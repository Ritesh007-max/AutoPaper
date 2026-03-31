import FormField from './FormField'
import { baseInputClassName } from './formStyles'
import { difficultyOptions, questionTypeOptions } from '../constants/questionForm'

function QuestionForm({ form, onChange, onReset, onSubmit }) {
  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
      <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">1. Question Content</p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <FormField label="Subject">
            <input
              className={baseInputClassName}
              name="subject"
              value={form.subject}
              onChange={onChange}
              required
            />
          </FormField>

          <FormField label="Chapter">
            <input
              className={baseInputClassName}
              name="chapter"
              value={form.chapter}
              onChange={onChange}
            />
          </FormField>

          <FormField label="Question Type">
            <select
              className={baseInputClassName}
              name="questionType"
              value={form.questionType}
              onChange={onChange}
              required
            >
              <option value="" disabled>
                Select type
              </option>
              {questionTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Grade">
            <input
              className={baseInputClassName}
              type="number"
              min="1"
              name="grade"
              value={form.grade}
              onChange={onChange}
              required
            />
          </FormField>
        </div>

        <div className="mt-3">
          <FormField label="Question Text">
            <textarea
              className={`${baseInputClassName} min-h-28`}
              name="questionText"
              value={form.questionText}
              onChange={onChange}
              required
              placeholder="Type your question text here..."
            />
          </FormField>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">2. Answer Setup</p>
          <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">
            Required
          </span>
        </div>

        <div className="mt-3">
          <FormField label="Answer">
            <input
              className={baseInputClassName}
              name="answer"
              value={form.answer}
              onChange={onChange}
              required
            />
          </FormField>
        </div>

        {form.questionType === 'MCQ' ? (
          <div className="mt-3">
            <FormField label="MCQ Options (One per line)">
              <textarea
                className={`${baseInputClassName} min-h-28`}
                name="optionsText"
                value={form.optionsText}
                onChange={onChange}
                placeholder={'Option A\nOption B\nOption C\nOption D'}
                required
              />
            </FormField>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">3. Metadata</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <FormField label="Difficulty">
            <select
              className={baseInputClassName}
              name="difficulty"
              value={form.difficulty}
              onChange={onChange}
            >
              {difficultyOptions.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Marks">
            <input
              className={baseInputClassName}
              type="number"
              min="1"
              name="marks"
              value={form.marks}
              onChange={onChange}
              required
            />
          </FormField>
        </div>
      </section>

      <div className="flex flex-wrap gap-3 pt-1">
        <button
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          type="submit"
        >
          Save to Bank
        </button>
        <button
          className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          type="button"
          onClick={onReset}
        >
          Reset
        </button>
      </div>
    </form>
  )
}

export default QuestionForm
