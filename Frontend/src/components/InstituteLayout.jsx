const navItems = [
  { key: 'dashboard', href: '/institute/dashboard', label: 'Dashboard' },
  { key: 'teachers', href: '/teachers', label: 'Teachers' },
  { key: 'activity', href: '/activity', label: 'Activity' },
  { key: 'invites', href: '/invites', label: 'Invites' },
]

function InstituteLayout({ activeKey, eyebrow = 'Institute Admin', title, description, actions, children }) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-200">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">{eyebrow}</p>
                <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900">AutoPaper Institute</h1>
              </div>
            </div>

            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const active = item.key === activeKey

                return (
                  <a
                    key={item.key}
                    href={item.href}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </a>
                )
              })}
            </nav>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-500">Command center</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
              {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p> : null}
            </div>

            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</section>
    </main>
  )
}

export default InstituteLayout
