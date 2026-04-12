import { useCallback, useEffect, useState } from 'react'
import api, { getErrorMessage } from '../services/api.js'

export function useNotifications(pollMs = 30000) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadNotifications = useCallback(
    async ({ showSpinner = false } = {}) => {
      if (!pollMs) {
        setLoading(false)
        return
      }

      if (showSpinner) setLoading(true)

      try {
        const { data } = await api.get('/notifications')
        setNotifications(data)
        setError('')
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    },
    [pollMs],
  )

  useEffect(() => {
    if (!pollMs) {
      setNotifications([])
      setLoading(false)
      return undefined
    }

    const refreshWhenVisible = () => {
      if (!document.hidden) loadNotifications()
    }

    loadNotifications({ showSpinner: true })
    const intervalId = window.setInterval(loadNotifications, pollMs)
    window.addEventListener('focus', loadNotifications)
    document.addEventListener('visibilitychange', refreshWhenVisible)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', loadNotifications)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [loadNotifications, pollMs])

  const markRead = async (id) => {
    // Notification actions mirror notificationRoutes: read uses PATCH, delete uses DELETE.
    await api.patch(`/notifications/${id}/read`)
    loadNotifications()
  }

  const removeNotification = async (id) => {
    await api.delete(`/notifications/${id}`)
    setNotifications((current) => current.filter((item) => item._id !== id))
  }

  return {
    notifications,
    unreadCount: notifications.filter((item) => !item.isRead).length,
    loading,
    error,
    reload: loadNotifications,
    markRead,
    removeNotification,
  }
}
