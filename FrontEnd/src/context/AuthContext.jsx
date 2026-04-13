import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../services/api.js'
import { AuthContext } from './authContextObject.js'

export function AuthProvider({ children }) {
  // sessionStorage is per browser tab/window, so admin, donor, and charity can be tested side by side.
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('donation_user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(Boolean(sessionStorage.getItem('donation_token')))

  const persistSession = useCallback((nextUser, token) => {
    // Register does not return a token, login does. Keep this helper usable for both flows.
    if (token) sessionStorage.setItem('donation_token', token)
    sessionStorage.setItem('donation_user', JSON.stringify(nextUser))
    setUser(nextUser)
  }, [])

  const refreshMe = useCallback(async () => {
    if (!sessionStorage.getItem('donation_token')) {
      setLoading(false)
      return null
    }

    try {
      const { data } = await api.get('/auth/me')
      persistSession(data, null)
      return data
    } catch (err) {
      if (err?.response?.status === 429 || err?.response?.status >= 500) { 
        return null 
      }

      // If the JWT expired or was changed server-side, clear the stale browser session.
      sessionStorage.removeItem('donation_token')
      sessionStorage.removeItem('donation_user')
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [persistSession])

  useEffect(() => {
    refreshMe()
  }, [refreshMe])

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (!document.hidden) refreshMe()
    }
    const intervalId = window.setInterval(refreshMe, 60000)

    window.addEventListener('focus', refreshMe)
    document.addEventListener('visibilitychange', refreshWhenVisible)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refreshMe)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [refreshMe])

  const login = useCallback(
    async (credentials) => {
      const { data } = await api.post('/auth/login', credentials)
      persistSession(data.user, data.token)
      return data.user
    },
    [persistSession],
  )

  const register = useCallback(
    async (payload) => {
      const { data } = await api.post('/auth/register', payload)
      return data
    },
    [],
  )

  const updateProfile = useCallback(
    async (payload) => {
      const { data } = await api.put('/auth/profile', payload)
      persistSession(data, null)
      return data
    },
    [persistSession],
  )

  const logout = useCallback(() => {
    sessionStorage.removeItem('donation_token')
    sessionStorage.removeItem('donation_user')
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, logout, register, refreshMe, updateProfile }),
    [user, loading, login, logout, register, refreshMe, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
