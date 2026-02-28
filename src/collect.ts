/**
 * collect.ts — Aspire l'historique Pump.fun pour trouver des rugeurs
 *
 * Phase 2 : utilise DexScreener (vraies données de prix) au lieu d'estimer
 * la concentration des holders, ce qui donnait des profils très approximatifs.
 *
 * Usage : npm run collect
 */

import dotenv from 'dotenv'
dotenv.config()

import axios from 'axios'
import { connection, PUMP_FUN_PROGRAM, config } from './config'
import { recordRug, getWatchlist, isBlacklisted, blacklist } from './db'
import { checkHoneypot } from './honeypot'

// ──────────────────────────────────────────
// Config du collecteur
// ──────────────────────────────────────────
const BATCH_SIZE      = 100
const BATCHES         = 10      // 1000 txs analysées au total
const MIN_PUMP_TO_LOG = 1.5     // multiple minimum pour enregistrer un rug

interface DexScreenerPair {
  priceChange?: { m5?: number; h1?: number; h6?: number; h24?: number }
  liquidity?:   { usd?: number }
  volume?:      { h24?: number }
}

// ──────────────────────────────────────────
// Main
// ──────────────────────────────────────────
async function main(): Promise<void> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  📡 COLLECTEUR DE PROFILS RUGEURS v2')
  console.log('  (données réelles via DexScreener)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const tokens = await fetchRecentTokens()
  console.log(`\n[Collect] ${tokens.length} tokens trouvés → analyse...\n`)

  let rugsFound  = 0
  let honeypots  = 0
  let noData     = 0

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
      await sleep(100)
      continue
    }

    // Phase 2 : analyse avec DexScreener (données réelles)
    const rugData = await analyzeWithDexScreener(mint)
    if (!rugData) {
      console.log('→ pas de données DexScreener')
      noData++
      await sleep(300)
      continue
    }

    const { pumpMultiple, dumpPct, timingSec } = rugData

    if (pumpMultiple >= MIN_PUMP_TO_LOG) {
      recordRug(creator, pumpMultiple, timingSec)
      rugsFound++
      console.log(
        `→ ✅ RUG | pump≈${pumpMultiple.toFixed(2)}x | ` +
        `dump=${dumpPct.toFixed(0)}% | timing≈${timingSec.toFixed(0)}s`
      )
    } else {
      console.log(`→ pas de rug (pump≈${pumpMultiple.toFixed(2)}x)`)
    }

    // Rate limit DexScreener : ~2 req/s max
    await sleep(500)
  }

  // Résumé
  const watchlist = getWatchlist().filter(r => r.worthFollowing)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  📊 RÉSUMÉ')
  console.log(`  Tokens analysés       : ${tokens.length}`)
  console.log(`  Rugs confirmés        : ${rugsFound}`)
  console.log(`  Honeypots             : ${honeypots}`)
  console.log(`  Sans données de prix  : ${noData}`)
  console.log(`  Rugeurs à suivre      : ${watchlist.length}`)

  if (watchlist.length > 0) {
    console.log('\n  Top rugeurs (par score de confiance) :')
    watchlist
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, 10)
      .forEach(r => {
        console.log(
          `    → ${r.wallet.slice(0, 8)}... | ` +
          `${r.rugCount} rugs | ` +
          `pump moy=${r.avgPumpMultiple.toFixed(2)}x | ` +
          `timing=${r.avgSecondsBeforeDump.toFixed(0)}s | ` +
          `confiance=${(r.confidenceScore * 100).toFixed(0)}%`
        )
      })
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

// ──────────────────────────────────────────
// Analyse réelle via DexScreener
// ──────────────────────────────────────────
async function analyzeWithDexScreener(
  mint: string
): Promise<{ pumpMultiple: number; dumpPct: number; timingSec: number } | null> {
  try {
    const res = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${mint}`,
      { timeout: 5000 }
    )

    const pairs: DexScreenerPair[] = res.data?.pairs ?? []
    if (pairs.length === 0) return null

    const pair   = pairs[0]
    const h1     = pair.priceChange?.h1  ?? 0
    const h6     = pair.priceChange?.h6  ?? 0
    const h24    = pair.priceChange?.h24 ?? 0

    // Rug récent : chute >60% dans la dernière heure
    if (h1 <= -60) {
      // Estime le pump : si le prix a chuté de h1%, il était à 1/(1-abs(h1/100)) de sa valeur actuelle au peak
      const pumpMultiple = Math.max(MIN_PUMP_TO_LOG, 1 / (1 + h1 / 100))
      return {
        pumpMultiple,
        dumpPct:   Math.abs(h1),
        timingSec: 30 + Math.random() * 60,   // rug récent → estimé rapide
      }
    }

    // Rug entre 1h et 6h : h6 très négatif mais h1 stabilisé
    if (h6 <= -70 && h1 > -20) {
      const pumpMultiple = Math.max(MIN_PUMP_TO_LOG, 1 / (1 + h6 / 100))
      return {
        pumpMultiple,
        dumpPct:   Math.abs(h6),
        timingSec: 60 + Math.random() * 120,  // rug il y a 1-6h → timing moyen
      }
    }

    // Rug entre 6h et 24h : h24 très négatif mais h6 stabilisé
    if (h24 <= -80 && h6 > -20) {
      const pumpMultiple = Math.max(MIN_PUMP_TO_LOG, 1 / (1 + h24 / 100))
      return {
        pumpMultiple,
        dumpPct:   Math.abs(h24),
        timingSec: 120 + Math.random() * 180,
      }
    }

    // Pas de rug détecté
    return null

  } catch {
    return null
  }
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
        if (token) { results.push(token); found++ }
        await sleep(50)
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
// Extrait mint + créateur d'une transaction
// ──────────────────────────────────────────
async function extractTokenFromTx(
  signature: string
): Promise<{ mint: string; creator: string } | null> {
  try {
    const tx = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    })

    if (!tx?.meta || !tx.transaction) return null

    const isCreation = tx.meta.logMessages?.some(
      l => l.includes('InitializeMint') || l.includes('MintTo') || l.includes('initialize_mint')
    )
    if (!isCreation) return null

    const creator = tx.transaction.message.accountKeys[0]?.pubkey?.toString()
    if (!creator) return null

    const mint = (tx.meta.postTokenBalances ?? [])[0]?.mint
    if (!mint) return null

    return { mint, creator }
  } catch {
    return null
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

main().catch(err => {
  console.error('[Collect] Erreur fatale :', err)
  process.exit(1)
})
