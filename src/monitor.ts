import { connection } from './config'
import { getWatchlist, RuggerProfile } from './db'
import { EventEmitter } from 'events'

export const monitorEvents = new EventEmitter()

// Emis quand un rugeur connu crée / achète un nouveau token
// Payload : { rugger: RuggerProfile, mint: string, poolAddress: string }
export const SNIPE_SIGNAL = 'snipe'

let watchedWallets = new Set<string>()
let subscriptionIds = new Map<string, number>()

// ──────────────────────────────────────────
// Démarrage du monitor
// ──────────────────────────────────────────
export function startMonitor(): void {
  console.log('[Monitor] Démarrage...')
  refreshWatchlist()

  // Rafraîchir la watchlist toutes les 30 secondes
  // (le discovery engine l'alimente en continu)
  setInterval(() => refreshWatchlist(), 30_000)
}

// ──────────────────────────────────────────
// Mise à jour dynamique de la watchlist
// ──────────────────────────────────────────
function refreshWatchlist(): void {
  const ruggers = getWatchlist().filter(r => r.worthFollowing)

  for (const rugger of ruggers) {
    if (watchedWallets.has(rugger.wallet)) continue

    watchWallet(rugger)
    watchedWallets.add(rugger.wallet)
  }

  if (ruggers.length > 0) {
    console.log(`[Monitor] 👁️  Surveillance de ${watchedWallets.size} rugeurs`)
  }
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

        // Ce wallet a fait une transaction → analyser
        await handleWalletActivity(logs.signature, rugger)
      },
      'confirmed'
    )

    subscriptionIds.set(pubkey, subId)
    console.log(`[Monitor] ✅ Wallet ajouté : ${pubkey} | pump moy=${rugger.avgPumpMultiple.toFixed(2)}x | temps moy=${rugger.avgSecondsBeforeDump.toFixed(0)}s`)

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

    // Vérifier que c'est bien ce rugeur qui agit
    if (creator !== rugger.wallet) return

    // Chercher un nouveau token dans les balances post-transaction
    const postTokenBalances = tx.meta.postTokenBalances ?? []
    const preTokenBalances  = tx.meta.preTokenBalances  ?? []

    // Nouveaux tokens = présents en post mais pas en pre
    const newMints = postTokenBalances
      .map(b => b.mint)
      .filter(mint => !preTokenBalances.some(b => b.mint === mint))

    if (newMints.length === 0) return

    const mint = newMints[0]

    // Trouver la pool associée
    const poolAccount = accounts.find(a => !a.signer && a.writable)
    const poolAddress = poolAccount?.pubkey.toString()

    if (!poolAddress) return

    console.log(`[Monitor] 🚨 SIGNAL : rugeur ${rugger.wallet} vient de créer ${mint}`)

    // Émettre le signal de snipe
    monitorEvents.emit(SNIPE_SIGNAL, {
      rugger,
      mint,
      poolAddress,
    })

  } catch (err) {
    // Silencieux
  }
}
