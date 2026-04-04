const nodemailer = require('nodemailer')

let cachedTransporter = null

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
  const transporter = getTransporter()
  const from = getMailFrom()

  if (!transporter) {
    throw new Error(
      'SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and MAIL_FROM in Backend/.env.',
    )
  }

  if (!from) {
    throw new Error('MAIL_FROM is not configured. Set MAIL_FROM or SMTP_FROM in Backend/.env.')
  }

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  })

  return {
    sent: true,
    transport: 'smtp',
    messageId: info.messageId || null,
    accepted: info.accepted || [],
    rejected: info.rejected || [],
  }
}

module.exports = {
  sendEmail,
}
