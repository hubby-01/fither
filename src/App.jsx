import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isPINSet, isSessionUnlocked } from './utils/auth'
import PinSetup from './pages/PinSetup'
import PinEntry from './pages/PinEntry'
import Dashboard from './pages/Dashboard'
import LogWorkout from './pages/LogWorkout'
import History from './pages/History'
import Progress from './pages/Progress'
import Guide from './pages/Guide'
import Settings from './pages/Settings'
import NavBar from './components/NavBar'

export function ProtectedRoute({ children }) {
  if (!isPINSet()) return <Navigate to="/setup" replace />
  if (!isSessionUnlocked()) return <Navigate to="/login" replace />
  return children
}

function AppShell() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/log" element={<LogWorkout />} />
          <Route path="/history" element={<History />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/setup" element={<PinSetup />} />
        <Route path="/login" element={<PinEntry />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        } />
      </Routes>
    </HashRouter>
  )
}
