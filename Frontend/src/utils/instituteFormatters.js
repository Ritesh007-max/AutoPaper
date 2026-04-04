const numberFormatter = new Intl.NumberFormat('en-US')

export const formatNumber = (value) => {
  const numericValue = Number(value)

  if (Number.isNaN(numericValue)) {
    return '0'
  }

  return numberFormatter.format(numericValue)
}

export const formatShortDate = (value) => {
  if (!value) {
    return 'Not available'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export const formatLongDateTime = (value) => {
  if (!value) {
    return 'Not available'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export const formatRelativeTime = (value) => {
  if (!value) {
    return 'Not available'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Not available'
  }

  const deltaSeconds = Math.round((date.getTime() - Date.now()) / 1000)
  const absoluteSeconds = Math.abs(deltaSeconds)

  const divisions = [
    { amount: 60, unit: 'second' },
    { amount: 60, unit: 'minute' },
    { amount: 24, unit: 'hour' },
    { amount: 7, unit: 'day' },
    { amount: 4.34524, unit: 'week' },
    { amount: 12, unit: 'month' },
    { amount: Number.POSITIVE_INFINITY, unit: 'year' },
  ]

  let duration = absoluteSeconds
  let unit = 'seconds'

  for (const division of divisions) {
    if (duration < division.amount) {
      unit = division.unit
      break
    }

    duration = Math.round(duration / division.amount)
  }

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const amount = deltaSeconds < 0 ? -duration : duration

  return formatter.format(amount, unit)
}
