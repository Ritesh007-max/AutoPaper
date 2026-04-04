function SidebarIcon({ type, active = false }) {
  const iconClassName = active ? 'text-blue-600' : 'text-slate-400'

  const commonProps = {
    className: `h-5 w-5 ${iconClassName}`,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    viewBox: '0 0 24 24',
  }

  const icons = {
    dashboard: (
      <svg {...commonProps}>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    'question-bank': (
      <svg {...commonProps}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    'add-question': (
      <svg {...commonProps}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
    'generate-paper': (
      <svg {...commonProps}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    history: (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    settings: (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V11a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
    trash: (
      <svg {...commonProps}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    ),
  }

  return icons[type] || null
}

export function TeacherSidebar({ navItems, activeKey }) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[260px] flex-col border-r border-slate-200 bg-white transition-all xl:flex">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-200">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">EduSaaS</h1>
          <p className="text-xs font-semibold text-slate-400">AI Exam Engine</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1.5 px-4 pt-4">
        {navItems.filter(item => !item.adminOnly).map((item) => {
          const active = item.key === activeKey
          return (
            <a
              key={item.key}
              href={item.disabled ? '#' : item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                active 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-slate-600 hover:bg-slate-50'
              } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <SidebarIcon type={item.icon} active={active} />
              {item.label}
            </a>
          )
        })}

        <div className="mt-8 px-4 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Administration</p>
        </div>
        
        {navItems.filter(item => item.adminOnly).map((item) => {
          const active = item.key === activeKey
          return (
            <a
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                active 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <SidebarIcon type={item.icon} active={active} />
              {item.label}
            </a>
          )
        })}
      </nav>

      {/* User info */}
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
            <span className="text-sm font-bold text-orange-600">AP</span>
          </div>
          <div className="min-w-0 overflow-hidden">
            <p className="truncate text-sm font-bold text-slate-900">Active workspace</p>
            <p className="truncate text-xs font-medium text-slate-500">Connected teacher profile</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export function TeacherTopbar() {
  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-100 bg-white/80 px-8 backdrop-blur-md">
      <div className="relative w-full max-w-[500px]">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search questions, papers, or tags..."
          className="h-12 w-full rounded-2xl border-0 bg-slate-100 pl-11 pr-4 text-sm font-medium text-slate-600 ring-0 transition-all focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="flex items-center gap-5">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-50">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute right-2.5 top-2.5 flex h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-600"></span>
        </button>
        <button className="flex h-11 items-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Quick Generate
        </button>
      </div>
    </header>
  )
}

export function DashboardStatCard({ title, value, icon, trend, iconBg, trendUp = true, accentColor }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-soft transition-all hover:shadow-card">
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend}
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            {trendUp ? <path d="M5 10l7-7m0 0l7 7m-7-7v18" /> : <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />}
          </svg>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm font-semibold text-slate-400">{title}</p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
      </div>
      {/* Accent gradient bar */}
      <div className={`mt-6 h-1 w-2/3 rounded-full opacity-20 ${accentColor}`}></div>
    </div>
  )
}

export function StatusBadge({ status }) {
  const published = String(status || '').toLowerCase() === 'published'
  return (
    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest ${
      published 
        ? 'bg-emerald-50 text-emerald-600' 
        : 'bg-amber-50 text-amber-600'
    }`}>
      {status}
    </span>
  )
}

export function RecentPaperRow({ name, timestamp, subject, status }) {
  return (
    <div className="grid grid-cols-[1.5fr,1fr,1fr,100px] items-center gap-4 border-b border-slate-50 py-5 last:border-0 hover:bg-slate-50/50 px-4 transition-all">
      <div className="min-w-0">
        <p className="truncate text-[15px] font-bold text-slate-900">{name}</p>
        <p className="mt-0.5 text-xs font-semibold text-slate-400">{timestamp}</p>
      </div>
      <div className="text-sm font-semibold text-slate-600 transition-all">{subject}</div>
      <div className="flex items-center">
         <StatusBadge status={status} />
      </div>
      <div className="flex items-center justify-end gap-3 text-slate-400">
        <button className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white hover:shadow-soft hover:text-blue-600 transition-all">
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </button>
        <button className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white hover:shadow-soft hover:text-slate-600 transition-all">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export function ActionCard({ icon, label, href, iconBg }) {
  return (
    <a 
      href={href}
      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:border-blue-100 hover:shadow-lg hover:shadow-blue-50/50 group"
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${iconBg}`}>
          {icon}
        </div>
        <span className="text-[15px] font-bold text-slate-800">{label}</span>
      </div>
      <svg className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </a>
  )
}

export function RecentActivityItem({ icon, title, meta }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform hover:scale-110">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[15px] font-bold text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs font-semibold text-slate-400">{meta}</p>
      </div>
    </div>
  )
}
