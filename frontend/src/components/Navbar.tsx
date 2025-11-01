// Navigation bar component / Navigasyon çubuğu bileşeni
import { Link, useLocation } from 'react-router-dom'
import { useFreighter } from '../hooks/useFreighter'

export default function Navbar() {
  const location = useLocation()
  const { publicKey, isConnected, connect, disconnect } = useFreighter()

  const navLinks = [
    { path: '/', label: '🎮 Quest Board' },
    { path: '/dashboard', label: '📊 Dashboard' },
    { path: '/create-quest', label: '➕ Create Quest' },
  ]

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-xl">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-white hover:text-purple-200">
              🌟 Stellar Adventure Quest
            </Link>
            <div className="flex space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'bg-white text-purple-600 font-bold'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <>
                <span className="text-sm text-gray-600">
                  {publicKey?.substring(0, 8)}...{publicKey?.substring(publicKey.length - 6)}
                </span>
                <button
                  onClick={disconnect}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Disconnect
                </button>
              </>
            ) : (
                <button
                  onClick={connect}
                  className="px-4 py-2 bg-white text-purple-600 font-bold rounded-md hover:bg-purple-50 shadow-md transition-all hover:scale-105"
                >
                  🎮 Connect & Start Quest
                </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

