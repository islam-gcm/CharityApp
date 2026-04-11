import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../components/Alert.jsx'
import Button from '../components/Button.jsx'
import PostCard from '../components/PostCard.jsx'
import Spinner from '../components/Spinner.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useNotifications } from '../hooks/useNotifications.js'
import api, { getErrorMessage } from '../services/api.js'
import { formatDate, titleCase } from '../utils/formatters.js'

function Dashboard() {
  const { user } = useAuth()
  const [myPosts, setMyPosts] = useState([])
  const [claimsByPost, setClaimsByPost] = useState({})
  const { unreadCount } = useNotifications()
  const [loading, setLoading] = useState(user.role === 'donor')
  const [error, setError] = useState('')

  const loadDonorData = useCallback(async () => {
    if (user.role !== 'donor') return

    setLoading(true)
    setError('')

    try {
      const { data } = await api.get('/posts/my')
      setMyPosts(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [user.role])

  const loadClaims = async (postId) => {
    setError('')

    try {
      // Donors can inspect claims per owned donation through /posts/:id/claims.
      const { data } = await api.get(`/posts/${postId}/claims`)
      setClaimsByPost({ ...claimsByPost, [postId]: data })
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const deletePost = async (postId) => {
    setError('')

    try {
      // Backend prevents deleting donations after claims have started.
      await api.delete(`/posts/${postId}`)
      setMyPosts(myPosts.filter((post) => post._id !== postId))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  useEffect(() => {
    loadDonorData()
  }, [loadDonorData])

  return (
    <section className="stack">
      <div className="page-head">
        <div>
          <p className="eyebrow">{titleCase(user.role)} dashboard</p>
          <h1>Hello, {user.name}</h1>
          <p>Status: {user.status || 'approved'}</p>
        </div>
        {user.role === 'donor' ? (
          <Link className="btn btn-primary" to="/posts/create">
            Create donation
          </Link>
        ) : null}
      </div>

      <div className="stats-grid">
        <div className="stat">
          <strong>{myPosts.length}</strong>
          <span>My donations</span>
        </div>
        <div className="stat">
          <strong>{unreadCount}</strong>
          <span>Unread notifications</span>
        </div>
        <div className="stat">
          <strong>{user.status || 'approved'}</strong>
          <span>Account status</span>
        </div>
      </div>

      <Alert type="error">{error}</Alert>

      {user.role === 'donor' ? (
        <>
          {loading ? <Spinner label="Loading your posts" /> : null}
          <div className="card-grid">
            {myPosts.map((post) => (
              <div className="with-claims" key={post._id}>
                <PostCard
                  donation={post}
                  actions={
                    <>
                      <Link className="btn btn-ghost" to={`/posts/${post._id}/edit`}>
                        Edit
                      </Link>
                      <Button variant="ghost" onClick={() => loadClaims(post._id)}>
                        Claims
                      </Button>
                      <Button variant="danger" onClick={() => deletePost(post._id)}>
                        Delete
                      </Button>
                    </>
                  }
                />
                {claimsByPost[post._id] ? (
                  <div className="claim-list">
                    {claimsByPost[post._id].length === 0 ? <p>No claims yet.</p> : null}
                    {claimsByPost[post._id].map((claim) => (
                      <p key={claim._id}>
                        {claim.charity?.organization || claim.charity?.name} claimed {claim.quantity} units from {post.name} - {claim.status} -{' '}
                        {formatDate(claim.createdAt)}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <h2>{user.role === 'charity' ? 'Find donations to claim' : 'Admin actions'}</h2>
          <p>
            {user.role === 'charity'
              ? 'Browse the public feed, open a donation, and submit a partial or full claim.'
              : 'Use the admin panel to approve or reject charity accounts.'}
          </p>
          <Link className="btn btn-primary" to={user.role === 'charity' ? '/posts' : '/admin'}>
            Continue
          </Link>
        </div>
      )}
    </section>
  )
}

export default Dashboard
