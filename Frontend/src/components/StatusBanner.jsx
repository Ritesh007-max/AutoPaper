function StatusBanner({ status }) {
  const hasError = status.type === 'error'
  const hasSuccess = status.type === 'success'

  const className = hasError
    ? 'border-rose-200 bg-rose-50 text-rose-700'
    : hasSuccess
      ? 'border-blue-200 bg-[var(--tp-primary-soft)] text-blue-700'
      : 'border-slate-200 bg-slate-50 text-slate-600'

  return (
    <div className={`mt-5 rounded-xl border px-4 py-3 text-sm ${className}`}>
      <span>{status.message || 'Run the backend on port 3000, then use this screen for CRUD operations.'}</span>
    </div>
  )
}

export default StatusBanner
