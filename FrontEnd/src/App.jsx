import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Spinner from './components/Spinner.jsx'
import { useAuth } from './hooks/useAuth.js'
import AdminPanel from './pages/AdminPanel.jsx'
import ClaimsHistory from './pages/ClaimsHistory.jsx'
import CreatePost from './pages/CreatePost.jsx'
import Dashboard from './pages/Dashboard.jsx'
import EditPost from './pages/EditPost.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotificationsPage from './pages/NotificationsPage.jsx'
import PostDetail from './pages/PostDetail.jsx'
import PostsList from './pages/PostsList.jsx'
import Profile from './pages/Profile.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import './App.css'

function RequireAuth({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Wait for /auth/me before deciding whether the saved JWT is still valid.
  if (loading) return <Spinner label="Checking session" />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />

  return children
}

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page">
        {/* Routes follow the frontend structure required in the PDF. */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/posts" element={<PostsList />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/posts/create"
            element={
              <RequireAuth roles={['donor']}>
                <CreatePost />
              </RequireAuth>
            }
          />
          <Route
            path="/posts/:id/edit"
            element={
              <RequireAuth roles={['donor']}>
                <EditPost />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/notifications"
            element={
              <RequireAuth>
                <NotificationsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/claims"
            element={
              <RequireAuth roles={['charity']}>
                <ClaimsHistory />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth roles={['admin']}>
                <AdminPanel />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
