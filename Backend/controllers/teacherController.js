const Question = require('../modles/Questions')

const allowedQuestionTypes = ['MCQ', 'short', 'long', 'numerical']
const allowedDifficulties = ['easy', 'medium', 'hard']

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key)

const normalizeStringValue = (value) => {
  if (typeof value !== 'string') {
    return value
  }

  return value.trim()
}

const buildQuestionPayload = (source = {}) => {
  const payload = {}

  const textFields = [
    'questionText',
    'questionType',
    'answer',
    'subject',
    'chapter',
    'difficulty',
    'institutionUid',
  ]

  for (const field of textFields) {
    if (hasOwn(source, field)) {
      payload[field] = normalizeStringValue(source[field])
    }
  }

  if (hasOwn(source, 'options') && Array.isArray(source.options)) {
    payload.options = source.options.map((option) => normalizeStringValue(option))
  }

  const numericFields = ['grade', 'marks']

  for (const field of numericFields) {
    if (hasOwn(source, field)) {
      const parsedValue = Number(source[field])

      if (!Number.isNaN(parsedValue)) {
        payload[field] = parsedValue
      }
    }
  }

  return payload
}

const parseFiltersFromQuery = (query = {}) => {
  const filters = {}

  if (query.subject) {
    filters.subject = String(query.subject).trim()
  }

  if (query.chapter) {
    filters.chapter = String(query.chapter).trim()
  }

  if (query.questionType) {
    filters.questionType = String(query.questionType).trim()
  }

  if (query.difficulty) {
    filters.difficulty = String(query.difficulty).trim()
  }

  if (query.grade) {
    const parsedGrade = Number.parseInt(query.grade, 10)

    if (!Number.isNaN(parsedGrade)) {
      filters.grade = parsedGrade
    }
  }

  return filters
}

const sendServerError = (res, message, error) => {
  res.status(500).json({
    success: false,
    message,
    error: error.message,
  })
}

const sendRequestError = (res, message, error) => {
  if (error?.name === 'ValidationError' || error?.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message,
      error: error.message,
    })
  }

  return sendServerError(res, message, error)
}

const getQuestions = async (req, res) => {
  try {
    const filters = parseFiltersFromQuery(req.query)
    let query = Question.find(filters).sort({ createdAt: -1 })

    const hasLimit = hasOwn(req.query, 'limit') && req.query.limit !== ''
    const hasPage = hasOwn(req.query, 'page') && req.query.page !== ''

    if (hasLimit) {
      const page = hasPage ? Number.parseInt(req.query.page, 10) : 1
      const limit = Number.parseInt(req.query.limit, 10)

      if (!Number.isInteger(page) || page < 1) {
        return res.status(400).json({
          success: false,
          message: 'page must be an integer greater than or equal to 1.',
        })
      }

      if (!Number.isInteger(limit) || limit < 1) {
        return res.status(400).json({
          success: false,
          message: 'limit must be an integer greater than or equal to 1.',
        })
      }

      query = query.skip((page - 1) * limit).limit(limit)
    }

    const questions = await query

    return res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    })
  } catch (error) {
    return sendServerError(res, 'Failed to fetch questions', error)
  }
}

const getQuestionFilters = async (req, res) => {
  try {
    const [subjects, chapters, grades, questionTypes, difficulties] = await Promise.all([
      Question.distinct('subject'),
      Question.distinct('chapter'),
      Question.distinct('grade'),
      Question.distinct('questionType'),
      Question.distinct('difficulty'),
    ])

    const filterStringValues = (values) =>
      values
        .map((value) => normalizeStringValue(value))
        .filter((value) => typeof value === 'string' && value.length > 0)

    const sortedSubjects = filterStringValues(subjects).sort((left, right) => left.localeCompare(right))
    const sortedChapters = filterStringValues(chapters).sort((left, right) => left.localeCompare(right))
    const sortedGrades = grades
      .map((grade) => Number(grade))
      .filter((grade) => !Number.isNaN(grade))
      .sort((left, right) => left - right)

    const sortedQuestionTypes = Array.from(
      new Set([...allowedQuestionTypes, ...filterStringValues(questionTypes)]),
    )
    const sortedDifficulties = Array.from(
      new Set([...allowedDifficulties, ...filterStringValues(difficulties)]),
    )

    return res.status(200).json({
      success: true,
      data: {
        subjects: sortedSubjects,
        chapters: sortedChapters,
        grades: sortedGrades,
        questionTypes: sortedQuestionTypes,
        difficulties: sortedDifficulties,
      },
    })
  } catch (error) {
    return sendServerError(res, 'Failed to fetch question filters', error)
  }
}

const createQuestion = async (req, res) => {
  try {
    const payload = buildQuestionPayload(req.body)
    const question = new Question(payload)

    await question.save()

    return res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: question,
    })
  } catch (error) {
    return sendRequestError(res, 'Failed to create question', error)
  }
}

const createQuestionsBulk = async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Expected a non-empty array of questions.',
      })
    }

    const payload = req.body.map((question) => buildQuestionPayload(question))
    const createdQuestions = await Question.insertMany(payload)

    return res.status(201).json({
      success: true,
      message: 'Questions added successfully',
      count: createdQuestions.length,
      data: createdQuestions,
    })
  } catch (error) {
    return sendRequestError(res, 'Failed to create questions', error)
  }
}

const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params
    const updates = buildQuestionPayload(req.body)

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields were provided for update.',
      })
    }

    const question = await Question.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    )

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: question,
    })
  } catch (error) {
    return sendRequestError(res, 'Failed to update question', error)
  }
}

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params
    const question = await Question.findByIdAndDelete(id)

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
      data: question,
    })
  } catch (error) {
    return sendRequestError(res, 'Failed to delete question', error)
  }
}

module.exports = {
  createQuestion,
  createQuestionsBulk,
  deleteQuestion,
  getQuestionFilters,
  getQuestions,
  updateQuestion,
}
