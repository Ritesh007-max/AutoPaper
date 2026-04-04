import axios from 'axios'

const api = axios.create({
  baseURL: '/api/admin',
})

export const getInstituteInvites = (params) => api.get('/institutes', { params })

export const createInstituteInvite = (payload) => api.post('/institutes', payload)

export const resendInstituteInvite = (inviteId) => api.post(`/institutes/${inviteId}/resend`)
