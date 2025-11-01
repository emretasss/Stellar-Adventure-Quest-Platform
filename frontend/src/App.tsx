// Main App component with routing / Yönlendirme ile ana App bileşeni
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WalletProvider } from './hooks/useFreighter'
import Navbar from './components/Navbar'
import QuestBoard from './pages/QuestBoard'
import Dashboard from './pages/Dashboard'
import CreateQuest from './pages/CreateQuest'

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<QuestBoard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-quest" element={<CreateQuest />} />
            </Routes>
          </main>
        </div>
      </Router>
    </WalletProvider>
  )
}

export default App

