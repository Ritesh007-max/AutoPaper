const mongoose = require('mongoose')
const { QUESTION_LIMITS } = require('../constants/questionLimits')

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true,
    maxlength: QUESTION_LIMITS.text.questionText,
  },
  questionType: {
    type: String,
    enum: ['MCQ', 'short', 'long', 'numerical'],
    required: true,
    trim: true,
    maxlength: QUESTION_LIMITS.text.questionType,
  },
  options: [{
    type: String,
    trim: true,
    maxlength: QUESTION_LIMITS.text.option,
  }],
  answer: {
    type: String,
    trim: true,
    maxlength: QUESTION_LIMITS.text.answer,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: QUESTION_LIMITS.text.subject,
  },
  chapter: {
    type: String,
    trim: true,
    maxlength: QUESTION_LIMITS.text.chapter,
  },
  grade: {
    type: Number,
    required: true,
    min: 1,
    max: QUESTION_LIMITS.maxGrade,
  },
  difficulty: {
    type: String,
    enum: QUESTION_LIMITS.allowedDifficulties,
    required: true,
    trim: true,
  },
  marks: {
    type: Number,
    required: true,
    min: 1,
    max: QUESTION_LIMITS.maxMarks,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  institutionUid: {
    type: String,
    required: true,
    trim: true,
    maxlength: QUESTION_LIMITS.text.institutionUid,
  },
  teacherUid: {
    type: String,
    required: true,
    trim: true,
    maxlength: QUESTION_LIMITS.text.teacherUid,
  },
}, {
  timestamps: true,
})

questionSchema.path('options').validate(function validateOptionCount(options) {
  return !Array.isArray(options) || options.length <= QUESTION_LIMITS.maxOptions
}, `A question can include at most ${QUESTION_LIMITS.maxOptions} options.`)

questionSchema.index({ institutionUid: 1, createdAt: -1 })
questionSchema.index({ institutionUid: 1, subject: 1, chapter: 1, grade: 1 })

module.exports = mongoose.model('Question', questionSchema)
