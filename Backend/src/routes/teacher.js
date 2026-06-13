const express = require('express')
const { authenticateToken, authorizeRoles } = require('../middleware/auth')
const {
  getTeacherNotifications,
  markAllTeacherNotificationsRead,
  markTeacherNotificationRead,
} = require('../controllers/notificationController')
const {
  createQuestion,
  createQuestionsBulk,
  deleteQuestion,
  getQuestionFilters,
  getQuestions,
  updateQuestion,
} = require('../controllers/teacherController')
const {
  bulkActionLimiter,
  destructiveActionLimiter,
  writeActionLimiter,
} = require('../middleware/rateLimit')

const router = express.Router()

router.use(authenticateToken, authorizeRoles('teacher'))

router.get('/questions', getQuestions)
router.get('/questions/filters', getQuestionFilters)
router.get('/notifications', getTeacherNotifications)
router.patch('/notifications/read-all', writeActionLimiter, markAllTeacherNotificationsRead)
router.patch('/notifications/:id/read', writeActionLimiter, markTeacherNotificationRead)
router.post('/questions', writeActionLimiter, createQuestion)
router.post('/questions/bulk', bulkActionLimiter, createQuestionsBulk)
router.put('/questions/:id', writeActionLimiter, updateQuestion)
router.patch('/questions/:id', writeActionLimiter, updateQuestion)
router.delete('/questions/:id', destructiveActionLimiter, deleteQuestion)

module.exports = router
