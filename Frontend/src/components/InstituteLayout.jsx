import { useState } from 'react'

import { TeacherSidebar } from './TeacherDashboardUi'

const navItems = [
  { key: 'dashboard', href: '/institute/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'teachers', href: '/teachers', label: 'Teachers', icon: 'teachers' },
  { key: 'activity', href: '/activity', label: 'Activity', icon: 'activity' },
  { key: 'invites', href: '/teachers/invite', label: 'Invite Teachers', icon: 'invites' },
  { key: 'notifications', href: '/notifications', label: 'Notifications', icon: 'notifications' },
]

function InstituteLayout({ activeKey, eyebrow = 'Institute Admin', title, description, actions, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <TeacherSidebar
        navItems={navItems}
        activeKey={activeKey}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        brandTitle="AutoPaper"
        brandSubtitle="Institute Admin"
        workspaceTitle="Institute workspace"
        workspaceSubtitle="Connected admin profile"
        workspaceInitials="IA"
        workspaceAccentClassName="bg-sky-100"
        workspaceInitialsClassName="text-sky-700"
      />

      <div className="flex min-h-screen flex-col xl:ml-[260px]">
        <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-md">
          <div className="flex flex-col gap-4 px-6 py-6 lg:px-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation menu"
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 xl:hidden"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>

              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-500">{eyebrow}</p>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
                {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p> : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
              <a
                href="/logout"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Logout
              </a>
            </div>
          </div>
        </header>

        <section className="w-full max-w-7xl flex-1 p-6 lg:p-8">{children}</section>
      </div>
    </main>
  )
}

export default InstituteLayout
