import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Alert from '../components/Alert.jsx'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'
import Select from '../components/Select.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { getErrorMessage } from '../services/api.js'

function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'donor',
    organization: '',
    registrationNumber: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      await register(form)
      setMessage('Account created. Login with your email and password.')
      setTimeout(() => navigate('/login'), 700)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="auth-page">
      <form className="form-card wide" onSubmit={submit}>
        <p className="eyebrow">Join the platform</p>
        <h1>Register</h1>
        <Alert type="success">{message}</Alert>
        <Alert type="error">{error}</Alert>
        <div className="form-grid">
          <Input label="Full name" id="name" name="name" value={form.name} onChange={update} required />
          <Input label="Email" id="email" name="email" type="email" value={form.email} onChange={update} required />
          <Input label="Password" id="password" name="password" type="password" minLength="8" value={form.password} onChange={update} required />
          <Input label="Phone" id="phone" name="phone" value={form.phone} onChange={update} />
          <Select label="Role" id="role" name="role" value={form.role} onChange={update}>
            <option value="donor">Donor</option>
            <option value="charity">Charity</option>
          </Select>
          {form.role === 'charity' ? (
            <>
              <Input label="Organization" id="organization" name="organization" value={form.organization} onChange={update} required />
              <Input label="Registration number" id="registrationNumber" name="registrationNumber" value={form.registrationNumber} onChange={update} required />
            </>
          ) : null}
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? 'Creating account...' : 'Create account'}
        </Button>
        <p className="muted">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </section>
  )
}

export default RegisterPage
