import { useEffect, useMemo } from 'react'

import SectionCard from '../../components/SectionCard'
import { getDashboardPathForRole, saveAuthSession } from '../../utils/auth'

const parseCallbackData = () => {
  if (typeof window === 'undefined') {
    return { token: '', user: null, error: '' }
  }

  const params = new URLSearchParams(window.location.search)
  const token = String(params.get('token') || '').trim()
  const error = String(params.get('authError') || params.get('error') || '').trim()
  const rawUser = String(params.get('user') || '').trim()

  let user = null
  if (rawUser) {
    try {
      user = JSON.parse(rawUser)
    } catch {
      user = null
    }
  }

  return {
    token,
    user,
    error,
  }
}

function GoogleAuthCallbackPage() {
  const initialData = useMemo(() => parseCallbackData(), [])
  const hasError = Boolean(initialData.error || !initialData.token || !initialData.user?.role)
  const statusMessage = initialData.error
    ? initialData.error
    : hasError
      ? 'Google sign-in did not return the information we expected.'
      : 'Completing Google sign-in...'

  useEffect(() => {
    if (hasError) {
      return
    }

    saveAuthSession({
      token: initialData.token,
      user: initialData.user,
    })

    window.location.replace(getDashboardPathForRole(initialData.user.role))
  }, [hasError, initialData.token, initialData.user])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-text-primary">
      <SectionCard>
        <div className="rounded-[1.5rem] border border-border bg-surface px-6 py-8 text-center ">
          <p className="text-[12px] font-black uppercase tracking-[0.3em] text-indigo-600">AutoPaper</p>
          <h1 className="mt-4 text-[24px] font-bold tracking-tight text-text-primary">Google sign-in</h1>
          <p className="mt-3 max-w-md text-[14px] leading-6 text-text-secondary">{statusMessage}</p>

          {hasError ? (
            <a
              href="/login"
              className="mt-6 inline-flex rounded-full bg-indigo-600 px-5 py-3 text-[14px] font-bold text-white transition hover:bg-indigo-700"
            >
              Back to login
            </a>
          ) : (
            <div className="mt-6 inline-flex rounded-full border border-border bg-background px-5 py-3 text-[14px] font-bold text-text-secondary">
              Redirecting...
            </div>
          )}
        </div>
      </SectionCard>
    </main>
  )
}

export default GoogleAuthCallbackPage
