import { Link } from 'react-router-dom'
import { useAuth } from '../App'
import { Sprout, ClipboardList, Truck, ShieldCheck, ArrowRight } from 'lucide-react'

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="page-fade">
      {/* ─── Hero Section ─────────────────────────────────── */}
      <section style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '60px 24px',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: -120, right: -80,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.12), transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -100, left: -60,
          width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.10), transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '15%',
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(254,240,138,0.15), transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 640 }}>
          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #dcfce7, #f0fdf4)',
            border: '2px solid #bbf7d0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px',
          }}>
            <Sprout size={32} color="#16a34a" strokeWidth={2} />
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 800,
            color: '#111827',
            lineHeight: 1.15,
            marginBottom: 18,
          }}>
            Reduce Food Waste.{' '}
            <span className="gradient-text">Feed Communities.</span>
          </h1>

          <p style={{
            fontSize: 17,
            color: '#6b7280',
            lineHeight: 1.7,
            maxWidth: 500,
            margin: '0 auto 36px',
          }}>
            FoodBridge connects restaurants with NGOs to redistribute surplus food.
            Together, we can turn excess into impact.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
            {user ? (
              <Link
                to={user.role === 'donor' ? '/donor/dashboard' : '/ngo/browse'}
                className="btn btn-primary btn-lg"
              >
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register?role=donor" id="hero-donor-btn" className="btn btn-primary btn-lg">
                  🍳 I'm a Donor
                </Link>
                <Link to="/register?role=ngo" id="hero-ngo-btn" className="btn btn-accent btn-lg">
                  🤝 I'm an NGO
                </Link>
              </>
            )}
          </div>

          {!user && (
            <p style={{ marginTop: 20, fontSize: 13, color: '#9ca3af' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#16a34a', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                Log in here
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* ─── Feature Highlights ───────────────────────────── */}
      <section style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 24px 80px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {[
            {
              icon: <ClipboardList size={24} color="#16a34a" />,
              title: 'Donor Registration',
              desc: 'Restaurants list their surplus food with quantity and safety details.',
              bg: '#f0fdf4',
              border: '#bbf7d0',
            },
            {
              icon: <Truck size={24} color="#f97316" />,
              title: 'Pickup Scheduling',
              desc: 'NGOs accept donations and schedule convenient pickup times.',
              bg: '#fff7ed',
              border: '#fed7aa',
            },
            {
              icon: <ShieldCheck size={24} color="#3b82f6" />,
              title: 'Food Safety Tracking',
              desc: 'Every donation tracks temperature, packaging, and allergen info.',
              bg: '#eff6ff',
              border: '#bfdbfe',
            },
          ].map((f, i) => (
            <div key={i} className="card-no-hover" style={{
              background: f.bg,
              borderColor: f.border,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: 'white',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {f.icon}
              </div>
              <div className="section-heading" style={{ fontSize: 17 }}>{f.title}</div>
              <p className="body-text" style={{ lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────── */}
      <footer style={{
        textAlign: 'center',
        padding: '24px',
        fontSize: 13,
        color: '#9ca3af',
        borderTop: '1px solid #e5e7eb',
      }}>
        © 2024 FoodBridge. Built with 💚 to reduce food waste.
      </footer>
    </div>
  )
}
