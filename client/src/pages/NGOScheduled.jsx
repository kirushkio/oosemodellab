import { useState, useEffect } from 'react'
import { api } from '../api'
import { StatusBadge, SafetyInfo, ExpiryCountdown, SkeletonCard } from '../components/DonationCard'
import { MapPin, Phone, Truck, CheckCircle2, Package, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NGOScheduled() {
  const [pickups, setPickups] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => { loadPickups() }, [])

  async function loadPickups() {
    try {
      const data = await api.getMyPickups()
      setPickups(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function updateStatus(pickupId, newStatus) {
    setUpdating(pickupId)
    try {
      await api.updatePickupStatus(pickupId, newStatus)
      toast.success(newStatus === 'picked_up' ? 'Marked as picked up!' : 'Delivery completed!')
      loadPickups()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update status')
    } finally { setUpdating(null) }
  }

  // Group pickups by date
  const groupedPickups = pickups.reduce((groups, pickup) => {
    const dateObj = new Date(pickup.scheduled_time)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let dateLabel
    if (dateObj.toDateString() === today.toDateString()) {
      dateLabel = `Today · ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    } else if (dateObj.toDateString() === tomorrow.toDateString()) {
      dateLabel = `Tomorrow · ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    } else {
      dateLabel = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
    }

    if (!groups[dateLabel]) groups[dateLabel] = []
    groups[dateLabel].push(pickup)
    return groups
  }, {})

  return (
    <div className="page-fade">
      <div className="page-container">
        <div style={{ marginBottom: 28 }}>
          <h1 className="page-title">Scheduled Pickups</h1>
          <p className="muted-text" style={{ marginTop: 4 }}>Track and manage your accepted donations</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 140, borderRadius: 14 }}></div>
            ))}
          </div>
        ) : pickups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <h3 className="section-heading" style={{ marginBottom: 4 }}>No scheduled pickups</h3>
            <p className="muted-text">Browse available donations and accept one to get started.</p>
          </div>
        ) : (
          <div>
            {Object.entries(groupedPickups).map(([date, datePickups]) => (
              <div key={date}>
                {/* ─── Date Divider ────────────────────────── */}
                <div className="date-divider">
                  <span className="date-pill">{date}</span>
                </div>

                {/* ─── Pickup Cards ───────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {datePickups.map(pickup => (
                    <div key={pickup.id} className="pickup-row">
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                        {/* Left: Info */}
                        <div style={{ flex: 1, minWidth: 200 }}>
                          {/* Header */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <div className="card-title">{pickup.food_name}</div>
                            <StatusBadge status={pickup.status} />
                          </div>

                          {/* Meta row */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 8 }}>
                            <span className="muted-text" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Package size={13} /> {pickup.quantity}
                            </span>
                            <span className="muted-text" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Clock size={13} /> {new Date(pickup.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <ExpiryCountdown expiryDatetime={pickup.expiry_datetime} />
                          </div>

                          {pickup.description && (
                            <p className="body-text" style={{ marginBottom: 8 }}>{pickup.description}</p>
                          )}

                          <SafetyInfo temp={pickup.safety_temp} packaging={pickup.safety_packaging} allergens={pickup.safety_allergens} />

                          {/* Donor Info */}
                          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 13, color: '#6b7280' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              from <strong style={{ color: '#374151' }}>{pickup.donor_name}</strong>
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <MapPin size={13} color="#16a34a" /> {pickup.donor_address}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Phone size={12} /> {pickup.donor_phone}
                            </span>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', justifyContent: 'center' }}>
                          {pickup.status === 'scheduled' && (
                            <button
                              id={`mark-picked-up-${pickup.id}`}
                              onClick={() => updateStatus(pickup.id, 'picked_up')}
                              disabled={updating === pickup.id}
                              className="btn" style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: 13 }}
                            >
                              <Truck size={15} /> {updating === pickup.id ? 'Updating...' : 'Mark Picked Up'}
                            </button>
                          )}
                          {pickup.status === 'picked_up' && (
                            <button
                              id={`mark-completed-${pickup.id}`}
                              onClick={() => updateStatus(pickup.id, 'completed')}
                              disabled={updating === pickup.id}
                              className="btn btn-primary" style={{ fontSize: 13 }}
                            >
                              <CheckCircle2 size={15} /> {updating === pickup.id ? 'Updating...' : 'Mark Completed'}
                            </button>
                          )}
                          {pickup.status === 'completed' && (
                            <span className="muted-text" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle2 size={14} color="#16a34a" /> Delivery completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
