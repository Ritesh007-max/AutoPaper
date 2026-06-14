function TeacherNavbar() {
  const links = [
    { href: '/teacher/upload-single-question', label: 'Upload Question' },
    { href: '/teacher/upload-bulk-questions', label: 'Bulk Upload' },
    { href: '/teacher/fetch-questions', label: 'Fetch Questions' },
    { href: '/teacher/update-questions', label: 'Update Questions' },
    { href: '/teacher/delete-questions', label: 'Delete Questions' },
  ]

  return (
    <nav className="card-base p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <p className="mr-2 text-xs font-bold uppercase tracking-widest text-text-secondary">Teacher Section</p>
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="btn btn-md btn-secondary"
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  )
}

export default TeacherNavbar
