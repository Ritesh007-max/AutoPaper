const express = require('express')
const {
  handleGoogleAuthCallback,
  getCurrentUser,
  loginUser,
  requestPasswordReset,
  registerUser,
  resetPassword,
  startGoogleAuth,
} = require('../controllers/authController')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()

router.get('/google/start', startGoogleAuth)
router.get('/google/callback', handleGoogleAuthCallback)
router.post('/login', loginUser)
router.post('/register', registerUser)
router.post('/forgot-password', requestPasswordReset)
router.post('/reset-password', resetPassword)
router.get('/me', authenticateToken, getCurrentUser)

module.exports = router
