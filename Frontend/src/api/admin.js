import { createApiClient } from './client'

const api = createApiClient('/api/admin')

export const getInstituteInvites = (params) => api.get('/institutes', { params })

export const createInstituteInvite = (payload) => api.post('/institutes', payload)

export const resendInstituteInvite = (inviteId) => api.post(`/institutes/${inviteId}/resend`)
