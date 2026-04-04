import { useEffect, useState } from 'react'
import { getQuestionFilters, getQuestions, patchQuestion } from '../../api/questions'
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

const emptyEditForm = {
  questionText: '',
  questionType: '',
  optionsText: '',
  answer: '',
  subject: '',
  chapter: '',
  grade: '',
  difficulty: 'easy',
  marks: '',
}

const uniqueStringValues = (values = []) =>
  Array.from(
    new Set(
      values
        .map((value) => String(value).trim())
        .filter(Boolean),
    ),
  )

const prepareEditFormFromQuestion = (question) => ({
  questionText: question.questionText ?? '',
  questionType: question.questionType ?? '',
  optionsText: Array.isArray(question.options) ? question.options.join('\n') : '',
  answer: question.answer ?? '',
  subject: question.subject ?? '',
  chapter: question.chapter ?? '',
  grade: question.grade != null ? String(question.grade) : '',
  difficulty: question.difficulty ?? 'easy',
  marks: question.marks != null ? String(question.marks) : '',
})

const buildPayload = (form) => {
  const options = form.questionType === 'MCQ'
    ? form.optionsText
      .split('\n')
      .map((option) => option.trim())
      .filter(Boolean)
    : []

  return {
    questionText: form.questionText.trim(),
    questionType: form.questionType,
    options,
    answer: form.answer.trim(),
    subject: form.subject.trim(),
    chapter: form.chapter.trim(),
    grade: Number(form.grade),
    difficulty: form.difficulty,
    marks: Number(form.marks),
  }
}

const validatePayload = (payload) => {
  if (!payload.questionText) {
    return 'Question text is required.'
  }

  if (!questionTypeOptions.includes(payload.questionType)) {
    return 'Please select a valid question type.'
  }

  if (!difficultyOptions.includes(payload.difficulty)) {
    return 'Please select a valid difficulty.'
  }

  if (!payload.subject) {
    return 'Subject is required.'
  }

  if (!payload.answer) {
    return 'Answer is required.'
  }

  if (!Number.isInteger(payload.grade) || payload.grade < 1) {
    return 'Grade must be a whole number greater than or equal to 1.'
  }

  if (!Number.isInteger(payload.marks) || payload.marks < 1) {
    return 'Marks must be a whole number greater than or equal to 1.'
  }

  if (payload.questionType === 'MCQ') {
    if (payload.options.length < 2) {
      return 'MCQ requires at least two options.'
    }

    const hasAnswerInOptions = payload.options.some(
      (option) => option.toLowerCase() === payload.answer.toLowerCase(),
    )

    if (!hasAnswerInOptions) {
      return 'For MCQ, answer must match one of the options.'
    }
  }

  return ''
}

function UpdateQuestionsPage() {
  const [filters, setFilters] = useState(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState(initialFilters)
  const [filterOptions, setFilterOptions] = useState(initialFilterOptions)
  const [questions, setQuestions] = useState([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [loadingFilterOptions, setLoadingFilterOptions] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState('')
  const [editForm, setEditForm] = useState(emptyEditForm)
  const [saving, setSaving] = useState(false)
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
          message: `Loaded ${payload.data.length} question(s) for update.`,
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
    setEditingQuestionId('')
    setEditForm(emptyEditForm)
  }

  const clearFilters = () => {
    setFilters(initialFilters)
    setAppliedFilters(initialFilters)
    setEditingQuestionId('')
    setEditForm(emptyEditForm)
  }

  const refreshQuestions = () => {
    setAppliedFilters((current) => ({ ...current }))
  }

  const startEditing = (question) => {
    setEditingQuestionId(question._id)
    setEditForm(prepareEditFormFromQuestion(question))
    setStatus({
      type: 'success',
      message: 'Question loaded in update form.',
    })
  }

  const cancelEdit = () => {
    setEditingQuestionId('')
    setEditForm(emptyEditForm)
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditForm((current) => ({ ...current, [name]: value }))
  }

  const saveEditedQuestion = async (event) => {
    event.preventDefault()

    if (!editingQuestionId) {
      setStatus({ type: 'error', message: 'Select a question to update first.' })
      return
    }

    const payload = buildPayload(editForm)
    const validationError = validatePayload(payload)

    if (validationError) {
      setStatus({ type: 'error', message: validationError })
      return
    }

    setSaving(true)

    try {
      const response = await patchQuestion(editingQuestionId, payload)
      const updatedQuestion = response.data?.data

      if (!updatedQuestion || !updatedQuestion._id) {
        throw new Error('Unexpected update response from server.')
      }

      setQuestions((currentQuestions) =>
        currentQuestions.map((question) =>
          question._id === updatedQuestion._id ? updatedQuestion : question,
        ),
      )
      setStatus({ type: 'success', message: 'Question updated successfully.' })
      setEditingQuestionId('')
      setEditForm(emptyEditForm)
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message ?? error.message ?? 'Failed to update question.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr,1.15fr]">
      <SectionCard>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Update Route</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Update Questions</h1>

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

          <div className="grid gap-4 sm:grid-cols-2">
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
          </div>

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
        </form>

        {editingQuestionId ? (
          <form className="mt-6 space-y-3.5 border-t border-slate-200 pt-5" onSubmit={saveEditedQuestion}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Edit Form</p>

            <FormField label="Question text">
              <textarea
                className={`${baseInputClassName} min-h-24`}
                name="questionText"
                value={editForm.questionText}
                onChange={handleEditChange}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Type">
                <select
                  className={baseInputClassName}
                  name="questionType"
                  value={editForm.questionType}
                  onChange={handleEditChange}
                >
                  <option value="" disabled>
                    Select type
                  </option>
                  {questionTypeOptions.map((questionType) => (
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
                  value={editForm.difficulty}
                  onChange={handleEditChange}
                >
                  {difficultyOptions.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Subject">
                <input
                  className={baseInputClassName}
                  name="subject"
                  value={editForm.subject}
                  onChange={handleEditChange}
                />
              </FormField>

              <FormField label="Chapter">
                <input
                  className={baseInputClassName}
                  name="chapter"
                  value={editForm.chapter}
                  onChange={handleEditChange}
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Grade">
                <input
                  className={baseInputClassName}
                  type="number"
                  min="1"
                  name="grade"
                  value={editForm.grade}
                  onChange={handleEditChange}
                />
              </FormField>

              <FormField label="Marks">
                <input
                  className={baseInputClassName}
                  type="number"
                  min="1"
                  name="marks"
                  value={editForm.marks}
                  onChange={handleEditChange}
                />
              </FormField>
            </div>

            <FormField label="Answer">
              <input
                className={baseInputClassName}
                name="answer"
                value={editForm.answer}
                onChange={handleEditChange}
              />
            </FormField>

            {editForm.questionType === 'MCQ' ? (
              <FormField label="Options">
                <textarea
                  className={`${baseInputClassName} min-h-24`}
                  name="optionsText"
                  value={editForm.optionsText}
                  onChange={handleEditChange}
                  placeholder="One option per line"
                />
              </FormField>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={saving}
              >
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </button>
              <button
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                type="button"
                onClick={cancelEdit}
                disabled={saving}
              >
                Cancel Edit
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">
            Select a question from the list to load it into the update form.
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Question List</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Click Edit On Any Question</h2>
          </div>
          <button
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            type="button"
            onClick={refreshQuestions}
          >
            Refresh
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {loadingQuestions ? <p className="text-sm text-slate-500">Loading questions...</p> : null}

          {!loadingQuestions && questions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center text-slate-500">
              No questions found for selected filters.
            </div>
          ) : null}

          {questions.map((question) => (
            <QuestionCard
              key={question._id}
              question={question}
              onEdit={startEditing}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

export default UpdateQuestionsPage


