import FetchQuestionsPage from './FetchQuestionsPage'
import BulkUploadQuestionsPage from './BulkUploadQuestionsPage'
import UploadQuestionPage from './UploadQuestionPage'
import UpdateQuestionsPage from './UpdateQuestionsPage'
import DeleteQuestionsPage from './DeleteQuestionsPage'
import TeacherDashboardPage from './TeacherDashboardPage'
import TeacherSettingsPage from './TeacherSettingsPage'
import TeacherHistoryPage from './TeacherHistoryPage'
import TeacherGeneratePaperPage from './TeacherGeneratePaperPage'
import TeacherLayout from '../../components/TeacherLayout'

const teacherRoutes = {
  '/teacher': { key: 'dashboard', component: TeacherDashboardPage },
  '/teacher/dashboard': { key: 'dashboard', component: TeacherDashboardPage },
  '/teacher/upload-single-question': { key: 'upload-single-question', component: UploadQuestionPage },
  '/teacher/add-question': { key: 'upload-single-question', component: UploadQuestionPage },
  '/teacher/upload-bulk-questions': { key: 'upload-bulk-questions', component: BulkUploadQuestionsPage },
  '/teacher/bulk-upload': { key: 'upload-bulk-questions', component: BulkUploadQuestionsPage },
  '/teacher/fetch-questions': { key: 'fetch-questions', component: FetchQuestionsPage },
  '/teacher/question-bank': { key: 'fetch-questions', component: FetchQuestionsPage },
  '/teacher/update-questions': { key: 'update-questions', component: UpdateQuestionsPage },
  '/teacher/delete-questions': { key: 'delete-questions', component: DeleteQuestionsPage },
  '/teacher/generate-paper': { key: 'generate-paper', component: TeacherGeneratePaperPage },
  '/teacher/history': { key: 'history', component: TeacherHistoryPage },
  '/teacher/settings': { key: 'settings', component: TeacherSettingsPage },
}

function TeacherSectionPage() {
  const navItems = [
    { key: 'dashboard', href: '/teacher/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { key: 'fetch-questions', href: '/teacher/question-bank', label: 'Question Bank', icon: 'question-bank' },
    { key: 'upload-single-question', href: '/teacher/add-question', label: 'Add Question', icon: 'add-question' },
    { key: 'update-questions', href: '/teacher/update-questions', label: 'Update Questions', icon: 'settings' },
    { key: 'delete-questions', href: '/teacher/delete-questions', label: 'Delete Questions', icon: 'trash' },
    { key: 'generate-paper', href: '/teacher/generate-paper', label: 'Generate Paper', icon: 'generate-paper' },
    { key: 'history', href: '/teacher/history', label: 'History', icon: 'history' },
    { key: 'settings', href: '/teacher/settings', label: 'Settings', icon: 'settings', adminOnly: true },
  ]

  const route = teacherRoutes[window.location.pathname] ?? teacherRoutes['/teacher/dashboard']
  const CurrentTeacherPage = route.component

  return (
    <TeacherLayout navItems={navItems} activeKey={route.key}>
      <CurrentTeacherPage />
    </TeacherLayout>
  )
}

export default TeacherSectionPage


