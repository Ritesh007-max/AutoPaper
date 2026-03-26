export const emptyForm = {
  questionText: '',
  questionType: '',
  optionsText: '',
  answer: '',
  subject: '',
  chapter: '',
  grade: '10',
  difficulty: 'easy',
  marks: '1',
}

export const questionTypeOptions = ['MCQ', 'short', 'long', 'numerical']

export const difficultyOptions = ['easy', 'medium', 'hard']

export const questionExamples = [
  {
    type: 'MCQ',
    title: 'Multiple Choice',
    description: 'Use one option per line and keep the answer identical to one of the options.',
    example: {
      questionText: 'What is the chemical symbol for water?',
      subject: 'Science',
      chapter: 'Chemistry Basics',
      answer: 'H2O',
      optionsText: 'H2O\nO2\nCO2\nNaCl',
    },
  },
  {
    type: 'short',
    title: 'Short Answer',
    description: 'Best for direct 1-3 line responses.',
    example: {
      questionText: 'Define photosynthesis.',
      subject: 'Biology',
      chapter: 'Plant Processes',
      answer: 'Photosynthesis is the process by which green plants make food using sunlight, water, and carbon dioxide.',
    },
  },
  {
    type: 'long',
    title: 'Long Answer',
    description: 'Use for descriptive answers that require steps, explanation, or structure.',
    example: {
      questionText: 'Explain the water cycle with all major stages.',
      subject: 'Geography',
      chapter: 'Water Resources',
      answer: 'The water cycle includes evaporation, condensation, precipitation, and collection. Water evaporates due to heat, forms clouds through condensation, falls as precipitation, and returns to rivers, lakes, and oceans.',
    },
  },
  {
    type: 'numerical',
    title: 'Numerical',
    description: 'Keep the final answer concise and numeric where possible.',
    example: {
      questionText: 'A student buys 3 notebooks for 25 each. What is the total cost?',
      subject: 'Mathematics',
      chapter: 'Multiplication',
      answer: '75',
    },
  },
]
