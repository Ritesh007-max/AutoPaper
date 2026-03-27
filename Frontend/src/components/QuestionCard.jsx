function QuestionCard({ question, onDelete, onEdit }) {
  const canEdit = typeof onEdit === 'function'
  const canDelete = typeof onDelete === 'function'

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              {question.questionType}
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              {question.difficulty}
            </span>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
              Grade {question.grade}
            </span>
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">{question.questionText}</h3>
        </div>
        {canEdit || canDelete ? (
          <div className="flex gap-2">
            {canEdit ? (
              <button
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                type="button"
                onClick={() => onEdit(question)}
              >
                Edit
              </button>
            ) : null}
            {canDelete ? (
              <button
                className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
                type="button"
                onClick={() => onDelete(question._id)}
              >
                Delete
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
        <p><span className="font-semibold text-slate-900">Subject:</span> {question.subject}</p>
        <p><span className="font-semibold text-slate-900">Chapter:</span> {question.chapter || '-'}</p>
        <p><span className="font-semibold text-slate-900">Marks:</span> {question.marks}</p>
        <p><span className="font-semibold text-slate-900">Answer:</span> {question.answer}</p>
      </div>

      {Array.isArray(question.options) && question.options.length > 0 ? (
        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Options</p>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            {question.options.map((option, index) => (
              <li key={`${question._id}-${index}`} className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
                {option}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  )
}

export default QuestionCard
