const jwt = require('jsonwebtoken')

const getJwtSecret = () => process.env.JWT_SECRET || 'autopaper-dev-secret'

const authenticateToken = (req, res, next) => {
  const authorizationHeader = req.headers.authorization || ''
  const [, token] = authorizationHeader.split(' ')

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is required.',
    })
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret())
    req.user = decoded
    return next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      error: error.message,
    })
  }
}

const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication is required.',
    })
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this resource.',
    })
  }

  return next()
}

module.exports = {
  authenticateToken,
  authorizeRoles,
  getJwtSecret,
}
