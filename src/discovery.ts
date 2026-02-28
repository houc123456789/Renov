import { PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js'
import { connection, PUMP_FUN_PROGRAM, config } from './config'
import { recordRug, isBlacklisted, blacklist } from './db'
import { checkHoneypot } from './honeypot'

interface TrackedToken {
  mint: string
  creator: string
  poolAddress: string
  launchTime: number          // timestamp ms
  peakPrice: number           // prix max observé (en SOL)
  currentPrice: number
  launchPrice: number
  lastUpdate: number
}

// Tokens en cours de surveillance
const trackedTokens = new Map<string, TrackedToken>()

// ──────────────────────────────────────────
// Lance le discovery engine
// ──────────────────────────────────────────
export function startDiscovery(): void {
  console.log('[Discovery] Démarrage de la surveillance Pump.fun...')

  // Écoute toutes les transactions du programme Pump.fun
  connection.onLogs(
    PUMP_FUN_PROGRAM,
    async (logs) => {
      try {
        // Filtre : seulement les créations de tokens (instruction "create")
        if (!logs.logs.some(l => l.includes('InitializeMint') || l.includes('create'))) return
        if (logs.err) return

        await handleNewToken(logs.signature)
      } catch (err) {
        // Silencieux pour ne pas spammer la console
      }
    },
    'confirmed'
  )

  // Toutes les 10 secondes : analyser les tokens trackés
  setInterval(() => analyzeTrackedTokens(), 10_000)

  console.log('[Discovery] ✅ Surveillance active')
}

// ──────────────────────────────────────────
// Traitement d'un nouveau token détecté
// ──────────────────────────────────────────
async function handleNewToken(signature: string): Promise<void> {
  const tx = await connection.getParsedTransaction(signature, {
    maxSupportedTransactionVersion: 0,
    commitment: 'confirmed',
  })

  if (!tx?.meta || !tx.transaction) return

  const creator = tx.transaction.message.accountKeys[0]?.pubkey?.toString()
  if (!creator) return

  // Ignorer si blacklisté
  if (isBlacklisted(creator)) return

  // Trouver le mint du nouveau token
  const postTokenBalances = tx.meta.postTokenBalances ?? []
  if (postTokenBalances.length === 0) return

  const mintAddress = postTokenBalances[0]?.mint
  if (!mintAddress) return

  // Trouver l'adresse de la pool (compte créé dans la tx)
  const poolAddress = findPoolAddress(tx)
  if (!poolAddress) return

  // Honeypot check immédiat
  const honeypotCheck = await checkHoneypot(mintAddress)
  if (honeypotCheck.isHoneypot) {
    console.log(`[Discovery] 🚫 Honeypot détecté à la création : ${mintAddress} | ${honeypotCheck.reason}`)
    blacklist(creator, `Honeypot créé : ${honeypotCheck.reason}`)
    return
  }

  // Prix initial (en SOL) depuis les balances
  const initialPrice = getInitialPrice(tx)
  if (initialPrice <= 0) return

  // Commencer à tracker ce token
  const token: TrackedToken = {
    mint: mintAddress,
    creator,
    poolAddress,
    launchTime: Date.now(),
    peakPrice: initialPrice,
    currentPrice: initialPrice,
    launchPrice: initialPrice,
    lastUpdate: Date.now(),
  }

  trackedTokens.set(mintAddress, token)
  console.log(`[Discovery] 👀 Nouveau token tracké : ${mintAddress} | Créateur : ${creator}`)
}

// ──────────────────────────────────────────
// Analyse périodique des tokens trackés
// ──────────────────────────────────────────
async function analyzeTrackedTokens(): Promise<void> {
  const now = Date.now()
  const MAX_TRACK_DURATION = 10 * 60 * 1000 // 10 minutes max

  for (const [mint, token] of trackedTokens.entries()) {
    const age = now - token.launchTime

    // Arrêter le tracking après 10 minutes
    if (age > MAX_TRACK_DURATION) {
      trackedTokens.delete(mint)
      continue
    }

    try {
      const price = await getCurrentPrice(mint, token.poolAddress)
      if (price <= 0) continue

      // Mettre à jour le prix max observé
      if (price > token.peakPrice) {
        token.peakPrice = price
      }

      token.currentPrice = price
      token.lastUpdate   = now

      // Détection de rug : a pumpé puis est retombé
      const pumpMultiple    = token.peakPrice / token.launchPrice
      const currentVsPeak   = price / token.peakPrice
      const secondsElapsed  = (now - token.launchTime) / 1000

      // Critères rug : a pumpé x2+ puis retombé à -70% du peak
      if (pumpMultiple >= 1.5 && currentVsPeak <= 0.3) {
        console.log(`[Discovery] 💀 Rug confirmé ! Mint=${mint} | Créateur=${token.creator} | Pump=${pumpMultiple.toFixed(2)}x | Temps=${secondsElapsed.toFixed(0)}s`)

        recordRug(token.creator, pumpMultiple, secondsElapsed)
        trackedTokens.delete(mint)
      }

    } catch {
      // Prix non récupérable → token probablement mort
      const age = now - token.launchTime
      if (age > 2 * 60 * 1000) {
        trackedTokens.delete(mint)
      }
    }
  }
}

// ──────────────────────────────────────────
// Utilitaires
// ──────────────────────────────────────────
function findPoolAddress(tx: ParsedTransactionWithMeta): string | null {
  const accounts = tx.transaction.message.accountKeys
  // Le compte pool est généralement créé dans cette tx (writable, non-signer)
  const created = accounts.find(a => !a.signer && a.writable)
  return created?.pubkey.toString() ?? null
}

function getInitialPrice(tx: ParsedTransactionWithMeta): number {
  const preBalances  = tx.meta?.preBalances  ?? []
  const postBalances = tx.meta?.postBalances ?? []
  if (preBalances.length < 2 || postBalances.length < 2) return 0

  // Estimation grossière : SOL dépensé pour initialiser la pool
  const diff = (preBalances[0] - postBalances[0]) / 1e9
  return Math.abs(diff)
}

async function getCurrentPrice(mint: string, poolAddress: string): Promise<number> {
  // Utilise l'API Jupiter pour obtenir le prix en temps réel
  try {
    const res = await fetch(
      `https://price.jup.ag/v6/price?ids=${mint}&vsToken=So11111111111111111111111111111111111111112`
    )
    const json = await res.json() as any
    return json?.data?.[mint]?.price ?? 0
  } catch {
    return 0
  }
}
