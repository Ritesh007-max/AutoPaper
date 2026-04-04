const { sendEmail } = require('./emailTransport')

const sendTeacherInvitationEmail = async ({ email, name, teacherUid, institutionUid }) => {
  const subject = 'Your AutoPaper Teacher Login UID'
  const text = [
    `Hello ${name || 'Teacher'},`,
    '',
    'Your institute admin has created your teacher account.',
    `Login UID: ${teacherUid}`,
    `Institute UID: ${institutionUid || 'Not provided'}`,
    '',
    'Use this UID to log in to the application.',
  ].join('\n')

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <p>Hello ${name || 'Teacher'},</p>
      <p>Your institute admin has created your teacher account.</p>
      <p><strong>Login UID:</strong> ${teacherUid}</p>
      <p><strong>Institute UID:</strong> ${institutionUid || 'Not provided'}</p>
      <p>Use this UID to log in to the application.</p>
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
