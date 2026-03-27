import { useEffect, useState } from 'react'
import { getQuestions } from '../api/questions'
import FormField, { baseInputClassName } from '../components/FormField'
import QuestionCard from '../components/QuestionCard'
import SectionCard from '../components/SectionCard'
import StatusBanner from '../components/StatusBanner'

const initialFilters = {
  subject: '',
  chapter: '',
  questionType: '',
  difficulty: '',
  grade: '',
}

function TeacherQuestionsPage() {
  const [filters, setFilters] = useState(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState(initialFilters)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true)

      try {
        const queryParams = Object.entries(appliedFilters).reduce((acc, [key, value]) => {
          if (value !== '') {
            acc[key] = value
          }
          return acc
        }, {})

        const response = await getQuestions(queryParams)
        const fetchedQuestions = response.data?.data ?? []

        setQuestions(fetchedQuestions)
        setStatus({
          type: 'success',
          message: `Loaded ${fetchedQuestions.length} question(s).`,
        })
      } catch (error) {
        setQuestions([])
        setStatus({
          type: 'error',
          message: error.response?.data?.message ?? 'Failed to fetch questions.',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [appliedFilters])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  const applyFilters = (event) => {
    event.preventDefault()
    setAppliedFilters({ ...filters })
  }

  const clearFilters = () => {
    setFilters(initialFilters)
    setAppliedFilters(initialFilters)
  }

  const refreshQuestions = () => {
    setAppliedFilters((current) => ({ ...current }))
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[360px,1fr]">
      <SectionCard>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Teacher View</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Question Bank Filters</h1>

        <form className="mt-8 space-y-4" onSubmit={applyFilters}>
          <FormField label="Subject">
            <input
              className={baseInputClassName}
              name="subject"
              value={filters.subject}
              onChange={handleFilterChange}
              placeholder="e.g. Math"
            />
          </FormField>

          <FormField label="Chapter">
            <input
              className={baseInputClassName}
              name="chapter"
              value={filters.chapter}
              onChange={handleFilterChange}
              placeholder="e.g. Algebra"
            />
          </FormField>

          <FormField label="Question Type">
            <select
              className={baseInputClassName}
              name="questionType"
              value={filters.questionType}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="MCQ">MCQ</option>
              <option value="short">short</option>
              <option value="long">long</option>
              <option value="numerical">numerical</option>
            </select>
          </FormField>

          <FormField label="Difficulty">
            <select
              className={baseInputClassName}
              name="difficulty"
              value={filters.difficulty}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </FormField>

          <FormField label="Grade">
            <input
              className={baseInputClassName}
              type="number"
              min="1"
              name="grade"
              value={filters.grade}
              onChange={handleFilterChange}
              placeholder="e.g. 8"
            />
          </FormField>

          <div className="flex gap-3 pt-2">
            <button
              className="flex-1 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              type="submit"
            >
              Apply Filters
            </button>
            <button
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              type="button"
              onClick={clearFilters}
            >
              Clear
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Fetched Questions</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">MongoDB Records</h2>
          </div>
          <button
            className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
            type="button"
            onClick={refreshQuestions}
          >
            Refresh
          </button>
        </div>

        <StatusBanner status={status} />

        <div className="mt-6 space-y-4">
          {loading ? <p className="text-sm text-slate-500">Loading questions...</p> : null}

          {!loading && questions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-12 text-center text-slate-500">
              No questions found for selected filters.
            </div>
          ) : null}

          {questions.map((question) => (
            <QuestionCard key={question._id} question={question} />
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

export default TeacherQuestionsPage
