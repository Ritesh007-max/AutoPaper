const escapePdfText = (value) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')

const buildContentStream = (lines) => {
  const topMarginY = 800
  const lineHeight = 16
  const safeLines = lines.slice(0, 45)

  const pdfLines = safeLines.map((line, index) => {
    const y = topMarginY - index * lineHeight
    return `BT /F1 11 Tf 48 ${y} Td (${escapePdfText(line)}) Tj ET`
  })

  return `${pdfLines.join('\n')}\n`
}

const buildPdfDocument = (contentStream) => {
  const header = '%PDF-1.4\n'
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n',
    `4 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ]

  let output = header
  const offsets = [0]

  objects.forEach((object) => {
    offsets.push(output.length)
    output += object
  })

  const xrefStart = output.length
  output += `xref\n0 ${objects.length + 1}\n`
  output += '0000000000 65535 f \n'

  offsets.slice(1).forEach((offset) => {
    output += `${String(offset).padStart(10, '0')} 00000 n \n`
  })

  output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
  return output
}

export const createQuestionSchemaPdfBlob = () => {
  const lines = [
    'AutoPaper Bulk Question Upload - PDF Template Guide',
    '',
    'Allowed file type: PDF only (.pdf)',
    'Your uploaded PDF must describe each question using these fields:',
    '',
    '1. questionText (required, string)',
    '2. questionType (required, one of: MCQ, short, long, numerical)',
    '3. options (array of strings, mainly for MCQ)',
    '4. answer (string)',
    '5. subject (required, string)',
    '6. chapter (string)',
    '7. grade (required, number)',
    '8. difficulty (required, one of: easy, medium, hard)',
    '9. marks (required, number)',
    '',
    'Recommended per-question format inside your PDF:',
    'Question 1:',
    'questionText: What is 2 + 2?',
    'questionType: MCQ',
    'options: 1 | 2 | 3 | 4',
    'answer: 4',
    'subject: Mathematics',
    'chapter: Arithmetic',
    'grade: 6',
    'difficulty: easy',
    'marks: 1',
    '',
    'Validation is based on your backend Question model schema.',
  ]

  const contentStream = buildContentStream(lines)
  const pdfText = buildPdfDocument(contentStream)
  return new Blob([pdfText], { type: 'application/pdf' })
}
