import Alert from '../components/Alert.jsx'
import Button from '../components/Button.jsx'
import Spinner from '../components/Spinner.jsx'
import { useNotifications } from '../hooks/useNotifications.js'
import { formatDate, titleCase } from '../utils/formatters.js'

function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    reload,
    markRead,
    removeNotification,
  } = useNotifications()

  const markAllRead = async () => {
    const unread = notifications.filter((notification) => !notification.isRead)

    await Promise.all(unread.map((notification) => markRead(notification._id, { reloadAfter: false })))
    reload()
  }

  return (
    <section className="stack">
      <div className="page-head">
        <div>
          <p className="eyebrow">Notification center</p>
          <h1>Notifications</h1>
          <p>{unreadCount} unread notification{unreadCount === 1 ? '' : 's'}</p>
        </div>
        <div className="card-actions">
          <Button variant="secondary" onClick={() => reload({ showSpinner: true })}>
            Refresh
          </Button>
          <Button variant="ghost" onClick={markAllRead} disabled={!unreadCount}>
            Mark all read
          </Button>
        </div>
      </div>

      <Alert type="error">{error}</Alert>
      {loading ? <Spinner label="Loading notifications" /> : null}

      <div className="notification-list">
        {notifications.map((notification) => (
          <article className={`notification ${notification.isRead ? '' : 'unread'}`} key={notification._id}>
            <div>
              <strong>{titleCase(notification.type)}</strong>
              <p>{notification.message}</p>
              <small>{formatDate(notification.createdAt)}</small>
            </div>
            <div className="card-actions">
              {!notification.isRead ? (
                <Button variant="secondary" onClick={() => markRead(notification._id)}>
                  Mark read
                </Button>
              ) : null}
              <Button variant="danger" onClick={() => removeNotification(notification._id)}>
                Delete
              </Button>
            </div>
          </article>
        ))}
      </div>

      {!loading && notifications.length === 0 ? <Alert>No notifications yet.</Alert> : null}
    </section>
  )
}

export default NotificationsPage
