import fs from 'fs'
import path from 'path'
import {
  PublicKey,
  Transaction,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
  ComputeBudgetProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js'
import { connection, wallet, config } from './config'
import { isSafeToSnipe } from './honeypot'
import { evaluatePosition, detectPriceDeceleration, logExit, Position, ExitSignal, ExitReason } from './exit'
import { RuggerProfile, updateRuggerProfit } from './db'
import { logTrade } from './logger'
import axios from 'axios'

// ──────────────────────────────────────────
// Persistance des positions sur disque
// ──────────────────────────────────────────
const POSITIONS_PATH = path.join(__dirname, '../data/positions.json')

function persistPositions(): void {
  try {
    const dir = path.dirname(POSITIONS_PATH)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const data: Record<string, Position> = {}
    for (const [mint, pos] of openPositions.entries()) data[mint] = pos
    fs.writeFileSync(POSITIONS_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch { /* non-fatal */ }
}

function loadPersistedPositions(): Map<string, Position> {
  const map = new Map<string, Position>()
  if (!fs.existsSync(POSITIONS_PATH)) return map
  try {
    const data = JSON.parse(fs.readFileSync(POSITIONS_PATH, 'utf-8'))
    for (const pos of Object.values(data) as Position[]) {
      // ruggerWallet peut manquer sur les positions pré-migration
      if (!pos.ruggerWallet) pos.ruggerWallet = 'unknown'
      map.set(pos.mint, pos)
    }
    if (map.size > 0) {
      console.log(`[Sniper] ♻️  ${map.size} position(s) restaurée(s) depuis le disque`)
    }
  } catch { }
  return map
}

// ──────────────────────────────────────────
// État interne
// ──────────────────────────────────────────
const openPositions = loadPersistedPositions()
const priceHistory  = new Map<string, number[]>()   // prix récents (ticks 500ms)
const txTimestamps  = new Map<string, number[]>()   // timestamps des txs on-chain sur la pool
const poolSubs         = new Map<string, number>()     // WebSocket sub IDs
const lastKnownPrices = new Map<string, number>()     // Dernier prix connu (pour le dashboard)

// Initialiser le state pour les positions restaurées
for (const pos of openPositions.values()) {
  priceHistory.set(pos.mint, [])
  txTimestamps.set(pos.mint, [])
}

// ──────────────────────────────────────────
// Limite d'exposition simultanée (Phase 1)
// ──────────────────────────────────────────
function checkExposureLimits(): { ok: boolean; reason?: string } {
  if (openPositions.size >= config.maxOpenPositions) {
    return { ok: false, reason: `Max positions atteint (${config.maxOpenPositions})` }
  }
  const totalExposure = Array.from(openPositions.values()).reduce((s, p) => s + p.amountSol, 0)
  if (totalExposure + config.amountPerTrade > config.maxTotalExposureSol) {
    return {
      ok: false,
      reason: `Exposition max atteinte (${totalExposure.toFixed(3)} + ${config.amountPerTrade} > ${config.maxTotalExposureSol} SOL)`,
    }
  }
  return { ok: true }
}

// ──────────────────────────────────────────
// Point d'entrée principal : sniper un token
// ──────────────────────────────────────────
export async function snipe(mint: string, poolAddress: string, rugger: RuggerProfile): Promise<void> {
  if (openPositions.has(mint)) return

  // Vérifier les limites avant de sniper
  const exposure = checkExposureLimits()
  if (!exposure.ok) {
    console.log(`[Sniper] ⏸️  Bloqué : ${exposure.reason}`)
    return
  }

  console.log(`[Sniper] 🎯 Tentative de snipe : ${mint}`)

  const safety = await isSafeToSnipe(mint, poolAddress)
  if (!safety.safe) {
    console.log(`[Sniper] ❌ Pas sûr : ${safety.reason}`)
    return
  }

  const entryPrice = await getTokenPrice(mint)
  if (entryPrice <= 0) {
    console.log(`[Sniper] ❌ Prix introuvable pour ${mint}`)
    return
  }

  const amountLamports = Math.floor(config.amountPerTrade * LAMPORTS_PER_SOL)

  try {
    const { tokenAmount, txSignature } = await buyViaJupiter(mint, amountLamports)
    if (tokenAmount <= 0) {
      console.log(`[Sniper] ❌ Achat échoué pour ${mint}`)
      return
    }

    console.log(`[Sniper] ✅ Acheté ! ${tokenAmount} tokens | TX: ${txSignature}`)

    const position: Position = {
      mint,
      poolAddress,
      entryPrice,
      amountSol:    config.amountPerTrade,
      tokenAmount,
      openedAt:     Date.now(),
      peakPrice:    entryPrice,
      ruggerWallet: rugger.wallet,
    }

    openPositions.set(mint, position)
    priceHistory.set(mint, [])
    txTimestamps.set(mint, [])
    persistPositions()

    subscribeToPool(mint, poolAddress)
    monitorPosition(position)

  } catch (err) {
    console.error(`[Sniper] ❌ Erreur lors de l'achat de ${mint}:`, err)
  }
}

// ──────────────────────────────────────────
// Volume on-chain via WebSocket de la pool (Phase 2)
// Compte les transactions réelles pour détecter un arrêt d'activité
// ──────────────────────────────────────────
function subscribeToPool(mint: string, poolAddress: string): void {
  try {
    const subId = connection.onLogs(
      new PublicKey(poolAddress),
      (logs) => {
        if (logs.err) return
        const times = txTimestamps.get(mint) ?? []
        times.push(Date.now())
        // Conserver seulement les 60 dernières secondes
        txTimestamps.set(mint, times.filter(t => Date.now() - t < 60_000))
      },
      'confirmed'
    )
    poolSubs.set(mint, subId)
  } catch { /* WebSocket optionnel */ }
}

/** Retourne true si les txs sur la pool ont chuté de >70% sur les 10 dernières secondes */
function detectRealVolumeDrop(mint: string): boolean {
  const times  = txTimestamps.get(mint) ?? []
  const now    = Date.now()
  const recent = times.filter(t => now - t < 10_000).length           // 0-10s
  const older  = times.filter(t => now - t >= 10_000 && now - t < 30_000).length  // 10-30s
  if (older === 0) return false
  // Normalise à 10s (older couvre 20s → diviser par 2 pour comparer)
  return recent / (older / 2) < 0.3   // -70% de transactions → dump imminent
}

// ──────────────────────────────────────────
// Surveillance de la position en temps réel
// ──────────────────────────────────────────
async function monitorPosition(position: Position): Promise<void> {
  const { mint } = position

  const interval = setInterval(async () => {
    const pos = openPositions.get(mint)
    if (!pos) {
      clearInterval(interval)
      return
    }

    try {
      const currentPrice = await getTokenPrice(mint)
      if (currentPrice <= 0) return
      lastKnownPrices.set(mint, currentPrice)

      // Historique des prix pour détecter décélération
      const history = priceHistory.get(mint) ?? []
      history.push(currentPrice)
      if (history.length > 20) history.shift()
      priceHistory.set(mint, history)

      // Signal 1 : décélération de prix (momentum négatif)
      if (detectPriceDeceleration(history)) {
        console.log(`[Sniper] ⚠️  Momentum négatif sur ${mint.slice(0, 8)}... → sortie`)
        await closePosition(pos, 100, 'VOLUME_DROP', currentPrice)
        clearInterval(interval)
        return
      }

      // Signal 2 : chute de volume on-chain réel
      if (detectRealVolumeDrop(mint)) {
        console.log(`[Sniper] ⚠️  Volume on-chain en chute sur ${mint.slice(0, 8)}... → sortie`)
        await closePosition(pos, 100, 'VOLUME_DROP', currentPrice)
        clearInterval(interval)
        return
      }

      // Évaluation TP / SL / Timeout
      const signal: ExitSignal = evaluatePosition(pos, currentPrice)
      if (signal.shouldExit && signal.reason) {
        logExit(pos, signal.reason, currentPrice, signal.sellPercent)

        if (signal.sellPercent === 100) {
          await closePosition(pos, 100, signal.reason, currentPrice)
          clearInterval(interval)
        } else {
          await closePosition(pos, signal.sellPercent, signal.reason, currentPrice)
          pos.tokenAmount = Math.floor(pos.tokenAmount * (1 - signal.sellPercent / 100))
          openPositions.set(mint, pos)
          persistPositions()
        }
      }

    } catch { /* Silencieux pour éviter le spam */ }
  }, 500)
}

// ──────────────────────────────────────────
// Fermeture d'une position avec P&L réel (Phase 1)
// ──────────────────────────────────────────
async function closePosition(
  position:     Position,
  percentToSell: number,
  reason:        ExitReason | string,
  currentPrice:  number
): Promise<void> {
  const { mint, tokenAmount, ruggerWallet } = position
  const amountToSell = Math.floor(tokenAmount * (percentToSell / 100))
  if (amountToSell <= 0) return

  try {
    const SOL_MINT = 'So11111111111111111111111111111111111111112'

    const quoteRes = await axios.get('https://quote-api.jup.ag/v6/quote', {
      params: {
        inputMint:   mint,
        outputMint:  SOL_MINT,
        amount:      amountToSell,
        slippageBps: config.slippageBps,
      },
    })
    const quote = quoteRes.data

    const swapRes = await axios.post('https://quote-api.jup.ag/v6/swap', {
      quoteResponse:             quote,
      userPublicKey:             wallet.publicKey.toString(),
      wrapAndUnwrapSol:          true,
      prioritizationFeeLamports: config.priorityFee,
    })

    const txBuf = Buffer.from(swapRes.data.swapTransaction, 'base64')
    let sig: string

    try {
      // Jupiter v6 retourne des VersionedTransactions
      const vtx = VersionedTransaction.deserialize(txBuf)
      vtx.sign([wallet])
      sig = await connection.sendRawTransaction(vtx.serialize(), { skipPreflight: false, maxRetries: 2 })
      await connection.confirmTransaction(sig, 'confirmed')
    } catch {
      // Fallback sur transaction legacy
      const tx = Transaction.from(txBuf)
      sig = await sendAndConfirmTransaction(connection, tx, [wallet], { commitment: 'confirmed' })
    }

    // P&L réel avec fees déduits
    const receivedSol = parseInt(quote.outAmount ?? '0') / LAMPORTS_PER_SOL
    const investedSol = position.amountSol * (percentToSell / 100)
    const grossPnlSol = receivedSol - investedSol
    const jupFees     = investedSol * (config.jupiterFeeBps / 10000)
    const feesSol     = config.solanaFeeSol + jupFees
    const netPnlSol   = grossPnlSol - feesSol
    const pnlPct      = (netPnlSol / investedSol) * 100
    const durationSec = (Date.now() - position.openedAt) / 1000

    console.log(
      `[Sniper] 💰 Vendu ${percentToSell}% | Raison=${reason} | ` +
      `net=${netPnlSol >= 0 ? '+' : ''}${netPnlSol.toFixed(4)} SOL | TX=${sig}`
    )

    // Journal CSV
    logTrade({
      mint,
      rugger:      ruggerWallet,
      entryPrice:  position.entryPrice,
      exitPrice:   currentPrice,
      investedSol,
      receivedSol,
      grossPnlSol,
      netPnlSol,
      pnlPct,
      reason:      String(reason),
      durationSec,
      feesSol,
    })

    // Mettre à jour le profit du rugeur dans la DB
    updateRuggerProfit(ruggerWallet, netPnlSol)

    if (percentToSell === 100) {
      openPositions.delete(mint)
      priceHistory.delete(mint)
      txTimestamps.delete(mint)

      // Désabonner du WebSocket de la pool
      const subId = poolSubs.get(mint)
      if (subId !== undefined) {
        connection.removeOnLogsListener(subId).catch(() => {})
        poolSubs.delete(mint)
      }
    }

    persistPositions()

  } catch (err) {
    console.error(`[Sniper] ❌ Erreur vente ${mint}:`, err)
  }
}

// ──────────────────────────────────────────
// Achat via Jupiter (avec support VersionedTransaction)
// ──────────────────────────────────────────
async function buyViaJupiter(
  mint:           string,
  amountLamports: number
): Promise<{ tokenAmount: number; txSignature: string }> {
  const SOL_MINT = 'So11111111111111111111111111111111111111112'

  const quoteRes = await axios.get('https://quote-api.jup.ag/v6/quote', {
    params: {
      inputMint:   SOL_MINT,
      outputMint:  mint,
      amount:      amountLamports,
      slippageBps: config.slippageBps,
    },
  })
  const quote     = quoteRes.data
  const outAmount = parseInt(quote.outAmount ?? '0')

  const swapRes = await axios.post('https://quote-api.jup.ag/v6/swap', {
    quoteResponse:             quote,
    userPublicKey:             wallet.publicKey.toString(),
    wrapAndUnwrapSol:          true,
    prioritizationFeeLamports: config.priorityFee,
  })

  const txBuf = Buffer.from(swapRes.data.swapTransaction, 'base64')
  let sig: string

  try {
    const vtx = VersionedTransaction.deserialize(txBuf)
    vtx.sign([wallet])
    sig = await connection.sendRawTransaction(vtx.serialize(), { skipPreflight: false, maxRetries: 2 })
    await connection.confirmTransaction(sig, 'confirmed')
  } catch {
    // Fallback legacy + priority fee explicite
    const tx = Transaction.from(txBuf)
    tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: config.priorityFee }))
    sig = await sendAndConfirmTransaction(connection, tx, [wallet], { commitment: 'confirmed' })
  }

  return { tokenAmount: outAmount, txSignature: sig }
}

// ──────────────────────────────────────────
// Prix via Jupiter
// ──────────────────────────────────────────
async function getTokenPrice(mint: string): Promise<number> {
  try {
    const res = await axios.get(
      `https://price.jup.ag/v6/price?ids=${mint}&vsToken=So11111111111111111111111111111111111111112`,
      { timeout: 3000 }
    )
    return res.data?.data?.[mint]?.price ?? 0
  } catch {
    return 0
  }
}

// ──────────────────────────────────────────
// Stats
// ──────────────────────────────────────────
/** Retourne le dernier prix connu pour le dashboard (sans appel API supplémentaire) */
export function getLastKnownPrice(mint: string): number {
  return lastKnownPrices.get(mint) ?? 0
}

export function getOpenPositions(): Position[] {
  return Array.from(openPositions.values())
}

// Reprendre le monitoring des positions restaurées au démarrage
setImmediate(() => {
  for (const pos of Array.from(openPositions.values())) {
    console.log(`[Sniper] ▶️  Reprise monitoring : ${pos.mint.slice(0, 8)}...`)
    subscribeToPool(pos.mint, pos.poolAddress)
    monitorPosition(pos)
  }
})
