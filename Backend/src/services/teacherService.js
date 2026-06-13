const Question = require('../modles/Questions')
const User = require('../modles/Users')
const { QUESTION_LIMITS } = require('../constants/questionLimits')
const { normalizeUidBase } = require('../utils/institutionUid')
const { createServiceError } = require('./serviceError')

const allowedQuestionTypes = ['MCQ', 'short', 'long', 'numerical']
const allowedDifficulties = QUESTION_LIMITS.allowedDifficulties

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key)

const requireInstitutionScope = (institutionUid) => {
  if (!institutionUid) {
    throw createServiceError(403, 'Institution scope is required for teacher access.')
  }
}

const requireQuestionOwnershipContext = ({ institutionUid, teacherUid }) => {
  if (!institutionUid || !teacherUid) {
    throw createServiceError(
      403,
      'Institute and teacher ownership details are required for question access.',
    )
  }
}

const buildTeacherQuestionScope = (institutionUid) => ({
  institutionUid,
})

const getTeacherUidInstituteCode = (teacherUid) =>
  normalizeUidBase(String(teacherUid || '').split('-')[0] || '')

const resolveQuestionOwnershipContext = async (user = {}) => {
  const userId = String(user?.userId || '').trim()
  const tokenInstitutionUid = String(user?.institutionUid || '').trim()
  const tokenTeacherUid = String(user?.teacherUid || '').trim()
  const userRecord = userId
    ? await User.findById(userId).select('institutionUid teacherUid').lean()
    : null

  const institutionUid = String(userRecord?.institutionUid || tokenInstitutionUid).trim()
  const teacherUid = String(userRecord?.teacherUid || tokenTeacherUid).trim()
  const institutionCode = normalizeUidBase(institutionUid)
  const teacherInstitutionCode = getTeacherUidInstituteCode(teacherUid)

  if (userId && userRecord) {
    const updates = {}

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
    institutionCode,
    institutionUid,
    teacherInstitutionCode,
    teacherUid,
  }
}

const requireTeacherInstituteIsolation = ({ institutionCode, teacherInstitutionCode }) => {
  if (!institutionCode || !teacherInstitutionCode || institutionCode !== teacherInstitutionCode) {
    throw createServiceError(
      403,
      'Teacher access is restricted to questions from the teacher\'s own institute only.',
    )
  }
}

const getValidatedQuestionContext = async (user) => {
  const context = await resolveQuestionOwnershipContext(user)

  requireInstitutionScope(context.institutionUid)
  requireQuestionOwnershipContext(context)
  requireTeacherInstituteIsolation(context)

  return context
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

  const textLengthFields = [
    'questionText',
    'questionType',
    'answer',
    'subject',
    'chapter',
  ]

  for (const field of textLengthFields) {
    const maxLength = QUESTION_LIMITS.text[field]
    const value = payload[field]

    if (typeof value === 'string' && maxLength && value.length > maxLength) {
      errors.push(`${field} must be ${maxLength} characters or fewer.`)
    }
  }

  if (!Number.isInteger(payload.grade) || payload.grade < 1 || payload.grade > QUESTION_LIMITS.maxGrade) {
    errors.push(`grade must be an integer between 1 and ${QUESTION_LIMITS.maxGrade}.`)
  }

  if (!Number.isInteger(payload.marks) || payload.marks < 1 || payload.marks > QUESTION_LIMITS.maxMarks) {
    errors.push(`marks must be an integer between 1 and ${QUESTION_LIMITS.maxMarks}.`)
  }

  if (payload.questionType && !allowedQuestionTypes.includes(payload.questionType)) {
    errors.push(`questionType must be one of ${allowedQuestionTypes.join(', ')}.`)
  }

  if (payload.difficulty && !allowedDifficulties.includes(payload.difficulty)) {
    errors.push(`difficulty must be one of ${allowedDifficulties.join(', ')}.`)
  }

  if (Array.isArray(payload.options)) {
    if (payload.options.length > QUESTION_LIMITS.maxOptions) {
      errors.push(`options can include at most ${QUESTION_LIMITS.maxOptions} entries.`)
    }

    payload.options.forEach((option, optionIndex) => {
      if (typeof option === 'string' && option.length > QUESTION_LIMITS.text.option) {
        errors.push(`option ${optionIndex + 1} must be ${QUESTION_LIMITS.text.option} characters or fewer.`)
      }
    })
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

const getQuestions = async ({ user, query: requestQuery = {} }) => {
  const filters = parseFiltersFromQuery(requestQuery)
  const { institutionUid } = await getValidatedQuestionContext(user)

  let query = Question.find({
    ...buildTeacherQuestionScope(institutionUid),
    ...filters,
  }).sort({ createdAt: -1 })

  const hasLimit = hasOwn(requestQuery, 'limit') && requestQuery.limit !== ''
  const hasPage = hasOwn(requestQuery, 'page') && requestQuery.page !== ''

  if (hasLimit) {
    const page = hasPage ? Number.parseInt(requestQuery.page, 10) : 1
    const limit = Number.parseInt(requestQuery.limit, 10)

    if (!Number.isInteger(page) || page < 1) {
      throw createServiceError(400, 'page must be an integer greater than or equal to 1.')
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > QUESTION_LIMITS.maxQueryLimit) {
      throw createServiceError(
        400,
        `limit must be an integer between 1 and ${QUESTION_LIMITS.maxQueryLimit}.`,
      )
    }

    query = query.skip((page - 1) * limit).limit(limit)
  }

  const questions = await query

  return {
    count: questions.length,
    data: questions,
  }
}

const getQuestionFilters = async ({ user }) => {
  const { institutionUid } = await getValidatedQuestionContext(user)
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

  return {
    subjects: filterStringValues(subjects).sort((left, right) => left.localeCompare(right)),
    chapters: filterStringValues(chapters).sort((left, right) => left.localeCompare(right)),
    grades: grades
      .map((grade) => Number(grade))
      .filter((grade) => !Number.isNaN(grade))
      .sort((left, right) => left - right),
    questionTypes: Array.from(
      new Set([...allowedQuestionTypes, ...filterStringValues(questionTypes)]),
    ),
    difficulties: Array.from(
      new Set([...allowedDifficulties, ...filterStringValues(difficulties)]),
    ),
  }
}

const createQuestion = async ({ user, body }) => {
  const { institutionUid, teacherUid } = await getValidatedQuestionContext(user)
  const payload = {
    ...buildQuestionPayload(body),
    institutionUid,
    teacherUid,
    createdBy: user.userId,
  }
  const validationErrors = validateQuestionPayload(payload)

  if (validationErrors.length > 0) {
    throw createServiceError(400, 'Question validation failed.', {
      errors: validationErrors,
    })
  }

  const question = new Question(payload)
  await question.save()

  return {
    message: 'Question created successfully',
    data: question,
  }
}

const createQuestionsBulk = async ({ user, body }) => {
  const { institutionUid, teacherUid } = await getValidatedQuestionContext(user)

  if (!Array.isArray(body) || body.length === 0) {
    throw createServiceError(400, 'Expected a non-empty array of questions.')
  }

  if (body.length > QUESTION_LIMITS.maxBulkQuestions) {
    throw createServiceError(
      413,
      `Bulk upload accepts at most ${QUESTION_LIMITS.maxBulkQuestions} questions per request.`,
    )
  }

  const payload = body.map((question) => ({
    ...buildQuestionPayload(question),
    institutionUid,
    teacherUid,
    createdBy: user.userId,
  }))
  const validationErrors = payload.flatMap((question, index) =>
    validateQuestionPayload(question).map((error) => `Question ${index + 1}: ${error}`),
  )

  if (validationErrors.length > 0) {
    throw createServiceError(400, 'Question validation failed.', {
      errors: validationErrors,
    })
  }

  const createdQuestions = await Question.insertMany(payload)

  return {
    message: 'Questions added successfully',
    count: createdQuestions.length,
    data: createdQuestions,
  }
}

const updateQuestion = async ({ user, questionId, body }) => {
  const { institutionUid } = await getValidatedQuestionContext(user)
  const updates = buildQuestionPayload(body)

  if (Object.keys(updates).length === 0) {
    throw createServiceError(400, 'No valid fields were provided for update.')
  }

  const validationErrors = validateQuestionPayload(updates)

  if (validationErrors.length > 0) {
    throw createServiceError(400, 'Question validation failed.', {
      errors: validationErrors,
    })
  }

  const question = await Question.findOneAndUpdate(
    { _id: questionId, institutionUid },
    { $set: updates },
    { new: true, runValidators: true },
  )

  if (!question) {
    throw createServiceError(404, 'Question not found.')
  }

  return {
    message: 'Question updated successfully',
    data: question,
  }
}

const deleteQuestion = async ({ user, questionId }) => {
  const { institutionUid } = await getValidatedQuestionContext(user)
  const question = await Question.findOneAndDelete({ _id: questionId, institutionUid })

  if (!question) {
    throw createServiceError(404, 'Question not found.')
  }

  return {
    message: 'Question deleted successfully',
    data: question,
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
