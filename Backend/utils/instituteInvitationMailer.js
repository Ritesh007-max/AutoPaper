const { sendEmail } = require('./emailTransport')

const sendInstituteInvitationEmail = async ({ email, adminName, institutionName, institutionUid }) => {
  const subject = 'Your AutoPaper Institute Admin Invitation'
  const text = [
    `Hello ${adminName || 'Institute Admin'},`,
    '',
    `Your institute "${institutionName || 'Unnamed Institute'}" has been invited to AutoPaper.`,
    `Institute UID: ${institutionUid || 'Not provided'}`,
    '',
    'Use this UID when you sign in and finish setting up the institute.',
  ].join('\n')

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <p>Hello ${adminName || 'Institute Admin'},</p>
      <p>Your institute <strong>${institutionName || 'Unnamed Institute'}</strong> has been invited to AutoPaper.</p>
      <p><strong>Institute UID:</strong> ${institutionUid || 'Not provided'}</p>
      <p>Use this UID when you sign in and finish setting up the institute.</p>
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
