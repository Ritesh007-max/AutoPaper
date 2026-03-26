function SectionCard({ children }) {
  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur md:p-8">
      {children}
    </section>
  )
}

export default SectionCard
