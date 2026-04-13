import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Alert from '../components/Alert.jsx'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'
import Spinner from '../components/Spinner.jsx'
import Textarea from '../components/Textarea.jsx'
import { useAuth } from '../hooks/useAuth.js'
import api, { getErrorMessage } from '../services/api.js'
import { formatDate, titleCase } from '../utils/formatters.js'

function PostDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [donation, setDonation] = useState(null)
  const [claim, setClaim] = useState({ quantity: 1, notes: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadDonation = async () => {
      setLoading(true)
      setError('')

      try {
        const { data } = await api.get(`/posts/${id}`)
        setDonation(data)
        setClaim((current) => ({ ...current, quantity: Math.min(1, data.remainingQty || 1) }))
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    loadDonation()
  }, [id])

  const update = (event) => setClaim({ ...claim, [event.target.name]: event.target.value })

  const submitClaim = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      // Claims send donationId because the backend transaction controller expects that field.
      const { data } = await api.post('/claims', {
        donationId: id,
        quantity: Number(claim.quantity),
        notes: claim.notes,
      })
      setMessage(data.message || 'Donation claimed successfully.')
      // Reload the donation so remainingQty/status reflect the atomic backend update.
      const refreshed = await api.get(`/posts/${id}`)
      setDonation(refreshed.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner label="Loading donation" />

  return (
    <section className="stack">
      <Alert type="error">{error}</Alert>
      {donation ? (
        <>
          <div className="detail-layout">
            <article className="detail-main">
              <p className="eyebrow">{titleCase(donation.donationType)}</p>
              <h1>{donation.name || 'Donation ready for pickup'}</h1>
              {donation.description ? <p>{donation.description}</p> : null}
              <div className="facts">
                <span>Status: {donation.status}</span>
                <span>Remaining: {donation.remainingQty} / {donation.quantity}</span>
                <span>Posted: {formatDate(donation.createdAt)}</span>
              </div>
            </article>
            <aside className="side-panel">
              <h2>Donor Contact</h2>
              {user ? (
                <>
                  <p>{donation.donor?.name || 'Donor'}</p>
                  <p>{donation.contactEmail || donation.donor?.email || 'Email hidden'}</p>
                  <p>{donation.contactPhone || donation.donor?.phone || 'Phone not provided'}</p>
                </>
              ) : (
                <p>Login to view pickup contact details.</p>
              )}
            </aside>
          </div>

          <Alert type="success">{message}</Alert>

          {user?.role === 'charity' ? (
            <form className="form-card slim" onSubmit={submitClaim}>
              <h2>Claim Donation</h2>
              {user.status !== 'approved' ? (
                <Alert type="error">Your charity account must be approved before claiming donations.</Alert>
              ) : null}
              <Input
                label="Quantity requested"
                id="claim-quantity"
                name="quantity"
                type="number"
                min="1"
                max={donation.remainingQty}
                value={claim.quantity}
                onChange={update}
                required
              />
              <Textarea label="Notes" id="claim-notes" name="notes" rows="4" value={claim.notes} onChange={update} />
              <Button type="submit" disabled={saving || user.status !== 'approved' || donation.remainingQty < 1}>
                {saving ? 'Claiming...' : 'Submit claim'}
              </Button>
            </form>
          ) : null}

          {!user ? (
            <Alert>
              <Link to="/login">Login</Link> as a charity to claim this donation.
            </Alert>
          ) : null}
        </>
      ) : (
        <Alert type="error">Donation not found.</Alert>
      )}
    </section>
  )
}

export default PostDetail
