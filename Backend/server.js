const fs = require('fs')
const path = require('path')

const app = require('./app')
const connectDB = require('./Config/db')

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
    await connectDB()

    const port = process.env.PORT || 3000

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
    })
  } catch (error) {
    console.error('Failed to start server', error)
    process.exit(1)
  }
}

startServer()
