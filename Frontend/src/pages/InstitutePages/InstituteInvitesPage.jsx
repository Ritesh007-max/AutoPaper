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
import { getStoredAuth } from '../../utils/auth'

const INSTITUTE_UID_STORAGE_KEY = 'autoPaper.institutionUid'

const initialState = {
  loading: true,
  error: '',
  data: [],
}

const getInitialInstitutionUid = () => {
  if (typeof window === 'undefined') {
    return ''
  }

  const authInstitutionUid = getStoredAuth()?.user?.institutionUid?.trim()
  if (authInstitutionUid) {
    return authInstitutionUid
  }

  const searchParams = new URLSearchParams(window.location.search)
  const fromQuery = searchParams.get('institutionUid')?.trim()

  if (fromQuery) {
    return fromQuery
  }

  return window.localStorage.getItem(INSTITUTE_UID_STORAGE_KEY)?.trim() || ''
}

const defaultTeacherForm = {
  name: '',
  email: '',
  role: 'teacher',
  institutionUid: getInitialInstitutionUid(),
}

const initialInstitutionUid = defaultTeacherForm.institutionUid

const normalizeInvite = (invite = {}) => ({
  id: invite.id || invite._id || invite.email || crypto.randomUUID(),
  name: invite.name || '',
  email: invite.email || '',
  teacherUid: invite.teacherUid || '',
  status: invite.status || 'pending',
  resendCount: Number(invite.resendCount) || 0,
  lastSentAt: invite.lastSentAt || null,
  expiresAt: invite.expiresAt || null,
  expiresAtLabel: formatShortDate(invite.expiresAt),
})

const deriveTeacherUidBase = (institutionUid = '') => {
  const normalized = String(institutionUid || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(-8)
    .toUpperCase()

  return normalized || 'AUTO'
}

function InstituteInvitesPage() {
  const [state, setState] = useState(initialState)
  const [resendingInviteId, setResendingInviteId] = useState('')
  const [teacherForm, setTeacherForm] = useState(defaultTeacherForm)
  const [teacherFormStatus, setTeacherFormStatus] = useState({ type: '', message: '' })
  const [teacherAction, setTeacherAction] = useState('')
  const teacherUidPreview = `${deriveTeacherUidBase(teacherForm.institutionUid)}-XXXXXX`

  const loadInvites = async (institutionUid = '') => {
    setState((current) => ({
      ...current,
      loading: true,
    }))

    try {
      const response = await getInstituteInvites(institutionUid ? { institutionUid } : undefined)
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
    loadInvites(initialInstitutionUid)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (teacherForm.institutionUid) {
      window.localStorage.setItem(INSTITUTE_UID_STORAGE_KEY, teacherForm.institutionUid)
    }
  }, [teacherForm.institutionUid])

  const handleTeacherFormChange = (event) => {
    const { name, value } = event.target
    setTeacherForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const resetTeacherForm = () => {
    setTeacherForm({
      ...defaultTeacherForm,
      institutionUid: getInitialInstitutionUid(),
    })
  }

  const submitTeacherForm = async (sendEmail) => {
    const payload = {
      name: teacherForm.name.trim(),
      email: teacherForm.email.trim(),
      role: 'teacher',
      institutionUid: teacherForm.institutionUid.trim(),
      sendEmail,
    }

    if (!payload.name || !payload.email) {
      setTeacherFormStatus({
        type: 'error',
        message: 'Name and email are required.',
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
      const message = sendEmail
        ? `Teacher invite sent successfully. Registration code: ${teacherUid || 'generated'}`
        : `Teacher invite saved successfully. Registration code: ${teacherUid || 'generated'}`

      setTeacherFormStatus({
        type: 'success',
        message,
      })

      await loadInvites(payload.institutionUid)

      resetTeacherForm()
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
    if (!invite?.id || invite.status === 'accepted') {
      return
    }

    setResendingInviteId(invite.id)

    try {
      await resendInstituteInvite(invite.id)
      await loadInvites(teacherForm.institutionUid.trim())
      setTeacherFormStatus({
        type: 'success',
        message: invite.status === 'draft' ? 'Teacher invite sent successfully.' : 'Teacher invite resent successfully.',
      })
    } catch (error) {
      setTeacherFormStatus({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to resend invite.',
      })
    } finally {
      setResendingInviteId('')
    }
  }

  const openInviteCount = state.data.filter((invite) => invite.status !== 'accepted').length

  return (
    <InstituteLayout
      activeKey="invites"
      title="Invite Teachers"
      description="Create a teacher invite, send the registration code by email, and keep the invite queue visible in one place."
    >
      <div className="space-y-6">
        <section className="grid gap-6 xl:grid-cols-[0.92fr,1.08fr]">
          <SectionCard>
            <SectionHeader
              eyebrow="Teacher invite"
              title="Add a teacher"
              description="Create a teacher invite now and optionally send the registration code by email."
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
                  placeholder="Enter or auto-fill institute UID"
                />
                <p className="text-xs text-slate-500">
                  The registration code is generated from this institute UID and the teacher email.
                </p>
                <p className="text-xs font-semibold text-slate-700">
                  Code preview: <span className="font-black text-slate-900">{teacherUidPreview}</span>
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
                  {teacherAction === 'save' ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  type="button"
                  onClick={() => submitTeacherForm(true)}
                  disabled={teacherAction === 'send'}
                  className="rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {teacherAction === 'send' ? 'Sending...' : 'Send Invite'}
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
              title="Open invites"
              description="Send or resend invitations until the teacher joins the institute."
              action={<p className="text-sm font-semibold text-slate-500">{state.loading ? 'Loading...' : `${formatNumber(openInviteCount)} open`}</p>}
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
