const fs = require('fs')
const path = require('path')
const express = require('express')

const frontendDistPath = path.join(__dirname, '..', 'Frontend', 'dist')
const frontendIndexPath = path.join(frontendDistPath, 'index.html')

const loadEnvFile = () => {
  const envPath = path.join(__dirname, '.env')

  if (!fs.existsSync(envPath)) {
    return
  }

  const envFile = fs.readFileSync(envPath, 'utf8')

  for (const line of envFile.split(/\r?\n/)) {
    const trimmedLine = line.trim()

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmedLine.indexOf('=')

    if (separatorIndex === -1) {
      continue
    }

    const key = trimmedLine.slice(0, separatorIndex).trim()
    const value = trimmedLine.slice(separatorIndex + 1).trim()

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

const startServer = async () => {
  try {
    loadEnvFile()

    const app = require('./app')
    const connectDB = require('./Config/db')

    await connectDB()

    if (fs.existsSync(frontendIndexPath)) {
      app.use(express.static(frontendDistPath))

      app.get(/^(?!\/api\/).*/, (req, res, next) => {
        if (req.method !== 'GET') {
          return next()
        }

        return res.sendFile(frontendIndexPath)
      })
    }

    const port = process.env.PORT || 3000

    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
    })

    server.requestTimeout = 30 * 1000
    server.headersTimeout = 10 * 1000
    server.keepAliveTimeout = 5 * 1000
  } catch (error) {
    console.error('Failed to start server', error)
    process.exit(1)
  }
}

startServer()
