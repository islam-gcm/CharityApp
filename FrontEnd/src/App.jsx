import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/" element={
        <div style={{ padding: '40px' }}>
          <h1>Charity App</h1>
          <p>{user ? `Welcome, ${user.name} (${user.role})` : 'Not logged in'}</p>
          <a href="/login">Go to Login</a>
        </div>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App