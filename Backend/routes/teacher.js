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

const router = express.Router()

router.use(authenticateToken, authorizeRoles('teacher'))

router.get('/questions', getQuestions)
router.get('/questions/filters', getQuestionFilters)
router.get('/notifications', getTeacherNotifications)
router.patch('/notifications/read-all', markAllTeacherNotificationsRead)
router.patch('/notifications/:id/read', markTeacherNotificationRead)
router.post('/questions', createQuestion)
router.post('/questions/bulk', createQuestionsBulk)
router.put('/questions/:id', updateQuestion)
router.patch('/questions/:id', updateQuestion)
router.delete('/questions/:id', deleteQuestion)

module.exports = router
