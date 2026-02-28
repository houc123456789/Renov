import dotenv from 'dotenv'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'

dotenv.config()

function required(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Variable d'environnement manquante : ${key}`)
  return val
}

// Connexion RPC
export const connection = new Connection(
  required('HELIUS_RPC_URL'),
  { wsEndpoint: required('HELIUS_WS_URL'), commitment: 'confirmed' }
)

// Wallet du bot
export const wallet = Keypair.fromSecretKey(
  bs58.decode(required('PRIVATE_KEY'))
)

// Programmes Solana importants
export const PUMP_FUN_PROGRAM = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P')
export const RAYDIUM_PROGRAM  = new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8')

// Paramètres de trade
export const config = {
  amountPerTrade: parseFloat(process.env.AMOUNT_PER_TRADE_SOL || '0.05'),

  tp1Multiplier:  parseFloat(process.env.TP1_MULTIPLIER  || '1.3'),
  tp2Multiplier:  parseFloat(process.env.TP2_MULTIPLIER  || '1.6'),
  stopLossPercent: parseFloat(process.env.STOP_LOSS_PERCENT || '25'),
  timeoutSec:     parseInt(process.env.POSITION_TIMEOUT_SEC || '90'),
  trailingStop:   parseFloat(process.env.TRAILING_STOP_PERCENT || '15'),

  minRugCount:          parseInt(process.env.MIN_RUG_COUNT           || '3'),
  minPumpMultiple:      parseFloat(process.env.MIN_PUMP_MULTIPLE     || '2.0'),
  minSecondsBeforeDump: parseInt(process.env.MIN_SECONDS_BEFORE_DUMP || '45'),

  priorityFee: parseInt(process.env.PRIORITY_FEE_MICROLAMPORTS || '100000'),
  slippageBps: parseInt(process.env.SLIPPAGE_BPS || '500'),
}
