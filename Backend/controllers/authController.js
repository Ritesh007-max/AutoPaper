const jwt = require('jsonwebtoken')
const User = require('../modles/Users')
const InstituteInvite = require('../modles/InstituteInvite')
const InstituteAdminInvite = require('../modles/InstituteAdminInvite')
const { getJwtSecret } = require('../middleware/auth')

const normalizeEmail = (value) => String(value || '').trim().toLowerCase()

const normalizeRole = (value) => {
  const lowered = String(value || '').trim().toLowerCase()

  if (lowered === 'teacher') {
    return 'teacher'
  }

  if (lowered === 'instituteteacher' || lowered === 'instituteadmin' || lowered === 'institute admin') {
    return 'instituteAdmin'
  }

  if (lowered === 'admin' || lowered === 'systemadmin' || lowered === 'system admin') {
    return 'Admin'
  }

  return ''
}

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const findUserByEmailAndRole = async (email, role) =>
  User.findOne({
    email: new RegExp(`^${escapeRegExp(email)}$`, 'i'),
    role,
  })

const buildUserResponse = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  institutionName: user.institutionName || '',
  institutionUid: user.institutionUid || '',
  teacherUid: user.teacherUid || '',
  inviteStatus: user.inviteStatus || 'draft',
  inviteSentAt: user.inviteSentAt || null,
})

const signToken = (user) =>
  jwt.sign(
    {
      userId: String(user._id),
      role: user.role,
      email: user.email,
      institutionUid: user.institutionUid || '',
      teacherUid: user.teacherUid || '',
    },
    getJwtSecret(),
    { expiresIn: '7d' },
  )

const getInviteCode = (body, role) => {
  if (role === 'teacher') {
    return String(body?.teacherUid || body?.code || body?.registrationCode || '').trim()
  }

  return String(body?.institutionUid || body?.code || body?.registrationCode || '').trim()
}

const registerTeacher = async (req, res, name, email, password) => {
  const code = getInviteCode(req.body, 'teacher')

  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Registration code is required for teacher registration.',
    })
  }

  const invite = await InstituteInvite.findOne({
    email: new RegExp(`^${escapeRegExp(email)}$`, 'i'),
    teacherUid: code,
  })

  if (!invite) {
    return res.status(404).json({
      success: false,
      message: 'Teacher invitation not found. Please check your registration code and email.',
    })
  }

  if (invite.status === 'expired') {
    return res.status(410).json({
      success: false,
      message: 'This teacher invitation has expired.',
    })
  }

  if (invite.status === 'accepted') {
    return res.status(409).json({
      success: false,
      message: 'This teacher invitation has already been used.',
    })
  }

  const existingTeacher = await findUserByEmailAndRole(email, 'teacher')
  if (existingTeacher) {
    return res.status(409).json({
      success: false,
      message: 'A teacher account with this email already exists.',
    })
  }

  const teacher = new User({
    name,
    email,
    password,
    role: 'teacher',
    institutionUid: invite.institutionUid,
    teacherUid: invite.teacherUid,
    inviteStatus: 'sent',
    inviteSentAt: invite.lastSentAt || invite.createdAt || new Date(),
  })

  await teacher.save()

  invite.status = 'accepted'
  await invite.save()

  return res.status(201).json({
    success: true,
    message: 'Teacher registered successfully.',
    token: signToken(teacher),
    tokenType: 'Bearer',
    data: buildUserResponse(teacher),
  })
}

const registerInstituteAdmin = async (req, res, name, email, password) => {
  const code = getInviteCode(req.body, 'instituteAdmin')

  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Registration code is required for institute admin registration.',
    })
  }

  const invite = await InstituteAdminInvite.findOne({
    adminEmail: new RegExp(`^${escapeRegExp(email)}$`, 'i'),
    institutionUid: code,
  })

  if (!invite) {
    return res.status(404).json({
      success: false,
      message: 'Institute admin invitation not found. Please check your registration code and email.',
    })
  }

  if (invite.inviteStatus === 'expired') {
    return res.status(410).json({
      success: false,
      message: 'This institute admin invitation has expired.',
    })
  }

  if (invite.inviteStatus === 'accepted') {
    return res.status(409).json({
      success: false,
      message: 'This institute admin invitation has already been used.',
    })
  }

  const existingAdmin = await findUserByEmailAndRole(email, 'instituteAdmin')
  if (existingAdmin) {
    return res.status(409).json({
      success: false,
      message: 'An institute admin account with this email already exists.',
    })
  }

  const instituteAdmin = new User({
    name,
    email,
    password,
    role: 'instituteAdmin',
    institutionName: invite.institutionName,
    institutionUid: invite.institutionUid,
    inviteStatus: 'sent',
    inviteSentAt: invite.inviteSentAt || invite.createdAt || new Date(),
  })

  await instituteAdmin.save()

  invite.inviteStatus = 'accepted'
  await invite.save()

  return res.status(201).json({
    success: true,
    message: 'Institute admin registered successfully.',
    token: signToken(instituteAdmin),
    tokenType: 'Bearer',
    data: buildUserResponse(instituteAdmin),
  })
}

const registerUser = async (req, res) => {
  try {
    const role = normalizeRole(req.body?.role)
    const name = String(req.body?.name || '').trim()
    const email = normalizeEmail(req.body?.email)
    const password = String(req.body?.password || '').trim()

    if (!['teacher', 'instituteAdmin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Only teacher and institute admin registrations are allowed.',
      })
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.',
      })
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      })
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required.',
      })
    }

    if (role === 'teacher') {
      return await registerTeacher(req, res, name, email, password)
    }

    return await registerInstituteAdmin(req, res, name, email, password)
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to register user.',
      error: error.message,
    })
  }
}

const loginUser = async (req, res) => {
  try {
    const role = normalizeRole(req.body?.role)
    const email = normalizeEmail(req.body?.email)
    const password = String(req.body?.password || '').trim()

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'A valid role is required for login.',
      })
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      })
    }

    const user = await findUserByEmailAndRole(email, role)

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email, password, or role.',
      })
    }

    const token = signToken(user)

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      tokenType: 'Bearer',
      data: buildUserResponse(user),
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to login.',
      error: error.message,
    })
  }
}

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      })
    }

    return res.status(200).json({
      success: true,
      data: buildUserResponse(user),
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch current user.',
      error: error.message,
    })
  }
}

module.exports = {
  getCurrentUser,
  loginUser,
  registerUser,
}
