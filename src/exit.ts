import { config } from './config'

export interface Position {
  mint: string
  poolAddress: string
  entryPrice: number          // prix d'achat en SOL
  amountSol: number           // SOL investis
  tokenAmount: number         // tokens détenus
  openedAt: number            // timestamp ms
  peakPrice: number           // plus haut observé
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
  shouldExit: boolean
  reason: ExitReason | null
  sellPercent: number          // % de la position à vendre (0-100)
}

// ──────────────────────────────────────────
// Évaluation à chaque tick de prix
// ──────────────────────────────────────────
export function evaluatePosition(position: Position, currentPrice: number): ExitSignal {
  const now        = Date.now()
  const elapsed    = (now - position.openedAt) / 1000   // secondes
  const multiple   = currentPrice / position.entryPrice  // ex: 1.5 = +50%

  // Mettre à jour le peak
  if (currentPrice > position.peakPrice) {
    position.peakPrice = currentPrice
  }

  // ── TIMEOUT (priorité haute) ──────────────
  if (elapsed >= config.timeoutSec) {
    return { shouldExit: true, reason: 'TIMEOUT', sellPercent: 100 }
  }

  // ── STOP LOSS ────────────────────────────
  const lossPercent = (1 - multiple) * 100
  if (lossPercent >= config.stopLossPercent) {
    return { shouldExit: true, reason: 'STOP_LOSS', sellPercent: 100 }
  }

  // ── TRAILING STOP ────────────────────────
  const dropFromPeak = (1 - currentPrice / position.peakPrice) * 100
  const peakMultiple = position.peakPrice / position.entryPrice

  // Trailing stop actif seulement si déjà en profit
  if (peakMultiple >= config.tp1Multiplier && dropFromPeak >= config.trailingStop) {
    return { shouldExit: true, reason: 'TRAILING_STOP', sellPercent: 100 }
  }

  // ── TAKE PROFIT 2 ────────────────────────
  if (multiple >= config.tp2Multiplier) {
    return { shouldExit: true, reason: 'TP2', sellPercent: 40 }
  }

  // ── TAKE PROFIT 1 ────────────────────────
  if (multiple >= config.tp1Multiplier) {
    return { shouldExit: true, reason: 'TP1', sellPercent: 40 }
  }

  return { shouldExit: false, reason: null, sellPercent: 0 }
}

// ──────────────────────────────────────────
// Détection de drop de volume (signal pré-dump)
// ──────────────────────────────────────────
export function detectVolumeDrop(
  recentBuyVolumes: number[],  // volumes des N dernières secondes
  threshold = 0.5              // -50% de volume = danger
): boolean {
  if (recentBuyVolumes.length < 4) return false

  const half = Math.floor(recentBuyVolumes.length / 2)
  const firstHalf  = recentBuyVolumes.slice(0, half)
  const secondHalf = recentBuyVolumes.slice(half)

  const avgFirst  = firstHalf.reduce((a, b) => a + b, 0)  / firstHalf.length
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

  if (avgFirst === 0) return false

  const drop = (avgFirst - avgSecond) / avgFirst
  return drop >= threshold
}

// ──────────────────────────────────────────
// Log de sortie
// ──────────────────────────────────────────
export function logExit(position: Position, reason: ExitReason, currentPrice: number, soldPercent: number): void {
  const pnl      = ((currentPrice - position.entryPrice) / position.entryPrice) * 100
  const elapsed  = ((Date.now() - position.openedAt) / 1000).toFixed(0)
  const symbol   = pnl >= 0 ? '✅' : '❌'

  console.log(
    `[Exit] ${symbol} ${reason} | ${pnl >= 0 ? '+' : ''}${pnl.toFixed(1)}% | ` +
    `Vendu ${soldPercent}% | ${elapsed}s dans la position | Mint=${position.mint}`
  )
}
