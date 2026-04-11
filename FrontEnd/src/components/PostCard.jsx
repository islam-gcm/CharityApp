import { Link } from 'react-router-dom'
import { formatDate, titleCase } from '../utils/formatters.js'

function PostCard({ donation, actions }) {
  const progress =
    donation.quantity > 0
      ? Math.round((donation.remainingQty / donation.quantity) * 100)
      : 0

  return (
    <article className="post-card">
      <div className="post-card-top">
        <span className="tag">{titleCase(donation.donationType)}</span>
        <span className={`status status-${donation.status}`}>{donation.status}</span>
      </div>
      <h3>{donation.name || 'Donation ready for pickup'}</h3>
      {donation.description ? <p>{donation.description}</p> : null}
      <p className="muted">
        Donor: {donation.donor?.name || 'You'} - {formatDate(donation.createdAt)}
      </p>
      <div className="quantity-line">
        <strong>{donation.remainingQty}</strong>
        <span>of {donation.quantity} remaining</span>
      </div>
      <div className="meter" aria-label={`${progress}% remaining`}>
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="card-actions">
        <Link className="btn btn-secondary" to={`/posts/${donation._id}`}>
          Details
        </Link>
        {actions}
      </div>
    </article>
  )
}

export default PostCard
