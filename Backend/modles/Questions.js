const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionType: { type: String, enum: ['MCQ','obj', 'gr','1m', '2m', '3m','5m'], required: true },
  options: [String],          // only filled for MCQ
  answer: { type: String },
  subject: { type: String, required: true },
  chapter: { type: String },
  grade: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  marks: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
}, {
  timestamps: true,
})

module.exports = mongoose.model('Question', questionSchema)



