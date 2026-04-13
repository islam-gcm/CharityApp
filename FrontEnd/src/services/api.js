import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
})

// Attach the JWT to every protected request expected by the Express middleware.
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('donation_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong'

export default api
