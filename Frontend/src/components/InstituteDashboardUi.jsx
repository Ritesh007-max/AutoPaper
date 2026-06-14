const toneStyles = {
  sky: {
    icon: 'bg-primary/10 text-primary',
    accent: 'bg-primary',
  },
  emerald: {
    icon: 'bg-success/10 text-success',
    accent: 'bg-success',
  },
  amber: {
    icon: 'bg-warning/10 text-warning',
    accent: 'bg-warning',
  },
  violet: {
    icon: 'bg-secondary/10 text-secondary',
    accent: 'bg-secondary',
  },
  rose: {
    icon: 'bg-error/10 text-error',
    accent: 'bg-error',
  },
}

export function MetricCard({ label, value, note, icon, tone = 'sky', loading = false, error = '' }) {
  const styles = toneStyles[tone] || toneStyles.sky

  return (
    <div className="card-base card-hoverable p-5 relative overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${styles.icon}`}>
          {icon}
        </div>
        <div className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${styles.icon}`}>
          KPI
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[13px] font-semibold text-text-secondary">{label}</p>
        <p className="mt-1 text-3xl tracking-tight text-text-primary">
          {loading ? '...' : error ? 'N/A' : value}
        </p>
        <p className="mt-2 text-[12px] font-medium text-text-secondary">{error || note}</p>
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
      className="group flex items-center justify-between card-base card-hoverable p-4"
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition group-hover:scale-105 ${styles.icon}`}>
          {icon}
        </div>
        <div>
          <p className="text-[14px] font-bold text-text-primary">{label}</p>
          <p className="mt-1 text-[12px] leading-5 text-text-secondary">{description}</p>
        </div>
      </div>

      <svg className="h-5 w-5 text-neutral transition group-hover:translate-x-1 group-hover:text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </a>
  )
}

export function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow ? <p className="text-[11px] font-bold uppercase tracking-widest text-primary">{eyebrow}</p> : null}
        <h3 className="mt-2 text-[20px] font-bold tracking-tight text-text-primary">{title}</h3>
        {description ? <p className="mt-2 max-w-2xl text-[14px] leading-6 text-text-secondary">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  )
}

export function StatusBadge({ status }) {
  const normalized = String(status || '').toLowerCase()
  const styles = {
    draft: 'chip-warning',
    pending: 'chip-warning',
    accepted: 'chip-success',
    expired: 'chip-neutral',
    active: 'chip-primary',
  }

  return (
    <span className={`chip ${styles[normalized] || 'chip-primary'}`}>
      {status}
    </span>
  )
}

export function ActivityList({ items, loading = false, error = '', emptyTitle = 'No activity yet', emptyDescription = 'Recent institute actions will appear here.' }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-start gap-4 card-base p-4">
            <div className="h-10 w-10 animate-pulse rounded-full bg-border" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/5 animate-pulse rounded bg-border" />
              <div className="h-3 w-2/5 animate-pulse rounded bg-border" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-[14px] text-error">{error}</div>
  }

  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-background px-6 py-10 text-center">
        <p className="text-[14px] font-bold text-text-primary">{emptyTitle}</p>
        <p className="mt-2 text-[14px] text-text-secondary">{emptyDescription}</p>
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
          <div key={item.id} className="flex items-start gap-4 card-base card-hoverable p-4">
            <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
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
                <p className="text-[14px] font-bold text-text-primary">{item.title}</p>
                <StatusBadge status={item.type.replace(/_/g, ' ')} />
              </div>
              {item.detail ? <p className="mt-1 text-[14px] text-text-secondary">{item.detail}</p> : null}
              <p className="mt-2 text-[12px] font-medium uppercase tracking-widest text-neutral">{item.time}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function TeacherSnapshotTable({
  teachers,
  loading = false,
  error = '',
  onRemove,
  removingTeacherId = '',
}) {
  const hasActions = typeof onRemove === 'function'

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card-base p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="h-5 w-40 animate-pulse rounded bg-border" />
                <div className="h-4 w-56 animate-pulse rounded bg-border" />
              </div>
              {hasActions ? <div className="h-10 w-24 animate-pulse rounded-full bg-border" /> : null}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((__, metricIndex) => (
                <div key={metricIndex} className="rounded-xl border border-border bg-background px-4 py-4">
                  <div className="h-3 w-20 animate-pulse rounded bg-border" />
                  <div className="mt-3 h-5 w-12 animate-pulse rounded bg-border" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-[14px] text-error">{error}</div>
  }

  if (!teachers.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-background px-6 py-10 text-center">
        <p className="text-[14px] font-bold text-text-primary">No teacher data available</p>
        <p className="mt-2 text-[14px] text-text-secondary">Teachers will appear here once the institute starts receiving activity.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {teachers.map((teacher) => (
        <article
          key={teacher.id}
          className="card-base card-hoverable p-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-[18px] font-bold text-text-primary">{teacher.name}</p>
              {teacher.email ? <p className="mt-1 break-all text-[14px] text-text-secondary">{teacher.email}</p> : null}
            </div>

            {hasActions ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onRemove(teacher)}
                  disabled={removingTeacherId === teacher.id}
                  className="btn btn-sm btn-secondary text-error hover:border-error hover:bg-error/5"
                >
                  {removingTeacherId === teacher.id ? 'Removing...' : 'Remove'}
                </button>
              </div>
            ) : null}
          </div>

          <div className={`mt-5 grid gap-3 ${hasActions ? 'xl:grid-cols-3' : 'md:grid-cols-3'}`}>
            <div className="rounded-xl border border-border bg-background px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral">Questions</p>
              <p className="mt-2 text-[24px] font-bold text-text-primary">{teacher.questionsAdded}</p>
            </div>

            <div className="rounded-xl border border-border bg-background px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral">Papers</p>
              <p className="mt-2 text-[24px] font-bold text-text-primary">{teacher.papersGenerated}</p>
            </div>

            <div className="rounded-xl border border-border bg-background px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral">Last Active</p>
              <p className="mt-2 text-[16px] font-bold text-text-primary">{teacher.lastActiveLabel}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

export function InviteTable({ invites, loading = false, error = '', onResend, resendingId = '' }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="card-base p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="h-5 w-56 animate-pulse rounded bg-border" />
                <div className="h-4 w-32 animate-pulse rounded bg-border" />
              </div>
              <div className="h-10 w-24 animate-pulse rounded-full bg-border" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((__, metricIndex) => (
                <div key={metricIndex} className="rounded-xl border border-border bg-background px-4 py-4">
                  <div className="h-3 w-20 animate-pulse rounded bg-border" />
                  <div className="mt-3 h-5 w-16 animate-pulse rounded bg-border" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-[14px] text-error">{error}</div>
  }

  if (!invites.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-background px-6 py-10 text-center">
        <p className="text-[14px] font-bold text-text-primary">No invites found</p>
        <p className="mt-2 text-[14px] text-text-secondary">Pending and completed invites will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {invites.map((invite) => (
        <article
          key={invite.id}
          className="card-base card-hoverable p-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="break-all text-[18px] font-bold text-text-primary">{invite.email}</p>
              {invite.teacherUid ? <p className="mt-1 text-[14px] text-text-secondary">Teacher UID: {invite.teacherUid}</p> : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={invite.status} />
              <button
                type="button"
                onClick={() => onResend?.(invite)}
                disabled={invite.status === 'accepted' || resendingId === invite.id}
                className="btn btn-sm btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resendingId === invite.id ? 'Sending...' : invite.status === 'draft' ? 'Send' : 'Resend'}
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-background px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral">Status</p>
              <p className="mt-2 text-[16px] font-bold text-text-primary capitalize">{invite.status}</p>
            </div>

            <div className="rounded-xl border border-border bg-background px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral">Expires</p>
              <p className="mt-2 text-[16px] font-bold text-text-primary">{invite.expiresAtLabel || 'No expiry set'}</p>
            </div>

            <div className="rounded-xl border border-border bg-background px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral">Resends</p>
              <p className="mt-2 text-[24px] font-bold text-text-primary">{invite.resendCount || 0}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

