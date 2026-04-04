import TeacherSectionPage from './pages/TeacherPages/TeacherSectionPage'
import InstituteSectionPage from './pages/InstitutePages/InstituteSectionPage'
import AdminInstitutesPage from './pages/AdminPages/AdminInstitutesPage'

function App() {
  const pathname = window.location.pathname
  const isTeacherRoute = pathname === '/teacher' || pathname.startsWith('/teacher/')
  const isInstituteRoute =
    pathname === '/institute' ||
    pathname.startsWith('/institute/') ||
    pathname === '/teachers' ||
    pathname === '/activity' ||
    pathname === '/invites'
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')

  if (isTeacherRoute) {
    return <TeacherSectionPage />
  }

  if (isInstituteRoute) {
    return <InstituteSectionPage />
  }

  if (isAdminRoute) {
    return <AdminInstitutesPage />
  }

  return <p className="px-4 py-10 text-center text-slate-600">Page not found.</p>
}

export default App
