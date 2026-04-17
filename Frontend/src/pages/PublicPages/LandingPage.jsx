import { getLoginPathForRole, getRegisterPathForRole, getRoleLabel } from '../../utils/auth'

const roleCards = [
  {
    role: 'teacher',
    title: 'Teacher Workspace',
    description: 'Build, update, and manage question banks from a protected dashboard.',
    accent: 'bg-sky-500',
    soft: 'bg-sky-50',
  },
  {
    role: 'instituteAdmin',
    title: 'Institute Console',
    description: 'Invite teachers, send notifications, and track activity from one command center.',
    accent: 'bg-emerald-500',
    soft: 'bg-emerald-50',
  },
  {
    role: 'Admin',
    title: 'Platform Control',
    description: 'Oversee institute onboarding and keep the platform organized at the top level.',
    accent: 'bg-amber-500',
    soft: 'bg-amber-50',
  },
]

const highlights = [
  {
    label: 'Role-based JWT auth',
    value: 'Secure access',
    detail: 'Every route is gated by the exact role it belongs to.',
  },
  {
    label: 'Teacher tools',
    value: 'Paper-ready',
    detail: 'Question bank tools, PDF export, and generation flows.',
  },
  {
    label: 'Institute actions',
    value: 'Invite + notify',
    detail: 'Invite teachers and send updates from one place.',
  },
]

const workflowSteps = [
  {
    step: '01',
    title: 'Choose your role',
    detail: 'Teachers, institute admins, and platform admins each land on their own flow.',
  },
  {
    step: '02',
    title: 'Authenticate',
    detail: 'Sign in with email and password, or use Google where supported.',
  },
  {
    step: '03',
    title: 'Start working',
    detail: 'The app routes you straight into the dashboard and tools you can actually use.',
  },
]

const metrics = [
  { label: 'Protected roles', value: '3' },
  { label: 'Teacher workspace', value: 'Question bank' },
  { label: 'Institute actions', value: 'Invites + notifications' },
  { label: 'Platform access', value: 'Admin login only' },
]

const roleAccess = [
  { role: 'Teacher', access: 'Register + Login', path: getRegisterPathForRole('teacher') },
  { role: 'Institute Admin', access: 'Register + Login', path: getRegisterPathForRole('instituteAdmin') },
  { role: 'System Admin', access: 'Login only', path: getLoginPathForRole('Admin') },
]

function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Preview</p>
            <h3 className="mt-1 text-lg font-black tracking-tight text-slate-900">Dashboard experience</h3>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-700">
            Light SaaS
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {metrics.slice(0, 3).map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">{metric.label}</p>
              <p className="mt-2 text-sm font-black text-slate-900">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Recent activity</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Teacher joined the institute</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              Active
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { label: 'Question bank updates', tone: 'bg-sky-500' },
              { label: 'Invite sent', tone: 'bg-emerald-500' },
              { label: 'Notification delivered', tone: 'bg-indigo-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5">
                <span className={`h-2.5 w-2.5 rounded-full ${item.tone}`} />
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function LandingPage() {
  return (
    <main className="relative min-h-screen bg-slate-50 text-slate-900">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-indigo-50/70 to-transparent" />

      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-30 rounded-[1.75rem] border border-slate-200 bg-white/90 px-5 py-4 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-slate-400">AutoPaper</p>
                <h1 className="mt-1 text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                  Smart Question Paper Generator
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href={getLoginPathForRole('teacher')}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Teacher Login
              </a>
              <a
                href={getRegisterPathForRole('teacher')}
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Teacher Register
              </a>
              <a
                href={getRegisterPathForRole('instituteAdmin')}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Institute Admin Register
              </a>
              <a
                href={getLoginPathForRole('Admin')}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                System Admin Login
              </a>
            </div>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.05fr,0.95fr] lg:py-16">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-indigo-700">
                Protected by role-based JWT auth
              </span>
              <span className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-slate-600">
                Built for teachers and institutes
              </span>
            </div>

            <h2 className="mt-6 max-w-2xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              One platform for teachers, institutes, and platform admins.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Register as a teacher or institute admin, log in with JWT-backed access, and land on the exact dashboard
              your role is allowed to use. System admins can only log in.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={getRegisterPathForRole('teacher')}
                className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-black text-white transition hover:bg-indigo-700"
              >
                Start as a Teacher
              </a>
              <a
                href={getRegisterPathForRole('instituteAdmin')}
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-black text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Start as Institute Admin
              </a>
              <a
                href={getLoginPathForRole('Admin')}
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-black text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Platform Admin Login
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <article
                  key={item.label}
                  className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                  <p className="mt-3 text-lg font-black tracking-tight text-slate-900">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <DashboardPreview />
        </div>

        <section className="grid gap-4 pb-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className="rounded-[1.75rem] border border-slate-200 bg-white px-5 py-4 shadow-sm"
            >
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">{metric.label}</p>
              <p className="mt-2 text-lg font-black tracking-tight text-slate-900">{metric.value}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-5 pb-6 lg:grid-cols-3">
          {roleCards.map((card) => (
            <article
              key={card.role}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className={`h-1.5 w-20 rounded-full ${card.accent}`} />
              <div className={`mt-5 inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] ${card.soft} text-slate-700`}>
                {getRoleLabel(card.role)}
              </div>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={card.role === 'Admin' ? getLoginPathForRole('Admin') : getRegisterPathForRole(card.role)}
                  className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                  {card.role === 'Admin' ? 'Login' : 'Register'}
                </a>
                <a
                  href={getLoginPathForRole(card.role)}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  View Login
                </a>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-5 pb-6 lg:grid-cols-[0.9fr,1.1fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-indigo-600">Access map</p>
            <div className="mt-4 space-y-3">
              {roleAccess.map((item) => (
                <a
                  key={item.role}
                  href={item.path}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300 hover:bg-white"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.role}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.access}</p>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Open</span>
                </a>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-indigo-600">How it works</p>
            <div className="mt-4 space-y-4">
              {workflowSteps.map((item) => (
                <div key={item.step} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-sm font-black text-indigo-700">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <footer className="flex flex-col gap-4 border-t border-slate-200 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p className="font-medium">AutoPaper keeps the teacher-first workflow sharp, simple, and secure.</p>
          <div className="flex flex-wrap gap-3">
            <a href={getLoginPathForRole('teacher')} className="transition hover:text-slate-900">
              Teacher Login
            </a>
            <a href={getLoginPathForRole('instituteAdmin')} className="transition hover:text-slate-900">
              Institute Admin Login
            </a>
            <a href={getLoginPathForRole('Admin')} className="transition hover:text-slate-900">
              Platform Admin Login
            </a>
          </div>
        </footer>
      </section>
    </main>
  )
}

export default LandingPage
