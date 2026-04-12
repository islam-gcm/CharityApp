import { useCallback, useEffect, useState } from 'react'
import Alert from '../components/Alert.jsx'
import Button from '../components/Button.jsx'
import Select from '../components/Select.jsx'
import Spinner from '../components/Spinner.jsx'
import api, { getErrorMessage } from '../services/api.js'
import { charityStatuses, claimStatuses } from '../utils/constants.js'
import { formatDate, titleCase } from '../utils/formatters.js'

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('charities')
  const [charities, setCharities] = useState([])
  const [claims, setClaims] = useState([])
  const [statusFilter, setStatusFilter] = useState('pending')
  const [claimStatusFilter, setClaimStatusFilter] = useState('pending')
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
    if (activeTab === 'charities') loadCharities()
  }, [activeTab, loadCharities])

  const loadClaims = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const params = claimStatusFilter ? { status: claimStatusFilter } : {}
      const { data } = await api.get('/claims', { params })
      setClaims(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [claimStatusFilter])

  useEffect(() => {
    if (activeTab === 'claims') loadClaims()
  }, [activeTab, loadClaims])

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

  const updateClaimStatus = async (claimId, status) => {
    setSavingId(claimId)
    setError('')
    setMessage('')

    try {
      const { data } = await api.put(`/claims/${claimId}/status`, { status })
      setMessage(`Claim ${data._id} is now ${data.status}.`)
      loadClaims()
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
          <h1>{activeTab === 'charities' ? 'Charity Verification' : 'Claim Review'}</h1>
          <p>
            {activeTab === 'charities'
              ? 'Approve or reject charity accounts after checking their registration number.'
              : 'Confirm or reject donation claims submitted by approved charities.'}
          </p>
        </div>
      </div>

      <div className="tabs" role="tablist" aria-label="Admin sections">
        <Button variant={activeTab === 'charities' ? 'primary' : 'ghost'} onClick={() => setActiveTab('charities')}>
          Charities
        </Button>
        <Button variant={activeTab === 'claims' ? 'primary' : 'ghost'} onClick={() => setActiveTab('claims')}>
          Claim review
        </Button>
      </div>

      <Alert type="success">{message}</Alert>
      <Alert type="error">{error}</Alert>
      {loading ? <Spinner label="Loading charities" /> : null}

      {activeTab === 'charities' ? (
        <>
          <Select label="Status filter" id="charity-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All charities</option>
            {charityStatuses.map((status) => (
              <option key={status} value={status}>
                {titleCase(status)}
              </option>
            ))}
          </Select>

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
        </>
      ) : (
        <>
          <Select label="Claim status filter" id="claim-status-filter" value={claimStatusFilter} onChange={(event) => setClaimStatusFilter(event.target.value)}>
            <option value="">All claims</option>
            {claimStatuses.map((status) => (
              <option key={status} value={status}>
                {titleCase(status)}
              </option>
            ))}
          </Select>

          <div className="table-like">
            {claims.map((claim) => (
              <article className="row-card admin-row" key={claim._id}>
                <div>
                  <strong>{claim.donation?.name || 'Donation'}</strong>
                  <p>{claim.charity?.organization || claim.charity?.name || 'Charity'} requested {claim.quantity} units.</p>
                  <p>Remaining now: {claim.donation?.remainingQty ?? 'Unknown'} / {claim.donation?.quantity ?? 'Unknown'}</p>
                  <small>Claimed {formatDate(claim.createdAt)}</small>
                </div>
                <span className={`status status-${claim.status}`}>{claim.status}</span>
                <div className="card-actions">
                  <Button variant="secondary" disabled={savingId === claim._id} onClick={() => updateClaimStatus(claim._id, 'confirmed')}>
                    Confirm
                  </Button>
                  <Button variant="danger" disabled={savingId === claim._id} onClick={() => updateClaimStatus(claim._id, 'rejected')}>
                    Reject
                  </Button>
                  <Button variant="ghost" disabled={savingId === claim._id} onClick={() => updateClaimStatus(claim._id, 'pending')}>
                    Pending
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {!loading && claims.length === 0 ? <Alert>No claims found for this filter.</Alert> : null}
        </>
      )}
    </section>
  )
}

export default AdminPanel
