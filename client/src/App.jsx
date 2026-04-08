import { useState, useEffect, createContext, useContext } from 'react'
import { Routes, Route, Navigate, useNavigate, Link, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { UtensilsCrossed, LayoutDashboard, PlusCircle, Search, CalendarCheck, LogOut } from 'lucide-react'
import { api } from './api'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import DonorDashboard from './pages/DonorDashboard'
import NewDonation from './pages/NewDonation'
import NGOBrowse from './pages/NGOBrowse'
import NGOScheduled from './pages/NGOScheduled'

export const AuthContext = createContext(null)
export function useAuth() { return useContext(AuthContext) }

function Navbar() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await api.logout()
      setUser(null)
      navigate('/')
    } catch (e) { console.error(e) }
  }

  const isActive = (path) => location.pathname === path

  if (!user) return null

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <UtensilsCrossed size={22} color="#16a34a" strokeWidth={2.5} />
          <span style={{ fontSize: 18, fontWeight: 700, color: '#16a34a' }}>FoodBridge</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {user.role === 'donor' && (
            <>
              <Link to="/donor/dashboard" className={`nav-link ${isActive('/donor/dashboard') ? 'nav-link-active' : ''}`}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LayoutDashboard size={15} /> Dashboard
                </span>
              </Link>
              <Link to="/donor/new-donation" className={`nav-link ${isActive('/donor/new-donation') ? 'nav-link-active' : ''}`}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <PlusCircle size={15} /> New Donation
                </span>
              </Link>
            </>
          )}
          {user.role === 'ngo' && (
            <>
              <Link to="/ngo/browse" className={`nav-link ${isActive('/ngo/browse') ? 'nav-link-active' : ''}`}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Search size={15} /> Browse
                </span>
              </Link>
              <Link to="/ngo/scheduled" className={`nav-link ${isActive('/ngo/scheduled') ? 'nav-link-active' : ''}`}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarCheck size={15} /> Scheduled
                </span>
              </Link>
            </>
          )}

          <div style={{ marginLeft: 12, paddingLeft: 12, borderLeft: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 13, fontWeight: 600
            }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <span className="muted-text" style={{ display: 'none' }}>{user.name}</span>
            <button onClick={handleLogout} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <LogOut size={14} /> <span style={{ fontSize: 13 }}>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #dcfce7', borderTop: '3px solid #16a34a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" />
  if (role && user.role !== role) return <Navigate to="/" />
  return children
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.me()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            padding: '12px 18px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
          },
          success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/donor/dashboard" element={
              <ProtectedRoute role="donor"><DonorDashboard /></ProtectedRoute>
            } />
            <Route path="/donor/new-donation" element={
              <ProtectedRoute role="donor"><NewDonation /></ProtectedRoute>
            } />
            <Route path="/ngo/browse" element={
              <ProtectedRoute role="ngo"><NGOBrowse /></ProtectedRoute>
            } />
            <Route path="/ngo/scheduled" element={
              <ProtectedRoute role="ngo"><NGOScheduled /></ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </AuthContext.Provider>
  )
}
