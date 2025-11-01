// Quest Platform Service
// Connects to quest_platform contract on Stellar

import { 
  Contract, 
  SorobanRpc,
  Address,
  nativeToScVal,
  scValToNative,
  TransactionBuilder,
  Account,
  BASE_FEE
} from '@stellar/stellar-sdk'
const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://soroban-testnet.stellar.org'
const QUEST_PLATFORM_CONTRACT_ID = import.meta.env.VITE_QUEST_PLATFORM_CONTRACT_ID || ''

export interface Quest {
  id: string
  creator: string
  title: string
  description: string
  reward_amount: string
  reward_token: string
  badge_id?: string
  status: string
  created_at: string
  expires_at?: string
  max_completions?: string
  current_completions: string
}

export interface QuestCompletion {
  user: string
  quest_id: string
  completed_at: string
  reward_claimed: boolean
}

export class QuestService {
  private contractId: string
  private rpc: SorobanRpc.Server

  constructor() {
    this.contractId = QUEST_PLATFORM_CONTRACT_ID
    this.rpc = new SorobanRpc.Server(RPC_URL)
  }

  private async callContract(functionName: string, ...args: any[]): Promise<any> {
    try {
      const contract = new Contract(this.contractId)
      
      // Convert args to ScVals
      const scArgs = args.map(arg => {
        if (typeof arg === 'string') {
          // Try Address first, then Symbol/String
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

  async getQuest(questId: string): Promise<Quest | null> {
    try {
      const result = await this.callContract('get_quest', questId)
      return result ? this.parseQuest(result) : null
    } catch (error) {
      console.error('Error getting quest:', error)
      return null
    }
  }

  async getActiveQuests(): Promise<Quest[]> {
    try {
      const result = await this.callContract('get_active_quests')
      return Array.isArray(result) ? result.map((q: any) => this.parseQuest(q)) : []
    } catch (error) {
      console.error('Error getting active quests:', error)
      return []
    }
  }

  async hasCompleted(userAddress: string, questId: string): Promise<boolean> {
    try {
      const result = await this.callContract('has_completed', userAddress, questId)
      return result === true
    } catch (error) {
      console.error('Error checking completion:', error)
      return false
    }
  }

  async getUserCompletions(userAddress: string): Promise<string[]> {
    try {
      const result = await this.callContract('get_user_completions', userAddress)
      return Array.isArray(result) ? result : []
    } catch (error) {
      console.error('Error getting user completions:', error)
      return []
    }
  }

  async getLeaderboard(): Promise<Array<[string, number]>> {
    try {
      const result = await this.callContract('get_leaderboard')
      return Array.isArray(result) ? result : []
    } catch (error) {
      console.error('Error getting leaderboard:', error)
      return []
    }
  }

  async getQuestCount(): Promise<number> {
    try {
      const result = await this.callContract('get_quest_count')
      return Number(result) || 0
    } catch (error) {
      console.error('Error getting quest count:', error)
      return 0
    }
  }

  private parseQuest(data: any): Quest {
    return {
      id: data.id?.toString() || '',
      creator: data.creator?.toString() || '',
      title: data.title?.toString() || '',
      description: data.description?.toString() || '',
      reward_amount: data.reward_amount?.toString() || '0',
      reward_token: data.reward_token?.toString() || '',
      badge_id: data.badge_id?.toString(),
      status: data.status?.toString() || 'active',
      created_at: data.created_at?.toString() || '0',
      expires_at: data.expires_at?.toString(),
      max_completions: data.max_completions?.toString(),
      current_completions: data.current_completions?.toString() || '0',
    }
  }

  // Build transaction for completing a quest (to be signed by wallet)
  async buildCompleteQuestTransaction(userAddress: string, questId: string): Promise<string> {
    try {
      const contract = new Contract(this.contractId)
      
      // Create ScVal arguments
      const userAddressScVal = Address.fromString(userAddress).toScVal()
      const questIdScVal = nativeToScVal(questId, { type: 'symbol' })

      // Build transaction
      const account = new Account(userAddress, '-1')
      let transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: 'Test SDF Network ; September 2015',
      })
        .addOperation(contract.call('complete_quest', userAddressScVal, questIdScVal))
        .setTimeout(30)
        .build()

      // Simulate and prepare transaction
      const prepared = await this.rpc.prepareTransaction(transaction)
      
      return prepared.toXDR()
    } catch (error) {
      console.error('Error building complete quest transaction:', error)
      throw error
    }
  }
}

