const InstituteAdminInvite = require('../modles/InstituteAdminInvite')
const {
  generateInstitutionUid,
} = require('../utils/institutionUid')
const {
  sendInstituteInvitationEmail,
} = require('../utils/instituteInvitationMailer')

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

const getInstituteInvites = async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit, 10)
    const institutes = await InstituteAdminInvite.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('adminName adminEmail institutionName institutionUid inviteStatus inviteSentAt resendCount createdAt')
      .lean()

    return res.status(200).json({
      success: true,
      count: institutes.length,
      data: buildInstituteInviteRows(institutes),
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch institute invites',
      error: error.message,
    })
  }
}

const createInstituteInvite = async (req, res) => {
  try {
    const {
      institutionName,
      adminName,
      adminEmail,
      institutionUid,
      sendEmail = false,
    } = req.body || {}

    const trimmedInstitutionName = String(institutionName || '').trim()
    const trimmedAdminName = String(adminName || '').trim()
    const trimmedAdminEmail = String(adminEmail || '').trim().toLowerCase()
    const resolvedInstitutionUid = String(institutionUid || '').trim() || generateInstitutionUid(trimmedInstitutionName, trimmedAdminEmail)

    if (!trimmedInstitutionName) {
      return res.status(400).json({
        success: false,
        message: 'Institute name is required.',
      })
    }

    if (!trimmedAdminName) {
      return res.status(400).json({
        success: false,
        message: 'Admin name is required.',
      })
    }

    if (!trimmedAdminEmail) {
      return res.status(400).json({
        success: false,
        message: 'Admin email is required.',
      })
    }

    const existingInstitute = await InstituteAdminInvite.findOne({
      $or: [
        { adminEmail: trimmedAdminEmail },
        { institutionUid: resolvedInstitutionUid },
      ],
    })

    if (existingInstitute) {
      return res.status(409).json({
        success: false,
        message: 'An institute invite with this email or UID already exists.',
      })
    }

    const inviteStatus = 'draft'
    const inviteSentAt = undefined

    const institute = new InstituteAdminInvite({
      adminName: trimmedAdminName,
      adminEmail: trimmedAdminEmail,
      institutionName: trimmedInstitutionName,
      institutionUid: resolvedInstitutionUid,
      inviteStatus,
      inviteSentAt,
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
        return res.status(502).json({
          success: false,
          message: 'Institute invite was saved, but the email could not be sent.',
          error: getErrorMessage(emailError),
          data: {
            id: institute._id,
            institutionName: institute.institutionName,
            adminName: institute.adminName,
            adminEmail: institute.adminEmail,
            institutionUid: institute.institutionUid,
            inviteStatus: institute.inviteStatus,
            inviteSentAt: institute.inviteSentAt || null,
            resendCount: institute.resendCount || 0,
            emailDispatch,
          },
        })
      }
    }

    return res.status(201).json({
      success: true,
      message: sendEmail
        ? 'Institute invite created and sent successfully.'
        : 'Institute invite saved successfully.',
      data: {
        id: institute._id,
        institutionName: institute.institutionName,
        adminName: institute.adminName,
        adminEmail: institute.adminEmail,
        institutionUid: institute.institutionUid,
        inviteStatus: institute.inviteStatus,
        inviteSentAt: institute.inviteSentAt,
        resendCount: institute.resendCount || 0,
        emailDispatch,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create institute invite.',
      error: error.message,
    })
  }
}

const resendInstituteInvite = async (req, res) => {
  try {
    const { id } = req.params
    const institute = await InstituteAdminInvite.findById(id)

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: 'Institute invite not found.',
      })
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
      return res.status(502).json({
        success: false,
        message: 'Institute invite was found, but the email could not be sent.',
        error: getErrorMessage(emailError),
        data: {
          id: String(institute._id),
          institutionName: institute.institutionName,
          adminName: institute.adminName,
          adminEmail: institute.adminEmail,
          institutionUid: institute.institutionUid,
          inviteStatus: institute.inviteStatus,
          inviteSentAt: institute.inviteSentAt || null,
          resendCount: institute.resendCount || 0,
          emailDispatch,
        },
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Institute invite resent successfully.',
      data: {
        id: String(institute._id),
        institutionName: institute.institutionName,
        adminName: institute.adminName,
        adminEmail: institute.adminEmail,
        institutionUid: institute.institutionUid,
        inviteStatus: institute.inviteStatus,
        inviteSentAt: institute.inviteSentAt,
        resendCount: institute.resendCount || 0,
        emailDispatch,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to resend institute invite.',
      error: error.message,
    })
  }
}

module.exports = {
  createInstituteInvite,
  getInstituteInvites,
  resendInstituteInvite,
}
