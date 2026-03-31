import { useEffect, useState } from 'react'
import { getQuestions } from '../api/questions'
import {
  DashboardStatCard,
  RecentPaperRow,
  ActionCard,
  RecentActivityItem,
} from '../components/TeacherDashboardUi'

const metricCards = [
  {
    key: 'totalQuestions',
    title: 'Total Questions',
    fallbackValue: '12,450',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
         <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    trend: '12%',
    iconBg: 'bg-blue-50 text-blue-600',
    accentColor: 'bg-blue-500',
  },
  {
    key: 'activeSubjects',
    title: 'Active Subjects',
    fallbackValue: '18',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253" />
      </svg>
    ),
    trend: '2%',
    iconBg: 'bg-purple-50 text-purple-600',
    accentColor: 'bg-purple-500',
  },
  {
    key: 'papersGenerated',
    title: 'Papers Generated',
    fallbackValue: '452',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    trend: '15%',
    iconBg: 'bg-orange-50 text-orange-600',
    accentColor: 'bg-orange-500',
  },
  {
    key: 'bankSize',
    title: 'Bank Size',
    fallbackValue: '1.2 GB',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    trend: '5%',
    iconBg: 'bg-rose-50 text-rose-600',
    accentColor: 'bg-rose-500',
  },
]

const recentPapers = [
  { name: 'Final Term Physics', createdAt: 'Created 2h ago', subject: 'Science', status: 'Published' },
  { name: 'Mid-term Math Advanced', createdAt: 'Created 5h ago', subject: 'Mathematics', status: 'Draft' },
  { name: 'Unit Test - Biology', createdAt: 'Created Yesterday', subject: 'Biology', status: 'Published' },
]



function TeacherDashboardPage() {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    activeSubjects: 0,
    papersGenerated: recentPapers.length,
    bankSize: '0 MB',
  })
  const [recentQuestions, setRecentQuestions] = useState([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getQuestions()
        const questions = Array.isArray(response.data?.data) ? response.data.data : []
        
        // Stats calculations
        const subjects = new Set(
          questions
            .map((question) => String(question.subject || '').trim())
            .filter(Boolean),
        )

        const totalSizeMB = (questions.length * 0.8).toFixed(1)
        const bankSizeDisplay = totalSizeMB > 1024 
          ? (totalSizeMB / 1024).toFixed(1) + ' GB' 
          : totalSizeMB + ' MB'

        setStats({
          totalQuestions: questions.length,
          activeSubjects: subjects.size,
          papersGenerated: 42 + recentPapers.length,
          bankSize: bankSizeDisplay,
        })

        // Get last 3 questions for 'Recently Added'
        setRecentQuestions(questions.slice(0, 3))
      } catch {
        // Fallback
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-10 pb-10">
      {/* Stats Grid */}
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

      {/* Main Content Split */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column (70%) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Recent Papers</h2>
            <a href="/teacher/history" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">View All</a>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft">
            {/* Table Header */}
            <div className="grid grid-cols-[1.5fr,1fr,1fr,100px] gap-4 bg-slate-50/50 px-8 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
              <span>Paper Name</span>
              <span>Subject</span>
              <span>Status</span>
              <span className="text-right pr-4">Actions</span>
            </div>

            <div className="divide-y divide-slate-50 px-4">
              {recentPapers.map((paper) => (
                <RecentPaperRow
                  key={paper.name}
                  name={paper.name}
                  timestamp={paper.createdAt}
                  subject={paper.subject}
                  status={paper.status}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (30%) */}
        <div className="lg:col-span-4 space-y-10">
          {/* Quick Actions */}
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

          {/* Recently Added */}
          {recentQuestions.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Recently Added</h2>
              <div className="space-y-6">
                {recentQuestions.map((q) => (
                  <RecentActivityItem 
                    key={q._id || q.id}
                    icon={<span className="text-lg">📚</span>}
                    title={`Question added to ${q.subject}`}
                    meta={`${q.type || 'MCQ'} • ${q.class || 'Class 10'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default TeacherDashboardPage
