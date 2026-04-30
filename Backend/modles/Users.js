const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'instituteAdmin', 'Admin', 'Student'], required: true },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleId: { type: String, unique: true, sparse: true },
  institutionName: { type: String },
  institutionUid: { type: String },
  teacherUid: { type: String, unique: true, sparse: true },
  inviteStatus: { type: String, enum: ['draft', 'sent'], default: 'draft' },
  inviteSentAt: { type: Date },
  passwordResetTokenHash: { type: String, sparse: true },
  passwordResetTokenExpiresAt: { type: Date },
}, {
  timestamps: true,
})

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) {
    return
  }

  if (typeof this.password === 'string' && this.password.startsWith('$2')) {
    return
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(String(this.password), salt)
})

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  if (typeof this.password !== 'string') {
    return false
  }

  if (this.password.startsWith('$2')) {
    return bcrypt.compare(String(candidatePassword), this.password)
  }

  return this.password === String(candidatePassword)
}

module.exports = mongoose.model('User', userSchema)
