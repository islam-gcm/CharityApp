import { useCallback, useEffect, useState } from 'react'
import api, { getErrorMessage } from '../services/api.js'

export function useClaims(enabled = true) {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState('')

  const loadClaims = useCallback(async () => {
    // Charity dashboard history uses /claims/my from transactionRoutes.
    if (!enabled) return

    setLoading(true)
    setError('')

    try {
      const { data } = await api.get('/claims/my')
      setClaims(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    loadClaims()
  }, [loadClaims])

  return { claims, loading, error, reload: loadClaims }
}
