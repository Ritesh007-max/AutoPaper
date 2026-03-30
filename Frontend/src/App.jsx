import TeacherSectionPage from './pages/TeacherSectionPage'

function App() {
  const pathname = window.location.pathname
  const isTeacherRoute = pathname === '/teacher' || pathname.startsWith('/teacher/')

  if (!isTeacherRoute) {
    return <p className="px-4 py-10 text-center text-slate-600">Page not found.</p>
  }

  return <TeacherSectionPage />
}

export default App
