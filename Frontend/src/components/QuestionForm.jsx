import FormField, { baseInputClassName } from './FormField'
import { difficultyOptions, questionTypeOptions } from '../constants/questionForm'

function QuestionForm({ form, onChange, onReset, onSubmit }) {
  return (
    <form className="mt-8 space-y-4" onSubmit={onSubmit}>
      <FormField label="Question text">
        <textarea
          className={`${baseInputClassName} min-h-28`}
          name="questionText"
          value={form.questionText}
          onChange={onChange}
          required
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Type">
          <select
            className={baseInputClassName}
            name="questionType"
            value={form.questionType}
            onChange={onChange}
            required
          >
            <option value="" disabled>
              Select question type
            </option>
            {questionTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FormField>

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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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

      <FormField label="Answer">
        <input
          className={baseInputClassName}
          name="answer"
          value={form.answer}
          onChange={onChange}
          required
        />
      </FormField>

      {form.questionType === 'MCQ' ? (
        <FormField label="Options">
          <textarea
            className={`${baseInputClassName} min-h-28`}
            name="optionsText"
            value={form.optionsText}
            onChange={onChange}
            placeholder="One option per line"
            required
          />
        </FormField>
      ) : null}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          type="submit"
        >
          Create question
        </button>
        <button
          className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          type="button"
          onClick={onReset}
        >
          Reset form
        </button>
      </div>
    </form>
  )
}

export default QuestionForm
