import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../App'
import { UtensilsCrossed, Phone, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('donor')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.login({ phone, password, role })
      setUser(data.user)
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate(role === 'donor' ? '/donor/dashboard' : '/ngo/browse')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-fade" style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 16 }}>
            <UtensilsCrossed size={26} color="#16a34a" strokeWidth={2.5} />
            <span style={{ fontSize: 22, fontWeight: 700, color: '#16a34a' }}>FoodBridge</span>
          </Link>
          <h1 className="page-title" style={{ fontSize: 24 }}>Welcome back</h1>
          <p className="muted-text" style={{ marginTop: 4 }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="auth-card">
          <div className="auth-card-accent"></div>
          <div className="auth-card-body">
            {error && (
              <div style={{
                marginBottom: 18, padding: '10px 14px', borderRadius: 10,
                background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Role Toggle */}
              <div className="role-tabs">
                <button type="button" onClick={() => setRole('donor')}
                  className={`role-tab ${role === 'donor' ? 'role-tab-active' : ''}`}>
                  🍳 Donor
                </button>
                <button type="button" onClick={() => setRole('ngo')}
                  className={`role-tab ${role === 'ngo' ? 'role-tab-active' : ''}`}>
                  🤝 NGO
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input id="login-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number" required
                    className="form-input" style={{ paddingLeft: 38 }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password" required
                    className="form-input" style={{ paddingLeft: 38 }} />
                </div>
              </div>

              <button id="login-submit" type="submit" disabled={loading}
                className="btn btn-primary btn-full" style={{ marginTop: 4, height: 44 }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#16a34a', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
