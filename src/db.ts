import fs from 'fs'
import path from 'path'

const WATCHLIST_PATH  = path.join(__dirname, '../data/watchlist.json')
const BLACKLIST_PATH  = path.join(__dirname, '../data/blacklist.json')

export interface RuggerProfile {
  wallet: string
  rugCount: number
  avgPumpMultiple: number       // x moyen avant dump
  avgSecondsBeforeDump: number  // secondes moyennes avant dump
  honeypotCount: number
  totalProfit: number           // SOL gagné grâce à ce rugeur (debug)
  lastSeen: string              // ISO date
  worthFollowing: boolean
}

// ──────────────────────────────────────────
// Helpers lecture / écriture JSON
// ──────────────────────────────────────────
function load(filePath: string): Record<string, any> {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '{}', 'utf-8')
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function save(filePath: string, data: Record<string, any>): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
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
  console.log(`[DB] Rugeur mis à jour : ${profile.wallet} | score pump=${profile.avgPumpMultiple.toFixed(2)}x | rugs=${profile.rugCount}`)
}

// Appelé par le discovery engine après chaque rug confirmé
export function recordRug(wallet: string, pumpMultiple: number, secondsBeforeDump: number): void {
  const data  = load(WATCHLIST_PATH)
  const existing: RuggerProfile = data[wallet] ?? {
    wallet,
    rugCount: 0,
    avgPumpMultiple: 0,
    avgSecondsBeforeDump: 0,
    honeypotCount: 0,
    totalProfit: 0,
    lastSeen: new Date().toISOString(),
    worthFollowing: false,
  }

  // Moyenne glissante
  const n = existing.rugCount
  existing.rugCount            += 1
  existing.avgPumpMultiple      = (existing.avgPumpMultiple * n + pumpMultiple)      / (n + 1)
  existing.avgSecondsBeforeDump = (existing.avgSecondsBeforeDump * n + secondsBeforeDump) / (n + 1)
  existing.lastSeen             = new Date().toISOString()

  // Vaut-il la peine d'être suivi ?
  existing.worthFollowing = (
    existing.rugCount            >= 3    &&
    existing.avgPumpMultiple     >= 2.0  &&
    existing.avgSecondsBeforeDump >= 45  &&
    existing.honeypotCount       === 0
  )

  data[wallet] = existing
  save(WATCHLIST_PATH, data)

  if (existing.worthFollowing) {
    console.log(`[DB] ⭐ Rugeur intéressant détecté : ${wallet} | ${existing.avgPumpMultiple.toFixed(2)}x moy | ${existing.avgSecondsBeforeDump.toFixed(0)}s moy`)
  }
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
  console.log(`[DB] ❌ Blacklisté : ${wallet} | Raison : ${reason}`)
}
