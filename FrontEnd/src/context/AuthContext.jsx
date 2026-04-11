import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

// 1. Create the context (like a "global box" for user data)
const AuthContext = createContext()

// 2. This wraps your whole app and provides the user data to everyone
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // When the app loads, check if there's already a token saved
  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  // Called when user logs in
  const login = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  // Called when user logs out
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (loading) return <div>Loading...</div>

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// 3. This is what you'll use in any component: const { user } = useAuth()
export function useAuth() {
  return useContext(AuthContext)
}