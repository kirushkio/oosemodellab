import { useState, useEffect } from 'react'
import { Thermometer, Package, AlertTriangle, Clock, MapPin } from 'lucide-react'

/* ─── Expiry Countdown ──────────────────────────────────── */
export function ExpiryCountdown({ expiryDatetime }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    function update() {
      const now = new Date()
      const expiry = new Date(expiryDatetime)
      const diff = expiry - now

      if (diff <= 0) {
        setTimeLeft('Expired')
        setIsExpired(true)
        setIsUrgent(false)
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setIsUrgent(hours < 2)

      if (hours > 0) {
        setTimeLeft(`${hours} hrs ${minutes} min`)
      } else {
        setTimeLeft(`${minutes} min`)
      }
    }

    update()
    const interval = setInterval(update, 30000)
    return () => clearInterval(interval)
  }, [expiryDatetime])

  if (isExpired) {
    return (
      <span style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'line-through' }}>
        Expired
      </span>
    )
  }

  if (isUrgent) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#ef4444' }}>
        <span className="pulse-dot"></span>
        Expires in {timeLeft}
      </span>
    )
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280' }}>
      <Clock size={12} /> Expires in {timeLeft}
    </span>
  )
}

/* ─── Status Badge ──────────────────────────────────────── */
export function StatusBadge({ status }) {
  const labels = {
    available: 'Available',
    accepted: 'Accepted',
    picked_up: 'Picked Up',
    completed: 'Completed',
    expired: 'Expired',
    scheduled: 'Scheduled',
  }
  return (
    <span className={`badge badge-${status}`}>
      {labels[status] || status}
    </span>
  )
}

/* ─── Safety Badges Row ─────────────────────────────────── */
export function SafetyInfo({ temp, packaging, allergens }) {
  const tempLabels = { hot: '🔥 Hot', cold: '❄️ Cold', dry: '📦 Dry' }
  const packLabels = { sealed: '✅ Sealed', open: '⚠️ Open' }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      <span className="safety-badge safety-temp">
        <Thermometer size={11} /> {tempLabels[temp] || temp}
      </span>
      <span className="safety-badge safety-pack">
        <Package size={11} /> {packLabels[packaging] || packaging}
      </span>
      {allergens === 'yes' && (
        <span className="safety-badge safety-allergen">
          <AlertTriangle size={11} /> Allergens
        </span>
      )}
    </div>
  )
}

/* ─── Skeleton Card ─────────────────────────────────────── */
export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ height: 4, background: '#e5e7eb' }}></div>
      <div style={{ padding: 24 }}>
        <div className="skeleton skeleton-line" style={{ width: '70%', height: 18 }}></div>
        <div className="skeleton skeleton-line" style={{ width: '45%', height: 12, marginTop: 8 }}></div>
        <div className="skeleton skeleton-line" style={{ width: '90%', height: 12, marginTop: 16 }}></div>
        <div className="skeleton skeleton-line" style={{ width: '60%', height: 12 }}></div>
        <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
          <div className="skeleton" style={{ width: 60, height: 22, borderRadius: 999 }}></div>
          <div className="skeleton" style={{ width: 60, height: 22, borderRadius: 999 }}></div>
        </div>
      </div>
    </div>
  )
}

/* ─── Donation Card ─────────────────────────────────────── */
export function DonationCard({ donation, children }) {
  return (
    <div className={`card strip-${donation.status}`} style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div className="card-title">{donation.food_name}</div>
            <div className="muted-text" style={{ marginTop: 2 }}>{donation.donor_name}</div>
          </div>
          <StatusBadge status={donation.status} />
        </div>

        {/* Quantity & Expiry */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#374151', fontWeight: 500 }}>
            <Package size={13} /> {donation.quantity}
          </span>
          <ExpiryCountdown expiryDatetime={donation.expiry_datetime} />
        </div>

        {/* Description */}
        {donation.description && (
          <p className="body-text" style={{ marginBottom: 10, lineHeight: 1.5 }}>
            {donation.description}
          </p>
        )}

        {/* Safety */}
        <SafetyInfo
          temp={donation.safety_temp}
          packaging={donation.safety_packaging}
          allergens={donation.safety_allergens}
        />

        {/* Address */}
        {donation.donor_address && (
          <div className="muted-text" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10 }}>
            <MapPin size={12} /> {donation.donor_address}
          </div>
        )}

        {/* Actions */}
        {children && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
