import { useEffect, useState } from 'react'

import SectionCard from '../../components/SectionCard'
import InstituteLayout from '../../components/InstituteLayout'
import { SectionHeader, TeacherSnapshotTable } from '../../components/InstituteDashboardUi'
import { formatNumber, formatRelativeTime } from '../../utils/instituteFormatters'
import { getInstituteTeachers } from '../../api/institute'

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
            action={<p className="text-sm font-semibold text-slate-500">{state.loading ? 'Loading...' : `${formatNumber(state.data.length)} teachers`}</p>}
          />

          <div className="mt-6">
            <TeacherSnapshotTable teachers={state.data} loading={state.loading} error={state.error} />
          </div>
        </SectionCard>
      </div>
    </InstituteLayout>
  )
}

export default InstituteTeachersPage
