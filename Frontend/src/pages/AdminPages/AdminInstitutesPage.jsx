import { useEffect, useState } from 'react'

import SectionCard from '../../components/SectionCard'
import StatusBanner from '../../components/StatusBanner'
import { formatLongDateTime, formatShortDate } from '../../utils/instituteFormatters'
import {
  createInstituteInvite,
  getInstituteInvites,
  resendInstituteInvite,
} from '../../api/admin'

const initialForm = {
  institutionName: '',
  adminName: '',
  adminEmail: '',
  institutionUid: '',
}

const initialState = {
  loading: true,
  error: '',
  data: [],
}

const statusStyles = {
  draft: 'bg-amber-50 text-amber-700 ring-amber-100',
  sent: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
}

const normalizeInvite = (invite = {}) => ({
  id: invite.id || invite._id || invite.adminEmail || crypto.randomUUID(),
  institutionName: invite.institutionName || 'Unnamed Institute',
  adminName: invite.adminName || 'Unnamed Admin',
  adminEmail: invite.adminEmail || '',
  institutionUid: invite.institutionUid || '',
  inviteStatus: invite.inviteStatus || 'draft',
  inviteSentAt: invite.inviteSentAt || null,
  createdAt: invite.createdAt || null,
  inviteSentAtLabel: formatLongDateTime(invite.inviteSentAt || invite.createdAt),
  createdAtLabel: formatShortDate(invite.createdAt),
})

function AdminInstitutesPage() {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [submittingAction, setSubmittingAction] = useState('')
  const [resendingId, setResendingId] = useState('')
  const [state, setState] = useState(initialState)

  const loadInvites = async () => {
    setState((current) => ({
      ...current,
      loading: true,
    }))

    try {
      const response = await getInstituteInvites({ limit: 12 })
      const payload = response.data?.data

      setState({
        loading: false,
        error: '',
        data: Array.isArray(payload) ? payload.map(normalizeInvite) : [],
      })
    } catch (error) {
      setState({
        loading: false,
        error: error.response?.data?.message || error.message || 'Failed to load institute invites.',
        data: [],
      })
    }
  }

  useEffect(() => {
    loadInvites()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const resetForm = () => {
    setForm(initialForm)
  }

  const buildPayload = (sendEmail) => ({
    institutionName: form.institutionName.trim(),
    adminName: form.adminName.trim(),
    adminEmail: form.adminEmail.trim(),
    institutionUid: form.institutionUid.trim(),
    sendEmail,
  })

  const validatePayload = (payload) => {
    if (!payload.institutionName) {
      return 'Institute name is required.'
    }

    if (!payload.adminName) {
      return 'Admin name is required.'
    }

    if (!payload.adminEmail) {
      return 'Admin email is required.'
    }

    return ''
  }

  const submitInvite = async (sendEmail) => {
    const payload = buildPayload(sendEmail)
    const validationError = validatePayload(payload)

    if (validationError) {
      setStatus({ type: 'error', message: validationError })
      return
    }

    setSubmittingAction(sendEmail ? 'send' : 'save')
    setStatus({ type: '', message: '' })

    try {
      const response = await createInstituteInvite(payload)
      const inviteData = response.data?.data

      setStatus({
        type: 'success',
        message: sendEmail
          ? `Institute invite sent successfully. UID: ${inviteData?.institutionUid || 'generated'}`
          : `Institute invite saved successfully. UID: ${inviteData?.institutionUid || 'generated'}`,
      })

      resetForm()
      await loadInvites()
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to create institute invite.',
      })
    } finally {
      setSubmittingAction('')
    }
  }

  const handleResend = async (invite) => {
    if (!invite?.id) {
      return
    }

    setResendingId(invite.id)

    try {
      await resendInstituteInvite(invite.id)
      await loadInvites()
      setStatus({ type: 'success', message: 'Institute invite resent successfully.' })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to resend institute invite.',
      })
    } finally {
      setResendingId('')
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-500">Admin Console</p>
          <div className="max-w-3xl">
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Institute Invitations</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Create and manage institute admin invites from one place. The invite email contains the registration code,
              and the institute admin sets their own password when they register.
            </p>
          </div>
          <a
            href="/logout"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            Logout
          </a>
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.95fr,1.05fr]">
          <SectionCard>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Invite Institute</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Add a new institute</h2>

            <StatusBanner status={status} />

            <form className="mt-5 space-y-4" onSubmit={(event) => event.preventDefault()}>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Institute Name
                </span>
                <input
                  name="institutionName"
                  value={form.institutionName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
                  placeholder="Northcrest Academy"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Admin Name
                  </span>
                  <input
                    name="adminName"
                    value={form.adminName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
                    placeholder="Principal / coordinator"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Admin Email
                  </span>
                  <input
                    name="adminEmail"
                    type="email"
                    value={form.adminEmail}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
                    placeholder="admin@school.edu"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Institute UID
                  </span>
                  <input
                    name="institutionUid"
                    value={form.institutionUid}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
                    placeholder="Leave blank to auto-generate"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => submitInvite(false)}
                  disabled={submittingAction === 'save'}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingAction === 'save' ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  type="button"
                  onClick={() => submitInvite(true)}
                  disabled={submittingAction === 'send'}
                  className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submittingAction === 'send' ? 'Sending...' : 'Send Invite'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
                >
                  Reset
                </button>
              </div>
            </form>
          </SectionCard>

          <SectionCard>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Recent Invites</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Institute invite list</h2>
              </div>
              <button
                type="button"
                onClick={loadInvites}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {state.loading ? (
                <p className="text-sm text-slate-500">Loading institute invites...</p>
              ) : null}

              {state.error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {state.error}
                </div>
              ) : null}

              {!state.loading && state.data.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center text-slate-500">
                  No institute invites found yet.
                </div>
              ) : null}

              {state.data.map((invite) => (
                <article
                  key={invite.id}
                  className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[1.4fr,1fr,0.9fr,0.9fr]"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{invite.institutionName}</p>
                    <p className="mt-1 text-xs text-slate-500">{invite.adminName}</p>
                    <p className="mt-1 text-xs text-slate-500">{invite.adminEmail}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">UID</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">{invite.institutionUid || 'Auto-generated'}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {invite.createdAtLabel ? `Created ${invite.createdAtLabel}` : 'No creation time'}
                    </p>
                  </div>

                  <div className="flex items-start">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ring-1 ${
                        statusStyles[invite.inviteStatus] || statusStyles.draft
                      }`}
                    >
                      {invite.inviteStatus}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 sm:items-end">
                    <p className="text-xs text-slate-500">
                      {invite.inviteSentAtLabel ? `Sent ${invite.inviteSentAtLabel}` : 'Not sent yet'}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleResend(invite)}
                      disabled={resendingId === invite.id}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {resendingId === invite.id ? 'Sending...' : invite.inviteStatus === 'draft' ? 'Send' : 'Resend'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </SectionCard>
        </div>
      </section>
    </main>
  )
}

export default AdminInstitutesPage
