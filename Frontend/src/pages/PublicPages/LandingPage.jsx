import { getLoginPathForRole, getRegisterPathForRole, getRoleLabel } from '../../utils/auth'

const featureCards = [
  {
    title: 'Teacher workspace',
    description: 'Build, filter, update, and remove question banks from a protected dashboard.',
    tone: 'sky',
  },
  {
    title: 'Institute console',
    description: 'Invite teachers, monitor activity, and keep every institute record in one place.',
    tone: 'emerald',
  },
  {
    title: 'Platform control',
    description: 'System admins can manage institute invitations and oversee the platform.',
    tone: 'amber',
  },
]

const toneStyles = {
  sky: 'from-sky-500/15 to-cyan-500/10 border-sky-200/70',
  emerald: 'from-emerald-500/15 to-teal-500/10 border-emerald-200/70',
  amber: 'from-amber-500/15 to-orange-500/10 border-amber-200/70',
}

function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.28),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.2),_transparent_30%),linear-gradient(180deg,_#0f172a_0%,_#020617_100%)]" />
      <div className="absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="absolute right-[-6rem] top-16 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />

      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.32em] text-sky-300">AutoPaper</p>
            <h1 className="mt-1 text-xl font-black tracking-tight text-white">Smart Question Paper Generator</h1>
          </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={getLoginPathForRole('teacher')}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                Teacher Login
              </a>
              <a
                href={getRegisterPathForRole('teacher')}
                className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
              >
                Start Free
              </a>
              <a
                href={getRegisterPathForRole('instituteAdmin')}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                Institute Admin Register
              </a>
              <a
                href={getLoginPathForRole('Admin')}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                System Admin Login
              </a>
            </div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.1fr,0.9fr] lg:py-16">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.22em] text-sky-200">
              Protected by role-based JWT auth
            </p>
            <h2 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              One platform for teachers, institutes, and platform admins.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Register as a teacher or institute admin, log in with JWT-backed access, and land on the exact dashboard
              your role is allowed to use. System admins can only log in.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={getLoginPathForRole('teacher')}
                className="rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
              >
                Teacher Login
              </a>
              <a
                href={getRegisterPathForRole('teacher')}
                className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Teacher Register
              </a>
              <a
                href={getLoginPathForRole('instituteAdmin')}
                className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Institute Admin Login
              </a>
              <a
                href={getLoginPathForRole('Admin')}
                className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                System Admin Login
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {featureCards.map((card) => (
                <article
                  key={card.title}
                  className={`rounded-3xl border bg-gradient-to-br ${toneStyles[card.tone]} p-5 backdrop-blur`}
                >
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-white">{card.title}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-200">{card.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <article className="rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-200">Role map</p>
              <div className="mt-4 space-y-3">
                {['teacher', 'instituteAdmin', 'Admin'].map((role) => (
                  <div
                    key={role}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3"
                  >
                    <span className="text-sm font-semibold text-white">{getRoleLabel(role)}</span>
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
                      {role === 'Admin' ? 'Login only' : 'Register + Login'}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-200">What happens next</p>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <li>1. Register or log in with your role.</li>
                <li>2. JWT stores your identity and permissions securely.</li>
                <li>3. You land on the dashboard that matches your access level.</li>
              </ol>
            </article>
          </div>
        </div>
      </section>
    </main>
  )
}

export default LandingPage
