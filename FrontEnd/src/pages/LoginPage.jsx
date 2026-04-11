import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function LoginPage() {
  // These store what the user types in the form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // This stores any error message from the server (wrong password, etc.)
  const [error, setError] = useState('')

  // This prevents double-clicking the button
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault() // stops the page from refreshing
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', { email, password })

      // Your backend returns: { user, token }
      const { user, token } = response.data

      // Save to context + localStorage
      login(user, token)

      // Redirect based on role
      if (user.role === 'donor') {
        navigate('/dashboard')
      } else if (user.role === 'charity') {
        navigate('/charity-dashboard')
      } else {
        navigate('/')
      }

    } catch (err) {
      // Show the error message from your backend
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '0 20px' }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label>Email</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label>Password</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        {/* Show error if there is one */}
        {error && (
          <p style={{ color: 'red', marginBottom: '12px' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px', cursor: 'pointer' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: '16px' }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  )
}

export default LoginPage