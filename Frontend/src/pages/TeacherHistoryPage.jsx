import SectionCard from '../components/SectionCard'

const historyRows = [
  { event: 'Question Bank Sync', when: 'Today, 10:45 AM', status: 'Completed' },
  { event: 'Bulk Upload (Physics)', when: 'Today, 9:15 AM', status: 'Completed' },
  { event: 'Paper Metadata Review', when: 'Yesterday, 6:20 PM', status: 'Pending' },
  { event: 'Question Cleanup', when: 'Yesterday, 2:10 PM', status: 'Completed' },
]

function TeacherHistoryPage() {
  return (
    <SectionCard>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">History</p>
      <h1 className="mt-2 text-3xl font-black text-slate-900">Recent Activity</h1>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {historyRows.map((row) => (
          <article
            key={`${row.event}-${row.when}`}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 last:border-b-0"
          >
            <div>
              <p className="text-lg font-bold text-slate-900">{row.event}</p>
              <p className="text-sm text-slate-500">{row.when}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                row.status === 'Completed'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {row.status}
            </span>
          </article>
        ))}
      </div>
    </SectionCard>
  )
}

export default TeacherHistoryPage
