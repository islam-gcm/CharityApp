import { Link } from 'react-router-dom'
import HeroShowcase from '../components/HeroShowcase.jsx'
import { useAuth } from '../hooks/useAuth.js'

function HomePage() {
  const { user } = useAuth()

  return (
    <section className="hero-section">
      <div className="hero-copy">
        <p className="eyebrow">Donor and charity management system</p>
        <h1>Post donations, discover available goods, and keep every claim accountable.</h1>
        <p>
          Donors manage donation posts with live remaining quantities. Charities browse, filter,
          and claim what they need without over-claiming stock.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/posts">
            Browse donations
          </Link>
          {user ? (
            <Link className="btn btn-secondary" to="/dashboard">
              Open dashboard
            </Link>
          ) : (
            <Link className="btn btn-secondary" to="/register">
              Create account
            </Link>
          )}
        </div>
      </div>
      <HeroShowcase />
      <div className="home-strip" aria-label="Platform highlights">
        <span>Live donation stock</span>
        <span>Verified charity claims</span>
        <span>Donor-owned updates</span>
      </div>
    </section>
  )
}

export default HomePage
