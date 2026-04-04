const crypto = require('crypto')

const normalizeUidBase = (value) => {
  if (!value) {
    return 'AUTO'
  }

  return String(value)
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(-8)
    .toUpperCase() || 'AUTO'
}

const generateTeacherUid = (institutionUid, email = '') => {
  const base = normalizeUidBase(institutionUid)
  const suffixSource = `${email}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
  const suffix = crypto.createHash('sha1').update(suffixSource).digest('hex').slice(0, 6).toUpperCase()

  return `${base}-${suffix}`
}

const generateInstitutionUid = (institutionName = '', adminEmail = '') => {
  const base = normalizeUidBase(institutionName || adminEmail || 'AUTO')
  const suffixSource = `${institutionName}-${adminEmail}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
  const suffix = crypto.createHash('sha1').update(suffixSource).digest('hex').slice(0, 6).toUpperCase()

  return `${base}-${suffix}`
}

module.exports = {
  generateInstitutionUid,
  generateTeacherUid,
  normalizeUidBase,
}
