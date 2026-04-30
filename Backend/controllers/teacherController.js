const Question = require('../modles/Questions')
const User = require('../modles/Users')
const InstituteAdminInvite = require('../modles/InstituteAdminInvite')

const allowedQuestionTypes = ['MCQ', 'short', 'long', 'numerical']
const allowedDifficulties = ['easy', 'medium', 'hard']

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key)

const getScopedInstitutionUid = (req) => String(req.user?.institutionUid || '').trim()

const requireInstitutionScope = (res, institutionUid) => {
  if (institutionUid) {
    return true
  }

  res.status(403).json({
    success: false,
    message: 'Institution scope is required for teacher access.',
  })

  return false
}

const requireQuestionOwnershipContext = (res, { institutionId, teacherUid }) => {
  if (institutionId && teacherUid) {
    return true
  }

  res.status(403).json({
    success: false,
    message: 'Institute and teacher ownership details are required for question access.',
  })

  return false
}

const buildTeacherQuestionScope = (institutionUid) => ({
  $or: [
    { institutionUid },
    { institutionUid: { $exists: false } },
    { institutionUid: null },
    { institutionUid: '' },
  ],
})

const resolveQuestionOwnershipContext = async (req) => {
  const userId = String(req.user?.userId || '').trim()
  const tokenInstitutionUid = String(req.user?.institutionUid || '').trim()
  const tokenTeacherUid = String(req.user?.teacherUid || '').trim()
  const tokenInstitutionId = String(req.user?.institutionId || '').trim()
  const userRecord = userId
    ? await User.findById(userId).select('institutionId institutionUid teacherUid').lean()
    : null

  const institutionUid = String(userRecord?.institutionUid || tokenInstitutionUid).trim()
  const teacherUid = String(userRecord?.teacherUid || tokenTeacherUid).trim()
  let institutionId = userRecord?.institutionId || tokenInstitutionId || null

  if (!institutionId && institutionUid) {
    const instituteRecord = await InstituteAdminInvite.findOne({ institutionUid }).select('_id')
    institutionId = instituteRecord?._id || null
  }

  if (userId && userRecord) {
    const updates = {}

    if (!userRecord.institutionId && institutionId) {
      updates.institutionId = institutionId
    }

    if (!userRecord.institutionUid && institutionUid) {
      updates.institutionUid = institutionUid
    }

    if (!userRecord.teacherUid && teacherUid) {
      updates.teacherUid = teacherUid
    }

    if (Object.keys(updates).length > 0) {
      await User.findByIdAndUpdate(userId, { $set: updates })
    }
  }

  return {
    institutionId,
    institutionUid,
    teacherUid,
  }
}

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
    payload.options = source.options
      .map((option) => normalizeStringValue(option))
      .filter((option) => typeof option === 'string' && option.length > 0)
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

const validateQuestionPayload = (payload = {}) => {
  const errors = []

  const requiredTextFields = ['questionText', 'questionType', 'subject', 'difficulty']

  for (const field of requiredTextFields) {
    if (!String(payload[field] || '').trim()) {
      errors.push(`${field} is required.`)
    }
  }

  if (!Number.isInteger(payload.grade) || payload.grade < 1) {
    errors.push('grade must be an integer greater than or equal to 1.')
  }

  if (!Number.isInteger(payload.marks) || payload.marks < 1) {
    errors.push('marks must be an integer greater than or equal to 1.')
  }

  if (payload.questionType && !allowedQuestionTypes.includes(payload.questionType)) {
    errors.push(`questionType must be one of ${allowedQuestionTypes.join(', ')}.`)
  }

  if (payload.difficulty && !allowedDifficulties.includes(payload.difficulty)) {
    errors.push(`difficulty must be one of ${allowedDifficulties.join(', ')}.`)
  }

  if (payload.questionType === 'MCQ') {
    if (!String(payload.answer || '').trim()) {
      errors.push('answer is required for MCQ questions.')
    }

    if (!Array.isArray(payload.options) || payload.options.length < 2) {
      errors.push('MCQ questions must include at least two options.')
    }

    if (String(payload.answer || '').trim() && Array.isArray(payload.options) && payload.options.length > 0) {
      const normalizedAnswer = String(payload.answer || '').trim().toLowerCase()
      const hasMatchingAnswer = payload.options.some(
        (option) => String(option || '').trim().toLowerCase() === normalizedAnswer,
      )

      if (!hasMatchingAnswer) {
        errors.push('MCQ answer must match one of the provided options.')
      }
    }
  }

  return errors
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
    const institutionUid = getScopedInstitutionUid(req)

    if (!requireInstitutionScope(res, institutionUid)) {
      return
    }

    let query = Question.find({
      ...buildTeacherQuestionScope(institutionUid),
      ...filters,
    }).sort({ createdAt: -1 })

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
    const institutionUid = getScopedInstitutionUid(req)

    if (!requireInstitutionScope(res, institutionUid)) {
      return
    }

    const teacherQuestionScope = buildTeacherQuestionScope(institutionUid)

    const [subjects, chapters, grades, questionTypes, difficulties] = await Promise.all([
      Question.distinct('subject', teacherQuestionScope),
      Question.distinct('chapter', teacherQuestionScope),
      Question.distinct('grade', teacherQuestionScope),
      Question.distinct('questionType', teacherQuestionScope),
      Question.distinct('difficulty', teacherQuestionScope),
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
    const {
      institutionId,
      institutionUid,
      teacherUid,
    } = await resolveQuestionOwnershipContext(req)

    if (!requireInstitutionScope(res, institutionUid)) {
      return
    }

    if (!requireQuestionOwnershipContext(res, { institutionId, teacherUid })) {
      return
    }

    const payload = buildQuestionPayload(req.body)
    payload.institutionId = institutionId
    payload.institutionUid = institutionUid
    payload.teacherUid = teacherUid
    payload.createdBy = req.user.userId
    const validationErrors = validateQuestionPayload(payload)

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Question validation failed.',
        errors: validationErrors,
      })
    }

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
    const {
      institutionId,
      institutionUid,
      teacherUid,
    } = await resolveQuestionOwnershipContext(req)

    if (!requireInstitutionScope(res, institutionUid)) {
      return
    }

    if (!requireQuestionOwnershipContext(res, { institutionId, teacherUid })) {
      return
    }

    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Expected a non-empty array of questions.',
      })
    }

    const payload = req.body.map((question) => ({
      ...buildQuestionPayload(question),
      institutionId,
      institutionUid,
      teacherUid,
      createdBy: req.user.userId,
    }))
    const validationErrors = payload.flatMap((question, index) =>
      validateQuestionPayload(question).map((error) => `Question ${index + 1}: ${error}`),
    )

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Question validation failed.',
        errors: validationErrors,
      })
    }

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
    const institutionUid = getScopedInstitutionUid(req)

    if (!requireInstitutionScope(res, institutionUid)) {
      return
    }

    const updates = buildQuestionPayload(req.body)
    const validationErrors = validateQuestionPayload(updates)

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields were provided for update.',
      })
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Question validation failed.',
        errors: validationErrors,
      })
    }

    const question = await Question.findOneAndUpdate(
      { _id: id, institutionUid },
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
    const institutionUid = getScopedInstitutionUid(req)

    if (!requireInstitutionScope(res, institutionUid)) {
      return
    }

    const question = await Question.findOneAndDelete({ _id: id, institutionUid })

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
