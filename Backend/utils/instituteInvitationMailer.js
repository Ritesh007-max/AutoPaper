const { sendEmail } = require('./emailTransport')

const sendInstituteInvitationEmail = async ({ email, adminName, institutionName, institutionUid }) => {
  const registerLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?role=instituteAdmin&code=${encodeURIComponent(institutionUid || '')}`
  const subject = 'Your AutoPaper Institute Admin Invitation'
  const text = [
    `Hello ${adminName || 'Institute Admin'},`,
    '',
    `Your institute "${institutionName || 'Unnamed Institute'}" has been invited to AutoPaper.`,
    `Registration code: ${institutionUid || 'Not provided'}`,
    '',
    'Use this code to register your account, then create your own password.',
    `Register here: ${registerLink}`,
  ].join('\n')

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <p>Hello ${adminName || 'Institute Admin'},</p>
      <p>Your institute <strong>${institutionName || 'Unnamed Institute'}</strong> has been invited to AutoPaper.</p>
      <p><strong>Registration code:</strong> ${institutionUid || 'Not provided'}</p>
      <p>Use this code to register your account, then create your own password.</p>
      <p><a href="${registerLink}">Complete registration</a></p>
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
  sendInstituteInvitationEmail,
}
