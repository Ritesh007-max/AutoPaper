function QuestionCard({ question, onDelete, onEdit }) {
  const canEdit = typeof onEdit === 'function'
  const canDelete = typeof onDelete === 'function'
  const difficulty = String(question.difficulty || '').toLowerCase()

  const difficultyClassName =
    difficulty === 'hard'
      ? 'chip chip-error'
      : difficulty === 'medium'
        ? 'chip chip-warning'
        : 'chip chip-success'

  return (
    <article className="card-base p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex flex-wrap gap-2">
            <span className="chip chip-neutral">
              {question.questionType}
            </span>
            <span className={difficultyClassName}>
              {question.difficulty}
            </span>
            <span className="chip">
              Grade {question.grade}
            </span>
          </div>
          <h3 className="mt-3 text-[16px] font-bold leading-snug text-text-primary">{question.questionText}</h3>
        </div>
        {canEdit || canDelete ? (
          <div className="flex gap-2">
            {canEdit ? (
              <button
                className="btn btn-sm btn-secondary"
                type="button"
                onClick={() => onEdit(question)}
              >
                Edit
              </button>
            ) : null}
            {canDelete ? (
              <button
                className="btn btn-sm btn-secondary text-error hover:border-error hover:bg-error/5"
                type="button"
                onClick={() => onDelete(question._id)}
              >
                Delete
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2 text-[13px] text-text-secondary sm:grid-cols-2">
        <p><span className="font-semibold uppercase tracking-widest text-neutral">Subject:</span> {question.subject}</p>
        <p><span className="font-semibold uppercase tracking-widest text-neutral">Chapter:</span> {question.chapter || '-'}</p>
        <p><span className="font-semibold uppercase tracking-widest text-neutral">Marks:</span> {question.marks}</p>
        <p><span className="font-semibold uppercase tracking-widest text-neutral">Answer:</span> {question.answer}</p>
      </div>

      {Array.isArray(question.options) && question.options.length > 0 ? (
        <div className="mt-3 rounded-xl border border-border bg-background p-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-neutral">Options</p>
          <ul className="mt-2 space-y-1.5 text-[14px] text-text-secondary">
            {question.options.map((option, index) => (
              <li key={`${question._id}-${index}`} className="rounded-xl border border-border bg-surface px-3 py-2">
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
