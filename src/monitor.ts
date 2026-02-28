import { PublicKey } from '@solana/web3.js'
import { connection } from './config'
import { getWatchlist, RuggerProfile } from './db'
import { EventEmitter } from 'events'

export const monitorEvents = new EventEmitter()
export const SNIPE_SIGNAL  = 'snipe'

let watchedWallets  = new Set<string>()
let subscriptionIds = new Map<string, number>()

// ──────────────────────────────────────────
// Démarrage du monitor
// ──────────────────────────────────────────
export function startMonitor(): void {
  console.log('[Monitor] Démarrage...')
  refreshWatchlist()
  setInterval(() => refreshWatchlist(), 30_000)
}

// ──────────────────────────────────────────
// Mise à jour dynamique : abonne/désabonne les wallets
// ──────────────────────────────────────────
function refreshWatchlist(): void {
  const ruggers      = getWatchlist().filter(r => r.worthFollowing)
  const worthySet    = new Set(ruggers.map(r => r.wallet))

  // Phase 3 : désabonner les wallets qui ne sont plus worthFollowing
  for (const [wallet, subId] of subscriptionIds.entries()) {
    if (!worthySet.has(wallet)) {
      connection.removeOnLogsListener(subId).catch(() => {})
      subscriptionIds.delete(wallet)
      watchedWallets.delete(wallet)
      console.log(`[Monitor] 🗑️  Désabonné (plus worthFollowing) : ${wallet.slice(0, 8)}...`)
    }
  }

  // Abonner les nouveaux rugeurs
  for (const rugger of ruggers) {
    if (watchedWallets.has(rugger.wallet)) continue
    watchWallet(rugger)
    watchedWallets.add(rugger.wallet)
    // Backfill : vérifier les txs récentes pour ne pas rater une création
    backfillRecentActivity(rugger).catch(() => {})
  }

  if (ruggers.length > 0) {
    const avgConf = ruggers.reduce((s, r) => s + (r.confidenceScore ?? 0), 0) / ruggers.length
    console.log(
      `[Monitor] 👁️  ${watchedWallets.size} rugeurs surveillés | ` +
      `confiance moy=${(avgConf * 100).toFixed(0)}%`
    )
  }
}

// ──────────────────────────────────────────
// Phase 2 : Backfill des 10 dernières txs pour les nouveaux wallets
// Évite de rater un token créé pendant la fenêtre de 30s entre refreshs
// ──────────────────────────────────────────
async function backfillRecentActivity(rugger: RuggerProfile): Promise<void> {
  try {
    const sigs = await connection.getSignaturesForAddress(
      new PublicKey(rugger.wallet),
      { limit: 10 },
      'confirmed'
    )

    for (const sig of sigs) {
      if (sig.err) continue
      // Seulement les txs des 5 dernières minutes
      const ageMs = Date.now() - (sig.blockTime ?? 0) * 1000
      if (ageMs > 5 * 60 * 1000) continue
      await handleWalletActivity(sig.signature, rugger)
    }
  } catch { /* non-fatal */ }
}

// ──────────────────────────────────────────
// Surveillance d'un wallet spécifique
// ──────────────────────────────────────────
function watchWallet(rugger: RuggerProfile): void {
  const pubkey = rugger.wallet

  try {
    const subId = connection.onLogs(
      { mentions: [pubkey] } as any,
      async (logs) => {
        if (logs.err) return
        await handleWalletActivity(logs.signature, rugger)
      },
      'confirmed'
    )

    subscriptionIds.set(pubkey, subId)
    console.log(
      `[Monitor] ✅ Ajouté : ${pubkey.slice(0, 8)}... | ` +
      `pump=${rugger.avgPumpMultiple.toFixed(2)}x | ` +
      `timing=${rugger.avgSecondsBeforeDump.toFixed(0)}s | ` +
      `confiance=${((rugger.confidenceScore ?? 0) * 100).toFixed(0)}%`
    )
  } catch (err) {
    console.error(`[Monitor] Erreur sur wallet ${pubkey}:`, err)
  }
}

// ──────────────────────────────────────────
// Analyse de l'activité détectée
// ──────────────────────────────────────────
async function handleWalletActivity(signature: string, rugger: RuggerProfile): Promise<void> {
  try {
    const tx = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    })

    if (!tx?.meta || !tx.transaction) return

    const accounts = tx.transaction.message.accountKeys
    const creator  = accounts[0]?.pubkey?.toString()
    if (creator !== rugger.wallet) return

    // Nouveaux tokens = présents en post mais pas en pre
    const postTokenBalances = tx.meta.postTokenBalances ?? []
    const preTokenBalances  = tx.meta.preTokenBalances  ?? []
    const newMints = postTokenBalances
      .map(b => b.mint)
      .filter(mint => !preTokenBalances.some(b => b.mint === mint))

    if (newMints.length === 0) return

    const mint        = newMints[0]
    const poolAccount = accounts.find(a => !a.signer && a.writable)
    const poolAddress = poolAccount?.pubkey.toString()
    if (!poolAddress) return

    console.log(
      `[Monitor] 🚨 SIGNAL : ${rugger.wallet.slice(0, 8)}... vient de créer ${mint.slice(0, 8)}...`
    )

    monitorEvents.emit(SNIPE_SIGNAL, { rugger, mint, poolAddress })

  } catch { /* Silencieux */ }
}
