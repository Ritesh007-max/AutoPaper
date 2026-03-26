const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'instituteAdmin', 'Admin', 'Student'], required: true },
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' }
}, {
  timestamps: true,
})

module.exports = mongoose.model('User', userSchema)
