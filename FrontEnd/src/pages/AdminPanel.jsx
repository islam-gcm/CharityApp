import { useCallback, useEffect, useState } from 'react'
import Alert from '../components/Alert.jsx'
import Button from '../components/Button.jsx'
import Select from '../components/Select.jsx'
import Spinner from '../components/Spinner.jsx'
import api, { getErrorMessage } from '../services/api.js'
import { charityStatuses } from '../utils/constants.js'
import { formatDate, titleCase } from '../utils/formatters.js'

function AdminPanel() {
  const [charities, setCharities] = useState([])
  const [statusFilter, setStatusFilter] = useState('pending')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')

  const loadCharities = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const params = statusFilter ? { status: statusFilter } : {}
      const { data } = await api.get('/auth/charities', { params })
      setCharities(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    loadCharities()
  }, [loadCharities])

  const updateStatus = async (charityId, status) => {
    setSavingId(charityId)
    setError('')
    setMessage('')

    try {
      const { data } = await api.put(`/auth/charities/${charityId}/status`, { status })
      setMessage(`${data.organization || data.name} is now ${data.status}.`)
      loadCharities()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSavingId('')
    }
  }

  return (
    <section className="stack">
      <div className="page-head">
        <div>
          <p className="eyebrow">Admin panel</p>
          <h1>Charity Verification</h1>
          <p>Approve or reject charity accounts after checking their registration number.</p>
        </div>
        <Select label="Status filter" id="charity-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">All charities</option>
          {charityStatuses.map((status) => (
            <option key={status} value={status}>
              {titleCase(status)}
            </option>
          ))}
        </Select>
      </div>

      <Alert type="success">{message}</Alert>
      <Alert type="error">{error}</Alert>
      {loading ? <Spinner label="Loading charities" /> : null}

      <div className="table-like">
        {charities.map((charity) => (
          <article className="row-card admin-row" key={charity._id}>
            <div>
              <strong>{charity.organization || charity.name}</strong>
              <p>{charity.name} - {charity.email}</p>
              <p>Registration: {charity.registrationNumber || 'Not provided'}</p>
              <small>Joined {formatDate(charity.createdAt)}</small>
            </div>
            <span className={`status status-${charity.status}`}>{charity.status}</span>
            <div className="card-actions">
              <Button variant="secondary" disabled={savingId === charity._id} onClick={() => updateStatus(charity._id, 'approved')}>
                Approve
              </Button>
              <Button variant="danger" disabled={savingId === charity._id} onClick={() => updateStatus(charity._id, 'rejected')}>
                Reject
              </Button>
              <Button variant="ghost" disabled={savingId === charity._id} onClick={() => updateStatus(charity._id, 'pending')}>
                Pending
              </Button>
            </div>
          </article>
        ))}
      </div>

      {!loading && charities.length === 0 ? <Alert>No charities found for this filter.</Alert> : null}
    </section>
  )
}

export default AdminPanel
