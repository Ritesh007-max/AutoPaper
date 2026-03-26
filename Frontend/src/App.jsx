import { useState } from 'react'
import { createQuestion } from './api/questions'
import QuestionForm from './components/QuestionForm'
import QuestionExamples from './components/QuestionExamples'
import SectionCard from './components/SectionCard'
import { emptyForm } from './constants/questionForm'
import StatusBanner from './components/StatusBanner'

function App() {
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

  const handleSubmit = async (event) => {
    event.preventDefault()

    const payload = buildPayload()

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
    <main className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[420px,1fr]">
        <SectionCard>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Upload Single Question</h1>

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
    </main>
  )
}

export default App
