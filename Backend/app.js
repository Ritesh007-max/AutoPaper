const express = require('express')
const Question = require('./modles/Questions')
const app = express()
app.use(express.json())


app.get('/', (req, res) => {
  res.json({
    message: 'AutoPaper API is running',
    routes: {
      questions: {
        get: "/api/questions", //gets questions all or specific coz it has filteration
        post: "/api/addQuestion", //adds a single question
        post: "/api/addQuestions", //adds multiple questions
      }
    }
  })
})

app.get('/api/questions', async (req, res) => {

  try {
    const { subject, chapter, questionType, difficulty, grade } = req.query

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    const skip = (page - 1) * limit;

    const filters = {}

    if (subject) filters.subject = subject
    if (chapter) filters.chapter = chapter
    if (questionType) filters.questionType = questionType
    if (difficulty) filters.difficulty = difficulty
    if (grade) filters.grade = parseInt(grade)

    const questions = await Question.find(filters).skip(skip).limit(limit)
    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    })

  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch questions',
      error: error.message,
    })
  }
})

app.post('/api/addQuestion', async (req, res) => {
  try {
    const { questionText, questionType, options, answer, subject, chapter, grade, difficulty, marks } = req.body

    const question = new Question({ questionText, questionType, options, answer, subject, chapter, grade, difficulty, marks })

    await question.save()
    res.status(201).json(question)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create question',
      error: error.message,
    })
  }
})

app.post('/api/addQuestions', async (req, res) => {
  try {

    await Question.insertMany(req.body)
    res.status(201).json({
      success: true,
      message: 'Questions added successfully',
      data: req.body,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create question',
      error: error.message,
    })
  }
})

app.put('/api/updateQuestion/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { questionText, questionType, options, answer, subject, chapter, grade, difficulty, marks } = req.body

    const filters = {}

    if (questionText) filters.questionText = questionText
    if (questionType) filters.questionType = questionType
    if (options) filters.options = options
    if (answer) filters.answer = answer
    if (subject) filters.subject = subject
    if (chapter) filters.chapter = chapter
    if (grade) filters.grade = parseInt(grade)
    if (difficulty) filters.difficulty = difficulty
    if (marks) filters.marks = parseInt(marks)

    const question = await Question.findByIdAndUpdate(id, filters, { returnDocument: 'after' })
    res.status(200).json(question)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update question',
      error: error.message,
    })
  }
})

app.delete('/api/deleteQuestion/:id', async (req, res) => {
  try {
    const { id } = req.params

    const question = await Question.findByIdAndDelete(id)
    res.status(200).json(question)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete question',
      error: error.message,
    })
  }
})

module.exports = app
