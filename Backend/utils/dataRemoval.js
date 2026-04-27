const InstituteActivity = require('../modles/InstituteActivity')
const InstituteInvite = require('../modles/InstituteInvite')
const Notification = require('../modles/Notification')
const Question = require('../modles/Questions')
const User = require('../modles/Users')

const getIdStrings = (items = []) =>
  items
    .map((item) => {
      if (!item?._id) {
        return ''
      }

      return String(item._id)
    })
    .filter(Boolean)

const buildTeacherNotificationFilter = (teacher, institutionUid) => {
  const orConditions = [{ teacherId: teacher._id }]

  if (teacher.email) {
    orConditions.push({ teacherEmail: String(teacher.email).trim().toLowerCase() })
  }

  if (teacher.teacherUid) {
    orConditions.push({ teacherUid: String(teacher.teacherUid).trim() })
  }

  return {
    institutionUid,
    $or: orConditions,
  }
}

const buildTeacherInviteFilter = (teacher, institutionUid) => {
  const orConditions = []

  if (teacher.email) {
    orConditions.push({ email: String(teacher.email).trim().toLowerCase() })
  }

  if (teacher.teacherUid) {
    orConditions.push({ teacherUid: String(teacher.teacherUid).trim() })
  }

  return orConditions.length
    ? {
        institutionUid,
        $or: orConditions,
      }
    : {
        institutionUid,
        _id: null,
      }
}

const buildTeacherActivityFilter = (teacher, institutionUid) => {
  const orConditions = [{ teacherId: teacher._id }]

  if (teacher.email) {
    orConditions.push({ detail: String(teacher.email).trim().toLowerCase() })
  }

  return {
    institutionUid,
    $or: orConditions,
  }
}

const removeTeacherData = async ({ teacher, institutionUid }) => {
  const [questionResult, notificationResult, inviteResult, activityResult, userResult] = await Promise.all([
    Question.deleteMany({ institutionUid, createdBy: teacher._id }),
    Notification.deleteMany(buildTeacherNotificationFilter(teacher, institutionUid)),
    InstituteInvite.deleteMany(buildTeacherInviteFilter(teacher, institutionUid)),
    InstituteActivity.deleteMany(buildTeacherActivityFilter(teacher, institutionUid)),
    User.deleteOne({ _id: teacher._id, role: 'teacher', institutionUid }),
  ])

  return {
    teacherId: String(teacher._id),
    questionsDeleted: questionResult.deletedCount || 0,
    notificationsDeleted: notificationResult.deletedCount || 0,
    invitesDeleted: inviteResult.deletedCount || 0,
    activitiesDeleted: activityResult.deletedCount || 0,
    teachersDeleted: userResult.deletedCount || 0,
  }
}

const removeInstituteData = async ({ institutionUid }) => {
  const teachers = await User.find({ role: 'teacher', institutionUid }).select('_id').lean()
  const teacherIds = getIdStrings(teachers)

  const [questionResult, activityResult, inviteResult, notificationResult, teacherResult] = await Promise.all([
    Question.deleteMany({ institutionUid }),
    InstituteActivity.deleteMany({ institutionUid }),
    InstituteInvite.deleteMany({ institutionUid }),
    Notification.deleteMany({ institutionUid }),
    User.deleteMany({ role: 'teacher', institutionUid }),
  ])

  return {
    institutionUid,
    teacherIds,
    questionsDeleted: questionResult.deletedCount || 0,
    activitiesDeleted: activityResult.deletedCount || 0,
    invitesDeleted: inviteResult.deletedCount || 0,
    notificationsDeleted: notificationResult.deletedCount || 0,
    teachersDeleted: teacherResult.deletedCount || 0,
  }
}

module.exports = {
  removeInstituteData,
  removeTeacherData,
}
