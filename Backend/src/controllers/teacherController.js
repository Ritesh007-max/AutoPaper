const teacherService = require('../services/teacherService')
const { sendErrorResponse } = require('./responseHelpers')

const getQuestions = async (req, res) => {
  try {
    const result = await teacherService.getQuestions({
      user: req.user,
      query: req.query,
    })

    return res.status(200).json({
      success: true,
      count: result.count,
      data: result.data,
    })
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to fetch questions')
  }
}

const getQuestionFilters = async (req, res) => {
  try {
    const data = await teacherService.getQuestionFilters({
      user: req.user,
    })

    return res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to fetch question filters')
  }
}

const createQuestion = async (req, res) => {
  try {
    const result = await teacherService.createQuestion({
      user: req.user,
      body: req.body,
    })

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.data,
    })
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to create question')
  }
}

const createQuestionsBulk = async (req, res) => {
  try {
    const result = await teacherService.createQuestionsBulk({
      user: req.user,
      body: req.body,
    })

    return res.status(201).json({
      success: true,
      message: result.message,
      count: result.count,
      data: result.data,
    })
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to create questions')
  }
}

const updateQuestion = async (req, res) => {
  try {
    const result = await teacherService.updateQuestion({
      user: req.user,
      questionId: req.params.id,
      body: req.body,
    })

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    })
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to update question')
  }
}

const deleteQuestion = async (req, res) => {
  try {
    const result = await teacherService.deleteQuestion({
      user: req.user,
      questionId: req.params.id,
    })

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    })
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to delete question')
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
