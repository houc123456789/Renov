/**
 * logger.ts — Journal CSV de tous les trades exécutés
 * Permet d'analyser les performances réelles du bot (P&L, winrate, rugeurs rentables)
 */

import fs from 'fs'
import path from 'path'

const DATA_DIR  = path.join(__dirname, '../data')
const LOG_PATH  = path.join(DATA_DIR, 'trades.csv')
const HEADER    =
  'timestamp,mint,rugger,entry_price_sol,exit_price_sol,' +
  'invested_sol,received_sol,gross_pnl_sol,net_pnl_sol,' +
  'pnl_pct,reason,duration_sec,fees_sol\n'

export interface TradeRecord {
  mint:        string
  rugger:      string
  entryPrice:  number   // SOL par token
  exitPrice:   number   // SOL par token
  investedSol: number   // SOL dépensé
  receivedSol: number   // SOL récupéré
  grossPnlSol: number   // P&L brut (sans fees)
  netPnlSol:   number   // P&L net (après fees)
  pnlPct:      number   // % net
  reason:      string   // raison de sortie
  durationSec: number   // durée de la position
  feesSol:     number   // frais totaux payés
}

export function initLogger(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(LOG_PATH)) fs.writeFileSync(LOG_PATH, HEADER, 'utf-8')
}

export function logTrade(record: TradeRecord): void {
  const row = [
    new Date().toISOString(),
    record.mint,
    record.rugger,
    record.entryPrice.toFixed(10),
    record.exitPrice.toFixed(10),
    record.investedSol.toFixed(6),
    record.receivedSol.toFixed(6),
    record.grossPnlSol.toFixed(6),
    record.netPnlSol.toFixed(6),
    record.pnlPct.toFixed(2),
    record.reason,
    record.durationSec.toFixed(0),
    record.feesSol.toFixed(6),
  ].join(',')

  fs.appendFileSync(LOG_PATH, row + '\n', 'utf-8')
}

export function readTrades(): TradeRecord[] {
  if (!fs.existsSync(LOG_PATH)) return []

  const lines = fs.readFileSync(LOG_PATH, 'utf-8')
    .split('\n')
    .slice(1)               // skip header
    .filter(Boolean)

  return lines.map(line => {
    const parts = line.split(',')
    return {
      mint:        parts[1],
      rugger:      parts[2],
      entryPrice:  parseFloat(parts[3]),
      exitPrice:   parseFloat(parts[4]),
      investedSol: parseFloat(parts[5]),
      receivedSol: parseFloat(parts[6]),
      grossPnlSol: parseFloat(parts[7]),
      netPnlSol:   parseFloat(parts[8]),
      pnlPct:      parseFloat(parts[9]),
      reason:      parts[10],
      durationSec: parseFloat(parts[11]),
      feesSol:     parseFloat(parts[12]),
    }
  })
}

export function printPerfSummary(): void {
  const trades = readTrades()

  if (trades.length === 0) {
    console.log('[Logger] Aucun trade enregistré pour l\'instant.')
    return
  }

  const totalNetPnl  = trades.reduce((s, t) => s + t.netPnlSol, 0)
  const totalFees    = trades.reduce((s, t) => s + t.feesSol,    0)
  const wins         = trades.filter(t => t.netPnlSol > 0)
  const losses       = trades.filter(t => t.netPnlSol <= 0)
  const bestTrade    = Math.max(...trades.map(t => t.netPnlSol))
  const worstTrade   = Math.min(...trades.map(t => t.netPnlSol))
  const avgDuration  = trades.reduce((s, t) => s + t.durationSec, 0) / trades.length

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  📈 PERFORMANCE HISTORIQUE')
  console.log(`  Trades total   : ${trades.length} (${wins.length}W / ${losses.length}L)`)
  console.log(`  Winrate        : ${((wins.length / trades.length) * 100).toFixed(1)}%`)
  console.log(`  P&L net        : ${totalNetPnl >= 0 ? '+' : ''}${totalNetPnl.toFixed(4)} SOL`)
  console.log(`  Fees totaux    : ${totalFees.toFixed(4)} SOL`)
  console.log(`  Meilleur trade : +${bestTrade.toFixed(4)} SOL`)
  console.log(`  Pire trade     : ${worstTrade.toFixed(4)} SOL`)
  console.log(`  Durée moyenne  : ${avgDuration.toFixed(0)}s`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}
