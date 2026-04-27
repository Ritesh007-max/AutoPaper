import { createApiClient, getApiBaseUrl } from './client'

const api = createApiClient('/api/auth')

export const loginUser = (payload) => api.post('/login', payload)

export const registerUser = (payload) => api.post('/register', payload)

export const getCurrentUser = () => api.get('/me')

export const requestPasswordReset = (payload) => api.post('/forgot-password', payload)

export const resetPassword = (payload) => api.post('/reset-password', payload)

export const buildGoogleAuthUrl = ({ mode, role, code }) => {
  const url = new URL('/api/auth/google/start', `${getApiBaseUrl()}/`)
  url.searchParams.set('mode', mode)
  url.searchParams.set('role', role)

  if (code) {
    url.searchParams.set('code', code)
  }

  return url.toString()
}
