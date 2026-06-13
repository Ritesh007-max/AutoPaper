const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  institutionUid: { type: String, required: true, trim: true, index: true },
  batchId: { type: String, required: true, trim: true, index: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  teacherEmail: { type: String, required: true, trim: true, lowercase: true },
  teacherUid: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdByName: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  status: { type: String, enum: ['unread', 'read'], default: 'unread', index: true },
  readAt: { type: Date },
  sentAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
})

notificationSchema.index({ teacherId: 1, createdAt: -1 })
notificationSchema.index({ institutionUid: 1, batchId: 1 })

module.exports = mongoose.model('Notification', notificationSchema)
