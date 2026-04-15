import { createApiClient } from './client'

const api = createApiClient('/api/teacher')

export const getTeacherNotifications = (params) => api.get('/notifications', { params })

export const markTeacherNotificationRead = (notificationId) => api.patch(`/notifications/${notificationId}/read`)

export const markAllTeacherNotificationsRead = () => api.patch('/notifications/read-all')
