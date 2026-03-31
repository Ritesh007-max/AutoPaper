function QuestionCard({ question, onDelete, onEdit }) {
  const canEdit = typeof onEdit === 'function'
  const canDelete = typeof onDelete === 'function'
  const difficulty = String(question.difficulty || '').toLowerCase()

  const difficultyClassName =
    difficulty === 'hard'
      ? 'bg-amber-50 text-amber-700'
      : difficulty === 'medium'
        ? 'bg-blue-50 text-blue-700'
        : 'bg-[var(--tp-primary-soft)] text-[#4f6286]'

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
              {question.questionType}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${difficultyClassName}`}>
              {question.difficulty}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
              Grade {question.grade}
            </span>
          </div>
          <h3 className="mt-3 text-base font-bold leading-snug text-slate-900">{question.questionText}</h3>
        </div>
        {canEdit || canDelete ? (
          <div className="flex gap-2">
            {canEdit ? (
              <button
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:bg-slate-50"
                type="button"
                onClick={() => onEdit(question)}
              >
                Edit
              </button>
            ) : null}
            {canDelete ? (
              <button
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-rose-700 transition hover:bg-rose-100"
                type="button"
                onClick={() => onDelete(question._id)}
              >
                Delete
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
        <p><span className="font-semibold uppercase tracking-[0.12em] text-slate-500">Subject:</span> {question.subject}</p>
        <p><span className="font-semibold uppercase tracking-[0.12em] text-slate-500">Chapter:</span> {question.chapter || '-'}</p>
        <p><span className="font-semibold uppercase tracking-[0.12em] text-slate-500">Marks:</span> {question.marks}</p>
        <p><span className="font-semibold uppercase tracking-[0.12em] text-slate-500">Answer:</span> {question.answer}</p>
      </div>

      {Array.isArray(question.options) && question.options.length > 0 ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Options</p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
            {question.options.map((option, index) => (
              <li key={`${question._id}-${index}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
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
