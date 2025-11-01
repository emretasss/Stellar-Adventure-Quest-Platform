// Quest Board - Main page showing active quests
import { useEffect, useState } from 'react'
import { useFreighter } from '../hooks/useFreighter'
import { QuestService, Quest } from '../services/questService'
import { Link } from 'react-router-dom'

export default function QuestBoard() {
  const { publicKey, isConnected } = useFreighter()
  const [quests, setQuests] = useState<Quest[]>([])
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set())
  const [leaderboard, setLeaderboard] = useState<Array<[string, number]>>([])
  const [loading, setLoading] = useState(true)
  const questService = new QuestService()

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [publicKey, isConnected])

  const loadData = async () => {
    try {
      setLoading(true)
      const [activeQuests, leaderboardData] = await Promise.all([
        questService.getActiveQuests(),
        questService.getLeaderboard(),
      ])
      
      setQuests(activeQuests)
      setLeaderboard(leaderboardData.slice(0, 10)) // Top 10

      if (publicKey && isConnected) {
        const userCompletions = await questService.getUserCompletions(publicKey)
        setCompletedQuests(new Set(userCompletions))
      }
    } catch (error) {
      console.error('Error loading quest board:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteQuest = async (questId: string) => {
    if (!publicKey || !isConnected) {
      alert('Please connect your wallet first!')
      return
    }

    if (completedQuests.has(questId)) {
      alert('You have already completed this quest!')
      return
    }

    try {
      // In production, this would invoke the contract via Freighter
      // For now, show a message
      alert(`Completing quest: ${questId}\n\nIn production, this will call the contract and mint your reward!`)
      
      // Reload data
      await loadData()
    } catch (error) {
      console.error('Error completing quest:', error)
      alert('Error completing quest. Please try again.')
    }
  }

  const formatDate = (timestamp: string) => {
    if (!timestamp) return null
    return new Date(Number(timestamp) * 1000).toLocaleDateString()
  }

  if (loading && quests.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-xl p-8 mb-8 shadow-2xl">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              🎮 Stellar Adventure Quest
            </h1>
            <p className="text-xl opacity-90">
              Complete quests, earn rewards, collect badges!
            </p>
          </div>
          {isConnected && (
            <div className="text-right">
              <div className="text-sm opacity-75 mb-1">Completed Quests</div>
              <div className="text-3xl font-bold">{completedQuests.size}</div>
            </div>
          )}
        </div>
      </div>

      {!isConnected && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-8">
          <p className="text-center font-semibold text-yellow-900 text-lg">
            🔗 Connect your Freighter wallet to start earning rewards!
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <Link
          to="/create-quest"
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
        >
          ➕ Create New Quest
        </Link>
        <Link
          to="/dashboard"
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg"
        >
          📊 My Dashboard
        </Link>
      </div>

      {/* Active Quests */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <span>📋</span>
          <span>Active Quests</span>
          <span className="text-lg font-normal text-gray-500">({quests.length})</span>
        </h2>

        {quests.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <p className="text-xl text-gray-600 mb-4">No active quests yet</p>
            <Link
              to="/create-quest"
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              Be the first to create one! →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quests.map((quest) => {
              const isCompleted = completedQuests.has(quest.id)
              const rewardAmount = Number(quest.reward_amount) / 1_000_0000 // Assuming 7 decimals
              
              return (
                <div
                  key={quest.id}
                  className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all duration-200 hover:shadow-xl hover:scale-105 ${
                    isCompleted
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-purple-400'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">
                      {quest.title || quest.id}
                    </h3>
                    {isCompleted && (
                      <span className="text-2xl">✅</span>
                    )}
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {quest.description || 'No description provided'}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Reward:</span>
                      <span className="font-bold text-purple-600">
                        {rewardAmount.toFixed(2)} tokens
                      </span>
                    </div>
                    {quest.badge_id && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Badge:</span>
                        <span className="font-semibold text-blue-600">🎖️ NFT Badge</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Completions:</span>
                      <span className="font-semibold">
                        {quest.current_completions} / {quest.max_completions || '∞'}
                      </span>
                    </div>
                    {quest.expires_at && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Expires:</span>
                        <span className="font-semibold">
                          {formatDate(quest.expires_at)}
                        </span>
                      </div>
                    )}
                  </div>

                  {!isCompleted ? (
                    <button
                      onClick={() => handleCompleteQuest(quest.id)}
                      disabled={!isConnected}
                      className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isConnected ? 'Complete Quest 🎯' : 'Connect Wallet First'}
                    </button>
                  ) : (
                    <div className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold text-center">
                      ✓ Completed
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-8 text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <span>🏆</span>
            <span>Top Adventurers</span>
          </h2>
          <div className="space-y-3">
            {leaderboard.map(([address, count], idx) => {
              const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
              const isCurrentUser = address === publicKey
              
              return (
                <div
                  key={address}
                  className={`flex justify-between items-center bg-white/20 rounded-lg p-4 ${
                    isCurrentUser ? 'ring-2 ring-yellow-400' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold w-8">#{idx + 1}</span>
                    <span className={`font-semibold ${isCurrentUser ? 'text-yellow-300' : ''}`}>
                      {isCurrentUser ? 'You' : shortAddress}
                    </span>
                  </div>
                  <span className="text-xl font-bold">{count} quests</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
