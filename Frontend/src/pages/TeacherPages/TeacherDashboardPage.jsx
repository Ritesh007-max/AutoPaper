import { useEffect, useState } from 'react'
import { getQuestions } from '../../api/questions'
import {
  ActionCard,
  DashboardStatCard,
  RecentActivityItem,
} from '../../components/TeacherDashboardUi'
import { formatRelativeTime } from '../../utils/instituteFormatters'

const metricCards = [
  {
    key: 'totalQuestions',
    title: 'Total Questions',
    fallbackValue: '0',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    trend: 'Live',
    iconBg: 'bg-blue-50 text-blue-600',
    accentColor: 'bg-blue-500',
  },
  {
    key: 'activeSubjects',
    title: 'Active Subjects',
    fallbackValue: '0',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253" />
      </svg>
    ),
    trend: 'Live',
    iconBg: 'bg-purple-50 text-purple-600',
    accentColor: 'bg-purple-500',
  },
  {
    key: 'recentAdditions',
    title: 'Recent Additions',
    fallbackValue: '0',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    trend: '7d',
    iconBg: 'bg-orange-50 text-orange-600',
    accentColor: 'bg-orange-500',
  },
  {
    key: 'bankSize',
    title: 'Bank Size',
    fallbackValue: '0 MB',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    trend: 'Est.',
    iconBg: 'bg-rose-50 text-rose-600',
    accentColor: 'bg-rose-500',
  },
]

const estimateBankSize = (questions) => {
  const megabytes = questions.length * 0.8

  if (megabytes >= 1024) {
    return `${(megabytes / 1024).toFixed(1)} GB`
  }

  return `${megabytes.toFixed(1)} MB`
}

const isRecentQuestion = (question, days = 7) => {
  if (!question?.createdAt) {
    return false
  }

  const createdAt = new Date(question.createdAt)
  if (Number.isNaN(createdAt.getTime())) {
    return false
  }

  return Date.now() - createdAt.getTime() <= days * 24 * 60 * 60 * 1000
}

function TeacherDashboardPage() {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    activeSubjects: 0,
    recentAdditions: 0,
    bankSize: '0 MB',
  })
  const [recentQuestions, setRecentQuestions] = useState([])

  useEffect(() => {
    let active = true

    const fetchStats = async () => {
      try {
        const response = await getQuestions({ limit: 25 })
        const questions = Array.isArray(response.data?.data) ? response.data.data : []

        if (!active) {
          return
        }

        const subjects = new Set(
          questions
            .map((question) => String(question.subject || '').trim())
            .filter(Boolean),
        )

        setStats({
          totalQuestions: questions.length,
          activeSubjects: subjects.size,
          recentAdditions: questions.filter(isRecentQuestion).length,
          bankSize: estimateBankSize(questions),
        })

        setRecentQuestions(questions.slice(0, 3))
      } catch {
        if (!active) {
          return
        }

        setStats({
          totalQuestions: 0,
          activeSubjects: 0,
          recentAdditions: 0,
          bankSize: '0 MB',
        })
        setRecentQuestions([])
      }
    }

    fetchStats()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-10 pb-10">
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => {
          const value = stats[card.key] !== undefined ? String(stats[card.key]) : card.fallbackValue

          return (
            <DashboardStatCard
              key={card.key}
              title={card.title}
              value={value}
              icon={card.icon}
              trend={card.trend}
              iconBg={card.iconBg}
              accentColor={card.accentColor}
            />
          )
        })}
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Recent Questions</h2>
            <a href="/teacher/history" className="text-sm font-bold text-blue-600 transition-colors hover:text-blue-700">
              View All
            </a>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft">
            <div className="grid grid-cols-[1.5fr,1fr,1fr,100px] gap-4 bg-slate-50/50 px-8 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
              <span>Question</span>
              <span>Subject</span>
              <span>Type</span>
              <span className="pr-4 text-right">Age</span>
            </div>

            <div className="divide-y divide-slate-50 px-4">
              {recentQuestions.length > 0 ? (
                recentQuestions.map((question) => (
                  <div
                    key={question._id}
                    className="grid grid-cols-[1.5fr,1fr,1fr,100px] items-center gap-4 border-b border-slate-50 py-5 last:border-0 hover:bg-slate-50/50 px-4 transition-all"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-bold text-slate-900">
                        {question.questionText || 'Untitled question'}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-400">
                        Grade {question.grade || 'N/A'}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-slate-600">{question.subject || 'Unassigned'}</div>
                    <div className="text-sm font-semibold text-slate-600">{question.questionType || 'Unknown'}</div>
                    <div className="text-right text-xs font-semibold text-slate-500">
                      {formatRelativeTime(question.createdAt)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-8 py-10 text-sm text-slate-500">No questions have been loaded yet.</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-10 lg:col-span-4">
          <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Quick Actions</h2>
            <div className="grid gap-4">
              <ActionCard
                label="Generate Paper"
                href="#"
                iconBg="bg-blue-50 text-blue-600"
                icon={(
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              />
              <ActionCard
                label="Bulk Upload (.pdf)"
                href="/teacher/bulk-upload"
                iconBg="bg-purple-50 text-purple-600"
                icon={(
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                )}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Recently Added</h2>
            <div className="space-y-6">
              {recentQuestions.length > 0 ? (
                recentQuestions.map((question) => (
                  <RecentActivityItem
                    key={question._id}
                    icon={(
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.25">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    title={question.questionText || 'Untitled question'}
                    meta={`${question.subject || 'Unassigned'} | ${question.questionType || 'Unknown'} | ${formatRelativeTime(question.createdAt)}`}
                  />
                ))
              ) : (
                <p className="text-sm text-slate-500">No recent questions to display.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TeacherDashboardPage
