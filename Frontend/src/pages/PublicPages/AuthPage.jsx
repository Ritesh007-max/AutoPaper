import { useEffect, useState } from 'react'

import { loginUser, registerUser } from '../../api/auth'
import SectionCard from '../../components/SectionCard'
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
    return { role: 'teacher', code: '' }
  }

  const params = new URLSearchParams(window.location.search)
  const requestedRole = normalizeRole(params.get('role'))
  const code = String(params.get('code') || params.get('uid') || '').trim()

  if (mode === 'register' && requestedRole === 'Admin') {
    return { role: 'teacher', code: '' }
  }

  return {
    role: requestedRole || 'teacher',
    code,
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
  const [status, setStatus] = useState({ type: '', message: '' })
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
      setStatus({ type: '', message: '' })
      return
    }

    setForm(getInitialForm('register', initialParams.code))
    setStatus({ type: '', message: '' })
  }, [mode, role, initialParams.code])

  const roleOptions = mode === 'login'
    ? ['teacher', 'instituteAdmin', 'Admin']
    : ['teacher', 'instituteAdmin']

  const authTitle = mode === 'login' ? 'Welcome back' : 'Join your workspace'
  const authSubtitle =
    mode === 'login'
      ? 'Log in with the role that matches your dashboard.'
      : 'Use the registration code from your invitation email, then set your own password.'

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

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-6 lg:grid-cols-[1fr,0.95fr]">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.28),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.95),_rgba(2,6,23,0.98))] p-8 shadow-2xl shadow-slate-950/50 lg:p-12">
          <div className="absolute left-8 top-8 h-24 w-24 rounded-full bg-sky-500/15 blur-2xl" />
          <div className="absolute right-4 top-24 h-32 w-32 rounded-full bg-emerald-500/15 blur-3xl" />

          <a href="/" className="text-xs font-black uppercase tracking-[0.3em] text-sky-200">
            AutoPaper
          </a>
          <h1 className="mt-6 max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl">
            {authTitle}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">{authSubtitle}</p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-200">Invite first</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                System admins invite institutes, and institutes invite teachers. Registration happens with the code they receive.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-200">Own password</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                The invited user creates their own password during registration, then uses email + password to log in later.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={mode === 'login' ? getRegisterPathForRole(role) : getLoginPathForRole(role)}
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
            </a>
            <a
              href={getLoginPathForRole('Admin')}
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              System Admin Login
            </a>
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full">
            <SectionCard>
              <div className="rounded-[1.5rem] bg-white p-6 text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-500">
                      {mode === 'login' ? 'Login' : 'Register'}
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                      {getRoleLabel(role)} access
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {mode === 'login'
                        ? 'Authenticate with your email and password.'
                        : 'Enter the registration code from your invite, then create your own password.'}
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
                        mode === 'login' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:text-slate-900'
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
                        mode === 'register' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:text-slate-900'
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
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50"
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
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50"
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
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50"
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
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50"
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
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50"
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
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50"
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
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50"
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
                      className="rounded-full bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? 'Working...' : mode === 'login' ? 'Login' : 'Create Account'}
                    </button>

                    <a
                      href={mode === 'login' ? getRegisterPathForRole(role) : getLoginPathForRole(role)}
                      className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      {mode === 'login' ? 'Need to register?' : 'Already registered?'}
                    </a>
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
