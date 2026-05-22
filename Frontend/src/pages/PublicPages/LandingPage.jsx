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

function LandingPage() {
  return (
    <main className="relative min-h-screen bg-slate-50 text-slate-900">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-indigo-50/70 to-transparent" />

      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col flex-1 items-center justify-center text-center gap-10 py-10 lg:py-16">
          <div className="max-w-3xl flex flex-col items-center">
            <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              One platform for teachers and institutes.
            </h2>

            <p className="mt-6 text-base leading-7 text-slate-600 sm:text-lg">
              Register as a teacher or institute admin, log in with secured access, and land on the exact dashboard
              your role is allowed to use.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
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

            <div className="mt-10 grid gap-4 sm:grid-cols-3 text-left">
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
        </div>

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

        <section className="pb-6">
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
