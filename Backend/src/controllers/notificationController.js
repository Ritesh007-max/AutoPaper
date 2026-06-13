const notificationService = require('../services/notificationService')
const { sendErrorResponse } = require('./responseHelpers')

const getTeacherNotifications = async (req, res) => {
  try {
    const data = await notificationService.getTeacherNotifications({
      user: req.user,
      query: req.query,
    })

    return res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to fetch teacher notifications.')
  }
}

const markTeacherNotificationRead = async (req, res) => {
  try {
    const data = await notificationService.markTeacherNotificationRead({
      user: req.user,
      notificationId: req.params.id,
    })

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data,
    })
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to update notification.')
  }
}

const markAllTeacherNotificationsRead = async (req, res) => {
  try {
    const data = await notificationService.markAllTeacherNotificationsRead({
      user: req.user,
    })

    return res.status(200).json({
      success: true,
      message: 'Notifications marked as read.',
      data,
    })
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to mark notifications as read.')
  }
}

const getInstituteNotifications = async (req, res) => {
  try {
    const data = await notificationService.getInstituteNotifications({
      user: req.user,
      query: req.query,
    })

    return res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to fetch institute notifications.')
  }
}

const createInstituteNotification = async (req, res) => {
  try {
    const result = await notificationService.createInstituteNotification({
      user: req.user,
      body: req.body,
    })

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.data,
    })
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to send notification.')
  }
}

module.exports = {
  createInstituteNotification,
  getInstituteNotifications,
  getTeacherNotifications,
  markAllTeacherNotificationsRead,
  markTeacherNotificationRead,
}
