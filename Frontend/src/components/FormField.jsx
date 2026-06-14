function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-bold uppercase tracking-widest text-text-secondary">{label}</span>
      {children}
    </label>
  )
}

export default FormField
