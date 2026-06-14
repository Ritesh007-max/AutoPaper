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
    <main className="min-h-screen bg-background text-text-primary">
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
        workspaceAccentClassName="bg-primary/20"
        workspaceInitialsClassName="text-primary"
      />

      <div className="flex min-h-screen flex-col xl:ml-[260px]">
        <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
          <div className="flex flex-col gap-4 px-6 py-6 lg:px-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation menu"
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary transition hover:bg-background xl:hidden"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>

              <div className="max-w-3xl">
                <p className="text-[11px] font-bold uppercase tracking-widest text-primary">{eyebrow}</p>
                <h1 className="mt-2 text-[24px] font-bold tracking-tight text-text-primary sm:text-[30px]">{title}</h1>
                {description ? <p className="mt-2 max-w-2xl text-[14px] leading-6 text-text-secondary">{description}</p> : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
              <a
                href="/logout"
                className="btn btn-md btn-secondary"
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
