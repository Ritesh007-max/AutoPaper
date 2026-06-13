const crypto = require('crypto')

const User = require('../modles/Users')
const Notification = require('../modles/Notification')
const { createServiceError } = require('./serviceError')

const parseLimit = (value, fallback) => {
  const parsed = Number.parseInt(value, 10)

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback
  }

  return parsed
}

const getScopedInstitutionUid = (user) => String(user?.institutionUid || '').trim()

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

const buildTeacherNotificationFilter = (user, extraFilter = {}) => {
  const institutionUid = getScopedInstitutionUid(user)
  const filter = {
    teacherId: user?.userId,
    ...extraFilter,
  }

  if (institutionUid) {
    filter.institutionUid = institutionUid
  }

  return filter
}

const getTeacherNotifications = async ({ user, query = {} }) => {
  const limit = parseLimit(query.limit, 8)
  const filter = buildTeacherNotificationFilter(user)

  const [notifications, unreadCount, totalCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).limit(limit).lean(),
    Notification.countDocuments({ ...filter, status: 'unread' }),
    Notification.countDocuments(filter),
  ])

  return {
    items: notifications.map(normalizeNotification),
    unreadCount,
    totalCount,
  }
}

const markTeacherNotificationRead = async ({ user, notificationId }) => {
  const notification = await Notification.findOne(
    buildTeacherNotificationFilter(user, { _id: notificationId }),
  )

  if (!notification) {
    throw createServiceError(404, 'Notification not found.')
  }

  if (notification.status !== 'read') {
    notification.status = 'read'
    notification.readAt = new Date()
    await notification.save()
  }

  return normalizeNotification(notification)
}

const markAllTeacherNotificationsRead = async ({ user }) => {
  const filter = buildTeacherNotificationFilter(user, { status: 'unread' })

  const result = await Notification.updateMany(filter, {
    $set: {
      status: 'read',
      readAt: new Date(),
    },
  })

  return {
    modifiedCount: result.modifiedCount || 0,
  }
}

const getInstituteNotifications = async ({ user, query = {} }) => {
  const limit = parseLimit(query.limit, 12)
  const institutionUid = getScopedInstitutionUid(user)

  const notifications = await Notification.find({ institutionUid })
    .sort({ createdAt: -1 })
    .limit(limit * 10)
    .lean()

  return groupNotificationsForInstitute(notifications).slice(0, limit)
}

const createInstituteNotification = async ({ user, body = {} }) => {
  const institutionUid = getScopedInstitutionUid(user)
  const title = String(body?.title || '').trim()
  const message = String(body?.message || '').trim()

  if (!institutionUid) {
    throw createServiceError(403, 'Institution scope is required to send notifications.')
  }

  if (!title) {
    throw createServiceError(400, 'Notification title is required.')
  }

  if (!message) {
    throw createServiceError(400, 'Notification message is required.')
  }

  const [sender, teachers] = await Promise.all([
    User.findById(user?.userId).select('name email role').lean(),
    User.find({ role: 'teacher', institutionUid }).select('_id email teacherUid').lean(),
  ])

  if (!teachers.length) {
    throw createServiceError(404, 'No teachers were found for this institute.')
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
      createdBy: user?.userId,
      createdByName,
      title,
      message,
      status: 'unread',
      sentAt,
    })),
  )

  return {
    message: `Notification sent to ${teachers.length} teacher${teachers.length === 1 ? '' : 's'}.`,
    data: {
      batchId,
      recipientCount: teachers.length,
      title,
      message,
      sentAt,
      createdByName,
    },
  }
}

module.exports = {
  createInstituteNotification,
  getInstituteNotifications,
  getTeacherNotifications,
  markAllTeacherNotificationsRead,
  markTeacherNotificationRead,
}
