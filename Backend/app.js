const express = require('express')

const teacherRoutes = require('./routes/teacher')
const instituteRoutes = require('./routes/institute')
const adminRoutes = require('./routes/admin')

const app = express()
app.use(express.json())

app.use('/api/teacher', teacherRoutes)
app.use('/api/institute', instituteRoutes)
app.use('/api/admin', adminRoutes)

module.exports = app
