const express = require('express')
const { authenticateToken, authorizeRoles } = require('../middleware/auth')
const {
  createInstituteNotification,
  getInstituteNotifications,
} = require('../controllers/notificationController')
const {
  createTeacher,
  deleteTeacher,
  getActivity,
  getDashboardStats,
  getInvites,
  getTeachers,
  resendInvite,
} = require('../controllers/instituteController')
const {
  destructiveActionLimiter,
  emailActionLimiter,
  writeActionLimiter,
} = require('../middleware/rateLimit')

const router = express.Router()

router.use(authenticateToken, authorizeRoles('instituteAdmin'))

router.get('/dashboard-stats', getDashboardStats)
router.get('/activity', getActivity)
router.get('/teachers', getTeachers)
router.post('/teachers', emailActionLimiter, createTeacher)
router.delete('/teachers/:id', destructiveActionLimiter, deleteTeacher)
router.get('/invites', getInvites)
router.post('/invites/:id/resend', emailActionLimiter, resendInvite)
router.get('/notifications', getInstituteNotifications)
router.post('/notifications', emailActionLimiter, writeActionLimiter, createInstituteNotification)

module.exports = router
