import { createApiClient } from './client'

const api = createApiClient('/api/auth')

export const loginUser = (payload) => api.post('/login', payload)

export const registerUser = (payload) => api.post('/register', payload)

export const getCurrentUser = () => api.get('/me')
