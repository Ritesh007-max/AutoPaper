import { useEffect, useState } from 'react'
import { getQuestionFilters, getQuestions } from '../api/questions'
import FormField from '../components/FormField'
import QuestionCard from '../components/QuestionCard'
import SectionCard from '../components/SectionCard'
import StatusBanner from '../components/StatusBanner'
import { baseInputClassName } from '../components/formStyles'
import { difficultyOptions, questionTypeOptions } from '../constants/questionForm'

const initialFilters = {
  subject: '',
  chapter: '',
  questionType: '',
  difficulty: '',
  grade: '',
}

const initialFilterOptions = {
  subjects: [],
  chapters: [],
  grades: [],
  questionTypes: questionTypeOptions,
  difficulties: difficultyOptions,
}

const uniqueStringValues = (values = []) =>
  Array.from(
    new Set(
      values
        .map((value) => String(value).trim())
        .filter(Boolean),
    ),
  )

function TeacherQuestionsPage() {
  const [filters, setFilters] = useState(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState(initialFilters)
  const [filterOptions, setFilterOptions] = useState(initialFilterOptions)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingFilterOptions, setLoadingFilterOptions] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  useEffect(() => {
    const fetchFilterOptions = async () => {
      setLoadingFilterOptions(true)

      try {
        const response = await getQuestionFilters()
        const options = response.data?.data ?? {}

        if (!response.data || typeof response.data !== 'object') {
          throw new Error('Unexpected filters response from server.')
        }

        setFilterOptions({
          subjects: uniqueStringValues(options.subjects).sort((left, right) => left.localeCompare(right)),
          chapters: uniqueStringValues(options.chapters).sort((left, right) => left.localeCompare(right)),
          grades: Array.from(
            new Set(
              (Array.isArray(options.grades) ? options.grades : [])
                .map((grade) => Number(grade))
                .filter((grade) => !Number.isNaN(grade)),
            ),
          ).sort((left, right) => left - right),
          questionTypes: uniqueStringValues([
            ...questionTypeOptions,
            ...(Array.isArray(options.questionTypes) ? options.questionTypes : []),
          ]),
          difficulties: uniqueStringValues([
            ...difficultyOptions,
            ...(Array.isArray(options.difficulties) ? options.difficulties : []),
          ]),
        })
      } catch {
        setFilterOptions(initialFilterOptions)
      } finally {
        setLoadingFilterOptions(false)
      }
    }

    fetchFilterOptions()
  }, [])

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
        const payload = response.data

        if (!payload || typeof payload !== 'object' || !Array.isArray(payload.data)) {
          throw new Error('Unexpected questions response. Check backend route or proxy configuration.')
        }

        const fetchedQuestions = payload.data

        setQuestions(fetchedQuestions)
        setStatus({
          type: 'success',
          message: `Loaded ${fetchedQuestions.length} question(s).`,
        })
      } catch (error) {
        setQuestions([])
        setStatus({
          type: 'error',
          message: error.response?.data?.message ?? error.message ?? 'Failed to fetch questions.',
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
    <div className="grid gap-5 xl:grid-cols-[330px,1fr]">
      <SectionCard>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Question Bank</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Filter Questions</h1>

        <form className="mt-5 space-y-3.5" onSubmit={applyFilters}>
          <FormField label="Subject">
            <select
              className={baseInputClassName}
              name="subject"
              value={filters.subject}
              onChange={handleFilterChange}
              disabled={loadingFilterOptions}
            >
              <option value="">All subjects</option>
              {filterOptions.subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Chapter">
            <select
              className={baseInputClassName}
              name="chapter"
              value={filters.chapter}
              onChange={handleFilterChange}
              disabled={loadingFilterOptions}
            >
              <option value="">All chapters</option>
              {filterOptions.chapters.map((chapter) => (
                <option key={chapter} value={chapter}>
                  {chapter}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Question Type">
            <select
              className={baseInputClassName}
              name="questionType"
              value={filters.questionType}
              onChange={handleFilterChange}
              disabled={loadingFilterOptions}
            >
              <option value="">All types</option>
              {filterOptions.questionTypes.map((questionType) => (
                <option key={questionType} value={questionType}>
                  {questionType}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Difficulty">
            <select
              className={baseInputClassName}
              name="difficulty"
              value={filters.difficulty}
              onChange={handleFilterChange}
              disabled={loadingFilterOptions}
            >
              <option value="">All difficulties</option>
              {filterOptions.difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Grade">
            <select
              className={baseInputClassName}
              name="grade"
              value={filters.grade}
              onChange={handleFilterChange}
              disabled={loadingFilterOptions}
            >
              <option value="">All grades</option>
              {filterOptions.grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </FormField>

          <div className="flex gap-3 pt-2">
            <button
              className="flex-1 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              type="submit"
            >
              Apply Filters
            </button>
            <button
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              type="button"
              onClick={clearFilters}
            >
              Clear
            </button>
          </div>

          {loadingFilterOptions ? (
            <p className="text-xs text-slate-500">Loading filter values...</p>
          ) : null}
        </form>
      </SectionCard>

      <SectionCard>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Fetched Questions</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Question List</h2>
          </div>
          <button
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
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
            <div className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center text-slate-500">
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
