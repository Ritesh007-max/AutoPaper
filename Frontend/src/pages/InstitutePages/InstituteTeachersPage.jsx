import { useEffect, useState } from 'react'

import SectionCard from '../../components/SectionCard'
import InstituteLayout from '../../components/InstituteLayout'
import { SectionHeader, TeacherSnapshotTable } from '../../components/InstituteDashboardUi'
import { formatNumber, formatRelativeTime } from '../../utils/instituteFormatters'
import { deleteInstituteTeacher, getInstituteTeachers } from '../../api/institute'

const initialState = {
  loading: true,
  error: '',
  data: [],
}

const normalizeTeacher = (teacher = {}) => ({
  id: teacher.id || teacher._id || teacher.email || crypto.randomUUID(),
  name: teacher.name || 'Unnamed Teacher',
  email: teacher.email || '',
  questionsAdded: Number(teacher.questionsAdded) || 0,
  papersGenerated: Number(teacher.papersGenerated) || 0,
  lastActive: teacher.lastActive || null,
  lastActiveLabel: formatRelativeTime(teacher.lastActive),
})

function InstituteTeachersPage() {
  const [state, setState] = useState(initialState)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [removingTeacherId, setRemovingTeacherId] = useState('')

  useEffect(() => {
    let active = true

    const loadTeachers = async () => {
      try {
        const response = await getInstituteTeachers({ limit: 20 })
        const payload = response.data?.data
        const teachers = Array.isArray(payload) ? payload.map(normalizeTeacher) : []

        if (!active) {
          return
        }

        setState({
          loading: false,
          error: '',
          data: teachers,
        })
      } catch (error) {
        if (!active) {
          return
        }

        setState({
          loading: false,
          error: error.response?.data?.message || error.message || 'Failed to load teachers.',
          data: [],
        })
      }
    }

    loadTeachers()

    return () => {
      active = false
    }
  }, [])

  const handleRemoveTeacher = async (teacher) => {
    if (!teacher?.id) {
      return
    }

    const confirmed = window.confirm(
      `Remove ${teacher.name || 'this teacher'}? This will permanently delete the teacher account, their questions, notifications, invite record, and related institute activity.`,
    )

    if (!confirmed) {
      return
    }

    setRemovingTeacherId(teacher.id)
    setStatus({ type: '', message: '' })

    try {
      await deleteInstituteTeacher(teacher.id)
      setState((current) => ({
        ...current,
        data: current.data.filter((row) => row.id !== teacher.id),
      }))
      setStatus({
        type: 'success',
        message: `${teacher.name || 'Teacher'} was removed and their institute data was deleted.`,
      })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to remove teacher.',
      })
    } finally {
      setRemovingTeacherId('')
    }
  }

  return (
    <InstituteLayout
      activeKey="teachers"
      title="Teachers"
      description="Review the teacher directory, their question volume, and recent activity from a single place."
    >
      <div className="space-y-6">
        <SectionCard>
          <SectionHeader
            eyebrow="Teacher directory"
            title="Active teachers"
            description="These are the teachers currently represented in the institute snapshot."
            action={<p className="text-[14px] font-semibold text-neutral">{state.loading ? 'Loading...' : `${formatNumber(state.data.length)} teachers`}</p>}
          />

          {status.message ? (
            <div
              className={`mt-6 rounded-2xl border px-4 py-3 text-[14px] ${
                status.type === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              {status.message}
            </div>
          ) : null}

          <div className="mt-6">
            <TeacherSnapshotTable
              teachers={state.data}
              loading={state.loading}
              error={state.error}
              onRemove={handleRemoveTeacher}
              removingTeacherId={removingTeacherId}
            />
          </div>
        </SectionCard>
      </div>
    </InstituteLayout>
  )
}

export default InstituteTeachersPage
