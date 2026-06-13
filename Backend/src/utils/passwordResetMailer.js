const { sendEmail } = require('./emailTransport')

const getFrontendUrl = () => (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '')

const sendPasswordResetEmail = async ({ email, name, role, resetToken }) => {
  const resetLink = `${getFrontendUrl()}/reset-password?token=${encodeURIComponent(resetToken || '')}&role=${encodeURIComponent(role || '')}&email=${encodeURIComponent(email || '')}`
  const subject = 'Reset your AutoPaper password'
  const text = [
    `Hello ${name || 'User'},`,
    '',
    'We received a request to reset your AutoPaper password.',
    `Role: ${role || 'Not specified'}`,
    '',
    'Use the link below to choose a new password. This link expires in 1 hour.',
    `Reset your password: ${resetLink}`,
  ].join('\n')

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <p>Hello ${name || 'User'},</p>
      <p>We received a request to reset your AutoPaper password.</p>
      <p><strong>Role:</strong> ${role || 'Not specified'}</p>
      <p>Use the link below to choose a new password. This link expires in 1 hour.</p>
      <p><a href="${resetLink}">Reset your password</a></p>
    </div>
  `

  return sendEmail({
    to: email,
    subject,
    text,
    html,
  })
}

module.exports = {
  sendPasswordResetEmail,
}
