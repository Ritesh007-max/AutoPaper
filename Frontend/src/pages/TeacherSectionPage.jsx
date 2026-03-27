import TeacherNavbar from '../components/TeacherNavbar'
import TeacherQuestionsPage from './FetchQuestionsPage'
import UploadQuestionPage from './UploadQuestionPage'

const teacherRoutes = {
  '/teacher/upload-single-question': UploadQuestionPage,
  '/teacher/fetch-questions': TeacherQuestionsPage,
}

function TeacherSectionPage() {
  const CurrentTeacherPage = teacherRoutes[window.location.pathname] ?? UploadQuestionPage

  return (
    <main className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <TeacherNavbar />
        <CurrentTeacherPage />
      </div>
    </main>
  )
}

export default TeacherSectionPage
