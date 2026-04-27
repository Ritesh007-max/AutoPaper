const { sendEmail } = require('./emailTransport')

const sendTeacherInvitationEmail = async ({ email, name, teacherUid, institutionUid }) => {
  const registerLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?role=teacher&code=${encodeURIComponent(teacherUid || '')}`
  const subject = 'Your AutoPaper Teacher Invitation'
  const text = [
    `Hello ${name || 'Teacher'},`,
    '',
    'Your institute admin has invited you to AutoPaper.',
    `Registration code: ${teacherUid}`,
    `Institute UID: ${institutionUid || 'Not provided'}`,
    '',
    'Use this code to register your account, then create your own password.',
    `Register here: ${registerLink}`,
  ].join('\n')

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <p>Hello ${name || 'Teacher'},</p>
      <p>Your institute admin has invited you to AutoPaper.</p>
      <p><strong>Registration code:</strong> ${teacherUid}</p>
      <p><strong>Institute UID:</strong> ${institutionUid || 'Not provided'}</p>
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
  sendTeacherInvitationEmail,
}
