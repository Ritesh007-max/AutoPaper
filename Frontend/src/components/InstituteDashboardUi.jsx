const toneStyles = {
  sky: {
    icon: 'bg-sky-50 text-sky-600',
    accent: 'bg-sky-500',
  },
  emerald: {
    icon: 'bg-emerald-50 text-emerald-600',
    accent: 'bg-emerald-500',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-600',
    accent: 'bg-amber-500',
  },
  violet: {
    icon: 'bg-violet-50 text-violet-600',
    accent: 'bg-violet-500',
  },
  rose: {
    icon: 'bg-rose-50 text-rose-600',
    accent: 'bg-rose-500',
  },
}

export function MetricCard({ label, value, note, icon, tone = 'sky', loading = false, error = '' }) {
  const styles = toneStyles[tone] || toneStyles.sky

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${styles.icon}`}>
          {icon}
        </div>
        <div className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${styles.icon}`}>
          KPI
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-black tracking-tight text-slate-900">
          {loading ? '...' : error ? 'N/A' : value}
        </p>
        <p className="mt-2 text-xs font-medium text-slate-500">{error || note}</p>
      </div>

      <div className={`mt-5 h-1 w-2/3 rounded-full opacity-20 ${styles.accent}`} />
    </div>
  )
}

export function QuickActionCard({ href, label, description, icon, tone = 'sky' }) {
  const styles = toneStyles[tone] || toneStyles.sky

  return (
    <a
      href={href}
      className="group flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl transition group-hover:scale-105 ${styles.icon}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">{label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
      </div>

      <svg className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </a>
  )
}

export function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow ? <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-sky-500">{eyebrow}</p> : null}
        <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900">{title}</h3>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  )
}

export function StatusBadge({ status }) {
  const normalized = String(status || '').toLowerCase()
  const styles = {
    draft: 'bg-amber-50 text-amber-700 ring-amber-100',
    pending: 'bg-amber-50 text-amber-700 ring-amber-100',
    accepted: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    expired: 'bg-slate-100 text-slate-600 ring-slate-200',
    active: 'bg-sky-50 text-sky-700 ring-sky-100',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ring-1 ${styles[normalized] || styles.active}`}>
      {status}
    </span>
  )
}

export function ActivityList({ items, loading = false, error = '', emptyTitle = 'No activity yet', emptyDescription = 'Recent institute actions will appear here.' }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="h-10 w-10 animate-pulse rounded-full bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/5 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-2/5 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
        <p className="text-sm font-bold text-slate-900">{emptyTitle}</p>
        <p className="mt-2 text-sm text-slate-500">{emptyDescription}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const tone = item.type === 'paper_generated'
          ? 'emerald'
          : item.type === 'teacher_joined'
            ? 'violet'
            : item.type === 'invite_accepted'
              ? 'amber'
              : 'sky'

        const styles = toneStyles[tone]

        return (
          <div key={item.id} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm">
            <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.25">
                {item.type === 'paper_generated' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                ) : item.type === 'teacher_joined' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 1114 0" />
                ) : item.type === 'invite_accepted' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M12 4v16" />
                )}
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold text-slate-900">{item.title}</p>
                <StatusBadge status={item.type.replace(/_/g, ' ')} />
              </div>
              {item.detail ? <p className="mt-1 text-sm text-slate-500">{item.detail}</p> : null}
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{item.time}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function TeacherSnapshotTable({ teachers, loading = false, error = '' }) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="grid grid-cols-4 gap-4 border-b border-slate-100 bg-slate-50 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
          <span>Name</span>
          <span>Questions</span>
          <span>Papers</span>
          <span>Last Active</span>
        </div>
        <div className="space-y-3 p-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 rounded-2xl border border-slate-100 px-4 py-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
  }

  if (!teachers.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
        <p className="text-sm font-bold text-slate-900">No teacher data available</p>
        <p className="mt-2 text-sm text-slate-500">Teachers will appear here once the institute starts receiving activity.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="grid grid-cols-[1.6fr,0.8fr,0.8fr,1fr] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
        <span>Name</span>
        <span>Questions</span>
        <span>Papers</span>
        <span>Last Active</span>
      </div>

      <div className="divide-y divide-slate-100">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="grid grid-cols-[1.6fr,0.8fr,0.8fr,1fr] gap-4 px-5 py-4">
            <div>
              <p className="text-sm font-bold text-slate-900">{teacher.name}</p>
              {teacher.email ? <p className="mt-1 text-xs text-slate-500">{teacher.email}</p> : null}
            </div>
            <p className="text-sm font-semibold text-slate-700">{teacher.questionsAdded}</p>
            <p className="text-sm font-semibold text-slate-700">{teacher.papersGenerated}</p>
            <p className="text-sm font-semibold text-slate-700">{teacher.lastActiveLabel}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function InviteTable({ invites, loading = false, error = '', onResend, resendingId = '' }) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="grid grid-cols-[1.6fr,0.8fr,0.8fr] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
          <span>Email</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        <div className="space-y-3 p-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[1.6fr,0.8fr,0.8fr] gap-4 rounded-2xl border border-slate-100 px-4 py-4">
              <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
  }

  if (!invites.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
        <p className="text-sm font-bold text-slate-900">No invites found</p>
        <p className="mt-2 text-sm text-slate-500">Pending and completed invites will appear here.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="grid grid-cols-[1.6fr,0.8fr,0.8fr] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
        <span>Email</span>
        <span>Status</span>
        <span>Action</span>
      </div>

      <div className="divide-y divide-slate-100">
        {invites.map((invite) => (
          <div key={invite.id} className="grid grid-cols-[1.6fr,0.8fr,0.8fr] gap-4 px-5 py-4">
            <div>
              <p className="text-sm font-bold text-slate-900">{invite.email}</p>
              {invite.teacherUid ? <p className="mt-1 text-xs text-slate-500">Teacher UID: {invite.teacherUid}</p> : null}
              <p className="mt-1 text-xs text-slate-500">
                {invite.expiresAtLabel ? `Expires ${invite.expiresAtLabel}` : 'No expiry set'}
              </p>
            </div>
            <div className="flex items-center">
              <StatusBadge status={invite.status} />
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => onResend?.(invite)}
                disabled={invite.status === 'accepted' || resendingId === invite.id}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resendingId === invite.id ? 'Sending...' : invite.status === 'draft' ? 'Send' : 'Resend'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

