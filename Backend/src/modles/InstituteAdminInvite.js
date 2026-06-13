const mongoose = require('mongoose')

const instituteAdminInviteSchema = new mongoose.Schema({
  institutionName: { type: String, required: true, trim: true },
  adminName: { type: String, required: true, trim: true },
  adminEmail: { type: String, required: true, trim: true, lowercase: true },
  institutionUid: { type: String, required: true, trim: true, unique: true },
  inviteStatus: {
    type: String,
    enum: ['draft', 'sent', 'accepted', 'expired'],
    default: 'draft',
  },
  resendCount: { type: Number, default: 0 },
  inviteSentAt: { type: Date },
  lastSentAt: { type: Date },
  expiresAt: { type: Date },
  archivedAt: { type: Date, default: null },
}, {
  timestamps: true,
})

module.exports = mongoose.model('InstituteAdminInvite', instituteAdminInviteSchema)
