import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'donor',           // default role
    organization: '',
    registrationNumber: ''
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  // This one function handles ALL inputs
  // instead of writing a separate handler for each field
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await api.post('/auth/register', formData)

      // Registration successful — tell the user then redirect to login
      setSuccess('Account created! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)

    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '440px', margin: '60px auto', padding: '0 20px' }}>
      <h2>Create Account</h2>

      <form onSubmit={handleSubmit}>

        {/* Name */}
        <div style={{ marginBottom: '14px' }}>
          <label>Full Name</label><br />
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: '14px' }}>
          <label>Email</label><br />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '14px' }}>
          <label>Password (min 8 characters)</label><br />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        {/* Phone */}
        <div style={{ marginBottom: '14px' }}>
          <label>Phone (optional)</label><br />
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        {/* Role selector */}
        <div style={{ marginBottom: '14px' }}>
          <label>I am a...</label><br />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          >
            <option value="donor">Donor</option>
            <option value="charity">Charity</option>
          </select>
        </div>

        {/* These fields only appear when role is "charity" */}
        {formData.role === 'charity' && (
          <>
            <div style={{ marginBottom: '14px' }}>
              <label>Organization Name</label><br />
              <input
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label>Registration Number</label><br />
              <input
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>

            {/* Important warning for charities */}
            <div style={{
              backgroundColor: '#fff8e1',
              border: '1px solid #f9a825',
              borderRadius: '6px',
              padding: '10px 14px',
              marginBottom: '14px',
              fontSize: '14px'
            }}>
              ⚠️ Charity accounts start as <strong>pending</strong>. 
              An admin must approve your account before you can claim donations.
            </div>
          </>
        )}

        {/* Messages */}
        {error && <p style={{ color: 'red', marginBottom: '12px' }}>{error}</p>}
        {success && <p style={{ color: 'green', marginBottom: '12px' }}>{success}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px', cursor: 'pointer' }}
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p style={{ marginTop: '16px' }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  )
}

export default RegisterPage