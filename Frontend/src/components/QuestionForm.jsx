import FormField from './FormField'
import { baseInputClassName } from './formStyles'
import { difficultyOptions, questionTypeOptions } from '../constants/questionForm'

function QuestionForm({ form, onChange, onReset, onSubmit }) {
  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
      <section className="card-base p-4 bg-background">
        <p className="text-[11px] font-bold uppercase tracking-widest text-neutral">1. Question Content</p>

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

      <section className="card-base p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-neutral">2. Answer Setup</p>
          <span className="chip chip-primary">
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

      <section className="card-base p-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-neutral">3. Metadata</p>
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
          className="btn btn-md btn-primary"
          type="submit"
        >
          Save to Bank
        </button>
        <button
          className="btn btn-md btn-secondary"
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
