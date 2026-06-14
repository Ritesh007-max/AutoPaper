import { useEffect, useState } from 'react'

import SectionCard from '../../components/SectionCard'
import InstituteLayout from '../../components/InstituteLayout'
import {
  ActivityList,
  InviteTable,
  MetricCard,
  QuickActionCard,
  SectionHeader,
  TeacherSnapshotTable,
} from '../../components/InstituteDashboardUi'
import {
  formatLongDateTime,
  formatNumber,
  formatRelativeTime,
  formatShortDate,
} from '../../utils/instituteFormatters'
import {
  getInstituteActivity,
  getInstituteDashboardStats,
  getInstituteInvites,
  getInstituteTeachers,
  resendInstituteInvite,
} from '../../api/institute'

const initialSectionState = {
  loading: true,
  error: '',
  data: null,
}

const statCardMeta = [
  {
    key: 'totalTeachers',
    label: 'Total Teachers',
    note: 'Teachers registered under the institute',
    tone: 'sky',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.25">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-1a4 4 0 00-4-4h-1m-4 5h-6v-1a4 4 0 014-4h2m0 0a4 4 0 10-8 0m8 0a4 4 0 118 0m-8 0a4 4 0 100-8 4 4 0 000 8z" />
      </svg>
    ),
  },
  {
    key: 'totalQuestions',
    label: 'Total Questions',
    note: 'Questions added across all teachers',
    tone: 'violet',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.25">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9a4 4 0 018 0c0 2.25-2 3-2 5m-2 4h.01M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
      </svg>
    ),
  },
  {
    key: 'totalPapersGenerated',
    label: 'Papers Generated',
    note: 'Institute-wide generated papers',
    tone: 'emerald',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.25">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    key: 'pendingInvites',
    label: 'Pending Invites',
    note: 'Invitations awaiting response',
    tone: 'amber',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.25">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.956a1 1 0 00.95.69h4.161c.969 0 1.371 1.24.588 1.81l-3.368 2.446a1 1 0 00-.364 1.118l1.286 3.956c.3.921-.755 1.688-1.54 1.118l-3.368-2.446a1 1 0 00-1.176 0l-3.368 2.446c-.785.57-1.84-.197-1.54-1.118l1.286-3.956a1 1 0 00-.364-1.118L2.075 9.383c-.783-.57-.38-1.81.588-1.81h4.161a1 1 0 00.95-.69l1.286-3.956z" />
      </svg>
    ),
  },
]

const quickActions = [
  {
    href: '/teachers/invite',
    label: 'Invite Teacher',
    description: 'Send or manage teacher invitations',
    tone: 'sky',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.25">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9V7a4 4 0 00-8 0v2M5 11h14l-1.5 9h-11L5 11z" />
      </svg>
    ),
  },
  {
    href: '/teachers',
    label: 'View Teachers',
    description: 'Open the teacher directory and stats',
    tone: 'violet',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.25">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-1a4 4 0 00-4-4h-1m-4 5H5v-1a4 4 0 014-4h2m0 0a4 4 0 10-8 0m8 0a4 4 0 118 0" />
      </svg>
    ),
  },
  {
    href: '/activity',
    label: 'View Activity',
    description: 'Inspect the most recent institute actions',
    tone: 'emerald',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.25">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8L10 18l-4-4-6 6" />
      </svg>
    ),
  },
  {
    href: '/invites',
    label: 'View Invites',
    description: 'Check pending, accepted, and expired invites',
    tone: 'amber',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.25">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18V6H3v10z" />
      </svg>
    ),
  },
  {
    href: '/notifications',
    label: 'Send Notifications',
    description: 'Broadcast updates to all teachers in the institute',
    tone: 'rose',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.25">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
]

const normalizeStats = (payload = {}) => ({
  totalTeachers: Number(payload.totalTeachers) || 0,
  totalQuestions: Number(payload.totalQuestions) || 0,
  totalPapersGenerated: Number(payload.totalPapersGenerated) || 0,
  pendingInvites: Number(payload.pendingInvites) || 0,
})

const normalizeTeacher = (teacher = {}) => ({
  id: teacher.id || teacher._id || teacher.email || crypto.randomUUID(),
  name: teacher.name || 'Unnamed Teacher',
  email: teacher.email || '',
  questionsAdded: Number(teacher.questionsAdded) || 0,
  papersGenerated: Number(teacher.papersGenerated) || 0,
  lastActive: teacher.lastActive || null,
  lastActiveLabel: formatRelativeTime(teacher.lastActive),
})

const normalizeActivity = (activity = {}) => ({
  id: activity.id || activity._id || crypto.randomUUID(),
  type: activity.type || 'question_added',
  title: activity.title || 'Activity update',
  detail: activity.detail || '',
  createdAt: activity.createdAt || null,
  time: formatRelativeTime(activity.createdAt),
})

const normalizeInvite = (invite = {}) => ({
  id: invite.id || invite._id || invite.email || crypto.randomUUID(),
  email: invite.email || '',
  status: invite.status || 'pending',
  resendCount: Number(invite.resendCount) || 0,
  lastSentAt: invite.lastSentAt || null,
  expiresAt: invite.expiresAt || null,
  expiresAtLabel: formatShortDate(invite.expiresAt),
})

function InstituteDashboard() {
  const [statsState, setStatsState] = useState(initialSectionState)
  const [activityState, setActivityState] = useState(initialSectionState)
  const [teachersState, setTeachersState] = useState(initialSectionState)
  const [invitesState, setInvitesState] = useState(initialSectionState)
  const [resendingInviteId, setResendingInviteId] = useState('')
  const [syncedAt, setSyncedAt] = useState(null)

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
      const [statsResult, activityResult, teachersResult, invitesResult] = await Promise.allSettled([
        getInstituteDashboardStats(),
        getInstituteActivity({ limit: 8 }),
        getInstituteTeachers({ limit: 5 }),
        getInstituteInvites(),
      ])

      if (!active) {
        return
      }

      if (statsResult.status === 'fulfilled' && statsResult.value?.data?.success !== false) {
        setStatsState({
          loading: false,
          error: '',
          data: normalizeStats(statsResult.value.data?.data),
        })
      } else {
        setStatsState({
          loading: false,
          error: statsResult.status === 'rejected'
            ? statsResult.reason?.response?.data?.message || statsResult.reason?.message || 'Failed to load dashboard stats.'
            : 'Failed to load dashboard stats.',
          data: null,
        })
      }

      if (activityResult.status === 'fulfilled' && activityResult.value?.data?.success !== false) {
        const activityItems = Array.isArray(activityResult.value.data?.data)
          ? activityResult.value.data.data.map(normalizeActivity)
          : []

        setActivityState({
          loading: false,
          error: '',
          data: activityItems,
        })
      } else {
        setActivityState({
          loading: false,
          error: activityResult.status === 'rejected'
            ? activityResult.reason?.response?.data?.message || activityResult.reason?.message || 'Failed to load activity.'
            : 'Failed to load activity.',
          data: [],
        })
      }

      if (teachersResult.status === 'fulfilled' && teachersResult.value?.data?.success !== false) {
        const teacherRows = Array.isArray(teachersResult.value.data?.data)
          ? teachersResult.value.data.data.map(normalizeTeacher)
          : []

        setTeachersState({
          loading: false,
          error: '',
          data: teacherRows,
        })
      } else {
        setTeachersState({
          loading: false,
          error: teachersResult.status === 'rejected'
            ? teachersResult.reason?.response?.data?.message || teachersResult.reason?.message || 'Failed to load teachers.'
            : 'Failed to load teachers.',
          data: [],
        })
      }

      if (invitesResult.status === 'fulfilled' && invitesResult.value?.data?.success !== false) {
        const inviteRows = Array.isArray(invitesResult.value.data?.data)
          ? invitesResult.value.data.data.map(normalizeInvite)
          : []

        setInvitesState({
          loading: false,
          error: '',
          data: inviteRows,
        })
      } else {
        setInvitesState({
          loading: false,
          error: invitesResult.status === 'rejected'
            ? invitesResult.reason?.response?.data?.message || invitesResult.reason?.message || 'Failed to load invites.'
            : 'Failed to load invites.',
          data: [],
        })
      }

      setSyncedAt(new Date().toISOString())
    }

    loadDashboard()

    return () => {
      active = false
    }
  }, [])

  const handleResendInvite = async (invite) => {
    if (!invite?.id || invite.status !== 'pending') {
      return
    }

    setResendingInviteId(invite.id)

    try {
      await resendInstituteInvite(invite.id)

      setInvitesState((current) => ({
        ...current,
        data: current.data.map((row) => (
          row.id === invite.id
            ? {
                ...row,
                resendCount: row.resendCount + 1,
                lastSentAt: new Date().toISOString(),
              }
            : row
        )),
      }))
    } catch {
      setInvitesState((current) => ({
        ...current,
        error: 'Invite resend failed. Please try again.',
      }))
    } finally {
      setResendingInviteId('')
    }
  }

  const stats = statsState.data || {
    totalTeachers: 0,
    totalQuestions: 0,
    totalPapersGenerated: 0,
    pendingInvites: 0,
  }

  return (
    <InstituteLayout
      activeKey="dashboard"
      title="Dashboard overview"
      description="Track teacher growth, question volume, generated papers, and invitation health from one calm, focused workspace."
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCardMeta.map((card) => (
            <MetricCard
              key={card.key}
              label={card.label}
              note={card.note}
              icon={card.icon}
              tone={card.tone}
              loading={statsState.loading}
              error={statsState.error}
              value={formatNumber(stats[card.key])}
            />
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.35fr,0.95fr]">
          <div className="space-y-6">
            <SectionCard>
              <SectionHeader
                eyebrow="Activity feed"
                title="Recent activity"
                description="Latest actions from teachers and the institute timeline."
              />

              <div className="mt-6">
                <ActivityList
                  items={activityState.data || []}
                  loading={activityState.loading}
                  error={activityState.error}
                  emptyTitle="No activity yet"
                  emptyDescription="Teacher actions, paper generation, and invite updates will appear here."
                />
              </div>
            </SectionCard>

            <SectionCard>
              <SectionHeader
                eyebrow="Teacher snapshot"
                title="Top teachers"
                description="A quick view of the most active teachers in the institute."
              />

              <div className="mt-6">
                <TeacherSnapshotTable
                  teachers={teachersState.data || []}
                  loading={teachersState.loading}
                  error={teachersState.error}
                />
              </div>
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard>
              <SectionHeader
                eyebrow="Quick actions"
                title="Shortcuts"
                description="Jump to the most common institute admin destinations."
              />

              <div className="mt-6 space-y-3">
                {quickActions.map((action) => (
                  <QuickActionCard key={action.href} {...action} />
                ))}
              </div>
            </SectionCard>

            <SectionCard>
              <SectionHeader
                eyebrow="Pending invites"
                title="Invite queue"
                description="Keep an eye on pending teacher invites and resend when needed."
              />

              <div className="mt-6">
                <InviteTable
                  invites={invitesState.data || []}
                  loading={invitesState.loading}
                  error={invitesState.error}
                  onResend={handleResendInvite}
                  resendingId={resendingInviteId}
                />
              </div>
            </SectionCard>

            <SectionCard>
              <SectionHeader
                eyebrow="Snapshot"
                title="At a glance"
                description="Last synced values for the institute dashboard."
              />

              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl border border-border bg-background px-4 py-3">
                  <p className="text-[12px] font-bold uppercase tracking-widest text-neutral">Last sync</p>
                  <p className="mt-1 text-[14px] font-semibold text-text-secondary">
                    {syncedAt ? formatLongDateTime(syncedAt) : 'Loading...'}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-background px-4 py-3">
                  <p className="text-[12px] font-bold uppercase tracking-widest text-neutral">Teachers loaded</p>
                  <p className="mt-1 text-[14px] font-semibold text-text-secondary">
                    {teachersState.loading ? 'Loading...' : `${formatNumber((teachersState.data || []).length)} shown`}
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        </section>
      </div>
    </InstituteLayout>
  )
}

export default InstituteDashboard
