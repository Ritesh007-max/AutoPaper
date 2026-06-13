const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const teacherRoutes = require('./routes/teacher')
const instituteRoutes = require('./routes/institute')
const adminRoutes = require('./routes/admin')
const { apiLimiter } = require('./middleware/rateLimit')

const app = express()

const getTrustProxyValue = () => {
  const configuredValue = String(process.env.TRUST_PROXY || '').trim()

  if (!configuredValue) {
    return false
  }

  if (configuredValue.toLowerCase() === 'true') {
    return true
  }

  if (configuredValue.toLowerCase() === 'false') {
    return false
  }

  const hopCount = Number.parseInt(configuredValue, 10)

  if (String(hopCount) === configuredValue && hopCount >= 0) {
    return hopCount
  }

  return configuredValue
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

app.set('trust proxy', getTrustProxyValue())

const getAllowedOrigins = () => {
  const configuredOrigins = String(
    process.env.CORS_ALLOWED_ORIGINS || process.env.FRONTEND_URL || '',
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  if (configuredOrigins.length > 0) {
    return configuredOrigins
  }

  return ['http://localhost:5173', 'http://127.0.0.1:5173']// on final deployed site change the local host url to deployed url
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true)
    }

    const allowedOrigins = getAllowedOrigins()

    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(null, false)
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}

app.use(cors(corsOptions))
app.options('/*path', cors(corsOptions))

app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff')
  res.set('X-Frame-Options', 'DENY')
  res.set('Referrer-Policy', 'no-referrer')
  next()
})

app.use(express.json({ limit: '1mb' }))

app.use('/api', apiLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/teacher', teacherRoutes)
app.use('/api/institute', instituteRoutes)
app.use('/api/admin', adminRoutes)

app.use((error, req, res, next) => {
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request body is too large. Maximum JSON payload size is 1 MB.',
    })
  }

  return next(error)
})

module.exports = app
