// Service for building and signing contract transactions with Freighter
import {
  Contract,
  TransactionBuilder,
  BASE_FEE,
  SorobanRpc,
  Address,
  nativeToScVal,
  xdr,
  Account,
} from '@stellar/stellar-sdk'
import { signTransaction as freighterSign } from '@stellar/freighter-api'

const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015'
const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://soroban-testnet.stellar.org'

export class ContractTransactionService {
  private rpc: SorobanRpc.Server

  constructor() {
    this.rpc = new SorobanRpc.Server(RPC_URL)
  }

  /**
   * Invoke a contract function with Freighter wallet signing
   */
  async invokeContract(
    contractId: string,
    functionName: string,
    args: any[],
    userPublicKey: string
  ): Promise<string> {
    try {
      const contract = new Contract(contractId)
      
      // Convert args to ScVal
      // For create_quest function signature:
      // creator: Address, quest_id: Symbol, title: String, description: String,
      // reward_amount: i128, badge_id: Option<Symbol>, expires_at: Option<u64>, max_completions: Option<i128>
      const scArgs = args.map((arg, index) => {
        // Handle Option types (args at index 5, 6, 7 are Option types)
        if (arg === undefined || arg === null) {
          // None value for Option types
          return xdr.ScVal.scvVoid()
        }
        
        // For Option<Symbol> (index 5)
        if (index === 5 && typeof arg === 'string') {
          const symbolVal = nativeToScVal(arg, { type: 'symbol' })
          return symbolVal
        }
        
        // For Option<u64> (index 6)
        if (index === 6 && typeof arg === 'number') {
          const u64Val = nativeToScVal(arg, { type: 'u64' })
          return u64Val
        }
        
        // For Option<i128> (index 7)
        if (index === 7 && typeof arg === 'number') {
          const i128Val = nativeToScVal(arg, { type: 'i128' })
          return i128Val
        }
        
        // Non-Option types
        if (arg instanceof Address) {
          return arg.toScVal()
        }
        
        if (typeof arg === 'string') {
          try {
            // Try as Address first
            return Address.fromString(arg).toScVal()
          } catch {
            // Try as Symbol (for quest_id) - max 9 chars
            if (arg.length <= 9 && arg.length > 0) {
              try {
                return nativeToScVal(arg, { type: 'symbol' })
              } catch {
                return nativeToScVal(arg, { type: 'string' })
              }
            }
            // Otherwise as String
            return nativeToScVal(arg, { type: 'string' })
          }
        }
        
        if (typeof arg === 'number') {
          // Default to i128
          return nativeToScVal(arg, { type: 'i128' })
        }
        
        if (typeof arg === 'bigint') {
          return nativeToScVal(Number(arg), { type: 'i128' })
        }
        
        return nativeToScVal(arg)
      })

      // Build transaction - account will be fetched by prepareTransaction
      let transaction = new TransactionBuilder(
        new Account(userPublicKey, '0'), // Placeholder, will be updated by prepareTransaction
        {
          fee: BASE_FEE,
          networkPassphrase: NETWORK_PASSPHRASE,
        }
      )
        .addOperation(contract.call(functionName, ...scArgs))
        .setTimeout(30)
        .build()

      // Prepare transaction (this fetches account and adds resource fees)
      const preparedTransaction = await this.rpc.prepareTransaction(transaction)
      
      if (!preparedTransaction) {
        throw new Error('Failed to prepare transaction')
      }
      
      // Sign with Freighter
      const signedXdr = await freighterSign(preparedTransaction.toXDR(), {
        networkPassphrase: NETWORK_PASSPHRASE
      }).catch(error => {
        console.error('Freighter signing error:', error);
        throw new Error(`Transaction signing failed: ${error.message || 'User cancelled or network mismatch'}`)
      });

      if (!signedXdr || typeof signedXdr !== 'string') {
        throw new Error('Transaction signing returned invalid result')
      }

      // Send transaction
      const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE)
      const sendResponse = await this.rpc.sendTransaction(tx)

      if (sendResponse.status === 'ERROR' || sendResponse.errorResult) {
        throw new Error(`Transaction failed: ${sendResponse.errorResult || 'Unknown error'}`)
      }

      // Wait for transaction to complete
      let txResult
      const startTime = Date.now()
      const timeout = 60000 // 60 seconds

      while (!txResult && Date.now() - startTime < timeout) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        try {
          const response = await this.rpc.getTransaction(sendResponse.hash)
          if (response.status === 'SUCCESS') {
            txResult = response
            break
          }
          if (response.status === 'FAILED') {
            throw new Error(`Transaction failed: ${response.resultMetaXdr || 'Unknown error'}`)
          }
        } catch (err) {
          // Transaction might not be ready yet, continue polling
          continue
        }
      }

      if (!txResult) {
        throw new Error('Transaction timeout - check status manually')
      }

      return sendResponse.hash || ''
    } catch (error: any) {
      console.error('Contract invocation error:', error)
      throw new Error(error.message || 'Failed to invoke contract')
    }
  }
}

