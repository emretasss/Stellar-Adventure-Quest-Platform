// Token service for contract interactions
import { 
  Contract, 
  TransactionBuilder, 
  BASE_FEE,
  SorobanRpc,
  Address,
  nativeToScVal,
  scValToNative,
  Account
} from '@stellar/stellar-sdk'

const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015'
const RPC_URL = 'https://soroban-testnet.stellar.org:443'
const CONTRACT_IDS = {
  token: import.meta.env.VITE_TOKEN_CONTRACT_ID || '',
  dashboard: import.meta.env.VITE_DASHBOARD_CONTRACT_ID || '',
  hello: import.meta.env.VITE_HELLO_CONTRACT_ID || '',
}

export class TokenService {
  private contractIds: typeof CONTRACT_IDS
  private rpc: SorobanRpc.Server

  constructor() {
    this.contractIds = CONTRACT_IDS
    this.rpc = new SorobanRpc.Server(RPC_URL)
  }

  // Get token balance
  async getBalance(address: string): Promise<number> {
    try {
      const contract = new Contract(this.contractIds.token)
      const addressScVal = Address.fromString(address).toScVal()
      
      // Build simulation transaction
      const account = new Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0')
      const transaction = new TransactionBuilder(account, {
        fee: '0',
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call('balance', addressScVal))
        .setTimeout(30)
        .build()

      // Simulate transaction
      const simulation = await this.rpc.simulateTransaction(transaction)
      
      if ('error' in simulation) {
        throw new Error(`Simulation error: ${(simulation as any).error}`)
      }

      const result = 'result' in simulation ? simulation.result : undefined
      if (result?.retval) {
        return Number(scValToNative(result.retval))
      }
      
      return 0
    } catch (error) {
      console.error('Error getting balance:', error)
      throw error
    }
  }

  // Mint tokens
  async mint(to: string, amount: number, publicKey: string): Promise<string> {
    try {
      const contract = new Contract(this.contractIds.token)
      const toAddress = Address.fromString(to).toScVal()
      const amountScVal = nativeToScVal(amount, { type: 'i128' })
      
      // Build transaction
      const account = new Account(publicKey, '-1')
      let transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call('mint', toAddress, amountScVal))
        .setTimeout(30)
        .build()

      // Simulate and prepare transaction
      const prepared = await this.rpc.prepareTransaction(transaction)
      
      return prepared.toXDR()
    } catch (error) {
      console.error('Error minting tokens:', error)
      throw error
    }
  }

  // Transfer tokens
  async transfer(from: string, to: string, amount: number, publicKey: string): Promise<string> {
    try {
      const contract = new Contract(this.contractIds.token)
      const fromAddress = Address.fromString(from).toScVal()
      const toAddress = Address.fromString(to).toScVal()
      const amountScVal = nativeToScVal(amount, { type: 'i128' })
      
      // Build transaction
      const account = new Account(publicKey, '-1')
      let transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call('transfer', fromAddress, toAddress, amountScVal))
        .setTimeout(30)
        .build()

      // Simulate and prepare transaction
      const prepared = await this.rpc.prepareTransaction(transaction)
      
      return prepared.toXDR()
    } catch (error) {
      console.error('Error transferring tokens:', error)
      throw error
    }
  }

  // Get token metadata
  async getMetadata() {
    try {
      const contract = new Contract(this.contractIds.token)
      
      // Build simulation transactions
      const account = new Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0')
      const simulationResults = await Promise.all([
        'name',
        'symbol',
        'decimals',
        'total_supply'
      ].map(async method => {
        const tx = new TransactionBuilder(account, {
          fee: '0',
          networkPassphrase: NETWORK_PASSPHRASE,
        })
          .addOperation(contract.call(method))
          .setTimeout(30)
          .build()

        const simulation = await this.rpc.simulateTransaction(tx)
        
        if ('error' in simulation) {
          throw new Error(`Simulation error in ${method}: ${(simulation as any).error}`)
        }

        const result = 'result' in simulation ? simulation.result : undefined
        return result?.retval ? scValToNative(result.retval) : null
      }))
      
      return {
        name: String(simulationResults[0] || ''),
        symbol: String(simulationResults[1] || ''),
        decimals: Number(simulationResults[2] || 0),
        supply: Number(simulationResults[3] || 0),
      }
    } catch (error) {
      console.error('Error getting metadata:', error)
      throw error
    }
  }
}

