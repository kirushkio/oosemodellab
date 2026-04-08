import { useState, useEffect } from 'react'
import { api } from '../api'
import { DonationCard, SkeletonCard } from '../components/DonationCard'
import { Search, SlidersHorizontal, CalendarClock, MapPin, Phone, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NGOBrowse() {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(null)
  const [scheduledTime, setScheduledTime] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedDonation, setSelectedDonation] = useState(null)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => { loadDonations() }, [])

  async function loadDonations() {
    try {
      const data = await api.getAvailable()
      setDonations(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const openScheduleModal = (donation) => {
    setSelectedDonation(donation)
    setScheduledTime('')
    setError('')
    setShowModal(true)
  }

  const handleAccept = async () => {
    if (!scheduledTime) { setError('Please select a pickup time.'); return }
    setAccepting(selectedDonation.id)
    try {
      await api.createPickup({
        donation_id: selectedDonation.id,
        scheduled_time: new Date(scheduledTime).toISOString(),
      })
      toast.success('Pickup scheduled successfully!')
      setShowModal(false)
      setSelectedDonation(null)
      loadDonations()
    } catch (err) {
      setError(err.message)
      toast.error('Failed to schedule pickup')
    } finally { setAccepting(null) }
  }

  const filtered = donations.filter(d =>
    d.food_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.donor_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="page-fade">
      <div className="page-container">
        <div style={{ marginBottom: 28 }}>
          <h1 className="page-title">Available Donations</h1>
          <p className="muted-text" style={{ marginTop: 4 }}>Browse and accept food donations from restaurants</p>
        </div>

        {/* ─── Search & Filter Bar ───────────────────────── */}
        <div className="card-no-hover" style={{
          padding: '14px 20px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <Search size={18} color="#9ca3af" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by food name or restaurant..."
            style={{
              flex: 1, border: 'none', outline: 'none', fontSize: 14,
              fontFamily: 'Inter, sans-serif', color: '#374151', background: 'transparent',
            }}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2 }}>
              <X size={16} />
            </button>
          )}
          <div style={{ height: 20, width: 1, background: '#e5e7eb' }}></div>
          <div className="muted-text" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <SlidersHorizontal size={14} /> {filtered.length} listing{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* ─── Grid ──────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🍃</div>
            <h3 className="section-heading" style={{ marginBottom: 4 }}>No donations available</h3>
            <p className="muted-text">
              {searchTerm ? 'Try a different search term.' : 'Check back later for new food listings.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {filtered.map(donation => (
              <DonationCard key={donation.id} donation={donation}>
                <button
                  id={`accept-donation-${donation.id}`}
                  onClick={() => openScheduleModal(donation)}
                  className="btn btn-accent btn-full"
                >
                  🤝 Accept & Schedule Pickup
                </button>
              </DonationCard>
            ))}
          </div>
        )}
      </div>

      {/* ─── Schedule Pickup Modal ───────────────────────── */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => setShowModal(false)}></div>
          <div className="modal-content">
            <button onClick={() => setShowModal(false)}
              style={{
                position: 'absolute', top: 16, right: 16,
                width: 32, height: 32, borderRadius: '50%',
                background: '#f3f4f6', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280',
              }}>
              <X size={16} />
            </button>

            <h2 className="section-heading" style={{ marginBottom: 4 }}>Schedule Pickup</h2>
            <p className="muted-text" style={{ marginBottom: 20 }}>
              Accept <strong style={{ color: '#374151' }}>{selectedDonation?.food_name}</strong> from{' '}
              <strong style={{ color: '#374151' }}>{selectedDonation?.donor_name}</strong>
            </p>

            {error && (
              <div style={{
                marginBottom: 16, padding: '10px 14px', borderRadius: 10,
                background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Pickup Date & Time</label>
              <input id="pickup-schedule-time" type="datetime-local" value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)} className="form-input" />
            </div>

            <div style={{
              padding: 16, borderRadius: 12,
              background: '#f9fafb', marginBottom: 24, border: '1px solid #f3f4f6',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Pickup Location
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', marginBottom: 4 }}>
                <MapPin size={14} color="#16a34a" /> {selectedDonation?.donor_address}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280' }}>
                <Phone size={13} /> {selectedDonation?.donor_phone}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button id="confirm-pickup-btn" onClick={handleAccept} disabled={accepting}
                className="btn btn-primary" style={{ flex: 1 }}>
                {accepting ? 'Scheduling...' : '✅ Confirm Pickup'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
