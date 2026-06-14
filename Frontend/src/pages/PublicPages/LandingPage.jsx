import { getLoginPathForRole, getRegisterPathForRole, getRoleLabel } from '../../utils/auth'

const roleCards = [
  {
    role: 'teacher',
    title: 'Teacher Workspace',
    description: 'Build, update, and manage question banks from a protected dashboard.',
    accent: 'bg-primary',
    soft: 'bg-primary/10 text-primary',
  },
  {
    role: 'instituteAdmin',
    title: 'Institute Console',
    description: 'Invite teachers, send notifications, and track activity from one command center.',
    accent: 'bg-success',
    soft: 'bg-success/10 text-success',
  },
  {
    role: 'Admin',
    title: 'Platform Control',
    description: 'Oversee institute onboarding and keep the platform organized at the top level.',
    accent: 'bg-warning',
    soft: 'bg-warning/10 text-warning',
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
    <main className="relative min-h-screen bg-background text-text-primary">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/5 to-transparent" />

      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col flex-1 items-center justify-center text-center gap-10 py-10 lg:py-16">
          <div className="max-w-3xl flex flex-col items-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl text-text-primary">
              One platform for teachers and institutes.
            </h2>

            <p className="mt-6 text-base leading-7 text-text-secondary sm:text-lg">
              Register as a teacher or institute admin, log in with secured access, and land on the exact dashboard
              your role is allowed to use.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={getRegisterPathForRole('teacher')} className="btn btn-lg btn-primary">
                Start as a Teacher
              </a>
              <a href={getRegisterPathForRole('instituteAdmin')} className="btn btn-lg btn-secondary">
                Start as Institute Admin
              </a>
              <a href={getLoginPathForRole('Admin')} className="btn btn-lg btn-secondary">
                Platform Admin Login
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3 text-left w-full">
              {highlights.map((item) => (
                <article key={item.label} className="card-base p-5">
                  <p className="text-[12px] font-bold uppercase tracking-widest text-neutral">{item.label}</p>
                  <p className="mt-3 text-lg font-bold tracking-tight text-text-primary">{item.value}</p>
                  <p className="mt-2 text-[14px] leading-6 text-text-secondary">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <section className="grid gap-5 pb-6 lg:grid-cols-3">
          {roleCards.map((card) => (
            <article key={card.role} className="card-base card-hoverable p-6">
              <div className={`h-[4px] w-12 rounded-full ${card.accent}`} />
              <div className={`mt-5 inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${card.soft}`}>
                {getRoleLabel(card.role)}
              </div>
              <h3 className="mt-3 text-2xl tracking-tight text-text-primary">{card.title}</h3>
              <p className="mt-3 text-[15px] leading-6 text-text-secondary">{card.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={card.role === 'Admin' ? getLoginPathForRole('Admin') : getRegisterPathForRole(card.role)}
                  className="btn btn-md btn-primary"
                >
                  {card.role === 'Admin' ? 'Login' : 'Register'}
                </a>
                <a href={getLoginPathForRole(card.role)} className="btn btn-md btn-secondary">
                  View Login
                </a>
              </div>
            </article>
          ))}
        </section>

        <section className="pb-6">
          <article className="card-base p-6">
            <p className="text-[12px] font-bold uppercase tracking-widest text-primary">How it works</p>
            <div className="mt-4 space-y-4">
              {workflowSteps.map((item) => (
                <div key={item.step} className="flex gap-4 rounded-xl border border-border bg-surface p-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[14px] font-bold text-primary">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-text-primary">{item.title}</p>
                    <p className="mt-1 text-[14px] leading-6 text-text-secondary">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <footer className="flex flex-col gap-4 border-t border-border py-6 text-[14px] text-text-secondary md:flex-row md:items-center md:justify-between">
          <p className="font-medium">AutoPaper keeps the teacher-first workflow sharp, simple, and secure.</p>
          <div className="flex flex-wrap gap-3">
            <a href={getLoginPathForRole('teacher')} className="transition hover:text-text-primary">
              Teacher Login
            </a>
            <a href={getLoginPathForRole('instituteAdmin')} className="transition hover:text-text-primary">
              Institute Admin Login
            </a>
            <a href={getLoginPathForRole('Admin')} className="transition hover:text-text-primary">
              Platform Admin Login
            </a>
          </div>
        </footer>
      </section>
    </main>
  )
}

export default LandingPage
