import { useEffect, useState } from 'react'
import { getQuestions } from '../../api/questions'
import SectionCard from '../../components/SectionCard'
import { formatLongDateTime, formatRelativeTime } from '../../utils/instituteFormatters'

function TeacherHistoryPage() {
  const [historyRows, setHistoryRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadHistory = async () => {
      try {
        const response = await getQuestions({ limit: 12 })
        const questions = Array.isArray(response.data?.data) ? response.data.data : []

        if (!active) {
          return
        }

        setHistoryRows(questions.map((question) => ({
          id: question._id,
          event: question.questionText || 'Untitled question',
          when: formatLongDateTime(question.createdAt),
          relativeTime: formatRelativeTime(question.createdAt),
          status: question.updatedAt && question.createdAt && question.updatedAt !== question.createdAt
            ? 'Updated'
            : 'Added',
          subject: question.subject || 'Unassigned',
          grade: question.grade || 'N/A',
        })))
      } catch {
        if (!active) {
          return
        }

        setHistoryRows([])
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadHistory()

    return () => {
      active = false
    }
  }, [])

  return (
    <SectionCard>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">History</p>
      <h1 className="mt-2 text-3xl font-black text-slate-900">Recent Activity</h1>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <div className="px-4 py-8 text-sm text-slate-500">Loading question history...</div>
        ) : null}

        {!loading && historyRows.length === 0 ? (
          <div className="px-4 py-8 text-sm text-slate-500">No saved questions found yet.</div>
        ) : null}

        {historyRows.map((row) => (
          <article
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-slate-900">{row.event}</p>
              <p className="text-sm text-slate-500">
                {row.when} | {row.relativeTime} | {row.subject} | Grade {row.grade}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                row.status === 'Added'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {row.status}
            </span>
          </article>
        ))}
      </div>
    </SectionCard>
  )
}

export default TeacherHistoryPage
