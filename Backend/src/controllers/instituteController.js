const instituteService = require('../services/instituteService')
const { sendErrorResponse } = require('./responseHelpers')

const getDashboardStats = async (req, res) => {
  try {
    const data = await instituteService.getDashboardStats({
      user: req.user,
    })

    return res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to fetch institute dashboard stats')
  }
}

const getActivity = async (req, res) => {
  try {
    const result = await instituteService.getActivity({
      user: req.user,
      query: req.query,
    })

    return res.status(200).json({
      success: true,
      count: result.count,
      data: result.data,
    })
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to fetch institute activity')
  }
}

const getTeachers = async (req, res) => {
  try {
    const result = await instituteService.getTeachers({
      user: req.user,
      query: req.query,
    })

    return res.status(200).json({
      success: true,
      count: result.count,
      data: result.data,
    })
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to fetch institute teachers')
  }
}

const createTeacher = async (req, res) => {
  try {
    const result = await instituteService.createTeacher({
      user: req.user,
      body: req.body,
    })

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.data,
    })
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to create teacher.')
  }
}

const getInvites = async (req, res) => {
  try {
    const data = await instituteService.getInvites({
      user: req.user,
    })

    return res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to fetch institute invites')
  }
}

const resendInvite = async (req, res) => {
  try {
    const result = await instituteService.resendInvite({
      user: req.user,
      inviteId: req.params.id,
    })

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    })
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to resend invite')
  }
}

const deleteTeacher = async (req, res) => {
  try {
    const result = await instituteService.deleteTeacher({
      user: req.user,
      teacherId: req.params.id,
    })

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    })
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to remove teacher.')
  }
}

module.exports = {
  getActivity,
  getDashboardStats,
  getInvites,
  getTeachers,
  createTeacher,
  deleteTeacher,
  resendInvite,
}
