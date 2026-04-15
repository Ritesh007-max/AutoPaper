const express = require('express')
const { authenticateToken, authorizeRoles } = require('../middleware/auth')
const {
  createInstituteNotification,
  getInstituteNotifications,
} = require('../controllers/notificationController')
const {
  createTeacher,
  getActivity,
  getDashboardStats,
  getInvites,
  getTeachers,
  resendInvite,
} = require('../controllers/instituteController')

const router = express.Router()

router.use(authenticateToken, authorizeRoles('instituteAdmin'))

router.get('/dashboard-stats', getDashboardStats)
router.get('/activity', getActivity)
router.get('/teachers', getTeachers)
router.post('/teachers', createTeacher)
router.get('/invites', getInvites)
router.post('/invites/:id/resend', resendInvite)
router.get('/notifications', getInstituteNotifications)
router.post('/notifications', createInstituteNotification)

module.exports = router
