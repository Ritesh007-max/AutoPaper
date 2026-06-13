const InstituteAdminInvite = require('../modles/InstituteAdminInvite')
const User = require('../modles/Users')
const { generateInstitutionUid } = require('../utils/institutionUid')
const { removeInstituteData } = require('../utils/dataRemoval')
const { sendInstituteInvitationEmail } = require('../utils/instituteInvitationMailer')
const { createServiceError } = require('./serviceError')

const parseLimit = (value, fallback) => {
  const parsed = Number.parseInt(value, 10)

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback
  }

  return parsed
}

const buildInstituteInviteRows = (institutes) =>
  institutes.map((institute) => ({
    id: String(institute._id),
    institutionName: institute.institutionName || 'Unnamed Institute',
    adminName: institute.adminName || 'Unnamed Admin',
    adminEmail: institute.adminEmail || '',
    institutionUid: institute.institutionUid || '',
    inviteStatus: institute.inviteStatus || 'draft',
    inviteSentAt: institute.inviteSentAt || null,
    resendCount: institute.resendCount || 0,
    createdAt: institute.createdAt || null,
  }))

const getErrorMessage = (error) => {
  if (!error) {
    return 'Unknown error'
  }

  return error.message || String(error)
}

const buildInstituteInviteResponse = (institute, emailDispatch = null) => ({
  id: String(institute._id),
  institutionName: institute.institutionName,
  adminName: institute.adminName,
  adminEmail: institute.adminEmail,
  institutionUid: institute.institutionUid,
  inviteStatus: institute.inviteStatus,
  inviteSentAt: institute.inviteSentAt || null,
  resendCount: institute.resendCount || 0,
  emailDispatch,
})

const getInstituteInvites = async ({ query = {} }) => {
  const limit = parseLimit(query.limit, 10)
  const institutes = await InstituteAdminInvite.find({ archivedAt: null })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('adminName adminEmail institutionName institutionUid inviteStatus inviteSentAt resendCount createdAt')
    .lean()

  return {
    count: institutes.length,
    data: buildInstituteInviteRows(institutes),
  }
}

const createInstituteInvite = async ({ body = {} }) => {
  const {
    institutionName,
    adminName,
    adminEmail,
    institutionUid,
    sendEmail = false,
  } = body

  const trimmedInstitutionName = String(institutionName || '').trim()
  const trimmedAdminName = String(adminName || '').trim()
  const trimmedAdminEmail = String(adminEmail || '').trim().toLowerCase()
  const resolvedInstitutionUid =
    String(institutionUid || '').trim() ||
    generateInstitutionUid(trimmedInstitutionName, trimmedAdminEmail)

  if (!trimmedInstitutionName) {
    throw createServiceError(400, 'Institute name is required.')
  }

  if (!trimmedAdminName) {
    throw createServiceError(400, 'Admin name is required.')
  }

  if (!trimmedAdminEmail) {
    throw createServiceError(400, 'Admin email is required.')
  }

  const existingInstitute = await InstituteAdminInvite.findOne({
    $or: [
      { adminEmail: trimmedAdminEmail },
      { institutionUid: resolvedInstitutionUid },
    ],
  })

  if (existingInstitute) {
    throw createServiceError(409, 'An institute invite with this email or UID already exists.')
  }

  const institute = new InstituteAdminInvite({
    adminName: trimmedAdminName,
    adminEmail: trimmedAdminEmail,
    institutionName: trimmedInstitutionName,
    institutionUid: resolvedInstitutionUid,
    inviteStatus: 'draft',
    inviteSentAt: undefined,
  })

  await institute.save()

  let emailDispatch = null

  if (sendEmail) {
    try {
      emailDispatch = await sendInstituteInvitationEmail({
        email: trimmedAdminEmail,
        adminName: trimmedAdminName,
        institutionName: trimmedInstitutionName,
        institutionUid: resolvedInstitutionUid,
      })

      institute.inviteStatus = 'sent'
      institute.inviteSentAt = new Date()
      institute.lastSentAt = new Date()
      institute.resendCount = 0
      await institute.save()
    } catch (emailError) {
      throw createServiceError(
        502,
        'Institute invite was saved, but the email could not be sent.',
        {
          exposeError: getErrorMessage(emailError),
          data: buildInstituteInviteResponse(institute, emailDispatch),
        },
      )
    }
  }

  return {
    message: sendEmail
      ? 'Institute invite created and sent successfully.'
      : 'Institute invite saved successfully.',
    data: buildInstituteInviteResponse(institute, emailDispatch),
  }
}

const resendInstituteInvite = async ({ inviteId }) => {
  const institute = await InstituteAdminInvite.findById(inviteId)

  if (!institute) {
    throw createServiceError(404, 'Institute invite not found.')
  }

  let emailDispatch = null

  try {
    emailDispatch = await sendInstituteInvitationEmail({
      email: institute.adminEmail,
      adminName: institute.adminName,
      institutionName: institute.institutionName,
      institutionUid: institute.institutionUid,
    })

    institute.inviteStatus = 'sent'
    institute.inviteSentAt = new Date()
    institute.lastSentAt = new Date()
    institute.resendCount = (institute.resendCount || 0) + 1
    await institute.save()
  } catch (emailError) {
    throw createServiceError(502, 'Institute invite was found, but the email could not be sent.', {
      exposeError: getErrorMessage(emailError),
      data: buildInstituteInviteResponse(institute, emailDispatch),
    })
  }

  return {
    message: 'Institute invite resent successfully.',
    data: buildInstituteInviteResponse(institute, emailDispatch),
  }
}

const removeInstitute = async ({ instituteId }) => {
  const institute = await InstituteAdminInvite.findOne({ _id: instituteId, archivedAt: null })

  if (!institute) {
    throw createServiceError(404, 'Institute not found.')
  }

  const institutionUid = String(institute.institutionUid || '').trim()

  if (!institutionUid) {
    throw createServiceError(400, 'This institute record does not contain an institution UID.')
  }

  const [cleanupSummary, preservedAdmins] = await Promise.all([
    removeInstituteData({ institutionUid }),
    User.find({ role: 'instituteAdmin', institutionUid })
      .select('_id name email institutionUid')
      .lean(),
  ])

  institute.archivedAt = new Date()
  await institute.save()

  return {
    message: 'Institute removed from the active list and institute data wiped successfully.',
    data: {
      id: String(institute._id),
      institutionUid,
      institutionName: institute.institutionName || '',
      preservedAdminAccounts: preservedAdmins.map((admin) => ({
        id: String(admin._id),
        name: admin.name || '',
        email: admin.email || '',
        institutionUid: admin.institutionUid || '',
      })),
      cleanupSummary,
    },
  }
}

module.exports = {
  createInstituteInvite,
  getInstituteInvites,
  removeInstitute,
  resendInstituteInvite,
}
