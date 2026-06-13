const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const User = require('../modles/Users')
const InstituteInvite = require('../modles/InstituteInvite')
const InstituteAdminInvite = require('../modles/InstituteAdminInvite')
const { getJwtSecret } = require('../middleware/auth')
const { sendPasswordResetEmail } = require('../utils/passwordResetMailer')

const GOOGLE_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

// ============= Helper Functions =============

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

const getFrontendUrl = () => (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '')

const getGoogleRedirectUri = () =>
  String(process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback').trim()

const getAuthEntryPath = (mode) => (mode === 'register' ? '/register' : '/login')

const buildFrontendUrl = (pathname, params = {}) => {
  const url = new URL(pathname, getFrontendUrl())

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue
    }

    url.searchParams.set(key, String(value))
  }

  return url.toString()
}

const buildAuthEntryUrl = (mode, params = {}) => buildFrontendUrl(getAuthEntryPath(mode), params)

const buildUserResponse = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  authProvider: user.authProvider || 'local',
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

// ============= User Lookup Functions =============

const findUserByEmailAndRole = async (email, role) =>
  User.findOne({
    email: new RegExp(`^${escapeRegExp(email)}$`, 'i'),
    role,
  })

const findAnyUserByEmail = async (email) =>
  User.findOne({
    email: new RegExp(`^${escapeRegExp(email)}$`, 'i'),
  })

const getUserById = async (userId) => User.findById(userId)

// ============= Account Creation Functions =============

const createTeacherAccount = async ({
  name,
  email,
  password,
  code,
  authProvider = 'local',
  googleId = '',
}) => {
  if (!code) {
    return {
      error: {
        status: 400,
        message: 'Registration code is required for teacher registration.',
      },
    }
  }

  const invite = await InstituteInvite.findOne({
    email: new RegExp(`^${escapeRegExp(email)}$`, 'i'),
    teacherUid: code,
  })

  if (!invite) {
    return {
      error: {
        status: 404,
        message: 'Teacher invitation not found. Please check your registration code and email.',
      },
    }
  }

  if (invite.status === 'expired') {
    return {
      error: {
        status: 410,
        message: 'This teacher invitation has expired.',
      },
    }
  }

  if (invite.status === 'accepted') {
    return {
      error: {
        status: 409,
        message: 'This teacher invitation has already been used.',
      },
    }
  }

  const existingTeacher = await findUserByEmailAndRole(email, 'teacher')
  if (existingTeacher) {
    return {
      error: {
        status: 409,
        message: 'A teacher account with this email already exists.',
      },
    }
  }

  const conflictingAccount = await findAnyUserByEmail(email)
  if (conflictingAccount && conflictingAccount.role !== 'teacher') {
    return {
      error: {
        status: 409,
        message: 'This email is already registered under a different role.',
      },
    }
  }

  const teacher = new User({
    name,
    email,
    password,
    role: 'teacher',
    authProvider,
    googleId,
    institutionUid: invite.institutionUid,
    teacherUid: invite.teacherUid,
    inviteStatus: 'sent',
    inviteSentAt: invite.lastSentAt || invite.createdAt || new Date(),
  })

  await teacher.save()

  invite.status = 'accepted'
  await invite.save()

  return {
    user: teacher,
    message: 'Teacher registered successfully.',
  }
}

const createInstituteAdminAccount = async ({
  name,
  email,
  password,
  code,
  authProvider = 'local',
  googleId = '',
}) => {
  if (!code) {
    return {
      error: {
        status: 400,
        message: 'Registration code is required for institute admin registration.',
      },
    }
  }

  const invite = await InstituteAdminInvite.findOne({
    adminEmail: new RegExp(`^${escapeRegExp(email)}$`, 'i'),
    institutionUid: code,
  })

  if (!invite) {
    return {
      error: {
        status: 404,
        message: 'Institute admin invitation not found. Please check your registration code and email.',
      },
    }
  }

  if (invite.inviteStatus === 'expired') {
    return {
      error: {
        status: 410,
        message: 'This institute admin invitation has expired.',
      },
    }
  }

  if (invite.inviteStatus === 'accepted') {
    return {
      error: {
        status: 409,
        message: 'This institute admin invitation has already been used.',
      },
    }
  }

  const existingAdmin = await findUserByEmailAndRole(email, 'instituteAdmin')
  if (existingAdmin) {
    return {
      error: {
        status: 409,
        message: 'An institute admin account with this email already exists.',
      },
    }
  }

  const conflictingAccount = await findAnyUserByEmail(email)
  if (conflictingAccount && conflictingAccount.role !== 'instituteAdmin') {
    return {
      error: {
        status: 409,
        message: 'This email is already registered under a different role.',
      },
    }
  }

  const instituteAdmin = new User({
    name,
    email,
    password,
    role: 'instituteAdmin',
    authProvider,
    googleId,
    institutionName: invite.institutionName,
    institutionUid: invite.institutionUid,
    inviteStatus: 'sent',
    inviteSentAt: invite.inviteSentAt || invite.createdAt || new Date(),
  })

  await instituteAdmin.save()

  invite.inviteStatus = 'accepted'
  await invite.save()

  return {
    user: instituteAdmin,
    message: 'Institute admin registered successfully.',
  }
}

// ============= Password Reset Functions =============

const generatePasswordResetToken = () => {
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  return {
    token,
    tokenHash,
    expiresAt,
  }
}

const validatePasswordResetRequest = async (email, role) => {
  const user = await findUserByEmailAndRole(email, role)

  if (!user) {
    return null
  }

  const { token, tokenHash, expiresAt } = generatePasswordResetToken()
  user.passwordResetTokenHash = tokenHash
  user.passwordResetTokenExpiresAt = expiresAt
  await user.save()

  return {
    user,
    token,
  }
}

const resetUserPassword = async (token, password) => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetTokenExpiresAt: { $gt: new Date() },
  })

  if (!user) {
    return {
      error: {
        status: 404,
        message: 'The reset link is invalid or has expired.',
      },
    }
  }

  user.password = password
  user.passwordResetTokenHash = undefined
  user.passwordResetTokenExpiresAt = undefined
  await user.save()

  return {
    success: true,
    message: 'Password updated successfully.',
  }
}

// ============= Google OAuth Functions =============

const getGoogleClientConfig = () => {
  const clientId = String(process.env.GOOGLE_CLIENT_ID || '').trim()
  const clientSecret = String(process.env.GOOGLE_CLIENT_SECRET || '').trim()
  const redirectUri = getGoogleRedirectUri()

  return {
    clientId,
    clientSecret,
    redirectUri,
  }
}

const getGoogleClientConfigOrThrow = () => {
  const config = getGoogleClientConfig()

  if (!config.clientId || !config.clientSecret) {
    throw new Error(
      'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Backend/.env.',
    )
  }

  return config
}

const getGoogleProfile = async (accessToken) => {
  if (typeof fetch !== 'function') {
    throw new Error('Fetch is not available in this Node runtime.')
  }

  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to fetch Google profile: ${response.status} ${text}`)
  }

  return response.json()
}

const exchangeGoogleCode = async ({ code, redirectUri, clientId, clientSecret }) => {
  if (typeof fetch !== 'function') {
    throw new Error('Fetch is not available in this Node runtime.')
  }

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to exchange Google code: ${response.status} ${text}`)
  }

  return response.json()
}

const buildGoogleAuthorizeUrl = (clientId, redirectUri) => {
  const authorizeUrl = new URL(GOOGLE_AUTHORIZE_URL)
  authorizeUrl.searchParams.set('client_id', clientId)
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('scope', 'openid email profile')
  authorizeUrl.searchParams.set('prompt', 'select_account')
  authorizeUrl.searchParams.set('access_type', 'online')

  return authorizeUrl.toString()
}

const createGoogleAuthState = (role, mode, code) =>
  jwt.sign(
    {
      role,
      mode,
      code,
    },
    getJwtSecret(),
    { expiresIn: '10m' },
  )

const completeGoogleRegistrationOrLogin = async ({ profile, role, mode, code }) => {
  const email = normalizeEmail(profile.email)
  const name = String(profile.name || profile.given_name || email.split('@')[0] || 'Google User').trim()
  const googleId = String(profile.id || profile.sub || '').trim()

  if (!email || !googleId) {
    return {
      error: {
        status: 400,
        message: 'Google account details are incomplete.',
      },
    }
  }

  const existingUser = await findUserByEmailAndRole(email, role)
  const conflictingAccount = await findAnyUserByEmail(email)

  if (conflictingAccount && conflictingAccount.role !== role) {
    return {
      error: {
        status: 409,
        message: 'This Google email is already registered under a different role.',
      },
    }
  }

  if (existingUser) {
    let changed = false

    if (!existingUser.googleId) {
      existingUser.googleId = googleId
      changed = true
    }

    if (!existingUser.authProvider) {
      existingUser.authProvider = 'google'
      changed = true
    }

    if (changed) {
      await existingUser.save()
    }

    return {
      user: existingUser,
      message: 'Google sign-in successful.',
    }
  }

  if (mode !== 'register') {
    return {
      error: {
        status: 404,
        message: 'No account was found for this Google email. Please register first.',
      },
    }
  }

  const password = crypto.randomBytes(24).toString('hex')
  const createResult =
    role === 'teacher'
      ? await createTeacherAccount({
          name,
          email,
          password,
          code,
          authProvider: 'google',
          googleId,
        })
      : await createInstituteAdminAccount({
          name,
          email,
          password,
          code,
          authProvider: 'google',
          googleId,
        })

  if (createResult.error) {
    return {
      error: createResult.error,
    }
  }

  return {
    user: createResult.user,
    message: createResult.message,
  }
}

module.exports = {
  // Helper functions
  normalizeEmail,
  normalizeRole,
  buildUserResponse,
  signToken,
  getInviteCode,
  buildAuthEntryUrl,
  buildFrontendUrl,
  getFrontendUrl,

  // User lookup
  findUserByEmailAndRole,
  findAnyUserByEmail,
  getUserById,

  // Account creation
  createTeacherAccount,
  createInstituteAdminAccount,

  // Password reset
  generatePasswordResetToken,
  validatePasswordResetRequest,
  resetUserPassword,

  // Google OAuth
  getGoogleClientConfigOrThrow,
  getGoogleProfile,
  exchangeGoogleCode,
  buildGoogleAuthorizeUrl,
  createGoogleAuthState,
  completeGoogleRegistrationOrLogin,
}
