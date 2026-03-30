import TeacherNavbar from '../components/TeacherNavbar'
import FetchQuestionsPage from './FetchQuestionsPage'
import BulkUploadQuestionsPage from './BulkUploadQuestionsPage'
import UploadQuestionPage from './UploadQuestionPage'
import UpdateQuestionsPage from './UpdateQuestionsPage'
import DeleteQuestionsPage from './DeleteQuestionsPage'

const teacherRoutes = {
  '/teacher/upload-single-question': UploadQuestionPage,
  '/teacher/upload-bulk-questions': BulkUploadQuestionsPage,
  '/teacher/fetch-questions': FetchQuestionsPage,
  '/teacher/update-questions': UpdateQuestionsPage,
  '/teacher/delete-questions': DeleteQuestionsPage,
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
