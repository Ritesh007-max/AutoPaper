const adminService = require('../services/adminService')
const { sendErrorResponse } = require('./responseHelpers')

const getInstituteInvites = async (req, res) => {
  try {
    const result = await adminService.getInstituteInvites({
      query: req.query,
    })

    return res.status(200).json({
      success: true,
      count: result.count,
      data: result.data,
    })
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to fetch institute invites')
  }
}

const createInstituteInvite = async (req, res) => {
  try {
    const result = await adminService.createInstituteInvite({
      body: req.body,
    })

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.data,
    })
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to create institute invite.')
  }
}

const resendInstituteInvite = async (req, res) => {
  try {
    const result = await adminService.resendInstituteInvite({
      inviteId: req.params.id,
    })

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    })
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to resend institute invite.')
  }
}

const removeInstitute = async (req, res) => {
  try {
    const result = await adminService.removeInstitute({
      instituteId: req.params.id,
    })

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    })
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to remove institute.')
  }
}

module.exports = {
  createInstituteInvite,
  getInstituteInvites,
  removeInstitute,
  resendInstituteInvite,
}
