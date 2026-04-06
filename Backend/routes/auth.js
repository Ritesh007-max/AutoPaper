const express = require('express')
const {
  getCurrentUser,
  loginUser,
  registerUser,
} = require('../controllers/authController')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()

router.post('/login', loginUser)
router.post('/register', registerUser)
router.get('/me', authenticateToken, getCurrentUser)

module.exports = router
