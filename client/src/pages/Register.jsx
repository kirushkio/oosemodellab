import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../App'
import { UtensilsCrossed, User, Phone, Lock, MapPin, Utensils } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const [searchParams] = useSearchParams()
  const initialRole = searchParams.get('role') || 'donor'
  const [role, setRole] = useState(initialRole)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [foodType, setFoodType] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let data
      if (role === 'donor') {
        data = await api.registerDonor({ name, contact, phone, address, food_type: foodType, password })
      } else {
        data = await api.registerNGO({ name, contact, phone, password })
      }
      setUser(data.user)
      toast.success('Account created successfully!')
      navigate(role === 'donor' ? '/donor/dashboard' : '/ngo/browse')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const InputIcon = ({ icon: Icon }) => (
    <Icon size={15} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
  )

  return (
    <div className="page-fade" style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 16 }}>
            <UtensilsCrossed size={26} color="#16a34a" strokeWidth={2.5} />
            <span style={{ fontSize: 22, fontWeight: 700, color: '#16a34a' }}>FoodBridge</span>
          </Link>
          <h1 className="page-title" style={{ fontSize: 24 }}>Create your account</h1>
          <p className="muted-text" style={{ marginTop: 4 }}>Join us in reducing food waste</p>
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

            {/* Role Toggle */}
            <div className="role-tabs" style={{ marginBottom: 22 }}>
              <button type="button" onClick={() => setRole('donor')}
                className={`role-tab ${role === 'donor' ? 'role-tab-active' : ''}`}>
                🍳 Register as Donor
              </button>
              <button type="button" onClick={() => setRole('ngo')}
                className={`role-tab ${role === 'ngo' ? 'role-tab-active' : ''}`}>
                🤝 Register as NGO
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">{role === 'donor' ? 'Restaurant Name' : 'Organization Name'}</label>
                <div style={{ position: 'relative' }}>
                  <InputIcon icon={UtensilsCrossed} />
                  <input id="register-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder={role === 'donor' ? 'e.g. Green Garden Restaurant' : 'e.g. Feeding Hope Foundation'}
                    required className="form-input" style={{ paddingLeft: 38 }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Contact Person</label>
                <div style={{ position: 'relative' }}>
                  <InputIcon icon={User} />
                  <input id="register-contact" type="text" value={contact} onChange={(e) => setContact(e.target.value)}
                    placeholder="Full name" required className="form-input" style={{ paddingLeft: 38 }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <InputIcon icon={Phone} />
                  <input id="register-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit phone number" required className="form-input" style={{ paddingLeft: 38 }} />
                </div>
              </div>

              {role === 'donor' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <div style={{ position: 'relative' }}>
                      <InputIcon icon={MapPin} />
                      <input id="register-address" type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                        placeholder="Full address for pickup" required className="form-input" style={{ paddingLeft: 38 }} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Food Type Offered</label>
                    <div style={{ position: 'relative' }}>
                      <InputIcon icon={Utensils} />
                      <input id="register-food-type" type="text" value={foodType} onChange={(e) => setFoodType(e.target.value)}
                        placeholder="e.g. Vegetarian Indian, Bakery Items" className="form-input" style={{ paddingLeft: 38 }} />
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <InputIcon icon={Lock} />
                  <input id="register-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password" required className="form-input" style={{ paddingLeft: 38 }} />
                </div>
              </div>

              <button id="register-submit" type="submit" disabled={loading}
                className="btn btn-primary btn-full" style={{ marginTop: 4, height: 44 }}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#16a34a', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
