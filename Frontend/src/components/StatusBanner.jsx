function StatusBanner({ status }) {
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
      <span className={status.type === 'error' ? 'text-rose-600' : 'text-slate-700'}>
        {status.message || 'Run the backend on port 3000, then use this screen for CRUD operations.'}
      </span>
    </div>
  )
}

export default StatusBanner
