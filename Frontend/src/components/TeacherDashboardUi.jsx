import { useEffect, useRef, useState } from 'react'

import {
  getTeacherNotifications,
  markAllTeacherNotificationsRead,
  markTeacherNotificationRead,
} from '../api/teacher'
import { formatRelativeTime } from '../utils/instituteFormatters'

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
    teachers: (
      <svg {...commonProps}>
        <path d="M17 20h5v-1a4 4 0 00-4-4h-1" />
        <path d="M9 20H4v-1a4 4 0 014-4h1" />
        <circle cx="9" cy="7" r="4" />
        <circle cx="17" cy="9" r="3" />
      </svg>
    ),
    activity: (
      <svg {...commonProps}>
        <path d="M3 12h4l3-7 4 14 3-7h4" />
      </svg>
    ),
    invites: (
      <svg {...commonProps}>
        <path d="M4 6h16v12H4z" />
        <path d="M4 8l8 5 8-5" />
      </svg>
    ),
    notifications: (
      <svg {...commonProps}>
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
        <path d="M9 17a3 3 0 006 0" />
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

const normalizeTeacherNotification = (notification = {}) => ({
  id: notification.id || notification._id || crypto.randomUUID(),
  title: notification.title || 'Notification',
  message: notification.message || '',
  status: notification.status || 'unread',
  createdAt: notification.sentAt || notification.createdAt || null,
  createdAtLabel: formatRelativeTime(notification.sentAt || notification.createdAt),
})

export function TeacherSidebar({
  navItems,
  activeKey,
  mobileOpen = false,
  onClose = () => {},
  brandTitle = 'EduSaaS',
  brandSubtitle = 'AI Exam Engine',
  workspaceTitle = 'Active workspace',
  workspaceSubtitle = 'Connected teacher profile',
  workspaceInitials = 'AP',
  workspaceAccentClassName = 'bg-orange-100',
  workspaceInitialsClassName = 'text-orange-600',
}) {
  const adminNavItems = navItems.filter((item) => item.adminOnly)

  useEffect(() => {
    if (typeof document === 'undefined' || !mobileOpen) {
      return undefined
    }

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = overflow
    }
  }, [mobileOpen])

  const renderNavItem = (item) => {
    const active = item.key === activeKey
    const sharedClassName = `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
      active
        ? 'bg-blue-50 text-blue-600'
        : 'text-slate-600 hover:bg-slate-50'
    } ${item.disabled ? 'cursor-not-allowed opacity-50' : ''}`

    if (item.disabled) {
      return (
        <button
          key={item.key}
          type="button"
          disabled
          title="Coming soon"
          className={sharedClassName}
        >
          <SidebarIcon type={item.icon} active={active} />
          {item.label}
        </button>
      )
    }

    return (
      <a
        key={item.key}
        href={item.href}
        onClick={onClose}
        className={sharedClassName}
      >
        <SidebarIcon type={item.icon} active={active} />
        {item.label}
      </a>
    )
  }

  const renderSidebarContent = ({ mobile = false } = {}) => (
    <>
      <div className="flex items-center justify-between gap-3 px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-200">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{brandTitle}</h1>
            <p className="text-xs font-semibold text-slate-400">{brandSubtitle}</p>
          </div>
        </div>

        {mobile ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1.5 px-4 pt-4">
        {navItems.filter((item) => !item.adminOnly).map(renderNavItem)}

        {adminNavItems.length ? (
          <>
            <div className="mt-8 px-4 pb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Administration</p>
            </div>

            {adminNavItems.map(renderNavItem)}
          </>
        ) : null}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${workspaceAccentClassName}`}>
            <span className={`text-sm font-bold ${workspaceInitialsClassName}`}>{workspaceInitials}</span>
          </div>
          <div className="min-w-0 overflow-hidden">
            <p className="truncate text-sm font-bold text-slate-900">{workspaceTitle}</p>
            <p className="truncate text-xs font-medium text-slate-500">{workspaceSubtitle}</p>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-[260px] flex-col border-r border-slate-200 bg-white transition-all xl:flex">
        {renderSidebarContent()}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px]"
          />
          <aside className="relative flex h-full w-[280px] max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-2xl">
            {renderSidebarContent({ mobile: true })}
          </aside>
        </div>
      ) : null}
    </>
  )
}

export function TeacherTopbar({ onOpenSidebar = () => {} }) {
  const [notificationsState, setNotificationsState] = useState({
    loading: true,
    error: '',
    data: [],
    unreadCount: 0,
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const fetchNotifications = async ({ quiet = false } = {}) => {
    if (!quiet) {
      setNotificationsState((current) => ({
        ...current,
        loading: true,
        error: '',
      }))
    }

    try {
      const response = await getTeacherNotifications({ limit: 8 })
      const payload = response.data?.data || {}
      const items = Array.isArray(payload.items) ? payload.items.map(normalizeTeacherNotification) : []

      setNotificationsState({
        loading: false,
        error: '',
        data: items,
        unreadCount: Number(payload.unreadCount) || 0,
      })
    } catch (error) {
      setNotificationsState({
        loading: false,
        error: error.response?.data?.message || error.message || 'Failed to load notifications.',
        data: [],
        unreadCount: 0,
      })
    }
  }

  useEffect(() => {
    let active = true

    const loadNotifications = async () => {
      if (!active) {
        return
      }

      await fetchNotifications()
    }

    loadNotifications()

    const intervalId = window.setInterval(() => {
      if (active) {
        void fetchNotifications({ quiet: true })
      }
    }, 60000)

    const handleDocumentClick = (event) => {
      if (!menuRef.current) {
        return
      }

      if (!menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleDocumentClick)

    return () => {
      active = false
      window.clearInterval(intervalId)
      document.removeEventListener('mousedown', handleDocumentClick)
    }
  }, [])

  const handleToggleMenu = () => {
    setMenuOpen((currentOpen) => {
      const nextOpen = !currentOpen

      if (nextOpen && notificationsState.loading === false) {
        void fetchNotifications({ quiet: true })
      }

      return nextOpen
    })
  }

  const handleMarkRead = async (notification) => {
    if (!notification?.id || notification.status === 'read') {
      return
    }

    try {
      await markTeacherNotificationRead(notification.id)
      await fetchNotifications({ quiet: true })
    } catch (error) {
      setNotificationsState((current) => ({
        ...current,
        error: error.response?.data?.message || error.message || 'Failed to update notification.',
      }))
    }
  }

  const handleMarkAllRead = async () => {
    if (!notificationsState.unreadCount) {
      setMenuOpen(false)
      return
    }

    try {
      await markAllTeacherNotificationsRead()
      await fetchNotifications({ quiet: true })
    } catch (error) {
      setNotificationsState((current) => ({
        ...current,
        error: error.response?.data?.message || error.message || 'Failed to update notifications.',
      }))
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Open navigation menu"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 xl:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <div className="relative min-w-0 flex-1 sm:max-w-[500px]">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
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
        </div>

        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={handleToggleMenu}
            aria-expanded={menuOpen}
            aria-label="Teacher notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-50"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {notificationsState.unreadCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white">
                {notificationsState.unreadCount > 9 ? '9+' : notificationsState.unreadCount}
              </span>
            ) : null}
          </button>

          {menuOpen ? (
            <div className="absolute right-0 top-12 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_60px_rgba(15,23,42,0.18)] sm:w-[370px]">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.26em] text-slate-400">Notifications</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {notificationsState.unreadCount} unread
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-[420px] overflow-y-auto">
                {notificationsState.loading ? (
                  <div className="space-y-3 p-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                        <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-100" />
                        <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                      </div>
                    ))}
                  </div>
                ) : notificationsState.error ? (
                  <div className="p-4">
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {notificationsState.error}
                    </div>
                  </div>
                ) : notificationsState.data.length ? (
                  <div className="divide-y divide-slate-100">
                    {notificationsState.data.map((notification) => {
                      const isUnread = notification.status !== 'read'

                      return (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => void handleMarkRead(notification)}
                          className={`block w-full px-4 py-4 text-left transition hover:bg-slate-50 ${
                            isUnread ? 'bg-sky-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                                isUnread ? 'bg-sky-500' : 'bg-slate-300'
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-bold text-slate-900">{notification.title}</p>
                                <span className="whitespace-nowrap text-[11px] font-semibold text-slate-400">
                                  {notification.createdAtLabel}
                                </span>
                              </div>
                              {notification.message ? (
                                <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
                              ) : null}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="px-4 py-10 text-center">
                    <p className="text-sm font-bold text-slate-900">No notifications yet</p>
                    <p className="mt-2 text-sm text-slate-500">New notifications from your institute will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
          </div>
          <a
            href="/teacher/generate-paper"
            className="hidden h-11 items-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 sm:flex"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Quick Generate
          </a>
          <a
            href="/logout"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Logout
          </a>
        </div>
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

export function ActionCard({ icon, label, href, iconBg, disabled = false }) {
  const content = (
    <>
      <div className="flex items-center gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${iconBg}`}>
          {icon}
        </div>
        <span className="text-[15px] font-bold text-slate-800">{label}</span>
      </div>
      {disabled ? (
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
          Coming soon
        </span>
      ) : (
        <svg className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </>
  )

  if (disabled) {
    return (
      <div
        aria-disabled="true"
        title="Coming soon"
        className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 opacity-75 shadow-sm transition-all"
      >
        {content}
      </div>
    )
  }

  return (
    <a 
      href={href}
      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:border-blue-100 hover:shadow-lg hover:shadow-blue-50/50 group"
    >
      {content}
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
