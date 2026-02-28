import { config } from './config'

export interface Position {
  mint:         string
  poolAddress:  string
  entryPrice:   number   // prix d'achat en SOL/token
  amountSol:    number   // SOL investis
  tokenAmount:  number   // tokens détenus
  openedAt:     number   // timestamp ms
  peakPrice:    number   // plus haut observé
  ruggerWallet: string   // wallet du rugeur (pour le P&L par rugeur)
}

export type ExitReason =
  | 'TP1'
  | 'TP2'
  | 'TRAILING_STOP'
  | 'STOP_LOSS'
  | 'TIMEOUT'
  | 'RUGGER_SELLING'
  | 'VOLUME_DROP'

export interface ExitSignal {
  shouldExit:  boolean
  reason:      ExitReason | null
  sellPercent: number   // % de la position à vendre (0-100)
}

// ──────────────────────────────────────────
// Évaluation à chaque tick de prix
// ──────────────────────────────────────────
export function evaluatePosition(position: Position, currentPrice: number): ExitSignal {
  const now      = Date.now()
  const elapsed  = (now - position.openedAt) / 1000
  const multiple = currentPrice / position.entryPrice

  if (currentPrice > position.peakPrice) {
    position.peakPrice = currentPrice
  }

  // TIMEOUT (priorité haute)
  if (elapsed >= config.timeoutSec) {
    return { shouldExit: true, reason: 'TIMEOUT', sellPercent: 100 }
  }

  // STOP LOSS
  const lossPercent = (1 - multiple) * 100
  if (lossPercent >= config.stopLossPercent) {
    return { shouldExit: true, reason: 'STOP_LOSS', sellPercent: 100 }
  }

  // TRAILING STOP (actif seulement en profit)
  const dropFromPeak = (1 - currentPrice / position.peakPrice) * 100
  const peakMultiple = position.peakPrice / position.entryPrice
  if (peakMultiple >= config.tp1Multiplier && dropFromPeak >= config.trailingStop) {
    return { shouldExit: true, reason: 'TRAILING_STOP', sellPercent: 100 }
  }

  // TP2
  if (multiple >= config.tp2Multiplier) {
    return { shouldExit: true, reason: 'TP2', sellPercent: 40 }
  }

  // TP1
  if (multiple >= config.tp1Multiplier) {
    return { shouldExit: true, reason: 'TP1', sellPercent: 40 }
  }

  return { shouldExit: false, reason: null, sellPercent: 0 }
}

// ──────────────────────────────────────────
// Détection de décélération de prix (signal pré-dump)
// Renommé honnêtement : on compare les prix récents, PAS des volumes.
// Le vrai volume on-chain est mesuré dans sniper.ts via WebSocket de la pool.
// ──────────────────────────────────────────
export function detectPriceDeceleration(
  recentPrices: number[],
  threshold    = 0.5
): boolean {
  if (recentPrices.length < 4) return false

  const half       = Math.floor(recentPrices.length / 2)
  const firstHalf  = recentPrices.slice(0, half)
  const secondHalf = recentPrices.slice(half)

  const avgFirst  = firstHalf.reduce((a, b)  => a + b, 0) / firstHalf.length
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

  if (avgFirst === 0) return false
  return (avgFirst - avgSecond) / avgFirst >= threshold
}

// ──────────────────────────────────────────
// Log de sortie avec P&L net (fees déduits)
// ──────────────────────────────────────────
export function logExit(
  position:     Position,
  reason:       ExitReason,
  currentPrice: number,
  soldPercent:  number,
  feesSol       = config.solanaFeeSol
): void {
  const soldFraction = soldPercent / 100
  const investedSol  = position.amountSol * soldFraction
  const grossPnlPct  = ((currentPrice - position.entryPrice) / position.entryPrice) * 100
  const grossPnlSol  = investedSol * (grossPnlPct / 100)
  const netPnlSol    = grossPnlSol - feesSol
  const elapsed      = ((Date.now() - position.openedAt) / 1000).toFixed(0)
  const symbol       = netPnlSol >= 0 ? '✅' : '❌'

  console.log(
    `[Exit] ${symbol} ${reason} | ` +
    `brut=${grossPnlPct >= 0 ? '+' : ''}${grossPnlPct.toFixed(1)}% | ` +
    `net=${netPnlSol >= 0 ? '+' : ''}${netPnlSol.toFixed(4)} SOL | ` +
    `fees=${feesSol.toFixed(5)} SOL | ` +
    `vendu ${soldPercent}% | ${elapsed}s | ` +
    `mint=${position.mint.slice(0, 8)}...`
  )
}
