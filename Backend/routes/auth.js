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
const {
  authLimiter,
  passwordResetLimiter,
} = require('../middleware/rateLimit')

const router = express.Router()

router.get('/google/start', authLimiter, startGoogleAuth)
router.get('/google/callback', authLimiter, handleGoogleAuthCallback)
router.post('/login', authLimiter, loginUser)
router.post('/register', authLimiter, registerUser)
router.post('/forgot-password', passwordResetLimiter, requestPasswordReset)
router.post('/reset-password', passwordResetLimiter, resetPassword)
router.get('/me', authenticateToken, getCurrentUser)

module.exports = router
