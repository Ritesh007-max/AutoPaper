import InstituteDashboard from './InstituteDashboard'
import InstituteTeachersPage from './InstituteTeachersPage'
import InstituteActivityPage from './InstituteActivityPage'
import InstituteInvitesPage from './InstituteInvitesPage'
import InstituteNotificationsPage from './InstituteNotificationsPage'

const instituteRoutes = {
  '/institute': { key: 'dashboard', component: InstituteDashboard },
  '/institute/dashboard': { key: 'dashboard', component: InstituteDashboard },
  '/teachers': { key: 'teachers', component: InstituteTeachersPage },
  '/institute/teachers': { key: 'teachers', component: InstituteTeachersPage },
  '/teachers/invite': { key: 'invites', component: InstituteInvitesPage },
  '/institute/teachers/invite': { key: 'invites', component: InstituteInvitesPage },
  '/activity': { key: 'activity', component: InstituteActivityPage },
  '/institute/activity': { key: 'activity', component: InstituteActivityPage },
  '/invites': { key: 'invites', component: InstituteInvitesPage },
  '/institute/invites': { key: 'invites', component: InstituteInvitesPage },
  '/notifications': { key: 'notifications', component: InstituteNotificationsPage },
  '/institute/notifications': { key: 'notifications', component: InstituteNotificationsPage },
}

function InstituteSectionPage() {
  const route = instituteRoutes[window.location.pathname] ?? instituteRoutes['/institute/dashboard']
  const CurrentPage = route.component

  return <CurrentPage />
}

export default InstituteSectionPage
