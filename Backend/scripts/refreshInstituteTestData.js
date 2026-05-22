const fs = require('fs')
const path = require('path')

const mongoose = require('mongoose')

const User = require('../modles/Users')
const Question = require('../modles/Questions')
const Notification = require('../modles/Notification')
const InstituteInvite = require('../modles/InstituteInvite')
const InstituteAdminInvite = require('../modles/InstituteAdminInvite')
const InstituteActivity = require('../modles/InstituteActivity')

const ROOT_DIR = path.resolve(__dirname, '..')
const ENV_PATH = path.join(ROOT_DIR, '.env')
const CREDENTIALS_PATH = path.resolve(ROOT_DIR, '..', 'role-credentials.txt')
const DEFAULT_MONGO_URI = 'mongodb://localhost:27017/AutoPaper'
const TEST_PASSWORD = 'Test@12345'

const TEST_INSTITUTES = [
  {
    institutionName: 'Institute A',
    institutionUid: 'INSTA2026',
    adminName: 'instituteA Admin',
    adminEmail: 'institutea.admin@example.com',
    teacherName: 'teacherA',
    teacherEmail: 'teachera@example.com',
    teacherUid: 'INSTA2026-T001',
  },
  {
    institutionName: 'Institute B',
    institutionUid: 'INSTB2026',
    adminName: 'instituteB Admin',
    adminEmail: 'instituteb.admin@example.com',
    teacherName: 'teacherB',
    teacherEmail: 'teacherb@example.com',
    teacherUid: 'INSTB2026-T001',
  },
]

const QUESTION_BLUEPRINTS = [
  {
    subject: 'Physics',
    chapter: 'Electricity',
    grade: 10,
    difficulty: 'easy',
    marks: 1,
    prompt: 'Which unit is used to measure electric current?',
    options: ['Ampere', 'Volt', 'Newton', 'Joule'],
    answer: 'Ampere',
  },
  {
    subject: 'Chemistry',
    chapter: 'Atoms and Molecules',
    grade: 9,
    difficulty: 'medium',
    marks: 1,
    prompt: 'What is the chemical symbol for sodium?',
    options: ['Na', 'S', 'So', 'Sn'],
    answer: 'Na',
  },
  {
    subject: 'Biology',
    chapter: 'Cell Structure',
    grade: 8,
    difficulty: 'easy',
    marks: 1,
    prompt: 'Which cell component is known as the control center of the cell?',
    options: ['Nucleus', 'Cytoplasm', 'Cell wall', 'Ribosome'],
    answer: 'Nucleus',
  },
  {
    subject: 'Mathematics',
    chapter: 'Linear Equations',
    grade: 8,
    difficulty: 'medium',
    marks: 1,
    prompt: 'What is the value of x in the equation 2x + 6 = 14?',
    options: ['2', '3', '4', '5'],
    answer: '4',
  },
  {
    subject: 'Geography',
    chapter: 'Earth and Climate',
    grade: 7,
    difficulty: 'easy',
    marks: 1,
    prompt: 'Which layer of the atmosphere contains most weather changes?',
    options: ['Troposphere', 'Stratosphere', 'Mesosphere', 'Thermosphere'],
    answer: 'Troposphere',
  },
]

const parseEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return {}
  }

  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce((result, line) => {
      const trimmedLine = line.trim()

      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return result
      }

      const separatorIndex = trimmedLine.indexOf('=')

      if (separatorIndex < 0) {
        return result
      }

      const key = trimmedLine.slice(0, separatorIndex).trim()
      const value = trimmedLine.slice(separatorIndex + 1).trim()
      result[key] = value
      return result
    }, {})
}

const ensureUser = async ({
  name,
  email,
  password,
  role,
  institutionName = '',
  institutionUid = '',
  teacherUid = '',
}) => {
  const user = new User({
    name,
    email,
    password,
    role,
    institutionName,
    institutionUid,
    teacherUid: teacherUid || undefined,
    inviteStatus: 'sent',
    inviteSentAt: new Date(),
  })

  await user.save()
  return user
}

const createInstituteAdminInvite = async ({
  institutionName,
  institutionUid,
  adminName,
  adminEmail,
}) => {
  const invite = new InstituteAdminInvite({
    institutionName,
    adminName,
    adminEmail,
    institutionUid,
    inviteStatus: 'accepted',
    inviteSentAt: new Date(),
    lastSentAt: new Date(),
    archivedAt: null,
  })

  await invite.save()
  return invite
}

const createTeacherInvite = async ({
  institutionUid,
  teacherName,
  teacherEmail,
  teacherUid,
}) => {
  const invite = new InstituteInvite({
    institutionUid,
    name: teacherName,
    email: teacherEmail,
    teacherUid,
    status: 'accepted',
    lastSentAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })

  await invite.save()
  return invite
}

const buildQuestionsForInstitute = ({ institutionUid, teacherUid, createdBy }) =>
  QUESTION_BLUEPRINTS.map((blueprint, index) => ({
    questionText: `[${institutionUid}] Q${index + 1}. ${blueprint.prompt}`,
    questionType: 'MCQ',
    options: blueprint.options,
    answer: blueprint.answer,
    subject: blueprint.subject,
    chapter: blueprint.chapter,
    grade: blueprint.grade,
    difficulty: blueprint.difficulty,
    marks: blueprint.marks,
    createdBy,
    institutionUid,
    teacherUid,
  }))

const buildCredentialsFile = ({ instituteRows, platformAdmin }) => {
  const sections = [
    'AutoPaper demo credentials',
    'Created for institute containerization testing with two clean institute accounts.',
    '',
  ]

  instituteRows.forEach((row, index) => {
    sections.push(`${index + 1}) ${row.teacherName}`)
    sections.push(`Name: ${row.teacherName}`)
    sections.push(`Email: ${row.teacherEmail}`)
    sections.push(`Password: ${TEST_PASSWORD}`)
    sections.push('Role: teacher')
    sections.push(`Institution Name: ${row.institutionName}`)
    sections.push(`Institution UID: ${row.institutionUid}`)
    sections.push(`Teacher UID: ${row.teacherUid}`)
    sections.push('')
  })

  instituteRows.forEach((row, index) => {
    sections.push(`${index + instituteRows.length + 1}) ${row.adminName}`)
    sections.push(`Name: ${row.adminName}`)
    sections.push(`Email: ${row.adminEmail}`)
    sections.push(`Password: ${TEST_PASSWORD}`)
    sections.push('Role: instituteAdmin')
    sections.push(`Institution Name: ${row.institutionName}`)
    sections.push(`Institution UID: ${row.institutionUid}`)
    sections.push('')
  })

  if (platformAdmin) {
    sections.push(`${(instituteRows.length * 2) + 1}) Platform Admin`)
    sections.push(`Name: ${platformAdmin.name}`)
    sections.push(`Email: ${platformAdmin.email}`)
    sections.push('Password: Platform@2026')
    sections.push('Role: Admin')
    sections.push('')
  }

  return `${sections.join('\n').trim()}\n`
}

const main = async () => {
  const env = parseEnvFile(ENV_PATH)
  const mongoUri = process.env.MONGO_URI || env.MONGO_URI || DEFAULT_MONGO_URI

  await mongoose.connect(mongoUri)

  const platformAdmin = await User.findOne({ role: 'Admin' }).select('name email role').lean()

  const [
    deletedQuestions,
    deletedNotifications,
    deletedActivities,
    deletedTeacherInvites,
    deletedInstituteInvites,
    deletedScopedUsers,
  ] = await Promise.all([
    Question.deleteMany({}),
    Notification.deleteMany({}),
    InstituteActivity.deleteMany({}),
    InstituteInvite.deleteMany({}),
    InstituteAdminInvite.deleteMany({}),
    User.deleteMany({ role: { $in: ['teacher', 'instituteAdmin'] } }),
  ])

  const createdInstitutes = []
  const questionsToInsert = []

  for (const config of TEST_INSTITUTES) {
    await createInstituteAdminInvite(config)

    await ensureUser({
      name: config.adminName,
      email: config.adminEmail,
      password: TEST_PASSWORD,
      role: 'instituteAdmin',
      institutionName: config.institutionName,
      institutionUid: config.institutionUid,
    })

    const teacher = await ensureUser({
      name: config.teacherName,
      email: config.teacherEmail,
      password: TEST_PASSWORD,
      role: 'teacher',
      institutionName: config.institutionName,
      institutionUid: config.institutionUid,
      teacherUid: config.teacherUid,
    })

    await createTeacherInvite({
      institutionUid: config.institutionUid,
      teacherName: config.teacherName,
      teacherEmail: config.teacherEmail,
      teacherUid: config.teacherUid,
    })

    createdInstitutes.push({
      institutionName: config.institutionName,
      institutionUid: config.institutionUid,
      adminName: config.adminName,
      adminEmail: config.adminEmail,
      teacherName: config.teacherName,
      teacherEmail: config.teacherEmail,
      teacherUid: config.teacherUid,
    })

    questionsToInsert.push(
      ...buildQuestionsForInstitute({
        institutionUid: config.institutionUid,
        teacherUid: config.teacherUid,
        createdBy: teacher._id,
      }),
    )
  }

  if (questionsToInsert.length > 0) {
    await Question.insertMany(questionsToInsert)
  }

  fs.writeFileSync(
    CREDENTIALS_PATH,
    buildCredentialsFile({
      instituteRows: createdInstitutes,
      platformAdmin,
    }),
    'utf8',
  )

  console.log(JSON.stringify({
    success: true,
    mongoUri,
    deleted: {
      questions: deletedQuestions.deletedCount || 0,
      notifications: deletedNotifications.deletedCount || 0,
      instituteActivities: deletedActivities.deletedCount || 0,
      teacherInvites: deletedTeacherInvites.deletedCount || 0,
      instituteAdminInvites: deletedInstituteInvites.deletedCount || 0,
      scopedUsers: deletedScopedUsers.deletedCount || 0,
    },
    createdInstituteCount: createdInstitutes.length,
    insertedQuestionCount: questionsToInsert.length,
    createdInstitutes,
    credentialsFile: CREDENTIALS_PATH,
  }, null, 2))
}

main()
  .catch(async (error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
