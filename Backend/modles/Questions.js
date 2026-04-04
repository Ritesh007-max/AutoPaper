const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionType: { type: String, enum: ['MCQ', 'short', 'long', 'numerical'], required: true },
  options: [String],          // only filled for MCQ
  answer: { type: String },
  subject: { type: String, required: true },
  chapter: { type: String },
  grade: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  marks: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
  institutionUid: { type: String },
}, {
  timestamps: true,
})

module.exports = mongoose.model('Question', questionSchema)
