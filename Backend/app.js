const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const teacherRoutes = require('./routes/teacher')
const instituteRoutes = require('./routes/institute')
const adminRoutes = require('./routes/admin')
const { apiLimiter } = require('./middleware/rateLimit')

const app = express()

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

app.use(express.json({ limit: '1mb' }))

app.use('/api', apiLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/teacher', teacherRoutes)
app.use('/api/institute', instituteRoutes)
app.use('/api/admin', adminRoutes)

module.exports = app
