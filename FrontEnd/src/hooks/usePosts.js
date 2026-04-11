import { useCallback, useEffect, useState } from 'react'
import api, { getErrorMessage } from '../services/api.js'

export function usePosts(params = {}) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { type, search, sort } = params

  const loadPosts = useCallback(async () => {
    // Public donation feed supports the same query params as donationController.getDonations.
    setLoading(true)
    setError('')

    try {
      const { data } = await api.get('/posts', { params: { type, search, sort } })
      setPosts(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [type, search, sort])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  return { posts, loading, error, reload: loadPosts }
}
