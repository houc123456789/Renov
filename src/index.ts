import { startDiscovery }                from './discovery'
import { startMonitor, monitorEvents, SNIPE_SIGNAL } from './monitor'
import { snipe }                          from './sniper'
import { getOpenPositions }               from './sniper'
import { getWatchlist }                   from './db'
import { RuggerProfile }                  from './db'

// ──────────────────────────────────────────
// Point d'entrée
// ──────────────────────────────────────────
async function main(): Promise<void> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  🤖 SOLANA SNIPER BOT - Démarrage')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // 1. Discovery engine : trouve les rugeurs automatiquement
  startDiscovery()

  // 2. Monitor : surveille les rugeurs connus
  startMonitor()

  // 3. Quand un signal de snipe arrive → exécuter
  monitorEvents.on(SNIPE_SIGNAL, async ({ rugger, mint, poolAddress }: {
    rugger: RuggerProfile
    mint: string
    poolAddress: string
  }) => {
    console.log(`\n[Main] 🔫 Signal reçu ! Rugeur=${rugger.wallet} | Mint=${mint}`)
    console.log(`[Main] Stats rugeur : pump moy=${rugger.avgPumpMultiple.toFixed(2)}x | temps moy=${rugger.avgSecondsBeforeDump.toFixed(0)}s`)

    await snipe(mint, poolAddress, rugger)
  })

  // 4. Stats toutes les 60 secondes
  setInterval(() => printStats(), 60_000)

  console.log('\n[Main] ✅ Bot actif. En attente de signaux...\n')
}

function printStats(): void {
  const positions = getOpenPositions()
  const watchlist = getWatchlist().filter(r => r.worthFollowing)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  📊 STATS | ${new Date().toLocaleTimeString()}`)
  console.log(`  Rugeurs surveillés   : ${watchlist.length}`)
  console.log(`  Positions ouvertes   : ${positions.length}`)

  for (const pos of positions) {
    const elapsed = ((Date.now() - pos.openedAt) / 1000).toFixed(0)
    console.log(`    → ${pos.mint.slice(0, 8)}... | ${elapsed}s | peak x${(pos.peakPrice / pos.entryPrice).toFixed(2)}`)
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  const positions = getOpenPositions()
  if (positions.length > 0) {
    console.log(`\n⚠️  Arrêt avec ${positions.length} position(s) ouverte(s). Fermer manuellement si nécessaire.`)
  }
  console.log('\n[Main] Bot arrêté.')
  process.exit(0)
})

main().catch(err => {
  console.error('[Main] Erreur fatale :', err)
  process.exit(1)
})
