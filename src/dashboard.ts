/**
 * dashboard.ts — Serveur web temps réel pour surveiller le bot
 * Accès : http://localhost:3000 (ou DASHBOARD_PORT dans .env)
 */

import express       from 'express'
import http          from 'http'
import { Server }    from 'socket.io'
import path          from 'path'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { connection, wallet, config } from './config'
import { getOpenPositions, getLastKnownPrice } from './sniper'
import { getWatchlist } from './db'
import { readTrades } from './logger'

const PORT = parseInt(process.env.DASHBOARD_PORT || '3000')

// Uptime du bot
const BOT_START = Date.now()

// ──────────────────────────────────────────
// Démarrage du serveur dashboard
// ──────────────────────────────────────────
export function startDashboard(): void {
  const app    = express()
  const server = http.createServer(app)
  const io     = new Server(server, { cors: { origin: '*' } })

  // Servir les fichiers statiques (public/)
  app.use(express.static(path.join(__dirname, '..', 'public')))

  // ── Broadcast toutes les 2 secondes ─────
  const broadcast = async () => {
    try {
      const positions = getOpenPositions()
      const watchlist = getWatchlist().filter(r => r.worthFollowing)
      const trades    = readTrades()

      let balance = 0
      try {
        balance = await connection.getBalance(wallet.publicKey) / LAMPORTS_PER_SOL
      } catch { /* RPC peut être indisponible */ }

      const totalNetPnl   = trades.reduce((s, t) => s + t.netPnlSol, 0)
      const totalFees     = trades.reduce((s, t) => s + t.feesSol,    0)
      const wins          = trades.filter(t => t.netPnlSol > 0).length
      const winrate       = trades.length > 0 ? (wins / trades.length) * 100 : 0
      const totalExposure = positions.reduce((s, p) => s + p.amountSol, 0)

      // Courbe P&L cumulé
      let cumPnl = 0
      const pnlHistory = trades.map(t => {
        cumPnl += t.netPnlSol
        return parseFloat(cumPnl.toFixed(4))
      })

      const uptimeSec = Math.floor((Date.now() - BOT_START) / 1000)

      io.emit('stats', {
        // Header
        balance:      parseFloat(balance.toFixed(4)),
        uptimeSec,
        timestamp:    new Date().toLocaleTimeString('fr-FR'),
        walletShort:  wallet.publicKey.toString().slice(0, 8) + '...',

        // Cartes stats
        totalNetPnl:  parseFloat(totalNetPnl.toFixed(4)),
        totalFees:    parseFloat(totalFees.toFixed(4)),
        tradesTotal:  trades.length,
        tradesWon:    wins,
        tradesLost:   trades.length - wins,
        winrate:      parseFloat(winrate.toFixed(1)),
        totalExposure: parseFloat(totalExposure.toFixed(3)),
        maxPositions: config.maxOpenPositions,
        maxExposure:  config.maxTotalExposureSol,

        // Positions ouvertes
        positions: positions.map(p => {
          const cur  = getLastKnownPrice(p.mint)
          const pnl  = cur > 0 ? ((cur - p.entryPrice) / p.entryPrice) * 100 : 0
          const peak = p.peakPrice / p.entryPrice
          return {
            mintShort:   p.mint.slice(0, 8) + '...',
            rugger:      p.ruggerWallet.slice(0, 8) + '...',
            entryPrice:  p.entryPrice,
            currentPrice: cur,
            peakMult:    parseFloat(peak.toFixed(2)),
            currentMult: cur > 0 ? parseFloat((cur / p.entryPrice).toFixed(2)) : 1,
            pnlPct:      parseFloat(pnl.toFixed(1)),
            amountSol:   p.amountSol,
            durationSec: Math.floor((Date.now() - p.openedAt) / 1000),
          }
        }),

        // Trades récents (15 derniers, ordre antéchronologique)
        recentTrades: trades.slice(-15).reverse().map(t => ({
          mintShort:  t.mint.slice(0, 8) + '...',
          rugger:     t.rugger.slice(0, 8) + '...',
          pnlPct:     parseFloat(t.pnlPct.toFixed(1)),
          netPnlSol:  parseFloat(t.netPnlSol.toFixed(4)),
          reason:     t.reason,
          durationSec: Math.round(t.durationSec),
        })),

        // Watchlist (15 meilleurs par score de confiance)
        watchlist: watchlist
          .sort((a, b) => b.confidenceScore - a.confidenceScore)
          .slice(0, 15)
          .map(r => ({
            walletShort: r.wallet.slice(0, 8) + '...',
            rugCount:    r.rugCount,
            avgPump:     parseFloat(r.avgPumpMultiple.toFixed(2)),
            avgTiming:   Math.round(r.avgSecondsBeforeDump),
            confidence:  Math.round((r.confidenceScore ?? 0) * 100),
            totalProfit: parseFloat(r.totalProfit.toFixed(3)),
          })),

        // Courbe P&L
        pnlHistory,
      })
    } catch { /* Silencieux */ }
  }

  io.on('connection', () => broadcast())
  setInterval(broadcast, 2000)

  server.listen(PORT, () => {
    console.log(`[Dashboard] 🌐 Dashboard disponible sur http://localhost:${PORT}`)
  })
}
