const crypto = require('crypto')

const User = require('../modles/Users')
const Notification = require('../modles/Notification')

const parseLimit = (value, fallback) => {
  const parsed = Number.parseInt(value, 10)

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback
  }

  return parsed
}

const getScopedInstitutionUid = (req) => String(req.user?.institutionUid || '').trim()

const normalizeNotification = (notification = {}) => ({
  id: String(notification._id),
  batchId: notification.batchId || '',
  teacherId: notification.teacherId ? String(notification.teacherId) : '',
  teacherEmail: notification.teacherEmail || '',
  teacherUid: notification.teacherUid || '',
  createdByName: notification.createdByName || 'Institute Admin',
  title: notification.title || '',
  message: notification.message || '',
  status: notification.status || 'unread',
  readAt: notification.readAt || null,
  sentAt: notification.sentAt || notification.createdAt || null,
  createdAt: notification.createdAt || null,
})

const groupNotificationsForInstitute = (notifications = []) => {
  const grouped = new Map()

  for (const notification of notifications) {
    const key = notification.batchId || String(notification._id)

    if (!grouped.has(key)) {
      grouped.set(key, {
        id: key,
        batchId: notification.batchId || key,
        title: notification.title || '',
        message: notification.message || '',
        createdByName: notification.createdByName || 'Institute Admin',
        sentAt: notification.sentAt || notification.createdAt || null,
        createdAt: notification.createdAt || null,
        recipientCount: 0,
        readCount: 0,
        unreadCount: 0,
      })
    }

    const current = grouped.get(key)
    current.recipientCount += 1

    if ((notification.status || 'unread') === 'read') {
      current.readCount += 1
    } else {
      current.unreadCount += 1
    }

    if (!current.sentAt && (notification.sentAt || notification.createdAt)) {
      current.sentAt = notification.sentAt || notification.createdAt
    }

    grouped.set(key, current)
  }

  return Array.from(grouped.values()).sort((left, right) => {
    const leftTime = new Date(left.sentAt || left.createdAt || 0).getTime()
    const rightTime = new Date(right.sentAt || right.createdAt || 0).getTime()

    return rightTime - leftTime
  })
}

const getTeacherNotifications = async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit, 8)
    const teacherId = req.user?.userId
    const institutionUid = getScopedInstitutionUid(req)

    const filter = {
      teacherId,
    }

    if (institutionUid) {
      filter.institutionUid = institutionUid
    }

    const [notifications, unreadCount, totalCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).limit(limit).lean(),
      Notification.countDocuments({ ...filter, status: 'unread' }),
      Notification.countDocuments(filter),
    ])

    return res.status(200).json({
      success: true,
      data: {
        items: notifications.map(normalizeNotification),
        unreadCount,
        totalCount,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher notifications.',
      error: error.message,
    })
  }
}

const markTeacherNotificationRead = async (req, res) => {
  try {
    const { id } = req.params
    const teacherId = req.user?.userId
    const institutionUid = getScopedInstitutionUid(req)

    const filter = {
      _id: id,
      teacherId,
    }

    if (institutionUid) {
      filter.institutionUid = institutionUid
    }

    const notification = await Notification.findOne(filter)

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
      })
    }

    if (notification.status !== 'read') {
      notification.status = 'read'
      notification.readAt = new Date()
      await notification.save()
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: normalizeNotification(notification),
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification.',
      error: error.message,
    })
  }
}

const markAllTeacherNotificationsRead = async (req, res) => {
  try {
    const teacherId = req.user?.userId
    const institutionUid = getScopedInstitutionUid(req)

    const filter = {
      teacherId,
      status: 'unread',
    }

    if (institutionUid) {
      filter.institutionUid = institutionUid
    }

    const result = await Notification.updateMany(filter, {
      $set: {
        status: 'read',
        readAt: new Date(),
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Notifications marked as read.',
      data: {
        modifiedCount: result.modifiedCount || 0,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read.',
      error: error.message,
    })
  }
}

const getInstituteNotifications = async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit, 12)
    const institutionUid = getScopedInstitutionUid(req)

    const notifications = await Notification.find({ institutionUid })
      .sort({ createdAt: -1 })
      .limit(limit * 10)
      .lean()

    return res.status(200).json({
      success: true,
      data: groupNotificationsForInstitute(notifications).slice(0, limit),
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch institute notifications.',
      error: error.message,
    })
  }
}

const createInstituteNotification = async (req, res) => {
  try {
    const institutionUid = getScopedInstitutionUid(req)
    const title = String(req.body?.title || '').trim()
    const message = String(req.body?.message || '').trim()

    if (!institutionUid) {
      return res.status(403).json({
        success: false,
        message: 'Institution scope is required to send notifications.',
      })
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Notification title is required.',
      })
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Notification message is required.',
      })
    }

    const [sender, teachers] = await Promise.all([
      User.findById(req.user?.userId).select('name email role').lean(),
      User.find({ role: 'teacher', institutionUid }).select('_id email teacherUid').lean(),
    ])

    if (!teachers.length) {
      return res.status(404).json({
        success: false,
        message: 'No teachers were found for this institute.',
      })
    }

    const batchId = crypto.randomUUID()
    const sentAt = new Date()
    const createdByName = sender?.name || 'Institute Admin'

    await Notification.insertMany(
      teachers.map((teacher) => ({
        institutionUid,
        batchId,
        teacherId: teacher._id,
        teacherEmail: teacher.email,
        teacherUid: teacher.teacherUid || '',
        createdBy: req.user?.userId,
        createdByName,
        title,
        message,
        status: 'unread',
        sentAt,
      })),
    )

    return res.status(201).json({
      success: true,
      message: `Notification sent to ${teachers.length} teacher${teachers.length === 1 ? '' : 's'}.`,
      data: {
        batchId,
        recipientCount: teachers.length,
        title,
        message,
        sentAt,
        createdByName,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to send notification.',
      error: error.message,
    })
  }
}

module.exports = {
  createInstituteNotification,
  getInstituteNotifications,
  getTeacherNotifications,
  markAllTeacherNotificationsRead,
  markTeacherNotificationRead,
}
