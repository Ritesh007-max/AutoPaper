import { useEffect, useState } from 'react'

import { buildGoogleAuthUrl, loginUser, registerUser } from '../../api/auth'
import SectionCard from '../../components/SectionCard'
import { baseInputClassName } from '../../components/formStyles'
import {
  getDashboardPathForRole,
  getLoginPathForRole,
  getRegisterPathForRole,
  getRoleLabel,
  getStoredAuth,
  normalizeRole,
  saveAuthSession,
} from '../../utils/auth'

const getInitialParams = (mode) => {
  if (typeof window === 'undefined') {
    return { role: 'teacher', code: '', authError: '' }
  }

  const params = new URLSearchParams(window.location.search)
  const requestedRole = normalizeRole(params.get('role'))
  const code = String(params.get('code') || params.get('uid') || '').trim()
  const authError = String(params.get('authError') || '').trim()

  if (mode === 'register' && requestedRole === 'Admin') {
    return { role: 'teacher', code: '', authError }
  }

  return {
    role: requestedRole || 'teacher',
    code,
    authError,
  }
}

const getInitialForm = (mode, code = '') => {
  if (mode === 'login') {
    return {
      email: '',
      password: '',
    }
  }

  return {
    name: '',
    email: '',
    password: '',
    code,
  }
}

function AuthPage({ mode }) {
  const initialParams = getInitialParams(mode)
  const [role, setRole] = useState(initialParams.role)
  const [form, setForm] = useState(getInitialForm(mode, initialParams.code))
  const [status, setStatus] = useState(
    initialParams.authError
      ? { type: 'error', message: initialParams.authError }
      : { type: '', message: '' },
  )
  const [loading, setLoading] = useState(false)
  const storedAuth = getStoredAuth()

  useEffect(() => {
    if (storedAuth?.token && storedAuth?.user?.role) {
      window.location.replace(getDashboardPathForRole(storedAuth.user.role))
    }
  }, [storedAuth?.token, storedAuth?.user?.role])

  useEffect(() => {
    if (mode === 'login') {
      setForm(getInitialForm('login'))
      setStatus(
        initialParams.authError
          ? { type: 'error', message: initialParams.authError }
          : { type: '', message: '' },
      )
      return
    }

    setForm(getInitialForm('register', initialParams.code))
    setStatus(
      initialParams.authError
        ? { type: 'error', message: initialParams.authError }
        : { type: '', message: '' },
    )
  }, [mode, role, initialParams.code, initialParams.authError])

  const roleOptions = mode === 'login' ? ['teacher', 'instituteAdmin', 'Admin'] : ['teacher', 'instituteAdmin']
  const googleAuthEnabled = role !== 'Admin'

  const authTitle = mode === 'login' ? 'Welcome back' : 'Join your workspace'
  const authSubtitle =
    mode === 'login'
      ? 'Log in with email and password, or use Google for supported roles.'
      : 'Use the registration code from your invitation email, then create your own password or finish with Google.'

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleRoleChange = (event) => {
    setRole(normalizeRole(event.target.value) || 'teacher')
  }

  const buildPayload = () => {
    if (mode === 'login') {
      return {
        role,
        email: form.email.trim(),
        password: form.password.trim(),
      }
    }

    return {
      role,
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password.trim(),
      code: form.code.trim(),
    }
  }

  const validatePayload = (payload) => {
    if (mode === 'login') {
      if (!payload.email || !payload.password) {
        return 'Email and password are required.'
      }
      return ''
    }

    if (!payload.name) {
      return `${getRoleLabel(role)} name is required.`
    }

    if (!payload.email) {
      return `${getRoleLabel(role)} email is required.`
    }

    if (!payload.password) {
      return 'Password is required.'
    }

    if (!payload.code) {
      return 'Registration code is required.'
    }

    return ''
  }

  const submitForm = async (event) => {
    event.preventDefault()

    if (mode === 'register' && role === 'Admin') {
      setStatus({
        type: 'error',
        message: 'System admins cannot register. Please use the login page.',
      })
      return
    }

    const payload = buildPayload()
    const validationError = validatePayload(payload)

    if (validationError) {
      setStatus({
        type: 'error',
        message: validationError,
      })
      return
    }

    setLoading(true)
    setStatus({ type: '', message: '' })

    try {
      const response = mode === 'login' ? await loginUser(payload) : await registerUser(payload)
      const token = response.data?.token
      const user = response.data?.data

      if (!token || !user) {
        throw new Error('Authentication response is missing token or user data.')
      }

      saveAuthSession({ token, user })
      window.location.replace(getDashboardPathForRole(user.role))
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Authentication failed.',
      })
    } finally {
      setLoading(false)
    }
  }

  const continueWithGoogle = () => {
    if (!googleAuthEnabled) {
      setStatus({
        type: 'error',
        message: 'Google sign-in is not available for system admins.',
      })
      return
    }

    if (mode === 'register' && !form.code.trim()) {
      setStatus({
        type: 'error',
        message: 'Please enter your registration code before continuing with Google.',
      })
      return
    }

    window.location.assign(
      buildGoogleAuthUrl({
        mode,
        role,
        code: mode === 'register' ? form.code.trim() : '',
      }),
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-6 lg:grid-cols-[0.95fr,1.05fr] lg:items-center">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <a href="/" className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600">
            AutoPaper
          </a>
          <h1 className="mt-6 max-w-xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            {authTitle}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">{authSubtitle}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-indigo-600">Invite first</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                System admins invite institutes, and institutes invite teachers. Registration happens with the code
                they receive.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-indigo-600">Password help</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                If you forget your password, we can send a reset link to your email and get you back in quickly.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={mode === 'login' ? getRegisterPathForRole(role) : getLoginPathForRole(role)}
              className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
            </a>
            <a
              href={getLoginPathForRole('Admin')}
              className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              System Admin Login
            </a>
          </div>

          <div className="mt-10 grid gap-3">
            {[
              { label: 'Dashboard-style UI', detail: 'Same surfaces, spacing, and typography as the logged-in app.' },
              { label: 'Role aware routing', detail: 'Teachers, institute admins, and admins all get the right entry point.' },
              { label: 'Simple recovery', detail: 'Forgot-password and reset flows follow the same clean theme.' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-indigo-600" />
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <SectionCard>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-slate-900">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-indigo-600">
                      {mode === 'login' ? 'Login' : 'Register'}
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                      {getRoleLabel(role)} access
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {mode === 'login'
                        ? 'Authenticate with your email and password, or continue with Google.'
                        : 'Enter the registration code from your invite, then create your own password or finish with Google.'}
                    </p>
                  </div>

                  <div className="flex rounded-full border border-slate-200 bg-slate-50 p-1">
                    <a
                      href={mode === 'login' ? '#' : getLoginPathForRole(role)}
                      onClick={(event) => {
                        if (mode === 'login') {
                          event.preventDefault()
                        }
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        mode === 'login' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Login
                    </a>
                    <a
                      href={mode === 'register' ? '#' : getRegisterPathForRole(role)}
                      onClick={(event) => {
                        if (mode === 'register') {
                          event.preventDefault()
                        }
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        mode === 'register' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Register
                    </a>
                  </div>
                </div>

                <form className="mt-8 space-y-4" onSubmit={submitForm}>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Role
                    </span>
                    <select
                      name="role"
                      value={role}
                      onChange={handleRoleChange}
                      className={baseInputClassName}
                    >
                      {roleOptions.map((option) => (
                        <option key={option} value={option}>
                          {getRoleLabel(option)}
                        </option>
                      ))}
                    </select>
                    {mode === 'register' && role === 'Admin' ? (
                      <p className="mt-2 text-xs font-semibold text-rose-600">
                        System admins can only log in. They cannot register here.
                      </p>
                    ) : null}
                  </label>

                  {mode === 'login' ? (
                    <>
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                          Email
                        </span>
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          className={baseInputClassName}
                          placeholder="name@example.com"
                        />
                      </label>

                      <label className="block">
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                          <span className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                            Password
                          </span>
                          <a
                            href={`/forgot-password?role=${encodeURIComponent(role)}`}
                            className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
                          >
                            Forgot password?
                          </a>
                        </div>
                        <input
                          name="password"
                          type="password"
                          value={form.password}
                          onChange={handleChange}
                          className={baseInputClassName}
                          placeholder="Your password"
                        />
                      </label>
                    </>
                  ) : (
                    <>
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                          {role === 'instituteAdmin' ? 'Admin Name' : 'Teacher Name'}
                        </span>
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          className={baseInputClassName}
                          placeholder={role === 'instituteAdmin' ? 'Principal / coordinator' : 'Teacher name'}
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                          {role === 'instituteAdmin' ? 'Admin Email' : 'Teacher Email'}
                        </span>
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          className={baseInputClassName}
                          placeholder="name@example.com"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                          Password
                        </span>
                        <input
                          name="password"
                          type="password"
                          value={form.password}
                          onChange={handleChange}
                          className={baseInputClassName}
                          placeholder="Create your password"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                          Registration Code
                        </span>
                        <input
                          name="code"
                          value={form.code}
                          onChange={handleChange}
                          className={baseInputClassName}
                          placeholder={role === 'teacher' ? 'Teacher code from email' : 'Institute UID from email'}
                        />
                      </label>
                    </>
                  )}

                  {status.message ? (
                    <div
                      className={`rounded-2xl border px-4 py-3 text-sm ${
                        status.type === 'error'
                          ? 'border-rose-200 bg-rose-50 text-rose-700'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {status.message}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading || (mode === 'register' && role === 'Admin')}
                      className="rounded-full bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? 'Working...' : mode === 'login' ? 'Login' : 'Create Account'}
                    </button>

                    <button
                      type="button"
                      onClick={continueWithGoogle}
                      disabled={loading || !googleAuthEnabled}
                      className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Continue with Google
                    </button>
                  </div>

                  <p className="text-xs leading-6 text-slate-500">
                    {mode === 'register'
                      ? 'Google sign-up uses your Google profile and the invitation code entered above.'
                      : 'Google sign-in works for accounts that were created or linked with Google on this workspace.'}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <a
                      href={mode === 'login' ? getRegisterPathForRole(role) : getLoginPathForRole(role)}
                      className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      {mode === 'login' ? 'Need to register?' : 'Already registered?'}
                    </a>
                    {mode === 'login' ? (
                      <a
                        href={`/forgot-password?role=${encodeURIComponent(role)}`}
                        className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                      >
                        Forgot password?
                      </a>
                    ) : null}
                  </div>
                </form>
              </div>
            </SectionCard>
          </div>
        </section>
      </div>
    </main>
  )
}

export default AuthPage
