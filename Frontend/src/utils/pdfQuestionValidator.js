const allowedQuestionTypes = ['MCQ', 'short', 'long', 'numerical']
const allowedDifficulty = ['easy', 'medium', 'hard']

const decodePdfLiteralString = (raw) =>
  raw
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')

const extractLiteralStrings = (pdfText) => {
  const values = []
  let depth = 0
  let escaped = false
  let current = ''

  for (let index = 0; index < pdfText.length; index += 1) {
    const char = pdfText[index]

    if (depth === 0) {
      if (char === '(') {
        depth = 1
        current = ''
      }
      continue
    }

    if (escaped) {
      current += `\\${char}`
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    if (char === '(') {
      depth += 1
      current += char
      continue
    }

    if (char === ')') {
      depth -= 1

      if (depth === 0) {
        values.push(decodePdfLiteralString(current))
        continue
      }
    }

    current += char
  }

  return values
}

const decompressFlateStream = async (streamBytes) => {
  if (typeof DecompressionStream === 'undefined') {
    return null
  }

  try {
    const decompressionStream = new DecompressionStream('deflate')
    const decompressedBuffer = await new Response(
      new Blob([streamBytes]).stream().pipeThrough(decompressionStream),
    ).arrayBuffer()
    return new Uint8Array(decompressedBuffer)
  } catch {
    return null
  }
}

const decodeAscii85Stream = (ascii85Text) => {
  const normalized = ascii85Text
    .replace(/<~/g, '')
    .replace(/~>/g, '')
    .replace(/\s+/g, '')
  const output = []
  let group = []

  const pushGroup = (values, outputLength) => {
    let value = 0

    values.forEach((item) => {
      value = value * 85 + item
    })

    const bytes = [
      (value >>> 24) & 0xff,
      (value >>> 16) & 0xff,
      (value >>> 8) & 0xff,
      value & 0xff,
    ]

    for (let index = 0; index < outputLength; index += 1) {
      output.push(bytes[index])
    }
  }

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index]

    if (char === 'z') {
      if (group.length === 0) {
        output.push(0, 0, 0, 0)
      }
      continue
    }

    const code = normalized.charCodeAt(index)
    if (code < 33 || code > 117) {
      continue
    }

    group.push(code - 33)

    if (group.length === 5) {
      pushGroup(group, 4)
      group = []
    }
  }

  if (group.length > 0) {
    const originalLength = group.length
    while (group.length < 5) {
      group.push(84)
    }
    pushGroup(group, originalLength - 1)
  }

  return new Uint8Array(output)
}

const normalizeFilterName = (filterName) => {
  const lowered = filterName.toLowerCase()

  if (lowered === 'flatedecode' || lowered === 'fl') {
    return 'FlateDecode'
  }

  if (lowered === 'ascii85decode' || lowered === 'a85') {
    return 'ASCII85Decode'
  }

  return null
}

const parseFiltersFromDictionary = (dictionaryText) => {
  const arrayFilterMatch = dictionaryText.match(/\/Filter\s*\[(.*?)\]/is)

  if (arrayFilterMatch) {
    return Array.from(arrayFilterMatch[1].matchAll(/\/([A-Za-z0-9]+)/g))
      .map(([, name]) => normalizeFilterName(name))
      .filter(Boolean)
  }

  const singleFilterMatch = dictionaryText.match(/\/Filter\s*\/([A-Za-z0-9]+)/i)
  if (!singleFilterMatch) {
    return []
  }

  const normalizedName = normalizeFilterName(singleFilterMatch[1])
  return normalizedName ? [normalizedName] : []
}

const decodeStreamByFilters = async (streamBytes, filters) => {
  let decoded = streamBytes

  for (const filter of filters) {
    if (filter === 'ASCII85Decode') {
      decoded = decodeAscii85Stream(new TextDecoder('latin1').decode(decoded))
      continue
    }

    if (filter === 'FlateDecode') {
      const decompressed = await decompressFlateStream(decoded)
      if (!decompressed) {
        return null
      }
      decoded = decompressed
      continue
    }

    return null
  }

  return decoded
}

const extractTextFromCompressedStreams = async (pdfBytes) => {
  const pdfText = new TextDecoder('latin1').decode(pdfBytes)
  const streamRegex = /<<(.*?)>>\s*stream\r?\n/gs
  const extractedChunks = []
  let match = streamRegex.exec(pdfText)

  while (match) {
    const filters = parseFiltersFromDictionary(match[1])
    if (filters.length === 0) {
      match = streamRegex.exec(pdfText)
      continue
    }

    const streamStart = streamRegex.lastIndex
    const endStreamIndex = pdfText.indexOf('endstream', streamStart)

    if (endStreamIndex === -1) {
      break
    }

    let streamEnd = endStreamIndex

    while (
      streamEnd > streamStart &&
      (pdfBytes[streamEnd - 1] === 0x0a || pdfBytes[streamEnd - 1] === 0x0d)
    ) {
      streamEnd -= 1
    }

    const streamBytes = pdfBytes.slice(streamStart, streamEnd)
    const decodedBytes = await decodeStreamByFilters(streamBytes, filters)

    if (decodedBytes) {
      extractedChunks.push(new TextDecoder('latin1').decode(decodedBytes))
    }

    match = streamRegex.exec(pdfText)
  }

  return extractedChunks.join('\n')
}

const getFieldValue = (block, fieldName) => {
  const escapedFieldName = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(?:^|\\n)\\s*${escapedFieldName}\\s*:\\s*([^\\n]+)`, 'i')
  const match = block.match(regex)
  return match ? match[1].trim() : ''
}

const parseOptions = (value) =>
  value
    .split(/[|,]/)
    .map((option) => option.trim())
    .filter(Boolean)

const parseQuestionBlocks = (textContent) => {
  const normalized = textContent.replace(/\r/g, '')
  const splitByQuestionHeading = normalized
    .split(/(?:^|\n)\s*Question\s+\d+\s*:\s*/i)
    .map((value) => value.trim())
    .filter(Boolean)
  const splitByQuestionText = normalized
    .split(/(?:^|\n)\s*(?=questionText\s*:)/i)
    .map((value) => value.trim())
    .filter(Boolean)

  const blocks =
    splitByQuestionHeading.length > 1
      ? splitByQuestionHeading
      : splitByQuestionText.length > 0
      ? splitByQuestionText
      : [normalized]

  return blocks
    .map((block) => ({
      questionText: getFieldValue(block, 'questionText'),
      questionType: getFieldValue(block, 'questionType'),
      options: parseOptions(getFieldValue(block, 'options')),
      answer: getFieldValue(block, 'answer'),
      subject: getFieldValue(block, 'subject'),
      chapter: getFieldValue(block, 'chapter'),
      grade: getFieldValue(block, 'grade'),
      difficulty: getFieldValue(block, 'difficulty'),
      marks: getFieldValue(block, 'marks'),
    }))
    .filter((question) =>
      Object.values(question).some((value) => (Array.isArray(value) ? value.length > 0 : value !== '')),
    )
}

const validateQuestion = (question, index) => {
  const errors = []
  const label = `Question ${index + 1}`

  if (!question.questionText) {
    errors.push(`${label}: questionText is required.`)
  }

  if (!question.subject) {
    errors.push(`${label}: subject is required.`)
  }

  if (!question.grade) {
    errors.push(`${label}: grade is required.`)
  } else {
    const parsedGrade = Number(question.grade)
    if (!Number.isInteger(parsedGrade) || parsedGrade < 1) {
      errors.push(`${label}: grade must be an integer >= 1.`)
    }
  }

  if (!question.marks) {
    errors.push(`${label}: marks is required.`)
  } else {
    const parsedMarks = Number(question.marks)
    if (!Number.isInteger(parsedMarks) || parsedMarks < 1) {
      errors.push(`${label}: marks must be an integer >= 1.`)
    }
  }

  if (!allowedQuestionTypes.includes(question.questionType)) {
    errors.push(`${label}: questionType must be one of ${allowedQuestionTypes.join(', ')}.`)
  }

  if (!allowedDifficulty.includes(question.difficulty)) {
    errors.push(`${label}: difficulty must be one of ${allowedDifficulty.join(', ')}.`)
  }

  if (question.questionType === 'MCQ') {
    if (question.options.length < 2) {
      errors.push(`${label}: MCQ must include at least 2 options.`)
    }

    if (!question.answer) {
      errors.push(`${label}: MCQ must include an answer.`)
    } else {
      const hasValidAnswer = question.options.some(
        (option) => option.toLowerCase() === question.answer.toLowerCase(),
      )

      if (!hasValidAnswer) {
        errors.push(`${label}: answer must match one of the provided options.`)
      }
    }
  }

  return errors
}

export const validateQuestionsPdf = async (file) => {
  const buffer = await file.arrayBuffer()
  const pdfBytes = new Uint8Array(buffer)
  const rawPdfText = new TextDecoder('latin1').decode(pdfBytes)
  const literalText = extractLiteralStrings(rawPdfText).join('\n')
  const compressedStreamText = await extractTextFromCompressedStreams(pdfBytes)
  const extractedText = [literalText, extractLiteralStrings(compressedStreamText).join('\n')]
    .filter(Boolean)
    .join('\n')

  if (!extractedText.trim()) {
    return {
      isValid: false,
      questionCount: 0,
      questions: [],
      errors: [
        'Unable to read question text from this PDF. Use text-based PDF format matching the provided template.',
      ],
    }
  }

  const questions = parseQuestionBlocks(extractedText)

  if (questions.length === 0) {
    return {
      isValid: false,
      questionCount: 0,
      questions: [],
      errors: ['No question blocks found. Use fields like questionText:, questionType:, subject:, grade:, difficulty:, marks:.'],
    }
  }

  const allErrors = questions.flatMap((question, index) => validateQuestion(question, index))

  return {
    isValid: allErrors.length === 0,
    questionCount: questions.length,
    questions,
    errors: allErrors,
  }
}
