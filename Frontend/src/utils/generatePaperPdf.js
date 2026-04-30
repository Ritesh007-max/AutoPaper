const escapePdfText = (value) =>
  String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')

const wrapLine = (line, maxLength = 88) => {
  const normalizedLine = String(line || '').trimEnd()

  if (!normalizedLine) {
    return ['']
  }

  const words = normalizedLine.split(/\s+/)
  const wrappedLines = []
  let currentLine = ''

  words.forEach((word) => {
    if (!currentLine) {
      currentLine = word
      return
    }

    const candidateLine = `${currentLine} ${word}`

    if (candidateLine.length <= maxLength) {
      currentLine = candidateLine
      return
    }

    wrappedLines.push(currentLine)
    currentLine = word
  })

  if (currentLine) {
    wrappedLines.push(currentLine)
  }

  return wrappedLines
}

const paginateLines = (lines, linesPerPage = 45) => {
  const pages = []

  for (let index = 0; index < lines.length; index += linesPerPage) {
    pages.push(lines.slice(index, index + linesPerPage))
  }

  return pages.length ? pages : [[]]
}

const buildContentStream = (lines) => {
  const topMarginY = 800
  const lineHeight = 16

  return `${lines
    .map((line, index) => {
      const y = topMarginY - index * lineHeight
      return `BT /F1 11 Tf 48 ${y} Td (${escapePdfText(line)}) Tj ET`
    })
    .join('\n')}\n`
}

const buildPdfDocument = (pageStreams) => {
  const objects = []
  const pageObjectIds = []
  const contentObjectIds = []
  const pagesRootId = 2
  const fontObjectId = 3

  objects[1] = `1 0 obj\n<< /Type /Catalog /Pages ${pagesRootId} 0 R >>\nendobj\n`
  objects[fontObjectId] =
    '3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n'

  let nextObjectId = 4

  pageStreams.forEach((stream) => {
    const pageObjectId = nextObjectId
    const contentObjectId = nextObjectId + 1

    pageObjectIds.push(pageObjectId)
    contentObjectIds.push(contentObjectId)

    objects[pageObjectId] =
      `${pageObjectId} 0 obj\n` +
      `<< /Type /Page /Parent ${pagesRootId} 0 R /MediaBox [0 0 595 842] ` +
      `/Resources << /Font << /F1 ${fontObjectId} 0 R >> >> ` +
      `/Contents ${contentObjectId} 0 R >>\nendobj\n`
    objects[contentObjectId] =
      `${contentObjectId} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj\n`

    nextObjectId += 2
  })

  objects[pagesRootId] =
    `2 0 obj\n<< /Type /Pages /Count ${pageObjectIds.length} /Kids [` +
    `${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] >>\nendobj\n`

  let output = '%PDF-1.4\n'
  const offsets = ['0000000000 65535 f \n']

  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = `${String(output.length).padStart(10, '0')} 00000 n \n`
    output += objects[id]
  }

  const xrefStart = output.length
  output += `xref\n0 ${objects.length}\n`
  output += offsets.join('')
  output += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  return output
}

const buildPaperLines = ({ blueprint, sections, totalMarks, totalQuestions }) => {
  const lines = []

  const pushWrapped = (line = '') => {
    wrapLine(line).forEach((wrappedLine) => {
      lines.push(wrappedLine)
    })
  }

  pushWrapped(blueprint.title || 'AutoPaper Generated Paper')
  lines.push('')

  const metaParts = [
    blueprint.subject ? `Subject: ${blueprint.subject}` : 'Subject: Mixed',
    blueprint.grade ? `Grade: ${blueprint.grade}` : 'Grade: Mixed',
    blueprint.chapter ? `Chapter: ${blueprint.chapter}` : 'Chapter: Mixed',
  ]

  pushWrapped(metaParts.join(' | '))
  pushWrapped(`Duration: ${blueprint.duration || 'N/A'} minutes | Total Marks: ${totalMarks} | Total Questions: ${totalQuestions}`)
  lines.push('')
  pushWrapped('Instructions:')
  pushWrapped(blueprint.instructions || 'Answer all questions.')

  let overallQuestionNumber = 1

  sections.forEach((section) => {
    lines.push('')
    pushWrapped(`${section.title} (${section.selectedQuestions.length} questions, ${section.plannedMarks} marks)`)

    section.selectedQuestions.forEach((question) => {
      lines.push('')
      pushWrapped(`${overallQuestionNumber}. ${question.questionText || 'Untitled question'} (${section.marksPerQuestion} mark${section.marksPerQuestion === 1 ? '' : 's'})`)

      if (Array.isArray(question.options) && question.options.length > 0) {
        question.options.forEach((option, optionIndex) => {
          const optionLabel = String.fromCharCode(65 + optionIndex)
          pushWrapped(`   ${optionLabel}. ${option}`)
        })
      }

      overallQuestionNumber += 1
    })
  })

  return lines
}

export const createGeneratedPaperPdfBlob = ({ blueprint, sections, totalMarks, totalQuestions }) => {
  const lines = buildPaperLines({ blueprint, sections, totalMarks, totalQuestions })
  const pages = paginateLines(lines)
  const pageStreams = pages.map((pageLines) => buildContentStream(pageLines))
  const pdfText = buildPdfDocument(pageStreams)

  return new Blob([pdfText], { type: 'application/pdf' })
}
