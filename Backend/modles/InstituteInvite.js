const mongoose = require('mongoose')

const instituteInviteSchema = new mongoose.Schema({
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
  institutionUid: { type: String },
  email: { type: String, required: true, trim: true },
  name: { type: String, trim: true },
  teacherUid: { type: String, trim: true },
  status: {
    type: String,
    enum: ['draft', 'pending', 'accepted', 'expired'],
    default: 'pending',
  },
  resendCount: { type: Number, default: 0 },
  lastSentAt: { type: Date },
  expiresAt: { type: Date },
}, {
  timestamps: true,
})

module.exports = mongoose.model('InstituteInvite', instituteInviteSchema)
