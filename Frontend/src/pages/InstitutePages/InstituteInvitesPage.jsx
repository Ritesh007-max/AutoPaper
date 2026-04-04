import { useEffect, useState } from 'react'

import SectionCard from '../../components/SectionCard'
import InstituteLayout from '../../components/InstituteLayout'
import { InviteTable, SectionHeader } from '../../components/InstituteDashboardUi'
import {
  createInstituteTeacher,
  getInstituteInvites,
  resendInstituteInvite,
} from '../../api/institute'
import { formatNumber, formatShortDate } from '../../utils/instituteFormatters'

const initialState = {
  loading: true,
  error: '',
  data: [],
}

const defaultTeacherForm = {
  name: '',
  email: '',
  password: '',
  role: 'teacher',
  institutionUid: '',
}

const normalizeInvite = (invite = {}) => ({
  id: invite.id || invite._id || invite.email || crypto.randomUUID(),
  email: invite.email || '',
  status: invite.status || 'pending',
  resendCount: Number(invite.resendCount) || 0,
  lastSentAt: invite.lastSentAt || null,
  expiresAt: invite.expiresAt || null,
  expiresAtLabel: formatShortDate(invite.expiresAt),
})

function InstituteInvitesPage() {
  const [state, setState] = useState(initialState)
  const [resendingInviteId, setResendingInviteId] = useState('')
  const [teacherForm, setTeacherForm] = useState(defaultTeacherForm)
  const [teacherFormStatus, setTeacherFormStatus] = useState({ type: '', message: '' })
  const [teacherAction, setTeacherAction] = useState('')

  const loadInvites = async () => {
    setState((current) => ({
      ...current,
      loading: true,
    }))

    try {
      const response = await getInstituteInvites()
      const payload = response.data?.data
      const invites = Array.isArray(payload) ? payload.map(normalizeInvite) : []

      setState({
        loading: false,
        error: '',
        data: invites,
      })
    } catch (error) {
      setState({
        loading: false,
        error: error.response?.data?.message || error.message || 'Failed to load invites.',
        data: [],
      })
    }
  }

  useEffect(() => {
    loadInvites()
  }, [])

  const handleTeacherFormChange = (event) => {
    const { name, value } = event.target
    setTeacherForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const resetTeacherForm = () => {
    setTeacherForm(defaultTeacherForm)
  }

  const submitTeacherForm = async (sendEmail) => {
    const payload = {
      ...teacherForm,
      role: 'teacher',
      sendEmail,
    }

    if (!payload.name.trim() || !payload.email.trim() || !payload.password.trim()) {
      setTeacherFormStatus({
        type: 'error',
        message: 'Name, email, and password are required.',
      })
      return
    }

    setTeacherAction(sendEmail ? 'send' : 'save')
    setTeacherFormStatus({
      type: '',
      message: '',
    })

    try {
      const response = await createInstituteTeacher(payload)
      const teacherUid = response.data?.data?.teacherUid
      const inviteStatus = response.data?.data?.inviteStatus
      const message = sendEmail
        ? `Teacher saved and invitation email sent. UID: ${teacherUid || 'generated'}`
        : `Teacher saved successfully. UID: ${teacherUid || 'generated'}`

      setTeacherFormStatus({
        type: 'success',
        message,
      })

      if (sendEmail) {
        await loadInvites()
      }

      resetTeacherForm()

      if (inviteStatus) {
        setState((current) => ({
          ...current,
          error: '',
        }))
      }
    } catch (error) {
      setTeacherFormStatus({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to save teacher.',
      })
    } finally {
      setTeacherAction('')
    }
  }

  const handleResend = async (invite) => {
    if (!invite?.id || invite.status !== 'pending') {
      return
    }

    setResendingInviteId(invite.id)

    try {
      await resendInstituteInvite(invite.id)

      setState((current) => ({
        ...current,
        data: current.data.map((row) => (
          row.id === invite.id
            ? { ...row, resendCount: row.resendCount + 1, lastSentAt: new Date().toISOString() }
            : row
        )),
      }))
    } catch {
      setState((current) => ({
        ...current,
        error: 'Unable to resend the invite right now.',
      }))
    } finally {
      setResendingInviteId('')
    }
  }

  const pendingCount = state.data.filter((invite) => invite.status === 'pending').length

  return (
    <InstituteLayout
      activeKey="invites"
      title="Invites"
      description="Manage pending, accepted, and expired invitations without mixing this flow with teacher routes."
    >
      <div className="space-y-6">
        <section className="grid gap-6 xl:grid-cols-[0.92fr,1.08fr]">
          <SectionCard>
            <SectionHeader
              eyebrow="Teacher invite"
              title="Add a teacher"
              description="Create a teacher record now and optionally send the login UID by email."
            />

            <div className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Name</span>
                  <input
                    name="name"
                    value={teacherForm.name}
                    onChange={handleTeacherFormChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
                    placeholder="Teacher name"
                  />
                </label>

                <label className="space-y-2">
                  <span className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Email</span>
                  <input
                    name="email"
                    type="email"
                    value={teacherForm.email}
                    onChange={handleTeacherFormChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
                    placeholder="teacher@example.com"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Temporary Password</span>
                  <input
                    name="password"
                    type="password"
                    value={teacherForm.password}
                    onChange={handleTeacherFormChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
                    placeholder="Set a temp password"
                  />
                </label>

                <label className="space-y-2">
                  <span className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Role</span>
                  <input
                    name="role"
                    value="teacher"
                    readOnly
                    className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none"
                  />
                </label>
              </div>

              <label className="space-y-2">
                <span className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Institute UID</span>
                <input
                  name="institutionUid"
                  value={teacherForm.institutionUid}
                  onChange={handleTeacherFormChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
                  placeholder="Enter institute UID"
                />
                <p className="text-xs text-slate-500">
                  The teacher UID will be derived from this institute UID.
                </p>
              </label>

              {teacherFormStatus.message ? (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    teacherFormStatus.type === 'error'
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {teacherFormStatus.message}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => submitTeacherForm(false)}
                  disabled={teacherAction === 'save'}
                  className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {teacherAction === 'save' ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => submitTeacherForm(true)}
                  disabled={teacherAction === 'send'}
                  className="rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {teacherAction === 'send' ? 'Sending...' : 'Send'}
                </button>
                <button
                  type="button"
                  onClick={resetTeacherForm}
                  className="rounded-full border border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
                >
                  Reset
                </button>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeader
              eyebrow="Invitation queue"
              title="Pending invites"
              description="Resend invitations when a teacher has not yet joined the institute."
              action={<p className="text-sm font-semibold text-slate-500">{state.loading ? 'Loading...' : `${formatNumber(pendingCount)} pending`}</p>}
            />

            <div className="mt-6">
              <InviteTable
                invites={state.data}
                loading={state.loading}
                error={state.error}
                onResend={handleResend}
                resendingId={resendingInviteId}
              />
            </div>
          </SectionCard>
        </section>
      </div>
    </InstituteLayout>
  )
}

export default InstituteInvitesPage
