import { useEffect, useState } from 'react'
import { deleteQuestion, getQuestionFilters, getQuestions } from '../../api/questions'
import FormField from '../../components/FormField'
import QuestionCard from '../../components/QuestionCard'
import SectionCard from '../../components/SectionCard'
import StatusBanner from '../../components/StatusBanner'
import { baseInputClassName } from '../../components/formStyles'
import { difficultyOptions, questionTypeOptions } from '../../constants/questionForm'

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

function DeleteQuestionsPage() {
  const [filters, setFilters] = useState(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState(initialFilters)
  const [filterOptions, setFilterOptions] = useState(initialFilterOptions)
  const [questions, setQuestions] = useState([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [loadingFilterOptions, setLoadingFilterOptions] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [status, setStatus] = useState({ type: '', message: '' })

  useEffect(() => {
    const fetchFilterOptions = async () => {
      setLoadingFilterOptions(true)

      try {
        const response = await getQuestionFilters()
        const options = response.data?.data ?? {}

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
      setLoadingQuestions(true)

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

        setQuestions(payload.data)
        setStatus({
          type: 'success',
          message: `Loaded ${payload.data.length} question(s) for delete.`,
        })
      } catch (error) {
        setQuestions([])
        setStatus({
          type: 'error',
          message: error.response?.data?.message ?? error.message ?? 'Failed to fetch questions.',
        })
      } finally {
        setLoadingQuestions(false)
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

  const handleDelete = async (questionId) => {
    const confirmation = window.confirm('Delete this question permanently?')

    if (!confirmation) {
      return
    }

    setDeletingId(questionId)

    try {
      await deleteQuestion(questionId)
      setQuestions((currentQuestions) => currentQuestions.filter((question) => question._id !== questionId))
      setStatus({ type: 'success', message: 'Question deleted successfully.' })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message ?? error.message ?? 'Failed to delete question.',
      })
    } finally {
      setDeletingId('')
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[330px,1fr]">
      <SectionCard>
        <p className="text-[12px] font-semibold uppercase tracking-widest text-neutral">Delete Route</p>
        <h1 className="mt-2 text-[24px] font-bold tracking-tight text-text-primary">Delete Questions</h1>

        <StatusBanner status={status} />

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
              className="flex-1 rounded-xl bg-blue-600 px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-blue-700"
              type="submit"
            >
              Apply Filters
            </button>
            <button
              className="rounded-xl border border-border px-5 py-2.5 text-[14px] font-semibold text-text-secondary transition hover:border-slate-400 hover:bg-background"
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
            <p className="text-[12px] font-semibold uppercase tracking-widest text-neutral">Question List</p>
            <h2 className="mt-2 text-[24px] font-bold text-text-primary">Delete Questions From Database</h2>
          </div>
          <button
            className="rounded-xl border border-border px-4 py-2.5 text-[14px] font-semibold text-text-secondary transition hover:border-slate-400 hover:bg-background"
            type="button"
            onClick={refreshQuestions}
            disabled={Boolean(deletingId)}
          >
            Refresh
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {loadingQuestions ? <p className="text-[14px] text-neutral">Loading questions...</p> : null}

          {deletingId ? (
            <p className="text-[14px] text-rose-600">Deleting selected question...</p>
          ) : null}

          {!loadingQuestions && questions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-neutral">
              No questions found for selected filters.
            </div>
          ) : null}

          {questions.map((question) => (
            <QuestionCard
              key={question._id}
              question={question}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

export default DeleteQuestionsPage


