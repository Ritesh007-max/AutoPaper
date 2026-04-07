import { useEffect, useState } from 'react'

import { requestPasswordReset } from '../../api/auth'
import SectionCard from '../../components/SectionCard'
import {
  getDashboardPathForRole,
  getLoginPathForRole,
  getStoredAuth,
  normalizeRole,
} from '../../utils/auth'

const getInitialRole = () => {
  if (typeof window === 'undefined') {
    return 'teacher'
  }

  const params = new URLSearchParams(window.location.search)
  return normalizeRole(params.get('role')) || 'teacher'
}

function ForgotPasswordPage() {
  const [role, setRole] = useState(getInitialRole())
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [resetUrl, setResetUrl] = useState('')
  const storedAuth = getStoredAuth()

  useEffect(() => {
    if (storedAuth?.token && storedAuth?.user?.role) {
      window.location.replace(getDashboardPathForRole(storedAuth.user.role))
    }
  }, [storedAuth?.token, storedAuth?.user?.role])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!email.trim()) {
      setStatus({
        type: 'error',
        message: 'Email is required.',
      })
      return
    }

    setLoading(true)
    setStatus({ type: '', message: '' })
    setResetUrl('')

    try {
      const response = await requestPasswordReset({
        role,
        email: email.trim(),
      })

      setStatus({
        type: 'success',
        message: response.data?.message || 'If an account exists, a reset link has been sent.',
      })
      setResetUrl(response.data?.resetUrl || '')
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to request password reset.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-5xl items-center">
        <SectionCard>
          <div className="rounded-[1.5rem] bg-white p-6 text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <div className="max-w-2xl">
              <a href="/login" className="text-xs font-black uppercase tracking-[0.3em] text-sky-500">
                AutoPaper
              </a>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Reset your password</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Enter the email tied to your account and we’ll send a password reset link.
              </p>
            </div>

            <form className="mt-8 space-y-4 max-w-xl" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Role
                </span>
                <select
                  value={role}
                  onChange={(event) => setRole(normalizeRole(event.target.value) || 'teacher')}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50"
                >
                  <option value="teacher">Teacher</option>
                  <option value="instituteAdmin">Institute Admin</option>
                  <option value="Admin">System Admin</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50"
                  placeholder="name@example.com"
                />
              </label>

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

              {resetUrl ? (
                <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                  <p className="font-semibold">Development reset link</p>
                  <a href={resetUrl} className="mt-2 block break-all font-medium text-sky-700 underline">
                    {resetUrl}
                  </a>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
                <a
                  href={getLoginPathForRole(role)}
                  className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Back to login
                </a>
              </div>
            </form>
          </div>
        </SectionCard>
      </div>
    </main>
  )
}

export default ForgotPasswordPage
