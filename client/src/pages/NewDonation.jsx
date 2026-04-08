import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewDonation() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [foodName, setFoodName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [expiryDatetime, setExpiryDatetime] = useState('')
  const [description, setDescription] = useState('')
  const [safetyTemp, setSafetyTemp] = useState('hot')
  const [safetyPackaging, setSafetyPackaging] = useState('sealed')
  const [safetyAllergens, setSafetyAllergens] = useState('no')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.createDonation({
        food_name: foodName, quantity,
        expiry_datetime: new Date(expiryDatetime).toISOString(),
        description, safety_temp: safetyTemp,
        safety_packaging: safetyPackaging, safety_allergens: safetyAllergens,
      })
      toast.success('Donation published successfully!')
      navigate('/donor/dashboard')
    } catch (err) {
      setError(err.message)
      toast.error('Failed to create donation')
    } finally { setLoading(false) }
  }

  return (
    <div className="page-fade">
      <div className="page-container">
        <div style={{ marginBottom: 28 }}>
          <h1 className="page-title">Create New Donation</h1>
          <p className="muted-text" style={{ marginTop: 4 }}>List surplus food for NGOs to pick up</p>
        </div>

        {error && (
          <div style={{
            marginBottom: 20, padding: '10px 14px', borderRadius: 10,
            background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: 24,
          }}>
            {/* Desktop: two columns */}
            <style>{`@media (min-width: 768px) { .form-two-col { grid-template-columns: 1.5fr 1fr !important; } }`}</style>
            <div className="form-two-col" style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 24,
            }}>
              {/* ─── Left: Food Details ─────────────────────── */}
              <div className="card-no-hover">
                <h3 className="section-heading" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  🍲 Food Details
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div className="form-group">
                    <label className="form-label">Food Item Name</label>
                    <input id="donation-food-name" type="text" value={foodName}
                      onChange={(e) => setFoodName(e.target.value)}
                      placeholder="e.g. Paneer Biryani, Mixed Veg Curry" required className="form-input" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Quantity</label>
                      <input id="donation-quantity" type="text" value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="e.g. 20 servings" required className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Expiry Date & Time</label>
                      <input id="donation-expiry" type="datetime-local" value={expiryDatetime}
                        onChange={(e) => setExpiryDatetime(e.target.value)} required className="form-input" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea id="donation-description" value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add details about the food item, serving suggestions, etc." rows={4} className="form-input" />
                  </div>
                </div>
              </div>

              {/* ─── Right: Safety Checklist ────────────────── */}
              <div style={{
                background: '#f0fdf4',
                borderRadius: 16,
                border: '1px solid #bbf7d0',
                padding: 24,
              }}>
                <h3 className="section-heading" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={20} color="#16a34a" /> Food Safety Checklist
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Temperature */}
                  <div>
                    <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Storage Temperature</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[
                        { value: 'hot', label: '🔥 Hot' },
                        { value: 'cold', label: '❄️ Cold' },
                        { value: 'dry', label: '📦 Dry' },
                      ].map(opt => (
                        <button key={opt.value} type="button" onClick={() => setSafetyTemp(opt.value)}
                          className={`safety-toggle ${safetyTemp === opt.value ? 'safety-toggle-active' : ''}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Packaging */}
                  <div>
                    <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Packaging Status</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[
                        { value: 'sealed', label: '✅ Sealed' },
                        { value: 'open', label: '⚠️ Open' },
                      ].map(opt => (
                        <button key={opt.value} type="button" onClick={() => setSafetyPackaging(opt.value)}
                          className={`safety-toggle ${safetyPackaging === opt.value ? 'safety-toggle-active' : ''}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Allergens */}
                  <div>
                    <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Contains Allergens?</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[
                        { value: 'no', label: '✅ No Allergens' },
                        { value: 'yes', label: '⚠️ Contains Allergens' },
                      ].map(opt => (
                        <button key={opt.value} type="button" onClick={() => setSafetyAllergens(opt.value)}
                          className={`safety-toggle ${
                            safetyAllergens === opt.value
                              ? (opt.value === 'yes' ? 'safety-toggle-warn' : 'safety-toggle-active')
                              : ''
                          }`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button id="donation-submit" type="submit" disabled={loading}
            className="btn btn-primary btn-full btn-lg" style={{ marginTop: 24 }}>
            {loading ? 'Creating...' : '🍽️ Publish Donation'}
          </button>
        </form>
      </div>
    </div>
  )
}
