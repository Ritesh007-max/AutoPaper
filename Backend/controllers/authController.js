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

const redirectWithAuthError = (res, mode, role, message) =>
  res.redirect(
    buildAuthEntryUrl(mode, {
      role,
      authError: message,
    }),
  )

const findUserByEmailAndRole = async (email, role) =>
  User.findOne({
    email: new RegExp(`^${escapeRegExp(email)}$`, 'i'),
    role,
  })

const findAnyUserByEmail = async (email) =>
  User.findOne({
    email: new RegExp(`^${escapeRegExp(email)}$`, 'i'),
  })

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

    const code = getInviteCode(req.body, role)
    const result =
      role === 'teacher'
        ? await createTeacherAccount({ name, email, password, code })
        : await createInstituteAdminAccount({ name, email, password, code })

    if (result.error) {
      return res.status(result.error.status).json({
        success: false,
        message: result.error.message,
      })
    }

    const token = signToken(result.user)

    return res.status(201).json({
      success: true,
      message: result.message,
      token,
      tokenType: 'Bearer',
      data: buildUserResponse(result.user),
    })
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

const requestPasswordReset = async (req, res) => {
  try {
    const role = normalizeRole(req.body?.role)
    const email = normalizeEmail(req.body?.email)

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'A valid role is required to request a password reset.',
      })
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      })
    }

    const user = await findUserByEmailAndRole(email, role)

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists for that email and role, a reset link has been sent.',
      })
    }

    const { token, tokenHash, expiresAt } = generatePasswordResetToken()
    user.passwordResetTokenHash = tokenHash
    user.passwordResetTokenExpiresAt = expiresAt
    await user.save()

    try {
      await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        role: user.role,
        resetToken: token,
      })
    } catch (error) {
      if (!String(error.message || '').includes('SMTP is not configured')) {
        throw error
      }

      return res.status(200).json({
        success: true,
        message: 'Password reset link generated. SMTP is not configured, so the reset URL is returned for testing.',
        resetUrl: buildFrontendUrl('/reset-password', {
          token,
          role: user.role,
          email: user.email,
        }),
      })
    }

    return res.status(200).json({
      success: true,
      message: 'If an account exists for that email and role, a reset link has been sent.',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to request password reset.',
      error: error.message,
    })
  }
}

const resetPassword = async (req, res) => {
  try {
    const token = String(req.body?.token || req.query?.token || '').trim()
    const password = String(req.body?.password || '').trim()

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required.',
      })
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required.',
      })
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetTokenExpiresAt: { $gt: new Date() },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'The reset link is invalid or has expired.',
      })
    }

    user.password = password
    user.passwordResetTokenHash = undefined
    user.passwordResetTokenExpiresAt = undefined
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password.',
      error: error.message,
    })
  }
}

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

const startGoogleAuth = (req, res) => {
  const role = normalizeRole(req.query?.role)
  const mode = String(req.query?.mode || 'login').trim().toLowerCase() === 'register' ? 'register' : 'login'
  const code = String(req.query?.code || '').trim()

  if (!['teacher', 'instituteAdmin'].includes(role)) {
    return redirectWithAuthError(
      res,
      mode,
      role,
      'Google sign-in is available for teacher and institute admin accounts only.',
    )
  }

  if (mode === 'register' && !code) {
    return redirectWithAuthError(
      res,
      mode,
      role,
      'A registration code is required to continue with Google.',
    )
  }

  try {
    const { clientId, clientSecret, redirectUri } = getGoogleClientConfigOrThrow()
    const state = jwt.sign(
      {
        role,
        mode,
        code,
      },
      getJwtSecret(),
      { expiresIn: '10m' },
    )

    const authorizeUrl = new URL(GOOGLE_AUTHORIZE_URL)
    authorizeUrl.searchParams.set('client_id', clientId)
    authorizeUrl.searchParams.set('redirect_uri', redirectUri)
    authorizeUrl.searchParams.set('response_type', 'code')
    authorizeUrl.searchParams.set('scope', 'openid email profile')
    authorizeUrl.searchParams.set('state', state)
    authorizeUrl.searchParams.set('prompt', 'select_account')

    if (clientSecret) {
      authorizeUrl.searchParams.set('access_type', 'online')
    }

    return res.redirect(authorizeUrl.toString())
  } catch (error) {
    return redirectWithAuthError(res, mode, role, error.message)
  }
}

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

const handleGoogleAuthCallback = async (req, res) => {
  const mode = String(req.query?.mode || 'login').trim().toLowerCase() === 'register' ? 'register' : 'login'

  try {
    const code = String(req.query?.code || '').trim()
    const state = String(req.query?.state || '').trim()

    if (!code || !state) {
      return redirectWithAuthError(res, mode, '', 'Google sign-in was cancelled or did not complete.')
    }

    let statePayload
    try {
      statePayload = jwt.verify(state, getJwtSecret())
    } catch (error) {
      return redirectWithAuthError(res, mode, '', 'Google sign-in expired. Please try again.')
    }

    const role = normalizeRole(statePayload.role)
    const inviteCode = String(statePayload.code || '').trim()
    const authMode = String(statePayload.mode || mode).trim().toLowerCase() === 'register' ? 'register' : 'login'

    if (!['teacher', 'instituteAdmin'].includes(role)) {
      return redirectWithAuthError(
        res,
        authMode,
        role,
        'Google sign-in is available for teacher and institute admin accounts only.',
      )
    }

    const { clientId, clientSecret, redirectUri } = getGoogleClientConfigOrThrow()
    const tokenData = await exchangeGoogleCode({
      code,
      redirectUri,
      clientId,
      clientSecret,
    })
    const profile = await getGoogleProfile(tokenData.access_token)

    if (!profile.email_verified) {
      return redirectWithAuthError(
        res,
        authMode,
        role,
        'Google email verification is required before you can continue.',
      )
    }

    const result = await completeGoogleRegistrationOrLogin({
      profile,
      role,
      mode: authMode,
      code: inviteCode,
    })

    if (result.error) {
      return redirectWithAuthError(res, authMode, role, result.error.message)
    }

    const token = signToken(result.user)
    return res.redirect(
      buildFrontendUrl('/auth/google/callback', {
        token,
        user: JSON.stringify(buildUserResponse(result.user)),
      }),
    )
  } catch (error) {
    console.error('Google authentication failed', error)
    return redirectWithAuthError(res, mode, '', 'Google sign-in failed. Please try again.')
  }
}

module.exports = {
  getCurrentUser,
  handleGoogleAuthCallback,
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  startGoogleAuth,
}
