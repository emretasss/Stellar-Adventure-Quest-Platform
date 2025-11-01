// Freighter wallet integration hook / Freighter cüzdan entegrasyonu hook'u
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  getAddress, 
  signTransaction as freighterSignTransaction,
  isConnected as freighterIsConnected,
  requestAccess as freighterRequestAccess
} from '@stellar/freighter-api'

interface WalletContextType {
  publicKey: string | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  signTransaction: (xdr: string) => Promise<string>
  error: string | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check if Freighter is installed / Freighter'ın yüklü olup olmadığını kontrol et
  useEffect(() => {
    checkFreighter()
  }, [])

  const checkFreighter = async () => {
    try {
      const connected = await freighterIsConnected()
      if (connected) {
        const result = await getAddress()
        if (result.address) {
          setPublicKey(result.address)
        }
      }
    } catch (err) {
      console.error('Freighter check failed:', err)
    }
  }

  const connect = async () => {
    try {
      setError(null)
      
      // Request access to Freighter
      const hasAccess = await freighterRequestAccess()
      
      if (!hasAccess) {
        throw new Error('Freighter access denied. Please approve the connection.')
      }

      // Get public key
      const result = await getAddress()
      if (result.address) {
        setPublicKey(result.address)
      } else if (result.error) {
        throw new Error(result.error)
      } else {
        throw new Error('Failed to get wallet address')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
      console.error('Wallet connection error:', err)
    }
  }

  const disconnect = () => {
    setPublicKey(null)
    setError(null)
  }

  const signTransaction = async (xdr: string): Promise<string> => {
    try {
      if (!publicKey) {
        throw new Error('Wallet not connected')
      }

      const result = await freighterSignTransaction(xdr, {
        networkPassphrase: 'Test SDF Network ; September 2015',
      })

      if (result.signedTxXdr) {
        return result.signedTxXdr
      } else if (result.error) {
        throw new Error(result.error)
      } else {
        throw new Error('Failed to sign transaction')
      }
    } catch (err: any) {
      throw new Error(err.message || 'Transaction signing failed')
    }
  }

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        isConnected: !!publicKey,
        connect,
        disconnect,
        signTransaction,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useFreighter() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useFreighter must be used within a WalletProvider')
  }
  return context
}

