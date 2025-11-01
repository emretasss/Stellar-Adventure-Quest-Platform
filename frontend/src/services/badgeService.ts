// Badge NFT Service
// Connects to badge_nft contract on Stellar

import { 
  Contract, 
  SorobanRpc,
  Address,
  nativeToScVal,
  scValToNative,
  TransactionBuilder,
  Account,
} from '@stellar/stellar-sdk'

const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://soroban-testnet.stellar.org'
const BADGE_NFT_CONTRACT_ID = import.meta.env.VITE_BADGE_NFT_CONTRACT_ID || ''

export interface Badge {
  id: string
  quest_id: string
  owner: string
  minted_at: string
  metadata: string
}

export class BadgeService {
  private contractId: string
  private rpc: SorobanRpc.Server

  constructor() {
    this.contractId = BADGE_NFT_CONTRACT_ID
    this.rpc = new SorobanRpc.Server(RPC_URL)
  }

  private async callContract(functionName: string, ...args: any[]): Promise<any> {
    try {
      const contract = new Contract(this.contractId)
      
      const scArgs = args.map(arg => {
        if (typeof arg === 'string') {
          try {
            return Address.fromString(arg).toScVal()
          } catch {
            // Try Symbol for short strings
            if (arg.length <= 9) {
              try {
                return nativeToScVal(arg, { type: 'symbol' })
              } catch {
                return nativeToScVal(arg, { type: 'string' })
              }
            }
            return nativeToScVal(arg, { type: 'string' })
          }
        }
        if (typeof arg === 'number') {
          return nativeToScVal(arg, { type: 'i128' })
        }
        return nativeToScVal(arg)
      })

      // Build a read-only transaction for simulation
      const account = new Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0')
      const transaction = new TransactionBuilder(account, {
        fee: '0',
        networkPassphrase: 'Test SDF Network ; September 2015',
      })
        .addOperation(contract.call(functionName, ...scArgs))
        .setTimeout(30)
        .build()

      // Simulate (read-only call)
      const simulation = await this.rpc.simulateTransaction(transaction)
      
      if ('error' in simulation) {
        throw new Error(`Simulation error: ${(simulation as any).error}`)
      }

      const result = 'result' in simulation ? simulation.result : undefined
      if (result?.retval) {
        return scValToNative(result.retval)
      }
      
      return null
    } catch (error) {
      console.error(`Error calling ${functionName}:`, error)
      throw error
    }
  }

  async getBadge(badgeId: string): Promise<Badge | null> {
    try {
      const result = await this.callContract('get_badge', badgeId)
      return result ? this.parseBadge(result) : null
    } catch (error) {
      console.error('Error getting badge:', error)
      return null
    }
  }

  async getUserBadges(userAddress: string): Promise<string[]> {
    try {
      const result = await this.callContract('get_user_badges', userAddress)
      return Array.isArray(result) ? result : []
    } catch (error) {
      console.error('Error getting user badges:', error)
      return []
    }
  }

  async ownerOf(badgeId: string): Promise<string | null> {
    try {
      const result = await this.callContract('owner_of', badgeId)
      return result ? result.toString() : null
    } catch (error) {
      console.error('Error getting badge owner:', error)
      return null
    }
  }

  async totalBadges(): Promise<number> {
    try {
      const result = await this.callContract('total_badges')
      return Number(result) || 0
    } catch (error) {
      console.error('Error getting total badges:', error)
      return 0
    }
  }

  private parseBadge(data: any): Badge {
    return {
      id: data.id?.toString() || '',
      quest_id: data.quest_id?.toString() || '',
      owner: data.owner?.toString() || '',
      minted_at: data.minted_at?.toString() || '0',
      metadata: data.metadata?.toString() || '{}',
    }
  }
}

