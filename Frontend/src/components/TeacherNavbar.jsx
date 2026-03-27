function TeacherNavbar() {
  const links = [
    { href: '/teacher/upload-single-question', label: 'Upload Question' },
    { href: '/teacher/fetch-questions', label: 'Fetch Questions' },
  ]

  return (
    <nav className="rounded-[2rem] border border-white/60 bg-white/85 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur md:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <p className="mr-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Teacher Section</p>
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  )
}

export default TeacherNavbar
