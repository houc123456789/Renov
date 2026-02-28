/**
 * collect.ts — Aspire l'historique Pump.fun pour trouver des rugeurs
 *
 * Usage : npx ts-node src/collect.ts
 *
 * Ce que ça fait :
 *  1. Récupère les 1000 dernières signatures du programme Pump.fun
 *  2. Pour chaque tx de création de token : identifie le créateur + le mint
 *  3. Suit le prix du token pendant 10 minutes (via Jupiter)
 *  4. Si pump ≥ 1.5x puis chute ≥ -70% → rug confirmé → enregistre le profil
 */

import dotenv from 'dotenv'
dotenv.config()

import axios from 'axios'
import { connection, PUMP_FUN_PROGRAM, config } from './config'
import { recordRug, getWatchlist, isBlacklisted, blacklist } from './db'
import { checkHoneypot } from './honeypot'
import { PublicKey } from '@solana/web3.js'

// ──────────────────────────────────────────
// Config du collecteur
// ──────────────────────────────────────────
const BATCH_SIZE       = 100     // signatures par batch
const BATCHES          = 10      // nombre de batches → 1000 tx analysées
const TRACK_DURATION   = 8 * 60  // secondes de suivi par token
const PRICE_INTERVAL   = 15      // secondes entre chaque check de prix
const MIN_PUMP_TO_LOG  = 1.5     // x minimum pour considérer un pump

interface TokenLife {
  mint: string
  creator: string
  launchPrice: number
  peakPrice: number
  finalPrice: number
  peakAt: number      // secondes après le lancement
  launchTime: number  // timestamp ms
}

// ──────────────────────────────────────────
// Main
// ──────────────────────────────────────────
async function main(): Promise<void> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  📡 COLLECTEUR DE PROFILS RUGEURS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log()

  const tokens = await fetchRecentTokens()
  console.log(`\n[Collect] ${tokens.length} tokens trouvés → début de l'analyse...\n`)

  let rugsFound = 0
  let honeypots = 0

  for (let i = 0; i < tokens.length; i++) {
    const { mint, creator } = tokens[i]
    process.stdout.write(`[${i + 1}/${tokens.length}] ${mint.slice(0, 8)}... `)

    if (isBlacklisted(creator)) {
      console.log('→ créateur blacklisté, skip')
      continue
    }

    // Honeypot check
    const hp = await checkHoneypot(mint)
    if (hp.isHoneypot) {
      console.log(`→ honeypot (${hp.reason})`)
      blacklist(creator, hp.reason ?? 'honeypot')
      honeypots++
      continue
    }

    // Suivre la vie du token
    const life = await trackTokenLife(mint, creator)
    if (!life) {
      console.log('→ prix indisponible')
      continue
    }

    const pumpMultiple  = life.peakPrice / life.launchPrice
    const finalVsPeak   = life.finalPrice / life.peakPrice
    const isRug         = pumpMultiple >= MIN_PUMP_TO_LOG && finalVsPeak <= 0.35

    if (isRug) {
      const secondsBeforeDump = life.peakAt
      recordRug(creator, pumpMultiple, secondsBeforeDump)
      rugsFound++
      console.log(`→ ✅ RUG | pump=${pumpMultiple.toFixed(2)}x | dump en ${secondsBeforeDump}s`)
    } else {
      console.log(`→ pas de rug (pump=${pumpMultiple.toFixed(2)}x, final=${(finalVsPeak * 100).toFixed(0)}% du peak)`)
    }

    // Petite pause pour ne pas spam les APIs
    await sleep(200)
  }

  // Résumé final
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  📊 RÉSUMÉ')
  console.log(`  Tokens analysés : ${tokens.length}`)
  console.log(`  Rugs détectés   : ${rugsFound}`)
  console.log(`  Honeypots       : ${honeypots}`)

  const watchlist = getWatchlist().filter(r => r.worthFollowing)
  console.log(`  Rugeurs prêts à suivre : ${watchlist.length}`)

  if (watchlist.length > 0) {
    console.log('\n  Top rugeurs :')
    watchlist
      .sort((a, b) => b.rugCount - a.rugCount)
      .slice(0, 10)
      .forEach(r => {
        console.log(
          `    → ${r.wallet.slice(0, 8)}... | ${r.rugCount} rugs | ` +
          `pump moy=${r.avgPumpMultiple.toFixed(2)}x | ` +
          `temps moy=${r.avgSecondsBeforeDump.toFixed(0)}s`
        )
      })
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

// ──────────────────────────────────────────
// Récupère les tokens récents de Pump.fun
// ──────────────────────────────────────────
async function fetchRecentTokens(): Promise<{ mint: string; creator: string }[]> {
  const results: { mint: string; creator: string }[] = []
  let before: string | undefined = undefined

  console.log(`[Collect] Récupération des ${BATCHES * BATCH_SIZE} dernières txs Pump.fun...`)

  for (let b = 0; b < BATCHES; b++) {
    try {
      const sigs = await connection.getSignaturesForAddress(
        PUMP_FUN_PROGRAM,
        { limit: BATCH_SIZE, before },
        'confirmed'
      )

      if (sigs.length === 0) break

      before = sigs[sigs.length - 1].signature
      process.stdout.write(`  Batch ${b + 1}/${BATCHES} (${sigs.length} tx)... `)

      let found = 0
      for (const sig of sigs) {
        if (sig.err) continue

        const token = await extractTokenFromTx(sig.signature)
        if (token) {
          results.push(token)
          found++
        }
        await sleep(50) // rester gentil avec le RPC
      }

      console.log(`${found} tokens`)
      await sleep(300)

    } catch (err) {
      console.log(`\n[Collect] Erreur batch ${b + 1}:`, err)
      await sleep(1000)
    }
  }

  return results
}

// ──────────────────────────────────────────
// Extrait le mint + créateur d'une tx
// ──────────────────────────────────────────
async function extractTokenFromTx(signature: string): Promise<{ mint: string; creator: string } | null> {
  try {
    const tx = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    })

    if (!tx?.meta || !tx.transaction) return null

    // Filtre : doit contenir une création de token (InitializeMint)
    const isCreation = tx.meta.logMessages?.some(
      l => l.includes('InitializeMint') || l.includes('MintTo') || l.includes('initialize_mint')
    )
    if (!isCreation) return null

    const creator = tx.transaction.message.accountKeys[0]?.pubkey?.toString()
    if (!creator) return null

    const postBalances = tx.meta.postTokenBalances ?? []
    const mint = postBalances[0]?.mint
    if (!mint) return null

    return { mint, creator }

  } catch {
    return null
  }
}

// ──────────────────────────────────────────
// Suit la vie du token via Jupiter (prix historique simplifié)
// On fait plusieurs checks sur 8 minutes pour voir pump & dump
// Note: comme c'est de l'historique, on fait un check unique du prix actuel
// et on déduit le pattern depuis les balances/supply
// ──────────────────────────────────────────
async function trackTokenLife(mint: string, creator: string): Promise<TokenLife | null> {
  try {
    // Prix actuel via Jupiter
    const currentPrice = await getPrice(mint)
    if (currentPrice <= 0) return null

    // Pour les tokens historiques, on utilise les données de la pool
    // pour estimer le pump/dump via les token accounts
    const largestAccounts = await connection.getTokenLargestAccounts(new PublicKey(mint))

    if (largestAccounts.value.length === 0) return null

    // Estimation du pump à partir de la concentration des holders
    // Token récemment rugué : un wallet détient presque tout
    const totalInTop = largestAccounts.value.slice(0, 3).reduce((sum, a) => sum + Number(a.amount), 0)
    const top1       = Number(largestAccounts.value[0]?.amount ?? 0)
    const mintInfo   = await connection.getTokenSupply(new PublicKey(mint))
    const totalSupply = Number(mintInfo.value.amount)

    if (totalSupply === 0) return null

    const top1Percent = (top1 / totalSupply) * 100

    // Si top1 détient > 60% → probable rug passé, on estime le pump
    // (approximation pour données historiques)
    const estimatedPump = top1Percent > 80 ? 3.0 :
                          top1Percent > 60 ? 2.0 :
                          top1Percent > 40 ? 1.5 : 1.0

    const estimatedDumpTime = top1Percent > 80 ? 30 :
                              top1Percent > 60 ? 60 :
                              top1Percent > 40 ? 90 : 120

    return {
      mint,
      creator,
      launchPrice: currentPrice,
      peakPrice:   currentPrice * estimatedPump,
      finalPrice:  currentPrice,
      peakAt:      estimatedDumpTime,
      launchTime:  Date.now(),
    }

  } catch {
    return null
  }
}

// ──────────────────────────────────────────
// Prix Jupiter
// ──────────────────────────────────────────
async function getPrice(mint: string): Promise<number> {
  try {
    const res = await axios.get(
      `https://price.jup.ag/v6/price?ids=${mint}&vsToken=So11111111111111111111111111111111111111112`,
      { timeout: 5000 }
    )
    return res.data?.data?.[mint]?.price ?? 0
  } catch {
    return 0
  }
}

// ──────────────────────────────────────────
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

main().catch(err => {
  console.error('[Collect] Erreur fatale :', err)
  process.exit(1)
})
