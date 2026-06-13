const User = require('../modles/Users')
const Question = require('../modles/Questions')
const InstituteActivity = require('../modles/InstituteActivity')
const InstituteInvite = require('../modles/InstituteInvite')
const { generateTeacherUid, normalizeUidBase } = require('../utils/institutionUid')
const { removeTeacherData } = require('../utils/dataRemoval')
const { sendTeacherInvitationEmail } = require('../utils/teacherInvitationMailer')
const { createServiceError } = require('./serviceError')

const getScopedInstitutionUid = (user) => String(user?.institutionUid || '').trim()

const parseLimit = (value, fallback) => {
  const parsed = Number.parseInt(value, 10)

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback
  }

  return parsed
}

const getObjectIdString = (value) => {
  if (!value) {
    return ''
  }

  return String(value)
}

const asValidDate = (value) => {
  const date = value ? new Date(value) : null

  if (!date || Number.isNaN(date.getTime())) {
    return null
  }

  return date
}

const newestDate = (...values) => {
  const dates = values
    .map((value) => asValidDate(value))
    .filter(Boolean)

  if (dates.length === 0) {
    return null
  }

  return new Date(Math.max(...dates.map((date) => date.getTime())))
}

const loadInstituteData = async (institutionUid = '') => {
  const filter = institutionUid ? { institutionUid } : {}

  const [teachers, questions, activities, invites] = await Promise.all([
    User.find({ role: 'teacher', ...filter }).select('name email teacherUid inviteStatus inviteSentAt createdAt updatedAt institutionUid').lean(),
    Question.find(filter).select('createdBy subject chapter createdAt updatedAt institutionUid').lean(),
    InstituteActivity.find(filter).select('teacherId teacherName type title detail createdAt updatedAt institutionUid').lean(),
    InstituteInvite.find(filter).select('name teacherUid email status resendCount lastSentAt expiresAt createdAt updatedAt institutionUid').lean(),
  ])

  return {
    teachers,
    questions,
    activities,
    invites,
  }
}

const buildStatsFromData = ({ teachers, questions, activities, invites }) => ({
  totalTeachers: teachers.length,
  totalQuestions: questions.length,
  totalPapersGenerated: activities.filter((activity) => activity.type === 'paper_generated').length,
  pendingInvites: invites.filter((invite) => (invite.status || '').toLowerCase() === 'pending').length,
})

const mapTeacherData = (teachers, questions, activities) => {
  const teacherMap = new Map()

  for (const teacher of teachers) {
    const teacherId = getObjectIdString(teacher._id)

    teacherMap.set(teacherId, {
      id: teacherId,
      name: teacher.name || 'Unnamed Teacher',
      email: teacher.email || '',
      questionsAdded: 0,
      papersGenerated: 0,
      lastActive: teacher.updatedAt || teacher.createdAt || null,
    })
  }

  for (const question of questions) {
    const teacherId = getObjectIdString(question.createdBy)

    if (!teacherId || !teacherMap.has(teacherId)) {
      continue
    }

    const teacherRow = teacherMap.get(teacherId)
    teacherRow.questionsAdded += 1
    teacherRow.lastActive = newestDate(teacherRow.lastActive, question.createdAt)?.toISOString() || teacherRow.lastActive
    teacherMap.set(teacherId, teacherRow)
  }

  for (const activity of activities) {
    const teacherId = getObjectIdString(activity.teacherId)

    if (!teacherId || !teacherMap.has(teacherId)) {
      continue
    }

    const teacherRow = teacherMap.get(teacherId)

    if (activity.type === 'paper_generated') {
      teacherRow.papersGenerated += 1
    }

    teacherRow.lastActive = newestDate(teacherRow.lastActive, activity.createdAt)?.toISOString() || teacherRow.lastActive
    teacherMap.set(teacherId, teacherRow)
  }

  return Array.from(teacherMap.values())
    .sort((left, right) => {
      const leftDate = asValidDate(left.lastActive)?.getTime() ?? 0
      const rightDate = asValidDate(right.lastActive)?.getTime() ?? 0

      if (rightDate !== leftDate) {
        return rightDate - leftDate
      }

      return right.questionsAdded - left.questionsAdded
    })
    .map((teacher) => ({
      ...teacher,
      lastActive: teacher.lastActive || null,
    }))
}

const buildActivityFeed = (teachers, questions, activities, invites) => {
  const teacherMap = new Map(
    teachers.map((teacher) => [getObjectIdString(teacher._id), teacher]),
  )

  const feed = []

  for (const activity of activities) {
    const teacher = activity.teacherId ? teacherMap.get(getObjectIdString(activity.teacherId)) : null
    const actorName = activity.teacherName || teacher?.name || 'Teacher'

    feed.push({
      id: getObjectIdString(activity._id),
      type: activity.type,
      title: activity.title || `${actorName} performed an action`,
      detail: activity.detail || '',
      actor: actorName,
      createdAt: activity.createdAt,
    })
  }

  for (const question of questions) {
    const teacher = question.createdBy ? teacherMap.get(getObjectIdString(question.createdBy)) : null
    const actorName = teacher?.name || 'Teacher'

    feed.push({
      id: `question-${getObjectIdString(question._id)}`,
      type: 'question_added',
      title: `${actorName} added a question`,
      detail: question.subject ? `${question.subject}${question.chapter ? ` - ${question.chapter}` : ''}` : 'Question updated',
      actor: actorName,
      createdAt: question.createdAt,
    })
  }

  for (const teacher of teachers) {
    feed.push({
      id: `teacher-${getObjectIdString(teacher._id)}`,
      type: 'teacher_joined',
      title: `${teacher.name || 'A teacher'} joined the institute`,
      detail: teacher.email || '',
      actor: teacher.name || 'Teacher',
      createdAt: teacher.createdAt,
    })
  }

  for (const invite of invites) {
    if (invite.status !== 'accepted') {
      continue
    }

    feed.push({
      id: `invite-${getObjectIdString(invite._id)}`,
      type: 'invite_accepted',
      title: `${invite.email} accepted the invite`,
      detail: `Resent ${invite.resendCount || 0} time(s)`,
      actor: invite.email,
      createdAt: invite.updatedAt || invite.createdAt,
    })
  }

  return feed
    .filter((item) => Boolean(asValidDate(item.createdAt)))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
}

const buildInviteRows = (invites) =>
  invites.map((invite) => ({
    id: getObjectIdString(invite._id),
    name: invite.name || '',
    teacherUid: invite.teacherUid || '',
    email: invite.email || '',
    status: invite.status || 'pending',
    resendCount: invite.resendCount || 0,
    lastSentAt: invite.lastSentAt || null,
    expiresAt: invite.expiresAt || null,
    createdAt: invite.createdAt || null,
  }))

const buildInviteResponse = (inviteRecord, emailDispatch = null) => ({
  id: inviteRecord._id,
  name: inviteRecord.name,
  email: inviteRecord.email,
  role: 'teacher',
  institutionUid: inviteRecord.institutionUid,
  teacherUid: inviteRecord.teacherUid,
  inviteStatus: inviteRecord.status,
  inviteSentAt: inviteRecord.lastSentAt || null,
  inviteRecord: {
    id: inviteRecord._id,
    email: inviteRecord.email,
    status: inviteRecord.status,
    resendCount: inviteRecord.resendCount,
    lastSentAt: inviteRecord.lastSentAt,
    expiresAt: inviteRecord.expiresAt,
  },
  emailDispatch,
})

const getDashboardStats = async ({ user }) => {
  const institutionUid = getScopedInstitutionUid(user)
  const data = await loadInstituteData(institutionUid)

  return buildStatsFromData(data)
}

const getActivity = async ({ user, query = {} }) => {
  const limit = parseLimit(query.limit, 8)
  const institutionUid = getScopedInstitutionUid(user)
  const data = await loadInstituteData(institutionUid)
  const feed = buildActivityFeed(data.teachers, data.questions, data.activities, data.invites)

  return {
    count: feed.length,
    data: feed.slice(0, limit),
  }
}

const getTeachers = async ({ user, query = {} }) => {
  const limit = parseLimit(query.limit, 5)
  const institutionUid = getScopedInstitutionUid(user)
  const data = await loadInstituteData(institutionUid)
  const teachers = mapTeacherData(data.teachers, data.questions, data.activities)

  return {
    count: teachers.length,
    data: teachers.slice(0, limit),
  }
}

const createTeacher = async ({ user, body = {} }) => {
  const {
    name,
    email,
    role = 'teacher',
    sendEmail = false,
  } = body

  const trimmedName = String(name || '').trim()
  const trimmedEmail = String(email || '').trim().toLowerCase()
  const trimmedRole = String(role || 'teacher').trim()
  const scopedInstitutionUid = getScopedInstitutionUid(user)
  const normalizedInstituteUid = normalizeUidBase(scopedInstitutionUid)

  if (!trimmedName) {
    throw createServiceError(400, 'Teacher name is required.')
  }

  if (!trimmedEmail) {
    throw createServiceError(400, 'Teacher email is required.')
  }

  if (trimmedRole !== 'teacher') {
    throw createServiceError(400, 'Only teacher accounts can be created from this screen.')
  }

  if (!normalizedInstituteUid) {
    throw createServiceError(403, 'Institution scope is required for teacher invites.')
  }

  const existingInvite = await InstituteInvite.findOne({
    email: trimmedEmail,
    institutionUid: normalizedInstituteUid,
  })

  if (existingInvite) {
    throw createServiceError(409, 'A teacher invite with this email already exists in the institute.')
  }

  const teacherUid = generateTeacherUid(normalizedInstituteUid, trimmedEmail)
  const inviteSentAt = sendEmail ? new Date() : undefined

  const inviteRecord = new InstituteInvite({
    institutionUid: normalizedInstituteUid,
    name: trimmedName,
    email: trimmedEmail,
    teacherUid,
    status: sendEmail ? 'pending' : 'draft',
    resendCount: 0,
    lastSentAt: inviteSentAt,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })

  await inviteRecord.save()

  let emailDispatch = null

  if (sendEmail) {
    try {
      emailDispatch = await sendTeacherInvitationEmail({
        email: trimmedEmail,
        name: trimmedName,
        teacherUid,
        institutionUid: normalizedInstituteUid,
      })

      await InstituteActivity.create({
        institutionUid: normalizedInstituteUid,
        teacherName: trimmedName,
        type: 'invite_sent',
        title: `${trimmedName} was invited`,
        detail: trimmedEmail,
      })
      inviteRecord.status = 'pending'
      inviteRecord.lastSentAt = new Date()
      await inviteRecord.save()
    } catch (emailError) {
      throw createServiceError(
        502,
        'Teacher invite was saved, but the invitation email could not be sent.',
        {
          exposeError: emailError.message || String(emailError),
          data: buildInviteResponse(inviteRecord, emailDispatch),
        },
      )
    }
  }

  return {
    message: sendEmail
      ? 'Teacher invite created and sent successfully.'
      : 'Teacher invite saved successfully.',
    data: buildInviteResponse(inviteRecord, emailDispatch),
  }
}

const getInvites = async ({ user }) => {
  const institutionUid = getScopedInstitutionUid(user)
  const data = await loadInstituteData(institutionUid)

  return buildInviteRows(data.invites)
}

const resendInvite = async ({ user, inviteId }) => {
  const institutionUid = getScopedInstitutionUid(user)
  const invite = await InstituteInvite.findOne({ _id: inviteId, institutionUid })

  if (!invite) {
    throw createServiceError(404, 'Invite not found.')
  }

  let emailDispatch = null

  try {
    emailDispatch = await sendTeacherInvitationEmail({
      email: invite.email,
      name: invite.name || 'Teacher',
      teacherUid: invite.teacherUid || generateTeacherUid(invite.institutionUid || '', invite.email || ''),
      institutionUid: invite.institutionUid,
    })

    invite.status = 'pending'
    invite.resendCount = (invite.resendCount || 0) + 1
    invite.lastSentAt = new Date()
    await invite.save()
  } catch (emailError) {
    throw createServiceError(502, 'Invite was found, but the email could not be sent.', {
      exposeError: emailError.message || String(emailError),
      data: {
        id: getObjectIdString(invite._id),
        email: invite.email,
        status: invite.status,
        resendCount: invite.resendCount || 0,
        lastSentAt: invite.lastSentAt || null,
        emailDispatch,
      },
    })
  }

  return {
    message: 'Invite resent successfully.',
    data: {
      id: getObjectIdString(invite._id),
      email: invite.email,
      status: invite.status,
      resendCount: invite.resendCount,
      lastSentAt: invite.lastSentAt,
      emailDispatch,
    },
  }
}

const deleteTeacher = async ({ user, teacherId }) => {
  const institutionUid = getScopedInstitutionUid(user)
  const teacher = await User.findOne({
    _id: teacherId,
    role: 'teacher',
    institutionUid,
  }).select('_id name email teacherUid institutionUid')

  if (!teacher) {
    throw createServiceError(404, 'Teacher not found.')
  }

  const cleanupSummary = await removeTeacherData({ teacher, institutionUid })

  return {
    message: 'Teacher and associated institute data removed successfully.',
    data: {
      teacher: {
        id: String(teacher._id),
        name: teacher.name || '',
        email: teacher.email || '',
        teacherUid: teacher.teacherUid || '',
      },
      cleanupSummary,
    },
  }
}

module.exports = {
  createTeacher,
  deleteTeacher,
  getActivity,
  getDashboardStats,
  getInvites,
  getTeachers,
  resendInvite,
}
