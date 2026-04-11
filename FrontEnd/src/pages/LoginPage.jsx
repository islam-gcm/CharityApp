import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Alert from '../components/Alert.jsx'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { getErrorMessage } from '../services/api.js'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      await login(form)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="auth-page">
      <form className="form-card" onSubmit={submit}>
        <p className="eyebrow">Welcome back</p>
        <h1>Login</h1>
        <Alert type="error">{error}</Alert>
        <Input label="Email" id="login-email" name="email" type="email" value={form.email} onChange={update} required />
        <Input label="Password" id="login-password" name="password" type="password" value={form.password} onChange={update} required />
        <Button type="submit" disabled={saving}>
          {saving ? 'Logging in...' : 'Login'}
        </Button>
        <p className="muted">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </section>
  )
}

export default LoginPage
