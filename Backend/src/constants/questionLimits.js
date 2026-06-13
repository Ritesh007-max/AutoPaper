const QUESTION_LIMITS = {
  allowedDifficulties: ['easy', 'medium', 'hard'],
  maxBulkQuestions: 100,
  maxOptions: 8,
  maxQueryLimit: 100,
  maxGrade: 100,
  maxMarks: 1000,
  text: {
    answer: 2000,
    chapter: 160,
    option: 5,
    questionText: 3000,
    questionType: 20,
    subject: 120,
  },
}

module.exports = {
  QUESTION_LIMITS
}
