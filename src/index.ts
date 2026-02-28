import { startDiscovery }                            from './discovery'
import { startMonitor, monitorEvents, SNIPE_SIGNAL } from './monitor'
import { snipe, getOpenPositions }                   from './sniper'
import { getWatchlist, pruneStaleRuggers }           from './db'
import { RuggerProfile }                             from './db'
import { initLogger, printPerfSummary }              from './logger'
import { config }                                    from './config'

// ──────────────────────────────────────────
// Point d'entrée
// ──────────────────────────────────────────
async function main(): Promise<void> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  🤖 SOLANA SNIPER BOT - Démarrage')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Phase 3 : initialiser le journal CSV + afficher la perf historique
  initLogger()
  printPerfSummary()

  // Phase 2 : nettoyer les rugeurs inactifs au démarrage
  pruneStaleRuggers()

  // 1. Discovery engine
  startDiscovery()

  // 2. Monitor
  startMonitor()

  // 3. Signaux de snipe
  monitorEvents.on(SNIPE_SIGNAL, async ({ rugger, mint, poolAddress }: {
    rugger:      RuggerProfile
    mint:        string
    poolAddress: string
  }) => {
    console.log(`\n[Main] 🔫 Signal ! Rugeur=${rugger.wallet.slice(0, 8)}... | Mint=${mint.slice(0, 8)}...`)
    console.log(
      `[Main] Stats rugeur : pump=${rugger.avgPumpMultiple.toFixed(2)}x | ` +
      `timing=${rugger.avgSecondsBeforeDump.toFixed(0)}s | ` +
      `confiance=${((rugger.confidenceScore ?? 0) * 100).toFixed(0)}%`
    )
    await snipe(mint, poolAddress, rugger)
  })

  // 4. Stats toutes les 60 secondes
  setInterval(() => printStats(), 60_000)

  // Phase 2 : nettoyage watchlist toutes les 24 heures
  setInterval(() => pruneStaleRuggers(), 24 * 60 * 60 * 1000)

  console.log('\n[Main] ✅ Bot actif. En attente de signaux...\n')
}

function printStats(): void {
  const positions = getOpenPositions()
  const watchlist = getWatchlist().filter(r => r.worthFollowing)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  📊 STATS | ${new Date().toLocaleTimeString()}`)
  console.log(`  Rugeurs surveillés   : ${watchlist.length}`)
  console.log(`  Positions ouvertes   : ${positions.length}/${config.maxOpenPositions} | expo max=${config.maxTotalExposureSol} SOL`)

  for (const pos of positions) {
    const elapsed  = ((Date.now() - pos.openedAt) / 1000).toFixed(0)
    const peakMult = (pos.peakPrice / pos.entryPrice).toFixed(2)
    console.log(`    → ${pos.mint.slice(0, 8)}... | ${elapsed}s | peak x${peakMult}`)
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

// Arrêt propre avec résumé des perfs
process.on('SIGINT', () => {
  const positions = getOpenPositions()
  if (positions.length > 0) {
    console.log(
      `\n⚠️  Arrêt avec ${positions.length} position(s) ouverte(s). ` +
      `Elles sont sauvegardées et seront reprises au prochain démarrage.`
    )
  }
  printPerfSummary()
  console.log('\n[Main] Bot arrêté.')
  process.exit(0)
})

main().catch(err => {
  console.error('[Main] Erreur fatale :', err)
  process.exit(1)
})
