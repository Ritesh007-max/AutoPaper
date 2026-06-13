class ServiceError extends Error {
  constructor(status, message, details = {}) {
    super(message)
    this.name = 'ServiceError'
    this.status = status
    Object.assign(this, details)
  }
}

const createServiceError = (status, message, details = {}) =>
  new ServiceError(status, message, details)

const isServiceError = (error) =>
  error instanceof ServiceError || Number.isInteger(error?.status)

module.exports = {
  ServiceError,
  createServiceError,
  isServiceError,
}
