import { useMemo, useState } from 'react'

import { resetPassword } from '../../api/auth'
import SectionCard from '../../components/SectionCard'
import { baseInputClassName } from '../../components/formStyles'
import { getLoginPathForRole, getRoleLabel, normalizeRole } from '../../utils/auth'

const getInitialParams = () => {
  if (typeof window === 'undefined') {
    return { token: '', role: 'teacher', email: '' }
  }

  const params = new URLSearchParams(window.location.search)

  return {
    token: String(params.get('token') || '').trim(),
    role: normalizeRole(params.get('role')) || 'teacher',
    email: String(params.get('email') || '').trim(),
  }
}

function ResetPasswordPage() {
  const initialParams = useMemo(() => getInitialParams(), [])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState(
    initialParams.token
      ? { type: '', message: '' }
      : { type: 'error', message: 'This reset link is missing a token.' },
  )
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!initialParams.token) {
      setStatus({
        type: 'error',
        message: 'This reset link is missing a token.',
      })
      return
    }

    if (!password.trim() || !confirmPassword.trim()) {
      setStatus({
        type: 'error',
        message: 'Please enter and confirm your new password.',
      })
      return
    }

    if (password.trim() !== confirmPassword.trim()) {
      setStatus({
        type: 'error',
        message: 'Passwords do not match.',
      })
      return
    }

    setLoading(true)
    setStatus({ type: '', message: '' })

    try {
      const response = await resetPassword({
        token: initialParams.token,
        password: password.trim(),
      })

      setSuccess(true)
      setStatus({
        type: 'success',
        message: response.data?.message || 'Password updated successfully.',
      })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to reset password.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-5xl items-center">
        <SectionCard>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-slate-900">
            <div className="max-w-2xl">
              <a href="/login" className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600">
                AutoPaper
              </a>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Choose a new password</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {initialParams.email
                  ? `Resetting the password for ${initialParams.email}.`
                  : `Resetting the password for ${getRoleLabel(initialParams.role)}.`}
              </p>
            </div>

            {success ? (
              <div className="mt-8 max-w-xl rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
                <p className="text-sm font-semibold">Password updated successfully.</p>
                <p className="mt-2 text-sm leading-6">
                  You can now log in with your new password.
                </p>
                <a
                  href={getLoginPathForRole(initialParams.role)}
                  className="mt-4 inline-flex rounded-full bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                  Back to login
                </a>
              </div>
            ) : (
              <form className="mt-8 max-w-xl space-y-4" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    New password
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={baseInputClassName}
                    placeholder="Enter a new password"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Confirm password
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className={baseInputClassName}
                    placeholder="Re-enter your password"
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

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-full bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Saving...' : 'Update password'}
                  </button>
                  <a
                    href={getLoginPathForRole(initialParams.role)}
                    className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    Back to login
                  </a>
                </div>
              </form>
            )}
          </div>
        </SectionCard>
      </div>
    </main>
  )
}

export default ResetPasswordPage
