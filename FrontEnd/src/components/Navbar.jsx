import { NavLink, Link } from 'react-router-dom'
import Button from './Button.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useNotifications } from '../hooks/useNotifications.js'

function Navbar() {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications(user ? 30000 : 0)

  return (
    <header className="navbar">
      <Link className="brand" to="/">
        <span className="brand-mark">D</span>
        <span>Donation Platform</span>
      </Link>

      <nav className="nav-links" aria-label="Main navigation">
        <NavLink to="/posts">Donations</NavLink>
        {user ? <NavLink to="/dashboard">Dashboard</NavLink> : null}
        {user?.role === 'donor' ? <NavLink to="/posts/create">Create</NavLink> : null}
        {user?.role === 'charity' ? <NavLink to="/claims">Claims</NavLink> : null}
        {user?.role === 'admin' ? <NavLink to="/admin">Admin</NavLink> : null}
        {user ? (
          <NavLink to="/notifications">
            Notifications{unreadCount ? <span className="nav-badge">{unreadCount}</span> : null}
          </NavLink>
        ) : null}
        {user ? <NavLink to="/profile">Profile</NavLink> : null}
      </nav>

      <div className="nav-actions">
        {user ? (
          <>
            <span className="user-chip">{user.role}</span>
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <NavLink className="btn btn-ghost" to="/login">
              Login
            </NavLink>
            <NavLink className="btn btn-primary" to="/register">
              Register
            </NavLink>
          </>
        )}
      </div>
    </header>
  )
}

export default Navbar
