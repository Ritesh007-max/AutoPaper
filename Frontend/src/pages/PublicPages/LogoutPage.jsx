import { useEffect } from 'react'

import { clearAuthSession } from '../../utils/auth'

function LogoutPage() {
  useEffect(() => {
    clearAuthSession()
    window.location.replace('/')
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-900">
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-700 shadow-sm">
        Signing out...
      </div>
    </main>
  )
}

export default LogoutPage
