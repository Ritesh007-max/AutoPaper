const { isServiceError } = require('../services/serviceError')

const sendErrorResponse = (res, error, fallbackMessage) => {
  if (isServiceError(error)) {
    const body = {
      success: false,
      message: error.message,
    }

    if (error.errors) {
      body.errors = error.errors
    }

    if (error.data) {
      body.data = error.data
    }

    if (error.exposeError) {
      body.error = error.exposeError
    }

    return res.status(error.status).json(body)
  }

  if (error?.name === 'ValidationError' || error?.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: fallbackMessage,
      error: error.message,
    })
  }

  return res.status(500).json({
    success: false,
    message: fallbackMessage,
    error: error.message,
  })
}

module.exports = {
  sendErrorResponse,
}
