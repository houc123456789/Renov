import fs from 'fs'
import path from 'path'
import { config } from './config'

const DATA_DIR       = path.join(__dirname, '../data')
const WATCHLIST_PATH = path.join(DATA_DIR, 'watchlist.json')
const BLACKLIST_PATH = path.join(DATA_DIR, 'blacklist.json')

export interface RuggerProfile {
  wallet:               string
  rugCount:             number
  avgPumpMultiple:      number   // multiple moyen avant dump
  avgSecondsBeforeDump: number   // secondes moyennes avant dump
  // Algorithme de Welford pour variance en ligne (sans stocker tout l'historique)
  pumpVariance:         number
  timingVariance:       number
  // Score de confiance 0-1 (cohérence des rugs)
  confidenceScore:      number
  honeypotCount:        number
  totalProfit:          number   // SOL net gagné grâce à ce rugeur
  lastSeen:             string   // ISO date
  worthFollowing:       boolean
}

// ──────────────────────────────────────────
// Helpers lecture / écriture JSON
// ──────────────────────────────────────────
function ensureDir(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function load(filePath: string): Record<string, any> {
  ensureDir()
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '{}', 'utf-8')
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function save(filePath: string, data: Record<string, any>): void {
  ensureDir()
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

// ──────────────────────────────────────────
// Score de confiance (Welford's online algorithm)
// CV = coefficient de variation = stdDev / mean
// Plus le CV est faible, plus le rugeur est cohérent → score élevé
// ──────────────────────────────────────────
function calcConfidence(
  rugCount:       number,
  pumpVariance:   number,
  timingVariance: number,
  avgPump:        number,
  avgTiming:      number
): number {
  if (rugCount < 2) return 0

  const pumpStd   = Math.sqrt(Math.max(0, pumpVariance   / rugCount))
  const timingStd = Math.sqrt(Math.max(0, timingVariance / rugCount))

  const pumpCV   = avgPump   > 0 ? pumpStd   / avgPump   : 1
  const timingCV = avgTiming > 0 ? timingStd / avgTiming : 1

  // Consistance : CV faible → score élevé
  const consistencyScore = 1 / (1 + (pumpCV + timingCV) / 2)

  // Poids du nombre de rugs (sature à 1 après ~20 rugs)
  const countWeight = rugCount / (rugCount + 10)

  return parseFloat((consistencyScore * countWeight).toFixed(3))
}

// ──────────────────────────────────────────
// WATCHLIST
// ──────────────────────────────────────────
export function getWatchlist(): RuggerProfile[] {
  const data = load(WATCHLIST_PATH)
  return Object.values(data) as RuggerProfile[]
}

export function getRugger(wallet: string): RuggerProfile | null {
  const data = load(WATCHLIST_PATH)
  return data[wallet] ?? null
}

export function upsertRugger(profile: RuggerProfile): void {
  const data = load(WATCHLIST_PATH)
  data[profile.wallet] = profile
  save(WATCHLIST_PATH, data)
}

// Appelé par le discovery engine après chaque rug confirmé
export function recordRug(wallet: string, pumpMultiple: number, secondsBeforeDump: number): void {
  const data = load(WATCHLIST_PATH)

  // Compatibilité avec les anciens profils : on fusionne avec les defaults
  const existing: RuggerProfile = {
    wallet,
    rugCount:             0,
    avgPumpMultiple:      0,
    avgSecondsBeforeDump: 0,
    pumpVariance:         0,
    timingVariance:       0,
    confidenceScore:      0,
    honeypotCount:        0,
    totalProfit:          0,
    lastSeen:             new Date().toISOString(),
    worthFollowing:       false,
    ...(data[wallet] ?? {}),
  }

  const n            = existing.rugCount
  const prevAvgPump  = existing.avgPumpMultiple
  const prevAvgTime  = existing.avgSecondsBeforeDump

  // Mise à jour des moyennes (Welford)
  existing.rugCount            += 1
  existing.avgPumpMultiple      = (prevAvgPump * n + pumpMultiple)       / (n + 1)
  existing.avgSecondsBeforeDump = (prevAvgTime * n + secondsBeforeDump)  / (n + 1)

  // Mise à jour de la variance (Welford's online algorithm)
  existing.pumpVariance   += (pumpMultiple      - prevAvgPump) * (pumpMultiple      - existing.avgPumpMultiple)
  existing.timingVariance += (secondsBeforeDump - prevAvgTime) * (secondsBeforeDump - existing.avgSecondsBeforeDump)

  existing.lastSeen        = new Date().toISOString()
  existing.confidenceScore = calcConfidence(
    existing.rugCount,
    existing.pumpVariance,
    existing.timingVariance,
    existing.avgPumpMultiple,
    existing.avgSecondsBeforeDump
  )

  existing.worthFollowing = (
    existing.rugCount             >= config.minRugCount           &&
    existing.avgPumpMultiple      >= config.minPumpMultiple       &&
    existing.avgSecondsBeforeDump >= config.minSecondsBeforeDump  &&
    existing.honeypotCount        === 0                           &&
    existing.confidenceScore      >= 0.10   // seuil minimal de cohérence
  )

  data[wallet] = existing
  save(WATCHLIST_PATH, data)

  if (existing.worthFollowing) {
    console.log(
      `[DB] ⭐ Rugeur intéressant : ${wallet.slice(0, 8)}... | ` +
      `pump=${existing.avgPumpMultiple.toFixed(2)}x | ` +
      `timing=${existing.avgSecondsBeforeDump.toFixed(0)}s | ` +
      `confiance=${(existing.confidenceScore * 100).toFixed(0)}%`
    )
  }
}

/** Met à jour le P&L total du bot via ce rugeur (appelé après chaque sortie) */
export function updateRuggerProfit(wallet: string, netPnlSol: number): void {
  const data    = load(WATCHLIST_PATH)
  const profile = data[wallet] as RuggerProfile | undefined
  if (!profile) return

  profile.totalProfit = parseFloat(((profile.totalProfit || 0) + netPnlSol).toFixed(6))
  save(WATCHLIST_PATH, data)
}

/**
 * Supprime les rugeurs inactifs depuis plus de watchlistDecayDays jours.
 * Retourne le nombre de rugeurs supprimés.
 */
export function pruneStaleRuggers(): number {
  const data    = load(WATCHLIST_PATH)
  const decayMs = config.watchlistDecayDays * 24 * 60 * 60 * 1000
  const now     = Date.now()
  let pruned    = 0

  for (const [key, profile] of Object.entries(data)) {
    const lastSeen = new Date((profile as RuggerProfile).lastSeen).getTime()
    if (now - lastSeen > decayMs) {
      delete data[key]
      pruned++
    }
  }

  if (pruned > 0) {
    save(WATCHLIST_PATH, data)
    console.log(`[DB] 🧹 ${pruned} rugeur(s) inactif(s) depuis +${config.watchlistDecayDays}j supprimé(s)`)
  }

  return pruned
}

// ──────────────────────────────────────────
// BLACKLIST
// ──────────────────────────────────────────
export function isBlacklisted(wallet: string): boolean {
  const data = load(BLACKLIST_PATH)
  return !!data[wallet]
}

export function blacklist(wallet: string, reason: string): void {
  const data = load(BLACKLIST_PATH)
  data[wallet] = { wallet, reason, addedAt: new Date().toISOString() }
  save(BLACKLIST_PATH, data)
  console.log(`[DB] ❌ Blacklisté : ${wallet.slice(0, 8)}... | Raison : ${reason}`)
}
