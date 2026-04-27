const express = require('express')
const { authenticateToken, authorizeRoles } = require('../middleware/auth')
const {
  createInstituteInvite,
  getInstituteInvites,
  removeInstitute,
  resendInstituteInvite,
} = require('../controllers/adminController')
const {
  destructiveActionLimiter,
  emailActionLimiter,
} = require('../middleware/rateLimit')

const router = express.Router()

router.use(authenticateToken, authorizeRoles('Admin'))

router.get('/institutes', getInstituteInvites)
router.post('/institutes', emailActionLimiter, createInstituteInvite)
router.post('/institutes/:id/resend', emailActionLimiter, resendInstituteInvite)
router.delete('/institutes/:id', destructiveActionLimiter, removeInstitute)

module.exports = router
