import { useEffect } from 'react'

import LandingPage from './pages/PublicPages/LandingPage'
import AuthPage from './pages/PublicPages/AuthPage'
import ForgotPasswordPage from './pages/PublicPages/ForgotPasswordPage'
import GoogleAuthCallbackPage from './pages/PublicPages/GoogleAuthCallbackPage'
import LogoutPage from './pages/PublicPages/LogoutPage'
import ResetPasswordPage from './pages/PublicPages/ResetPasswordPage'
import TeacherSectionPage from './pages/TeacherPages/TeacherSectionPage'
import InstituteSectionPage from './pages/InstitutePages/InstituteSectionPage'
import AdminInstitutesPage from './pages/AdminPages/AdminInstitutesPage'
import {
  getDashboardPathForRole,
  getLoginPathForRole,
  getStoredAuth,
  normalizeRole,
} from './utils/auth'

const getExpectedRoleForPath = (pathname) => {
  if (pathname === '/teacher' || pathname.startsWith('/teacher/')) {
    return 'teacher'
  }

  if (
    pathname === '/institute' ||
    pathname.startsWith('/institute/') ||
    pathname === '/teachers' ||
    pathname === '/teachers/invite' ||
    pathname === '/activity' ||
    pathname === '/invites' ||
    pathname === '/notifications'
  ) {
    return 'instituteAdmin'
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return 'Admin'
  }

  return ''
}

function RedirectPage({ to }) {
  useEffect(() => {
    window.location.replace(to)
  }, [to])

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-slate-200">
        Redirecting...
      </div>
    </main>
  )
}

function App() {
  const pathname = window.location.pathname
  const auth = getStoredAuth()
  const authRole = normalizeRole(auth?.user?.role)
  const expectedRole = getExpectedRoleForPath(pathname)

  if (pathname === '/logout') {
    return <LogoutPage />
  }

  if (pathname === '/forgot-password') {
    return <ForgotPasswordPage />
  }

  if (pathname === '/reset-password') {
    return <ResetPasswordPage />
  }

  if (pathname === '/auth/google/callback') {
    return <GoogleAuthCallbackPage />
  }

  if (pathname === '/') {
    if (authRole) {
      return <RedirectPage to={getDashboardPathForRole(authRole)} />
    }

    return <LandingPage />
  }

  if (pathname === '/login' || pathname === '/register') {
    if (authRole) {
      return <RedirectPage to={getDashboardPathForRole(authRole)} />
    }

    return <AuthPage mode={pathname === '/login' ? 'login' : 'register'} />
  }

  if (expectedRole === 'teacher') {
    if (!authRole) {
      return <RedirectPage to={getLoginPathForRole('teacher')} />
    }

    if (authRole !== 'teacher') {
      return <RedirectPage to={getDashboardPathForRole(authRole)} />
    }

    return <TeacherSectionPage />
  }

  if (expectedRole === 'instituteAdmin') {
    if (!authRole) {
      return <RedirectPage to={getLoginPathForRole('instituteAdmin')} />
    }

    if (authRole !== 'instituteAdmin') {
      return <RedirectPage to={getDashboardPathForRole(authRole)} />
    }

    return <InstituteSectionPage />
  }

  if (expectedRole === 'Admin') {
    if (!authRole) {
      return <RedirectPage to={getLoginPathForRole('Admin')} />
    }

    if (authRole !== 'Admin') {
      return <RedirectPage to={getDashboardPathForRole(authRole)} />
    }

    return <AdminInstitutesPage />
  }

  return <p className="px-4 py-10 text-center text-slate-600">Page not found.</p>
}

export default App
