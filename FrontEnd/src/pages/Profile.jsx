import { useState } from 'react'
import Alert from '../components/Alert.jsx'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'
import Spinner from '../components/Spinner.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useNotifications } from '../hooks/useNotifications.js'
import { getErrorMessage } from '../services/api.js'
import { formatDate, titleCase } from '../utils/formatters.js'

function Profile() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
    organization: user.organization || '',
    registrationNumber: user.registrationNumber || '',
  })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const {
    notifications,
    loading: loadingNotifications,
    error: notificationError,
    markRead,
    removeNotification,
  } = useNotifications()

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      await updateProfile(form)
      setMessage('Profile updated.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="stack">
      <div className="page-head">
        <div>
          <p className="eyebrow">Private profile</p>
          <h1>{user.name}</h1>
          <p>{titleCase(user.role)} - {user.email}</p>
        </div>
      </div>

      <Alert type="success">{message}</Alert>
      <Alert type="error">{error}</Alert>
      <Alert type="error">{notificationError}</Alert>

      <form className="form-card wide" onSubmit={submit}>
        <h2>Profile Information</h2>
        <div className="form-grid">
          <Input label="Name" id="profile-name" name="name" value={form.name} onChange={update} required />
          <Input label="Phone" id="profile-phone" name="phone" value={form.phone} onChange={update} />
          {user.role === 'charity' ? (
            <>
              <Input label="Organization" id="profile-org" name="organization" value={form.organization} onChange={update} />
              <Input label="Registration number" id="profile-reg" name="registrationNumber" value={form.registrationNumber} onChange={update} />
            </>
          ) : null}
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Update profile'}
        </Button>
      </form>

      <section className="stack compact">
        <h2>Notifications</h2>
        {loadingNotifications ? <Spinner label="Loading notifications" /> : null}
        {notifications.map((notification) => (
          <article className={`notification ${notification.isRead ? '' : 'unread'}`} key={notification._id}>
            <div>
              <strong>{titleCase(notification.type)}</strong>
              <p>{notification.message}</p>
              <small>{formatDate(notification.createdAt)}</small>
            </div>
            <div className="card-actions">
              {!notification.isRead ? (
                <Button variant="secondary" onClick={() => markRead(notification._id)}>
                  Mark read
                </Button>
              ) : null}
              <Button variant="danger" onClick={() => removeNotification(notification._id)}>
                Delete
              </Button>
            </div>
          </article>
        ))}
        {!loadingNotifications && notifications.length === 0 ? <Alert>No notifications yet.</Alert> : null}
      </section>
    </section>
  )
}

export default Profile
