const express = require('express')
const {
  createInstituteInvite,
  getInstituteInvites,
  resendInstituteInvite,
} = require('../controllers/adminController')

const router = express.Router()

router.get('/institutes', getInstituteInvites)
router.post('/institutes', createInstituteInvite)
router.post('/institutes/:id/resend', resendInstituteInvite)

module.exports = router
