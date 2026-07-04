import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import TrainingPage from './pages/TrainingPage'
import AnalysisPage from './pages/AnalysisPage'

function App() {
  const token = localStorage.getItem('token')

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/training/:sessionId?" element={token ? <TrainingPage /> : <Navigate to="/login" />} />
        <Route path="/analysis" element={token ? <AnalysisPage /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  )
}

export default App
