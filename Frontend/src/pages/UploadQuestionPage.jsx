import { useState } from 'react'
import { createQuestion } from '../api/questions'
import QuestionForm from '../components/QuestionForm'
import QuestionExamples from '../components/QuestionExamples'
import SectionCard from '../components/SectionCard'
import { difficultyOptions, emptyForm, questionTypeOptions } from '../constants/questionForm'
import StatusBanner from '../components/StatusBanner'

function UploadQuestionPage() {
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState({ type: '', message: '' })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const resetForm = () => {
    setForm(emptyForm)
  }

  const buildPayload = () => {
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

  const handleSubmit = async (event) => {
    event.preventDefault()

    const payload = buildPayload()
    const validationError = validatePayload(payload)

    if (validationError) {
      setStatus({ type: 'error', message: validationError })
      return
    }

    try {
      await createQuestion(payload)
      setStatus({ type: 'success', message: 'Question created successfully.' })
      resetForm()
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message ?? 'Request failed.',
      })
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.35fr,1fr]">
      <SectionCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Question Bank</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Create New Question</h1>
            <p className="mt-2 text-sm text-slate-600">
              Configure your question with rich text style fields and metadata.
            </p>
          </div>

          <button
            type="button"
            className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
          >
            Generate with AI (Soon)
          </button>
        </div>

        <StatusBanner status={status} />

        <QuestionForm
          form={form}
          onChange={handleChange}
          onReset={resetForm}
          onSubmit={handleSubmit}
        />
      </SectionCard>

      <SectionCard>
        <QuestionExamples selectedType={form.questionType} />
      </SectionCard>
    </div>
  )
}

export default UploadQuestionPage
