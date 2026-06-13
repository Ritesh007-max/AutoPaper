const jwt = require('jsonwebtoken')

const User = require('../modles/Users')
const { getJwtSecret } = require('../middleware/auth')
const { sendPasswordResetEmail } = require('../utils/passwordResetMailer')
const authService = require('../services/authService')

const registerUser = async (req, res) => {
  try {
    const role = authService.normalizeRole(req.body?.role)
    const name = String(req.body?.name || '').trim()
    const email = authService.normalizeEmail(req.body?.email)
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

    const code = authService.getInviteCode(req.body, role)
    const result =
      role === 'teacher'
        ? await authService.createTeacherAccount({ name, email, password, code })
        : await authService.createInstituteAdminAccount({ name, email, password, code })

    if (result.error) {
      return res.status(result.error.status).json({
        success: false,
        message: result.error.message,
      })
    }

    const token = authService.signToken(result.user)

    return res.status(201).json({
      success: true,
      message: result.message,
      token,
      tokenType: 'Bearer',
      data: authService.buildUserResponse(result.user),
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
    const role = authService.normalizeRole(req.body?.role)
    const email = authService.normalizeEmail(req.body?.email)
    const password = String(req.body?.password || '').trim()
    console.log(role, email, password)
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

    const user = await authService.findUserByEmailAndRole(email, role)

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email, password, or role.',
      })
    }

    const token = authService.signToken(user)

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      tokenType: 'Bearer',
      data: authService.buildUserResponse(user),
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
    const user = await authService.getUserById(req.user.userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      })
    }

    return res.status(200).json({
      success: true,
      data: authService.buildUserResponse(user),
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch current user.',
      error: error.message,
    })
  }
}

const requestPasswordReset = async (req, res) => {
  try {
    const role = authService.normalizeRole(req.body?.role)
    const email = authService.normalizeEmail(req.body?.email)

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

    const result = await authService.validatePasswordResetRequest(email, role)

    if (!result) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists for that email and role, a reset link has been sent.',
      })
    }

    try {
      await sendPasswordResetEmail({
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        resetToken: result.token,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email.',
        error: error.message,
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

    const result = await authService.resetUserPassword(token, password)

    if (result.error) {
      return res.status(result.error.status).json({
        success: false,
        message: result.error.message,
      })
    }

    return res.status(200).json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password.',
      error: error.message,
    })
  }
}

const redirectWithAuthError = (res, mode, role, message) =>
  res.redirect(
    authService.buildAuthEntryUrl(mode, {
      role,
      authError: message,
    }),
  )

const startGoogleAuth = (req, res) => {
  const role = authService.normalizeRole(req.query?.role)
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
    const { clientId, redirectUri } = authService.getGoogleClientConfigOrThrow()
    const state = authService.createGoogleAuthState(role, mode, code)
    const authorizeUrl = authService.buildGoogleAuthorizeUrl(clientId, redirectUri)
    const authorizeUrlWithState = `${authorizeUrl}&state=${encodeURIComponent(state)}`

    return res.redirect(authorizeUrlWithState)
  } catch (error) {
    return redirectWithAuthError(res, mode, role, error.message)
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

    const role = authService.normalizeRole(statePayload.role)
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

    const { clientId, clientSecret, redirectUri } = authService.getGoogleClientConfigOrThrow()
    const tokenData = await authService.exchangeGoogleCode({
      code,
      redirectUri,
      clientId,
      clientSecret,
    })
    const profile = await authService.getGoogleProfile(tokenData.access_token)

    const isGoogleEmailVerified = profile.email_verified === true || profile.verified_email === true

    if (!isGoogleEmailVerified) {
      return redirectWithAuthError(
        res,
        authMode,
        role,
        'Google email verification is required before you can continue.',
      )
    }

    const result = await authService.completeGoogleRegistrationOrLogin({
      profile,
      role,
      mode: authMode,
      code: inviteCode,
    })

    if (result.error) {
      return redirectWithAuthError(res, authMode, role, result.error.message)
    }

    const token = authService.signToken(result.user)
    return res.redirect(
      authService.buildFrontendUrl('/auth/google/callback', {
        token,
        user: JSON.stringify(authService.buildUserResponse(result.user)),
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
