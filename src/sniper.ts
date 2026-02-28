import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  ComputeBudgetProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js'
import { connection, wallet, config } from './config'
import { isSafeToSnipe } from './honeypot'
import { evaluatePosition, detectVolumeDrop, logExit, Position, ExitSignal } from './exit'
import { RuggerProfile } from './db'
import axios from 'axios'

// Positions ouvertes actuellement
const openPositions = new Map<string, Position>()

// Volume tracker par mint
const volumeHistory = new Map<string, number[]>()

// ──────────────────────────────────────────
// Point d'entrée principal : sniper un token
// ──────────────────────────────────────────
export async function snipe(mint: string, poolAddress: string, rugger: RuggerProfile): Promise<void> {
  // Ne pas sniper si déjà en position sur ce mint
  if (openPositions.has(mint)) return

  console.log(`[Sniper] 🎯 Tentative de snipe : ${mint}`)

  // 1. Safety check
  const safety = await isSafeToSnipe(mint, poolAddress)
  if (!safety.safe) {
    console.log(`[Sniper] ❌ Pas sûr : ${safety.reason}`)
    return
  }

  // 2. Obtenir le prix actuel
  const entryPrice = await getTokenPrice(mint)
  if (entryPrice <= 0) {
    console.log(`[Sniper] ❌ Prix introuvable pour ${mint}`)
    return
  }

  // 3. Calculer le montant en lamports
  const amountLamports = Math.floor(config.amountPerTrade * LAMPORTS_PER_SOL)

  // 4. Construire et envoyer la transaction via Jupiter
  try {
    const { tokenAmount, txSignature } = await buyViaJupiter(mint, amountLamports)

    if (tokenAmount <= 0) {
      console.log(`[Sniper] ❌ Achat échoué pour ${mint}`)
      return
    }

    console.log(`[Sniper] ✅ Acheté ! ${tokenAmount} tokens | TX: ${txSignature}`)

    // 5. Enregistrer la position
    const position: Position = {
      mint,
      poolAddress,
      entryPrice,
      amountSol: config.amountPerTrade,
      tokenAmount,
      openedAt: Date.now(),
      peakPrice: entryPrice,
    }

    openPositions.set(mint, position)
    volumeHistory.set(mint, [])

    // 6. Démarrer la surveillance de la position
    monitorPosition(position)

  } catch (err) {
    console.error(`[Sniper] ❌ Erreur lors de l'achat de ${mint}:`, err)
  }
}

// ──────────────────────────────────────────
// Surveillance de la position en temps réel
// ──────────────────────────────────────────
async function monitorPosition(position: Position): Promise<void> {
  const { mint } = position

  // Vérification toutes les 500ms
  const interval = setInterval(async () => {
    const pos = openPositions.get(mint)
    if (!pos) {
      clearInterval(interval)
      return
    }

    try {
      const currentPrice = await getTokenPrice(mint)
      if (currentPrice <= 0) return

      // Tracker le volume (simplification : on log les variations de prix)
      const history = volumeHistory.get(mint) ?? []
      history.push(currentPrice)
      if (history.length > 20) history.shift()
      volumeHistory.set(mint, history)

      // Check drop de volume → signal pré-dump
      if (detectVolumeDrop(history)) {
        console.log(`[Sniper] ⚠️  Drop de volume détecté sur ${mint} → sortie`)
        await sellPosition(pos, 100, 'VOLUME_DROP', currentPrice)
        clearInterval(interval)
        return
      }

      // Évaluation TP / SL / Timeout
      const signal: ExitSignal = evaluatePosition(pos, currentPrice)

      if (signal.shouldExit && signal.reason) {
        logExit(pos, signal.reason, currentPrice, signal.sellPercent)

        if (signal.sellPercent === 100) {
          await sellPosition(pos, 100, signal.reason, currentPrice)
          clearInterval(interval)
        } else {
          // Vente partielle (TP1 ou TP2 : 40%)
          await sellPosition(pos, signal.sellPercent, signal.reason, currentPrice)
          // Réduire la quantité de tokens restante
          pos.tokenAmount = Math.floor(pos.tokenAmount * (1 - signal.sellPercent / 100))
          openPositions.set(mint, pos)
        }
      }

    } catch {
      // Silencieux
    }
  }, 500)
}

// ──────────────────────────────────────────
// Vente via Jupiter
// ──────────────────────────────────────────
async function sellPosition(
  position: Position,
  percentToSell: number,
  reason: string,
  currentPrice: number
): Promise<void> {
  const { mint, tokenAmount } = position
  const amountToSell = Math.floor(tokenAmount * (percentToSell / 100))

  if (amountToSell <= 0) return

  try {
    const SOL_MINT = 'So11111111111111111111111111111111111111112'

    // Quote Jupiter
    const quoteRes = await axios.get('https://quote-api.jup.ag/v6/quote', {
      params: {
        inputMint:   mint,
        outputMint:  SOL_MINT,
        amount:      amountToSell,
        slippageBps: config.slippageBps,
      },
    })

    const quote = quoteRes.data

    // Swap transaction
    const swapRes = await axios.post('https://quote-api.jup.ag/v6/swap', {
      quoteResponse:        quote,
      userPublicKey:        wallet.publicKey.toString(),
      wrapAndUnwrapSol:     true,
      prioritizationFeeLamports: config.priorityFee,
    })

    const { swapTransaction } = swapRes.data
    const txBuf = Buffer.from(swapTransaction, 'base64')

    const tx = Transaction.from(txBuf)
    const sig = await sendAndConfirmTransaction(connection, tx, [wallet], { commitment: 'confirmed' })

    console.log(`[Sniper] 💰 Vendu ${percentToSell}% | Raison=${reason} | TX=${sig}`)

    if (percentToSell === 100) {
      openPositions.delete(mint)
      volumeHistory.delete(mint)
    }

  } catch (err) {
    console.error(`[Sniper] ❌ Erreur vente ${mint}:`, err)
  }
}

// ──────────────────────────────────────────
// Achat via Jupiter
// ──────────────────────────────────────────
async function buyViaJupiter(
  mint: string,
  amountLamports: number
): Promise<{ tokenAmount: number; txSignature: string }> {
  const SOL_MINT = 'So11111111111111111111111111111111111111112'

  // Priority fee instruction
  const priorityIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: config.priorityFee,
  })

  // Quote
  const quoteRes = await axios.get('https://quote-api.jup.ag/v6/quote', {
    params: {
      inputMint:   SOL_MINT,
      outputMint:  mint,
      amount:      amountLamports,
      slippageBps: config.slippageBps,
    },
  })

  const quote      = quoteRes.data
  const outAmount  = parseInt(quote.outAmount ?? '0')

  // Swap
  const swapRes = await axios.post('https://quote-api.jup.ag/v6/swap', {
    quoteResponse:             quote,
    userPublicKey:             wallet.publicKey.toString(),
    wrapAndUnwrapSol:          true,
    prioritizationFeeLamports: config.priorityFee,
  })

  const { swapTransaction } = swapRes.data
  const txBuf = Buffer.from(swapTransaction, 'base64')
  const tx    = Transaction.from(txBuf)
  tx.add(priorityIx)

  const sig = await sendAndConfirmTransaction(connection, tx, [wallet], { commitment: 'confirmed' })

  return { tokenAmount: outAmount, txSignature: sig }
}

// ──────────────────────────────────────────
// Prix via Jupiter
// ──────────────────────────────────────────
async function getTokenPrice(mint: string): Promise<number> {
  try {
    const res  = await axios.get(`https://price.jup.ag/v6/price?ids=${mint}&vsToken=So11111111111111111111111111111111111111112`)
    return res.data?.data?.[mint]?.price ?? 0
  } catch {
    return 0
  }
}

// ──────────────────────────────────────────
// Stats en temps réel
// ──────────────────────────────────────────
export function getOpenPositions(): Position[] {
  return Array.from(openPositions.values())
}
