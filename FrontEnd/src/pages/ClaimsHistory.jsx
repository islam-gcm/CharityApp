import Alert from '../components/Alert.jsx'
import Spinner from '../components/Spinner.jsx'
import { useClaims } from '../hooks/useClaims.js'
import { formatDate, titleCase } from '../utils/formatters.js'

function ClaimsHistory() {
  const { claims, loading, error } = useClaims()

  return (
    <section className="stack">
      <div className="page-head">
        <div>
          <p className="eyebrow">Charity module</p>
          <h1>Claims History</h1>
          <p>Track every donation claim submitted by your charity account.</p>
        </div>
      </div>

      <Alert type="error">{error}</Alert>
      {loading ? <Spinner label="Loading claims" /> : null}
      <div className="table-like">
        {claims.map((claim) => (
          <article key={claim._id} className="row-card">
            <div>
              <strong>{claim.donation?.name || titleCase(claim.donation?.donationType || 'Donation')}</strong>
              <p>{claim.donation?.description || 'No description'}</p>
            </div>
            <span>{claim.quantity} units</span>
            <span className={`status status-${claim.status}`}>{claim.status}</span>
            <span>{formatDate(claim.claimedAt || claim.createdAt)}</span>
          </article>
        ))}
      </div>
      {!loading && claims.length === 0 ? <Alert>No claims submitted yet.</Alert> : null}
    </section>
  )
}

export default ClaimsHistory
