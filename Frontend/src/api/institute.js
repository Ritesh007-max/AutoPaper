import axios from 'axios'

const api = axios.create({
  baseURL: '/api/institute',
})

export const getInstituteDashboardStats = (params) => api.get('/dashboard-stats', { params })

export const getInstituteActivity = (params) => api.get('/activity', { params })

export const getInstituteTeachers = (params) => api.get('/teachers', { params })

export const getInstituteInvites = (params) => api.get('/invites', { params })

export const resendInstituteInvite = (inviteId) => api.post(`/invites/${inviteId}/resend`)

export const createInstituteTeacher = (payload) => api.post('/teachers', payload)
