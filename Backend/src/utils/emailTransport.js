const nodemailer = require('nodemailer')

let cachedTransporter = null
let cachedProvider = ''

const normalizeEnvValue = (value) => {
  const trimmed = String(value || '').trim()

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith('\'') && trimmed.endsWith('\''))
  ) {
    return trimmed.slice(1, -1)
  }

  return trimmed
}

const hasSmtpConfig = () =>
  Boolean(
    normalizeEnvValue(process.env.SMTP_HOST) &&
      normalizeEnvValue(process.env.SMTP_USER) &&
      normalizeEnvValue(process.env.SMTP_PASS),
  )

const hasResendConfig = () => Boolean(normalizeEnvValue(process.env.RESEND_API_KEY))

const parseBoolean = (value) => String(value || '').trim().toLowerCase() === 'true'

const getMailFrom = () =>
  normalizeEnvValue(process.env.MAIL_FROM) ||
  normalizeEnvValue(process.env.SMTP_FROM) ||
  normalizeEnvValue(process.env.SMTP_USER)

const getTransporter = () => {
  if (!hasSmtpConfig()) {
    return null
  }

  if (cachedTransporter) {
    return cachedTransporter
  }

  const smtpPort = Number.parseInt(process.env.SMTP_PORT || '', 10)
  const secure = process.env.SMTP_SECURE
    ? parseBoolean(process.env.SMTP_SECURE)
    : smtpPort === 465

  cachedTransporter = nodemailer.createTransport({
    host: normalizeEnvValue(process.env.SMTP_HOST),
    port: Number.isInteger(smtpPort) ? smtpPort : 587,
    secure,
    auth: {
      user: normalizeEnvValue(process.env.SMTP_USER),
      pass: normalizeEnvValue(process.env.SMTP_PASS),
    },
  })

  return cachedTransporter
}

const sendEmail = async ({ to, subject, text, html }) => {
  const from = getMailFrom()
  const smtpConfigured = hasSmtpConfig()
  const resendConfigured = hasResendConfig()

  if (!from) {
    throw new Error('MAIL_FROM is not configured. Set MAIL_FROM or SMTP_FROM in Backend/.env.')
  }

  if (smtpConfigured) {
    const transporter = getTransporter()

    cachedProvider = 'smtp'

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    })

    return {
      sent: true,
      transport: cachedProvider,
      messageId: info.messageId || null,
      accepted: info.accepted || [],
      rejected: info.rejected || [],
    }
  }

  if (resendConfigured) {
    if (typeof fetch !== 'function') {
      throw new Error('Fetch is not available in this Node runtime.')
    }

    cachedProvider = 'resend'

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${normalizeEnvValue(process.env.RESEND_API_KEY)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        text,
        html,
      }),
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(
        payload?.message
          ? `Resend error: ${payload.message}`
          : `Resend request failed with status ${response.status}.`,
      )
    }

    return {
      sent: true,
      transport: cachedProvider,
      messageId: payload?.id || null,
      accepted: [to],
      rejected: [],
    }
  }

  throw new Error(
    'No email transport is configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, or RESEND_API_KEY in Backend/.env.',
  )
}

module.exports = {
  sendEmail,
}
