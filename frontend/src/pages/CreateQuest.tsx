// Create Quest - Page for creating new quests with real contract interaction
import { useState } from 'react'
import { useFreighter } from '../hooks/useFreighter'
import { useNavigate } from 'react-router-dom'
import { ContractTransactionService } from '../services/contractTransactionService'

const QUEST_PLATFORM_CONTRACT_ID = import.meta.env.VITE_QUEST_PLATFORM_CONTRACT_ID || ''

export default function CreateQuest() {
  const { publicKey, isConnected } = useFreighter()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    questId: '',
    title: '',
    description: '',
    rewardAmount: '',
    badgeId: '',
    expiresAt: '',
    maxCompletions: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || !publicKey) {
      alert('Please connect your wallet first!')
      return
    }

    if (!QUEST_PLATFORM_CONTRACT_ID) {
      alert('Quest Platform Contract ID is not configured. Please set VITE_QUEST_PLATFORM_CONTRACT_ID in your .env file.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      // Convert form data to contract arguments
      const rewardAmount = Math.floor(parseFloat(formData.rewardAmount) * 1_000_0000) // Assuming 7 decimals
      const expiresAt = formData.expiresAt 
        ? Math.floor(Date.now() / 1000) + (parseInt(formData.expiresAt) * 24 * 60 * 60)
        : null // null = None for Option<u64>
      const maxCompletions = formData.maxCompletions 
        ? parseInt(formData.maxCompletions) 
        : null // null = None for Option<i128>
      const badgeId = formData.badgeId && formData.badgeId.trim() !== '' 
        ? formData.badgeId.trim() 
        : null // null = None for Option<Symbol>

      // Build transaction arguments (matching contract signature exactly)
      // creator: Address, quest_id: Symbol, title: String, description: String,
      // reward_amount: i128, badge_id: Option<Symbol>, expires_at: Option<u64>, max_completions: Option<i128>
      const args = [
        publicKey, // creator (Address as string)
        formData.questId.trim(), // quest_id (Symbol) - must be <= 9 chars
        formData.title.trim(), // title (String)
        formData.description.trim(), // description (String)
        rewardAmount, // reward_amount (i128)
        badgeId, // badge_id (Option<Symbol>) - null if empty
        expiresAt, // expires_at (Option<u64>) - null if empty
        maxCompletions, // max_completions (Option<i128>) - null if empty
      ]

      // Invoke contract
      const txService = new ContractTransactionService()
      const txHash = await txService.invokeContract(
        QUEST_PLATFORM_CONTRACT_ID,
        'create_quest',
        args,
        publicKey
      )

      alert(`Quest created successfully!\n\nTransaction Hash: ${txHash}\n\nYour quest is now on-chain!`)
      navigate('/')
    } catch (error: any) {
      console.error('Error creating quest:', error)
      setError(error.message || 'Failed to create quest. Please check console for details.')
      alert(`Error creating quest: ${error.message || 'Unknown error'}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">Please connect your wallet to create a quest.</p>
        </div>
      </div>
    )
  }

  if (!QUEST_PLATFORM_CONTRACT_ID) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Contract Not Configured</h2>
          <p className="text-red-700">
            Quest Platform Contract ID is missing. Please:
          </p>
          <ol className="list-decimal list-inside text-red-700 mt-2 space-y-1">
            <li>Deploy the quest_platform contract (see DEPLOYMENT.md)</li>
            <li>Set VITE_QUEST_PLATFORM_CONTRACT_ID in frontend/.env</li>
            <li>Restart the development server</li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">➕ Create New Quest</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-lg space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Quest ID *
          </label>
          <input
            type="text"
            required
            value={formData.questId}
            onChange={(e) => setFormData({ ...formData, questId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="e.g., my_first_quest"
            maxLength={9}
          />
          <p className="text-xs text-gray-500 mt-1">Unique identifier (max 9 characters, used as Symbol)</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="e.g., Complete Tutorial Quest"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Describe what users need to do to complete this quest..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Reward Amount (tokens) *
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.rewardAmount}
            onChange={(e) => setFormData({ ...formData, rewardAmount: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="1000"
          />
          <p className="text-xs text-gray-500 mt-1">Amount will be multiplied by 10,000,000 (7 decimals)</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Badge ID (optional, max 9 chars)
          </label>
          <input
            type="text"
            value={formData.badgeId}
            onChange={(e) => setFormData({ ...formData, badgeId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="badge_id"
            maxLength={9}
          />
          <p className="text-xs text-gray-500 mt-1">NFT badge to mint when quest is completed</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Max Completions
            </label>
            <input
              type="number"
              min="1"
              value={formData.maxCompletions}
              onChange={(e) => setFormData({ ...formData, maxCompletions: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="100"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Expires At (days)
            </label>
            <input
              type="number"
              min="1"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="30"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Creating a quest requires a transaction on Stellar testnet.
            You'll need to approve the transaction in Freighter wallet.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Creating Quest... (Approve in Freighter)' : 'Create Quest 🚀'}
        </button>
      </form>
    </div>
  )
}
