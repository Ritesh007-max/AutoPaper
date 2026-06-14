import { useEffect } from 'react'

import { clearAuthSession } from '../../utils/auth'

function LogoutPage() {
  useEffect(() => {
    clearAuthSession()
    window.location.replace('/')
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-text-primary">
      <div className="rounded-3xl border border-border bg-surface px-6 py-5 text-[14px] text-text-secondary ">
        Signing out...
      </div>
    </main>
  )
}

export default LogoutPage
