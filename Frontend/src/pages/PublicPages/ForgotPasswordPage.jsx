import { useEffect, useState } from 'react'

import { requestPasswordReset } from '../../api/auth'
import SectionCard from '../../components/SectionCard'
import { baseInputClassName } from '../../components/formStyles'
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
    <main className="min-h-screen bg-background px-4 py-6 text-text-primary sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-5xl items-center">
        <SectionCard>
          <div className="rounded-[1.5rem] border border-border bg-surface p-6 text-text-primary">
            <div className="max-w-2xl">
              <a href="/login" className="text-[12px] font-black uppercase tracking-[0.3em] text-indigo-600">
                AutoPaper
              </a>
              <h1 className="mt-4 text-[30px] font-bold tracking-tight text-slate-950">Reset your password</h1>
              <p className="mt-3 text-[14px] leading-6 text-text-secondary">
                Enter the email tied to your account and we&apos;ll send a password reset link.
              </p>
            </div>

            <form className="mt-8 max-w-xl space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-bold uppercase tracking-widest text-neutral">
                  Role
                </span>
                <select
                  value={role}
                  onChange={(event) => setRole(normalizeRole(event.target.value) || 'teacher')}
                  className={baseInputClassName}
                >
                  <option value="teacher">Teacher</option>
                  <option value="instituteAdmin">Institute Admin</option>
                  <option value="Admin">System Admin</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[12px] font-bold uppercase tracking-widest text-neutral">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={baseInputClassName}
                  placeholder="name@example.com"
                />
              </label>

              {status.message ? (
                <div
                  className={`rounded-2xl border px-4 py-3 text-[14px] ${
                    status.type === 'error'
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {status.message}
                </div>
              ) : null}

              {resetUrl ? (
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-[14px] text-indigo-900">
                  <p className="font-semibold">Development reset link</p>
                  <a href={resetUrl} className="mt-2 block break-all font-medium text-indigo-700 underline">
                    {resetUrl}
                  </a>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-indigo-600 px-5 py-3 text-[14px] font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
                <a
                  href={getLoginPathForRole(role)}
                  className="rounded-full border border-border bg-surface px-5 py-3 text-[14px] font-bold text-text-secondary transition hover:border-slate-400 hover:bg-background"
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
