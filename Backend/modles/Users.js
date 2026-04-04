const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'instituteAdmin', 'Admin', 'Student'], required: true },
  institutionName: { type: String },
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
  institutionUid: { type: String },
  teacherUid: { type: String, unique: true, sparse: true },
  inviteStatus: { type: String, enum: ['draft', 'sent'], default: 'draft' },
  inviteSentAt: { type: Date },
}, {
  timestamps: true,
})

module.exports = mongoose.model('User', userSchema)
