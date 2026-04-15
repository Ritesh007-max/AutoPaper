import { createApiClient } from './client'

const api = createApiClient('/api/institute')

export const getInstituteDashboardStats = (params) => api.get('/dashboard-stats', { params })

export const getInstituteActivity = (params) => api.get('/activity', { params })

export const getInstituteTeachers = (params) => api.get('/teachers', { params })

export const getInstituteInvites = (params) => api.get('/invites', { params })

export const resendInstituteInvite = (inviteId) => api.post(`/invites/${inviteId}/resend`)

export const createInstituteTeacher = (payload) => api.post('/teachers', payload)

export const getInstituteNotifications = (params) => api.get('/notifications', { params })

export const createInstituteNotification = (payload) => api.post('/notifications', payload)
