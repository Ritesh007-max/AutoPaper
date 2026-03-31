import { useState } from 'react'
import SectionCard from '../components/SectionCard'
import StatusBanner from '../components/StatusBanner'
import { createQuestionsBulk } from '../api/questions'
import { createQuestionSchemaPdfBlob } from '../utils/questionSchemaPdf'
import { validateQuestionsPdf } from '../utils/pdfQuestionValidator'

function BulkUploadQuestionsPage() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [processing, setProcessing] = useState(false)

  const handleDownloadTemplate = () => {
    const blob = createQuestionSchemaPdfBlob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'bulk-questions-schema-template.pdf'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      setSelectedFile(null)
      return
    }

    const lowerName = file.name.toLowerCase()
    const isPdf = file.type === 'application/pdf' || lowerName.endsWith('.pdf')

    if (!isPdf) {
      setSelectedFile(null)
      event.target.value = ''
      setStatus({
        type: 'error',
        message: 'Only PDF files are allowed for bulk upload.',
      })
      return
    }

    setSelectedFile(file)
    setStatus({
      type: 'success',
      message: `Selected: ${file.name}`,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!selectedFile) {
      setStatus({
        type: 'error',
        message: 'Please select a PDF file before uploading.',
      })
      return
    }

    setProcessing(true)

    try {
      const validationResult = await validateQuestionsPdf(selectedFile)

      if (!validationResult.isValid) {
        const previewErrors = validationResult.errors.slice(0, 3).join(' ')
        const hasMoreErrors = validationResult.errors.length > 3

        setStatus({
          type: 'error',
          message: `Validation failed for ${validationResult.questionCount} question(s). ${previewErrors}${hasMoreErrors ? ' More issues found in the PDF.' : ''}`,
        })
        return
      }

      if (!Array.isArray(validationResult.questions) || validationResult.questions.length === 0) {
        setStatus({
          type: 'error',
          message: 'Validation passed but no question payload was generated from this PDF.',
        })
        return
      }

      const response = await createQuestionsBulk(validationResult.questions)
      const insertedCount = response?.data?.count ?? validationResult.questions.length

      setStatus({
        type: 'success',
        message: `PDF validated and uploaded successfully. Added ${insertedCount} question(s) to DB.`,
      })
    } catch (error) {
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message

      setStatus({
        type: 'error',
        message: apiMessage || 'Failed to validate or upload PDF content.',
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr,1fr]">
      <SectionCard>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Bulk Upload</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Upload Questions via PDF</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          File type is compulsory PDF. Download the schema template first, then create your document in that format.
        </p>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="w-full rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            Download Schema Template (PDF)
          </button>
        </div>

        <StatusBanner status={status} />

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500" htmlFor="bulkPdf">
            Select PDF File
          </label>
          <input
            id="bulkPdf"
            name="bulkPdf"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700"
          />

          <button
            type="submit"
            disabled={processing}
            className="w-full rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {processing ? 'Validating And Uploading...' : 'Validate And Upload PDF'}
          </button>
        </form>
      </SectionCard>

      <SectionCard>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Schema Rules</p>
        <h2 className="mt-2 text-2xl font-black text-slate-900">Backend Validation Fields</h2>

        <div className="mt-5 space-y-3 text-sm text-slate-700">
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><strong>Required:</strong> questionText, questionType, subject, grade, difficulty, marks</p>
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><strong>questionType:</strong> MCQ | short | long | numerical</p>
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><strong>difficulty:</strong> easy | medium | hard</p>
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><strong>Optional:</strong> options, answer, chapter</p>
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><strong>MCQ note:</strong> `options` should contain all choices and `answer` should match one valid option.</p>
        </div>
      </SectionCard>
    </div>
  )
}

export default BulkUploadQuestionsPage
