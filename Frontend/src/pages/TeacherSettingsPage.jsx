import SectionCard from '../components/SectionCard'

const settingsRows = [
  { label: 'Default class', value: 'Grade 10', note: 'Used while creating questions' },
  { label: 'Default subject', value: 'Physics', note: 'Auto-selected in forms' },
  { label: 'Paper watermark', value: 'Enabled', note: 'Appears in paper preview output' },
  { label: 'Notifications', value: 'Email + In-app', note: 'For upload and validation status' },
]

function TeacherSettingsPage() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr,1fr]">
      <SectionCard>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Teacher Settings</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Profile and defaults</h1>
        <p className="mt-2 text-sm text-slate-600">
          Settings panel UI is prepared so we can connect real profile data in the next step.
        </p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          {settingsRows.map((row) => (
            <div key={row.label} className="border-b border-slate-200 bg-white px-4 py-3 last:border-b-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">{row.label}</p>
                <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                  {row.value}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{row.note}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Coming Next</p>
        <h2 className="mt-2 text-xl font-black text-slate-900">Settings integrations</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            Connect teacher profile API.
          </li>
          <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            Save form defaults per subject and class.
          </li>
          <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            Alert preferences with real notification channels.
          </li>
        </ul>
      </SectionCard>
    </div>
  )
}

export default TeacherSettingsPage
