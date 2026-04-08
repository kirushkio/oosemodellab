import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../App'
import { DonationCard, StatusBadge, SkeletonCard } from '../components/DonationCard'
import { Plus, Package, CheckCircle2, Clock, BarChart3, CalendarClock, Handshake } from 'lucide-react'

export default function DonorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { loadDonations() }, [])

  async function loadDonations() {
    try {
      const data = await api.getMyDonations()
      setDonations(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const filtered = filter === 'all' ? donations : donations.filter(d => d.status === filter)

  const stats = {
    total: donations.length,
    available: donations.filter(d => d.status === 'available').length,
    completed: donations.filter(d => d.status === 'completed').length,
  }

  const upcomingPickups = donations.filter(d => d.scheduled_time && d.status !== 'completed' && d.status !== 'expired')

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="page-fade">
      <div className="page-container">
        {/* ─── Greeting Banner ────────────────────────────── */}
        <div className="greeting-banner" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <h1 className="page-title" style={{ fontSize: 24 }}>
                Welcome back, {user.name} 👋
              </h1>
              <p className="muted-text" style={{ marginTop: 4 }}>{today}</p>
            </div>
            <Link to="/donor/new-donation" className="btn btn-primary" id="new-donation-btn">
              <Plus size={16} /> New Donation
            </Link>
          </div>
        </div>

        {/* ─── Stat Cards ────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 36 }}>
          <div className="stat-card" style={{ borderLeft: '4px solid #6b7280' }}>
            <div className="stat-card-icon" style={{ background: '#f3f4f6' }}>
              <BarChart3 size={20} color="#6b7280" />
            </div>
            <div>
              <div className="stat-card-value">{stats.total}</div>
              <div className="stat-card-label">Total Donations</div>
            </div>
          </div>

          <div className="stat-card" style={{ borderLeft: '4px solid #22c55e' }}>
            <div className="stat-card-icon" style={{ background: '#dcfce7' }}>
              <Package size={20} color="#16a34a" />
            </div>
            <div>
              <div className="stat-card-value">{stats.available}</div>
              <div className="stat-card-label">Active Listings</div>
            </div>
          </div>

          <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
            <div className="stat-card-icon" style={{ background: '#dbeafe' }}>
              <CheckCircle2 size={20} color="#3b82f6" />
            </div>
            <div>
              <div className="stat-card-value">{stats.completed}</div>
              <div className="stat-card-label">Completed</div>
            </div>
          </div>
        </div>

        {/* ─── Upcoming Pickups ───────────────────────────── */}
        {upcomingPickups.length > 0 && (
          <div style={{ marginBottom: 36 }}>
            <h2 className="section-heading" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <CalendarClock size={20} /> Upcoming Pickups
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcomingPickups.map(p => (
                <div key={p.id} className="pickup-row" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Handshake size={20} color="#f97316" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="card-title">{p.food_name}</div>
                    <div className="muted-text">{p.ngo_name} · {new Date(p.scheduled_time).toLocaleString()}</div>
                  </div>
                  <StatusBadge status={p.pickup_status || p.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Filter Tabs ───────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <h2 className="section-heading">Your Donations</h2>
          <div className="filter-tabs">
            {[
              { key: 'all', label: 'All' },
              { key: 'available', label: 'Available' },
              { key: 'accepted', label: 'Accepted' },
              { key: 'picked_up', label: 'Picked Up' },
              { key: 'completed', label: 'Completed' },
              { key: 'expired', label: 'Expired' },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`filter-tab ${filter === f.key ? 'filter-tab-active' : ''}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Donation Grid ─────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🍃</div>
            <h3 className="section-heading" style={{ marginBottom: 4 }}>No donations found</h3>
            <p className="muted-text">
              {filter === 'all' ? 'Create your first donation to get started!' : `No ${filter} donations at the moment.`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {filtered.map(donation => (
              <DonationCard key={donation.id} donation={donation}>
                {donation.ngo_name && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280' }}>
                    <Handshake size={14} color="#f97316" />
                    Accepted by <span style={{ fontWeight: 500, color: '#374151' }}>{donation.ngo_name}</span>
                  </div>
                )}
                {donation.scheduled_time && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                    <Clock size={13} />
                    Pickup: {new Date(donation.scheduled_time).toLocaleString()}
                  </div>
                )}
              </DonationCard>
            ))}
          </div>
        )}
      </div>

      {/* ─── Floating Action Button ──────────────────────── */}
      <button className="fab" onClick={() => navigate('/donor/new-donation')} title="Create new donation">
        <Plus size={26} />
      </button>
    </div>
  )
}
