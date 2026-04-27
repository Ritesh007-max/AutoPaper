import { useEffect, useState } from 'react'

import { createInstituteNotification, getInstituteNotifications } from '../../api/institute'
import SectionCard from '../../components/SectionCard'
import InstituteLayout from '../../components/InstituteLayout'
import { SectionHeader, StatusBadge } from '../../components/InstituteDashboardUi'
import { formatLongDateTime, formatNumber, formatRelativeTime } from '../../utils/instituteFormatters'
import { getStoredAuth } from '../../utils/auth'

const initialState = {
  loading: true,
  error: '',
  data: [],
}

const initialForm = {
  title: '',
  message: '',
}

const normalizeNotification = (notification = {}) => ({
  id: notification.id || notification._id || crypto.randomUUID(),
  batchId: notification.batchId || '',
  title: notification.title || 'Notification',
  message: notification.message || '',
  createdByName: notification.createdByName || 'Institute Admin',
  recipientCount: Number(notification.recipientCount) || 0,
  readCount: Number(notification.readCount) || 0,
  unreadCount: Number(notification.unreadCount) || 0,
  sentAt: notification.sentAt || notification.createdAt || null,
  sentAtLabel: formatLongDateTime(notification.sentAt || notification.createdAt),
  timeLabel: formatRelativeTime(notification.sentAt || notification.createdAt),
})

function InstituteNotificationsPage() {
  const [state, setState] = useState(initialState)
  const [form, setForm] = useState(initialForm)
  const [formStatus, setFormStatus] = useState({ type: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const instituteName = getStoredAuth()?.user?.institutionName || 'your institute'

  const loadNotifications = async () => {
    setState((current) => ({
      ...current,
      loading: true,
    }))

    try {
      const response = await getInstituteNotifications({ limit: 12 })
      const payload = Array.isArray(response.data?.data) ? response.data.data.map(normalizeNotification) : []

      setState({
        loading: false,
        error: '',
        data: payload,
      })
    } catch (error) {
      setState({
        loading: false,
        error: error.response?.data?.message || error.message || 'Failed to load notifications.',
        data: [],
      })
    }
  }

  useEffect(() => {
    loadNotifications()
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

  const handleSubmit = async (event) => {
    event.preventDefault()

    const title = form.title.trim()
    const message = form.message.trim()

    if (!title || !message) {
      setFormStatus({
        type: 'error',
        message: 'Both title and message are required.',
      })
      return
    }

    setSubmitting(true)
    setFormStatus({ type: '', message: '' })

    try {
      const response = await createInstituteNotification({ title, message })
      const recipientCount = Number(response.data?.data?.recipientCount) || 0

      setFormStatus({
        type: 'success',
        message: recipientCount
          ? `Notification sent to ${recipientCount} teacher${recipientCount === 1 ? '' : 's'}.`
          : 'Notification sent successfully.',
      })
      resetForm()
      await loadNotifications()
    } catch (error) {
      setFormStatus({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to send notification.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <InstituteLayout
      activeKey="notifications"
      title="Notifications"
      description={`Send broadcast notifications to every teacher in ${instituteName}. Teachers will see them in the bell icon inside the teacher section.`}
    >
      <div className="space-y-6">
        <section className="grid gap-6 xl:grid-cols-[0.92fr,1.08fr]">
          <SectionCard>
            <SectionHeader
              eyebrow="Create notification"
              title="Send to teachers"
              description="Use this form to broadcast an update to every teacher in your institute."
            />

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Title
                </span>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
                  placeholder="Staff meeting reminder"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Message
                </span>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows="6"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
                  placeholder="Share the update your teachers need to see."
                />
              </label>

              {formStatus.message ? (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    formStatus.type === 'error'
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {formStatus.message}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Sending...' : 'Send notification'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Clear
                </button>
              </div>
            </form>
          </SectionCard>

          <SectionCard>
            <SectionHeader
              eyebrow="Teacher inbox"
              title="How it appears"
              description="Each teacher sees the latest messages in the notifications bell inside the teacher workspace."
              action={<p className="text-sm font-semibold text-slate-500">{state.loading ? 'Loading...' : `${formatNumber(state.data.length)} sent`}</p>}
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Delivery mode</p>
                <p className="mt-3 text-sm font-semibold text-slate-900">Broadcast to all teachers</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Notifications are copied to every teacher account in the current institute.
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Read tracking</p>
                <p className="mt-3 text-sm font-semibold text-slate-900">Unread and read states</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Teachers can dismiss a notification by opening it in the bell menu.
                </p>
              </div>
            </div>
          </SectionCard>
        </section>

        <SectionCard>
          <SectionHeader
            eyebrow="Recent sends"
            title="Notification history"
            description="Review the latest notification batches and see how many teachers have opened them."
            action={<p className="text-sm font-semibold text-slate-500">{state.loading ? 'Loading...' : `${formatNumber(state.data.length)} batches`}</p>}
          />

          <div className="mt-6">
            {state.loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                    <div className="mt-3 h-3 w-4/5 animate-pulse rounded bg-slate-100" />
                    <div className="mt-5 h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : state.error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {state.error}
              </div>
            ) : state.data.length ? (
              <div className="space-y-4">
                {state.data.map((notification) => (
                  <div key={notification.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-black text-slate-900">{notification.title}</h3>
                          <StatusBadge status="active" />
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{notification.message}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                          {notification.timeLabel}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-700">{notification.sentAtLabel}</p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Recipients</p>
                        <p className="mt-2 text-lg font-black text-slate-900">{notification.recipientCount}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Read</p>
                        <p className="mt-2 text-lg font-black text-emerald-600">{notification.readCount}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Unread</p>
                        <p className="mt-2 text-lg font-black text-amber-600">{notification.unreadCount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                <p className="text-sm font-bold text-slate-900">No notifications sent yet</p>
                <p className="mt-2 text-sm text-slate-500">Create the first notification using the form above.</p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </InstituteLayout>
  )
}

export default InstituteNotificationsPage
