const express = require('express')
const { authenticateToken, authorizeRoles } = require('../middleware/auth')
const {
  createInstituteInvite,
  getInstituteInvites,
  resendInstituteInvite,
} = require('../controllers/adminController')

const router = express.Router()

router.use(authenticateToken, authorizeRoles('Admin'))

router.get('/institutes', getInstituteInvites)
router.post('/institutes', createInstituteInvite)
router.post('/institutes/:id/resend', resendInstituteInvite)

module.exports = router
