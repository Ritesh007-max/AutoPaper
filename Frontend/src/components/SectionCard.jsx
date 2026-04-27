function SectionCard({ children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 md:p-6">
      {children}
    </section>
  )
}

export default SectionCard
