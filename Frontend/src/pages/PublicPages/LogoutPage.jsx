import { useEffect } from 'react'

import { clearAuthSession } from '../../utils/auth'

function LogoutPage() {
  useEffect(() => {
    clearAuthSession()
    window.location.replace('/')
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-slate-200">
        Signing out...
      </div>
    </main>
  )
}

export default LogoutPage
