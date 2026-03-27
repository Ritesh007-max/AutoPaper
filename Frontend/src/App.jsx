import TeacherSectionPage from './pages/TeacherSectionPage'

function App() {
  const routes = {
    '/teacher': TeacherSectionPage,
    '/teacher/': TeacherSectionPage,
    '/teacher/upload-single-question': TeacherSectionPage,
    '/teacher/fetch-questions': TeacherSectionPage,
  }

  const CurrentPage = routes[window.location.pathname]

  if (!CurrentPage) {
    return <p className="px-4 py-10 text-center text-slate-600">Page not found.</p>
  }

  return <CurrentPage />
}

export default App
