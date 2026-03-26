import QuestionCard from './QuestionCard'
import StatusBanner from './StatusBanner'

function QuestionList({ loading, onDelete, onEdit, onRefresh, questions, status }) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Stored Questions</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900">MongoDB Records</h2>
        </div>
        <button
          className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
          type="button"
          onClick={onRefresh}
        >
          Refresh
        </button>
      </div>

      <StatusBanner status={status} />

      <div className="mt-6 space-y-4">
        {loading ? <p className="text-sm text-slate-500">Loading questions...</p> : null}

        {!loading && questions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-12 text-center text-slate-500">
            No questions found.
          </div>
        ) : null}

        {questions.map((question) => (
          <QuestionCard
            key={question._id}
            onDelete={onDelete}
            onEdit={onEdit}
            question={question}
          />
        ))}
      </div>
    </>
  )
}

export default QuestionList
