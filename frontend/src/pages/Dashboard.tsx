// Dashboard - User's quest statistics, badges, and profile
import { useEffect, useState } from 'react'
import { useFreighter } from '../hooks/useFreighter'
import { QuestService, Quest } from '../services/questService'
import { BadgeService } from '../services/badgeService'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { publicKey, isConnected } = useFreighter()
  const [completedQuests, setCompletedQuests] = useState<string[]>([])
  const [badges, setBadges] = useState<string[]>([])
  const [userQuests, setUserQuests] = useState<Quest[]>([])
  const [leaderboardPosition, setLeaderboardPosition] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const questService = new QuestService()
  const badgeService = new BadgeService()

  useEffect(() => {
    if (publicKey && isConnected) {
      loadUserData()
    }
  }, [publicKey, isConnected])

  const loadUserData = async () => {
    if (!publicKey) return

    try {
      setLoading(true)
      
      const [completions, badgeIds, leaderboard] = await Promise.all([
        questService.getUserCompletions(publicKey),
        badgeService.getUserBadges(publicKey),
        questService.getLeaderboard(),
      ])

      setCompletedQuests(completions)
      setBadges(badgeIds)

      // Find user's position in leaderboard
      const position = leaderboard.findIndex(([addr]) => addr === publicKey)
      setLeaderboardPosition(position >= 0 ? position + 1 : null)

      // Load quest details for completed quests
      const questDetails = await Promise.all(
        completions.map(id => questService.getQuest(id))
      )
      setUserQuests(questDetails.filter((q): q is Quest => q !== null))
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">Please connect your wallet to view your dashboard.</p>
          <Link
            to="/"
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            Go to Quest Board →
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">📊 Your Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-sm opacity-90 mb-1">Completed Quests</div>
          <div className="text-4xl font-bold">{completedQuests.length}</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-sm opacity-90 mb-1">Badges Collected</div>
          <div className="text-4xl font-bold">{badges.length}</div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-sm opacity-90 mb-1">Leaderboard Rank</div>
          <div className="text-4xl font-bold">
            {leaderboardPosition ? `#${leaderboardPosition}` : 'N/A'}
          </div>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-3">Wallet Address</h2>
        <p className="font-mono text-sm bg-gray-100 p-3 rounded break-all">
          {publicKey}
        </p>
      </div>

      {/* Completed Quests */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">✅ Completed Quests</h2>
        {userQuests.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <p className="text-gray-600 mb-4">You haven't completed any quests yet!</p>
            <Link
              to="/"
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              Start completing quests →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userQuests.map((quest) => (
              <div
                key={quest.id}
                className="bg-white rounded-lg p-4 border-2 border-green-200 shadow-md"
              >
                <h3 className="font-bold text-lg mb-2">{quest.title || quest.id}</h3>
                <p className="text-sm text-gray-600 mb-2">{quest.description}</p>
                <div className="text-sm text-green-600 font-semibold">
                  ✓ Completed
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">🎖️ Your Badges</h2>
        {badges.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <p className="text-gray-600">No badges collected yet. Complete quests to earn badges!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {badges.map((badgeId) => (
              <div
                key={badgeId}
                className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white text-center shadow-lg transform hover:scale-105 transition-transform"
              >
                <div className="text-4xl mb-2">🎖️</div>
                <div className="text-xs font-semibold truncate">{badgeId}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex gap-4 flex-wrap">
          <Link
            to="/"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Browse Quests
          </Link>
          <Link
            to="/create-quest"
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Create Quest
          </Link>
        </div>
      </div>
    </div>
  )
}
