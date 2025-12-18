import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardLayout from './components/layouts/DashboardLayout'
import EnhancedDashboard from './pages/EnhancedDashboard'
import Facilitators from './pages/Facilitators'
import Properties from './pages/Properties'
import Maintenance from './pages/Maintenance'
import Landlords from './pages/Landlords'
import Settings from './pages/Settings'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <>
      <Toaster />
      <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<EnhancedDashboard />} />
                  <Route path="/facilitators" element={<Facilitators />} />
                  <Route path="/properties" element={<Properties />} />
                  <Route path="/maintenance" element={<Maintenance />} />
                  <Route path="/landlords" element={<Landlords />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
