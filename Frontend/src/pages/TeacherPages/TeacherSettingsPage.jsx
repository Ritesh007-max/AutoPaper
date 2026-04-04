import { useEffect, useState } from 'react'
import { getQuestionFilters, getQuestions } from '../../api/questions'
import SectionCard from '../../components/SectionCard'
import { formatLongDateTime, formatRelativeTime } from '../../utils/instituteFormatters'

const initialSummary = {
  loading: true,
  error: '',
  totalQuestions: 0,
  topSubject: 'Not available',
  topGrade: 'Not available',
  difficultySpread: 'Not available',
  latestUpdate: 'Not available',
  availableSubjects: 0,
  availableChapters: 0,
}

const countOccurrences = (items = []) => {
  const counts = new Map()

  for (const item of items) {
    const key = String(item || '').trim()

    if (!key) {
      continue
    }

    counts.set(key, (counts.get(key) || 0) + 1)
  }

  return counts
}

const pickMostCommon = (items = []) => {
  const counts = countOccurrences(items)

  if (counts.size === 0) {
    return 'Not available'
  }

  return Array.from(counts.entries()).sort((left, right) => {
    if (right[1] !== left[1]) {
      return right[1] - left[1]
    }

    return left[0].localeCompare(right[0])
  })[0][0]
}

function TeacherSettingsPage() {
  const [summary, setSummary] = useState(initialSummary)

  useEffect(() => {
    let active = true

    const loadSummary = async () => {
      try {
        const [questionsResponse, filtersResponse] = await Promise.all([
          getQuestions({ limit: 250 }),
          getQuestionFilters(),
        ])

        const questions = Array.isArray(questionsResponse.data?.data) ? questionsResponse.data.data : []
        const filters = filtersResponse.data?.data || {}

        if (!active) {
          return
        }

        const subjects = questions.map((question) => question.subject)
        const grades = questions.map((question) => question.grade)
        const difficulties = questions.map((question) => question.difficulty)
        const latestQuestion = questions.find((question) => question.createdAt || question.updatedAt)

        setSummary({
          loading: false,
          error: '',
          totalQuestions: questions.length,
          topSubject: pickMostCommon(subjects),
          topGrade: pickMostCommon(grades),
          difficultySpread: countOccurrences(difficulties).size > 0
            ? Array.from(countOccurrences(difficulties).entries())
                .map(([label, count]) => `${label} (${count})`)
                .join(', ')
            : 'Not available',
          latestUpdate: latestQuestion?.updatedAt || latestQuestion?.createdAt
            ? `${formatLongDateTime(latestQuestion.updatedAt || latestQuestion.createdAt)} | ${formatRelativeTime(latestQuestion.updatedAt || latestQuestion.createdAt)}`
            : 'Not available',
          availableSubjects: Array.isArray(filters.subjects) ? filters.subjects.length : 0,
          availableChapters: Array.isArray(filters.chapters) ? filters.chapters.length : 0,
        })
      } catch (error) {
        if (!active) {
          return
        }

        setSummary((current) => ({
          ...current,
          loading: false,
          error: error.response?.data?.message || error.message || 'Failed to load teacher workspace summary.',
        }))
      }
    }

    loadSummary()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr,1fr]">
      <SectionCard>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Teacher Settings</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Workspace snapshot</h1>
        <p className="mt-2 text-sm text-slate-600">
          This view is now driven by live question data so we can see the current bank shape without fake placeholders.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Questions stored</p>
            <p className="mt-1 text-2xl font-black text-slate-900">
              {summary.loading ? '...' : summary.totalQuestions}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Top subject</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{summary.loading ? '...' : summary.topSubject}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Top grade</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{summary.loading ? '...' : summary.topGrade}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Latest update</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {summary.loading ? '...' : summary.latestUpdate}
            </p>
          </div>
        </div>

        {summary.error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {summary.error}
          </div>
        ) : null}
      </SectionCard>

      <SectionCard>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Live metadata</p>
        <h2 className="mt-2 text-xl font-black text-slate-900">Current bank coverage</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            Available subjects: {summary.loading ? '...' : summary.availableSubjects}
          </li>
          <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            Available chapters: {summary.loading ? '...' : summary.availableChapters}
          </li>
          <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            Difficulty spread: {summary.loading ? '...' : summary.difficultySpread}
          </li>
          <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            Recent activity: {summary.loading ? '...' : summary.latestUpdate}
          </li>
        </ul>
      </SectionCard>
    </div>
  )
}

export default TeacherSettingsPage
