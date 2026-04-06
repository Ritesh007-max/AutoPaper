const express = require('express')
const { authenticateToken, authorizeRoles } = require('../middleware/auth')
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

module.exports = router
