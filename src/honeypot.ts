import { Connection, PublicKey } from '@solana/web3.js'
import { getMint } from '@solana/spl-token'
import { connection } from './config'
import axios from 'axios'

export interface HoneypotResult {
  isHoneypot: boolean
  reason: string | null
}

// ──────────────────────────────────────────
// Check principal
// ──────────────────────────────────────────
export async function checkHoneypot(tokenMint: string): Promise<HoneypotResult> {
  const mint = new PublicKey(tokenMint)

  try {
    const [mintInfo, largestAccounts] = await Promise.all([
      getMint(connection, mint),
      connection.getTokenLargestAccounts(mint),
    ])

    // 1. Freeze authority active → peut bloquer ton wallet
    if (mintInfo.freezeAuthority !== null) {
      return { isHoneypot: true, reason: 'Freeze authority active → honeypot probable' }
    }

    // 2. Mint authority active → peut diluer le supply à l'infini
    if (mintInfo.mintAuthority !== null) {
      return { isHoneypot: true, reason: 'Mint authority active → inflation infinie possible' }
    }

    // 3. Un seul holder détient > 80% → impossible de vendre sans crasher
    if (largestAccounts.value.length > 0) {
      const totalSupply = Number(mintInfo.supply)
      const topHolder   = Number(largestAccounts.value[0].amount)
      const topPercent  = (topHolder / totalSupply) * 100

      if (topPercent > 80) {
        return { isHoneypot: true, reason: `Top holder à ${topPercent.toFixed(1)}% du supply` }
      }
    }

    // 4. Supply = 0 → token mort / rug déjà effectué
    if (mintInfo.supply === BigInt(0)) {
      return { isHoneypot: true, reason: 'Supply = 0, token déjà rugué' }
    }

    return { isHoneypot: false, reason: null }

  } catch (err) {
    return { isHoneypot: true, reason: `Erreur lors du check : ${err}` }
  }
}

// ──────────────────────────────────────────
// Vérification de la liquidité
// ──────────────────────────────────────────
export async function checkLiquidity(poolAddress: string): Promise<{ ok: boolean; solAmount: number }> {
  try {
    const info = await connection.getAccountInfo(new PublicKey(poolAddress))
    if (!info) return { ok: false, solAmount: 0 }

    const solAmount = info.lamports / 1e9
    return { ok: solAmount >= 3, solAmount }
  } catch {
    return { ok: false, solAmount: 0 }
  }
}

// ──────────────────────────────────────────
// Checker complet avant achat
// ──────────────────────────────────────────
export async function isSafeToSnipe(tokenMint: string, poolAddress: string): Promise<{
  safe: boolean
  reason: string | null
}> {
  const [honeypot, liquidity] = await Promise.all([
    checkHoneypot(tokenMint),
    checkLiquidity(poolAddress),
  ])

  if (honeypot.isHoneypot) {
    return { safe: false, reason: honeypot.reason }
  }

  if (!liquidity.ok) {
    return { safe: false, reason: `Liquidité insuffisante : ${liquidity.solAmount.toFixed(3)} SOL` }
  }

  return { safe: true, reason: null }
}
