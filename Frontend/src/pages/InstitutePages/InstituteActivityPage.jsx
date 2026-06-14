import { useEffect, useState } from 'react'

import SectionCard from '../../components/SectionCard'
import InstituteLayout from '../../components/InstituteLayout'
import { ActivityList, SectionHeader } from '../../components/InstituteDashboardUi'
import { getInstituteActivity } from '../../api/institute'
import { formatNumber, formatRelativeTime } from '../../utils/instituteFormatters'

const initialState = {
  loading: true,
  error: '',
  data: [],
}

const normalizeActivity = (activity = {}) => ({
  id: activity.id || activity._id || crypto.randomUUID(),
  type: activity.type || 'question_added',
  title: activity.title || 'Activity update',
  detail: activity.detail || '',
  createdAt: activity.createdAt || null,
  time: formatRelativeTime(activity.createdAt),
})

function InstituteActivityPage() {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    let active = true

    const loadActivity = async () => {
      try {
        const response = await getInstituteActivity({ limit: 25 })
        const payload = response.data?.data
        const items = Array.isArray(payload) ? payload.map(normalizeActivity) : []

        if (!active) {
          return
        }

        setState({
          loading: false,
          error: '',
          data: items,
        })
      } catch (error) {
        if (!active) {
          return
        }

        setState({
          loading: false,
          error: error.response?.data?.message || error.message || 'Failed to load activity.',
          data: [],
        })
      }
    }

    loadActivity()

    return () => {
      active = false
    }
  }, [])

  return (
    <InstituteLayout
      activeKey="activity"
      title="Activity"
      description="A focused feed of the latest institute actions, teacher updates, and paper generation events."
    >
      <div className="space-y-6">
        <SectionCard>
          <SectionHeader
            eyebrow="Recent actions"
            title="Activity timeline"
            description="Keep track of the latest actions happening across the institute."
            action={<p className="text-[14px] font-semibold text-neutral">{state.loading ? 'Loading...' : `${formatNumber(state.data.length)} events`}</p>}
          />

          <div className="mt-6">
            <ActivityList
              items={state.data}
              loading={state.loading}
              error={state.error}
              emptyTitle="No activity recorded"
              emptyDescription="Once teachers start adding questions and generating papers, the feed will populate here."
            />
          </div>
        </SectionCard>
      </div>
    </InstituteLayout>
  )
}

export default InstituteActivityPage
