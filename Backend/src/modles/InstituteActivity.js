const mongoose = require('mongoose')

const instituteActivitySchema = new mongoose.Schema({
  institutionUid: { type: String },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teacherName: { type: String },
  type: {
    type: String,
    enum: ['question_added', 'paper_generated', 'teacher_joined', 'invite_sent', 'invite_accepted'],
    required: true,
  },
  title: { type: String, required: true },
  detail: { type: String, default: '' },
}, {
  timestamps: true,
})

module.exports = mongoose.model('InstituteActivity', instituteActivitySchema)
