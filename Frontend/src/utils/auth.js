const AUTH_STORAGE_KEY = 'autoPaper.auth'

export const AUTH_ROLES = ['teacher', 'instituteAdmin', 'Admin']
export const REGISTER_ROLES = ['teacher', 'instituteAdmin']

const parseStoredValue = (value) => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export const getStoredAuth = () => {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!rawValue) {
    return null
  }

  const parsed = parseStoredValue(rawValue)
  if (!parsed || typeof parsed !== 'object') {
    return null
  }

  return {
    token: typeof parsed.token === 'string' ? parsed.token : '',
    user: parsed.user && typeof parsed.user === 'object' ? parsed.user : null,
  }
}

export const saveAuthSession = ({ token, user }) => {
  if (typeof window === 'undefined' || !token || !user) {
    return
  }

  window.localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      token,
      user,
    }),
  )
}

export const clearAuthSession = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

export const normalizeRole = (role) => {
  const lowered = String(role || '').trim().toLowerCase()

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

export const getRoleLabel = (role) => {
  const normalized = normalizeRole(role)

  if (normalized === 'teacher') {
    return 'Teacher'
  }

  if (normalized === 'instituteAdmin') {
    return 'Institute Admin'
  }

  if (normalized === 'Admin') {
    return 'System Admin'
  }

  return 'User'
}

export const getDashboardPathForRole = (role) => {
  const normalized = normalizeRole(role)

  if (normalized === 'teacher') {
    return '/teacher/dashboard'
  }

  if (normalized === 'instituteAdmin') {
    return '/institute/dashboard'
  }

  if (normalized === 'Admin') {
    return '/admin'
  }

  return '/'
}

export const getLoginPathForRole = (role) => `/login?role=${encodeURIComponent(normalizeRole(role) || 'teacher')}`

export const getRegisterPathForRole = (role) => `/register?role=${encodeURIComponent(normalizeRole(role) || 'teacher')}`
