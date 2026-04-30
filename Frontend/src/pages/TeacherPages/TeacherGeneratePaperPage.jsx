import { useEffect, useState } from 'react'

import { getQuestionFilters, getQuestions } from '../../api/questions'
import FormField from '../../components/FormField'
import SectionCard from '../../components/SectionCard'
import StatusBanner from '../../components/StatusBanner'
import { baseInputClassName } from '../../components/formStyles'
import { difficultyOptions, questionTypeOptions } from '../../constants/questionForm'
import { createGeneratedPaperPdfBlob } from '../../utils/generatePaperPdf'

const uniqueStringValues = (values = []) =>
  Array.from(
    new Set(
      values
        .map((value) => String(value).trim())
        .filter(Boolean),
    ),
  )

const createSection = (section = {}) => ({
  id: section.id || crypto.randomUUID(),
  title: section.title || 'New Section',
  questionType: section.questionType || '',
  difficulty: section.difficulty || '',
  count: section.count || '3',
  marksPerQuestion: section.marksPerQuestion || '1',
})

const plannerTemplates = {
  balanced: {
    title: 'Balanced Test',
    description: 'A mixed paper with objective and descriptive sections.',
    createBlueprint: () => ({
      title: 'Balanced Assessment',
      duration: '60',
      subject: '',
      chapter: '',
      grade: '',
      instructions:
        'Answer all questions. Read each section carefully before attempting.',
      sections: [
        createSection({ title: 'Section A', questionType: 'MCQ', difficulty: 'easy', count: '5', marksPerQuestion: '1' }),
        createSection({ title: 'Section B', questionType: 'short', difficulty: 'medium', count: '4', marksPerQuestion: '2' }),
        createSection({ title: 'Section C', questionType: 'long', difficulty: 'hard', count: '2', marksPerQuestion: '5' }),
      ],
    }),
  },
  objective: {
    title: 'Objective Quiz',
    description: 'Fast quiz paper for quick classroom checks.',
    createBlueprint: () => ({
      title: 'Objective Quiz',
      duration: '30',
      subject: '',
      chapter: '',
      grade: '',
      instructions: 'Choose the best answer for each question.',
      sections: [
        createSection({ title: 'Section A', questionType: 'MCQ', difficulty: 'easy', count: '10', marksPerQuestion: '1' }),
        createSection({ title: 'Section B', questionType: 'numerical', difficulty: 'medium', count: '5', marksPerQuestion: '2' }),
      ],
    }),
  },
  practice: {
    title: 'Written Practice',
    description: 'Useful for revision or take-home practice sets.',
    createBlueprint: () => ({
      title: 'Revision Practice Set',
      duration: '90',
      subject: '',
      chapter: '',
      grade: '',
      instructions:
        'Attempt each question with clear workings and complete steps where needed.',
      sections: [
        createSection({ title: 'Section A', questionType: 'short', difficulty: 'medium', count: '6', marksPerQuestion: '2' }),
        createSection({ title: 'Section B', questionType: 'long', difficulty: 'hard', count: '3', marksPerQuestion: '5' }),
      ],
    }),
  },
}

const createInitialBlueprint = () => plannerTemplates.balanced.createBlueprint()

const initialFilterOptions = {
  subjects: [],
  chapters: [],
  grades: [],
}

const normalizeComparableValue = (value) => String(value || '').trim().toLowerCase()

const buildScopedQueryParams = (blueprint) => {
  const params = {}

  if (blueprint.subject) {
    params.subject = blueprint.subject
  }

  if (blueprint.chapter) {
    params.chapter = blueprint.chapter
  }

  if (blueprint.grade) {
    params.grade = blueprint.grade
  }

  return params
}

const toPositiveInteger = (value) => {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed
}

const matchesGlobalFilters = (question, blueprint) => {
  if (
    blueprint.subject &&
    normalizeComparableValue(question.subject) !== normalizeComparableValue(blueprint.subject)
  ) {
    return false
  }

  if (
    blueprint.chapter &&
    normalizeComparableValue(question.chapter) !== normalizeComparableValue(blueprint.chapter)
  ) {
    return false
  }

  if (
    blueprint.grade &&
    normalizeComparableValue(question.grade) !== normalizeComparableValue(blueprint.grade)
  ) {
    return false
  }

  return true
}

const matchesSectionFilters = (question, section) => {
  if (
    section.questionType &&
    normalizeComparableValue(question.questionType) !== normalizeComparableValue(section.questionType)
  ) {
    return false
  }

  if (
    section.difficulty &&
    normalizeComparableValue(question.difficulty) !== normalizeComparableValue(section.difficulty)
  ) {
    return false
  }

  return true
}

function TemplateButton({ title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-3xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/60"
    >
      <p className="text-sm font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </button>
  )
}

function InsightTile({ label, value, tone = 'indigo' }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
  }

  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50 px-4 py-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <div className={`mt-3 inline-flex rounded-2xl px-3 py-2 text-lg font-black ${tones[tone] || tones.indigo}`}>
        {value}
      </div>
    </div>
  )
}

function TeacherGeneratePaperPage() {
  const [blueprint, setBlueprint] = useState(createInitialBlueprint)
  const [filterOptions, setFilterOptions] = useState(initialFilterOptions)
  const [questionBank, setQuestionBank] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingQuestionBank, setLoadingQuestionBank] = useState(true)
  const [status, setStatus] = useState({
    type: 'info',
    message: 'Build the paper blueprint here. The screen checks your live question bank so you can plan with confidence.',
  })

  useEffect(() => {
    let active = true

    const loadPlannerData = async () => {
      try {
        const filtersResponse = await getQuestionFilters()

        if (!active) {
          return
        }

        const filters = filtersResponse.data?.data ?? {}

        setFilterOptions({
          subjects: uniqueStringValues(filters.subjects).sort((left, right) => left.localeCompare(right)),
          chapters: uniqueStringValues(filters.chapters).sort((left, right) => left.localeCompare(right)),
          grades: Array.from(
            new Set(
              (Array.isArray(filters.grades) ? filters.grades : [])
                .map((grade) => Number(grade))
                .filter((grade) => !Number.isNaN(grade)),
            ),
          ).sort((left, right) => left - right),
        })
        setStatus({
          type: 'info',
          message: 'Planner ready. Choose your paper filters and the matching questions will be pulled from the backend.',
        })
      } catch (error) {
        if (!active) {
          return
        }

        setFilterOptions(initialFilterOptions)
        setQuestionBank([])
        setStatus({
          type: 'error',
          message: error.response?.data?.message || error.message || 'Failed to load paper planning data.',
        })
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadPlannerData()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadScopedQuestions = async () => {
      setLoadingQuestionBank(true)

      try {
        const response = await getQuestions(buildScopedQueryParams(blueprint))
        const questions = Array.isArray(response.data?.data) ? response.data.data : []

        if (!active) {
          return
        }

        setQuestionBank(questions)
        setStatus({
          type: 'success',
          message: `Planner synced with backend. ${questions.length} question(s) match the current paper scope.`,
        })
      } catch (error) {
        if (!active) {
          return
        }

        setQuestionBank([])
        setStatus({
          type: 'error',
          message: error.response?.data?.message || error.message || 'Failed to load scoped questions for this paper.',
        })
      } finally {
        if (active) {
          setLoading(false)
          setLoadingQuestionBank(false)
        }
      }
    }

    loadScopedQuestions()

    return () => {
      active = false
    }
  }, [blueprint.subject, blueprint.chapter, blueprint.grade])

  const scopedQuestions = questionBank.filter((question) => matchesGlobalFilters(question, blueprint))

  const usedQuestionIds = new Set()

  const sectionInsights = blueprint.sections.map((section) => {
    const matchingQuestions = scopedQuestions.filter((question) => {
      if (!matchesSectionFilters(question, section)) {
        return false
      }

      if (usedQuestionIds.has(String(question._id || ''))) {
        return false
      }

      return true
    })
    const requestedCount = toPositiveInteger(section.count)
    const marksPerQuestion = toPositiveInteger(section.marksPerQuestion)
    const selectedQuestions = matchingQuestions.slice(0, requestedCount)

    selectedQuestions.forEach((question) => {
      usedQuestionIds.add(String(question._id || ''))
    })

    return {
      ...section,
      requestedCount,
      marksPerQuestion,
      availableCount: matchingQuestions.length,
      shortfall: Math.max(requestedCount - selectedQuestions.length, 0),
      plannedMarks: requestedCount * marksPerQuestion,
      selectedQuestions,
      sampleQuestions: selectedQuestions.length > 0 ? selectedQuestions.slice(0, 2) : matchingQuestions.slice(0, 2),
    }
  })

  const totalQuestions = sectionInsights.reduce((sum, section) => sum + section.requestedCount, 0)
  const totalMarks = sectionInsights.reduce((sum, section) => sum + section.plannedMarks, 0)
  const readySections = sectionInsights.filter((section) => section.shortfall === 0 && section.requestedCount > 0).length

  const updateBlueprintField = (field, value) => {
    setBlueprint((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const updateSectionField = (sectionId, field, value) => {
    setBlueprint((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              [field]: value,
            }
          : section,
      ),
    }))
  }

  const handleApplyTemplate = (templateKey) => {
    const template = plannerTemplates[templateKey]

    if (!template) {
      return
    }

    setBlueprint(template.createBlueprint())
    setStatus({
      type: 'success',
      message: `${template.title} loaded. Adjust the filters and sections to match your class.`,
    })
  }

  const handleAddSection = () => {
    setBlueprint((current) => ({
      ...current,
      sections: [
        ...current.sections,
        createSection({
          title: `Section ${String.fromCharCode(65 + current.sections.length)}`,
          count: '3',
          marksPerQuestion: '1',
        }),
      ],
    }))
  }

  const handleRemoveSection = (sectionId) => {
    setBlueprint((current) => {
      if (current.sections.length === 1) {
        return current
      }

      return {
        ...current,
        sections: current.sections.filter((section) => section.id !== sectionId),
      }
    })
  }

  const handlePrepareDraft = () => {
    const blockedSections = sectionInsights.filter((section) => section.shortfall > 0)

    if (blockedSections.length > 0) {
      setStatus({
        type: 'error',
        message: `This draft needs ${blockedSections[0].shortfall} more matching question(s) in ${blockedSections[0].title}. Adjust the filters or reduce the section count.`,
      })
      return
    }

    const paperBlob = createGeneratedPaperPdfBlob({
      blueprint,
      sections: sectionInsights,
      totalMarks,
      totalQuestions,
    })
    const downloadUrl = URL.createObjectURL(paperBlob)
    const safeFileName = String(blueprint.title || 'generated-paper')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    const link = document.createElement('a')

    link.href = downloadUrl
    link.download = `${safeFileName || 'generated-paper'}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.setTimeout(() => {
      URL.revokeObjectURL(downloadUrl)
    }, 1000)

    setStatus({
      type: 'success',
      message: `PDF downloaded with ${totalQuestions} question(s), ${totalMarks} total marks, and ${blueprint.duration} minutes duration.`,
    })
  }

  return (
    <div className="space-y-8 pb-10">
      <section className="overflow-hidden rounded-[2rem] border border-indigo-100 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_34%),linear-gradient(135deg,_#ffffff,_#eef2ff_52%,_#f8fafc)] px-6 py-7 shadow-lg shadow-indigo-100/50 md:px-8 md:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-indigo-500">Generate Paper</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              Plan a paper with live question-bank coverage
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              Set the paper structure, filter by class context, and check whether your bank already has enough questions
              before you generate.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <InsightTile label="Question Pool" value={String(scopedQuestions.length)} />
            <InsightTile label="Sections Ready" value={`${readySections}/${blueprint.sections.length}`} tone="emerald" />
            <InsightTile label="Draft Marks" value={String(totalMarks)} tone="amber" />
          </div>
        </div>
      </section>

      <SectionCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Quick Start</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Choose a paper style</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Start from a balanced test, a rapid objective quiz, or a written practice set, then fine-tune the sections.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {Object.entries(plannerTemplates).map(([key, template]) => (
            <TemplateButton
              key={key}
              title={template.title}
              description={template.description}
              onClick={() => handleApplyTemplate(key)}
            />
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <SectionCard>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Paper Builder</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Configure the paper</h2>
            </div>
            <button
              type="button"
              onClick={handlePrepareDraft}
              className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700"
            >
              Download PDF
            </button>
          </div>

          <StatusBanner status={status} />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <FormField label="Paper Title">
              <input
                className={baseInputClassName}
                type="text"
                value={blueprint.title}
                onChange={(event) => updateBlueprintField('title', event.target.value)}
                placeholder="Final Term Mathematics Paper"
              />
            </FormField>

            <FormField label="Duration (Minutes)">
              <input
                className={baseInputClassName}
                type="number"
                min="0"
                value={blueprint.duration}
                onChange={(event) => updateBlueprintField('duration', event.target.value)}
                placeholder="60"
              />
            </FormField>

            <FormField label="Subject">
              <select
                className={baseInputClassName}
                value={blueprint.subject}
                onChange={(event) => updateBlueprintField('subject', event.target.value)}
                disabled={loading}
              >
                <option value="">All subjects</option>
                {filterOptions.subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Grade">
              <select
                className={baseInputClassName}
                value={blueprint.grade}
                onChange={(event) => updateBlueprintField('grade', event.target.value)}
                disabled={loading}
              >
                <option value="">All grades</option>
                {filterOptions.grades.map((grade) => (
                  <option key={grade} value={String(grade)}>
                    {grade}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Chapter Focus">
                <select
                  className={baseInputClassName}
                  value={blueprint.chapter}
                  onChange={(event) => updateBlueprintField('chapter', event.target.value)}
                  disabled={loading}
                >
                  <option value="">All chapters</option>
                  {filterOptions.chapters.map((chapter) => (
                    <option key={chapter} value={chapter}>
                      {chapter}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="md:col-span-2">
              <FormField label="Instructions">
                <textarea
                  className={`${baseInputClassName} min-h-28 resize-y`}
                  value={blueprint.instructions}
                  onChange={(event) => updateBlueprintField('instructions', event.target.value)}
                  placeholder="Add candidate instructions for this paper."
                />
              </FormField>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Sections</p>
              <h3 className="mt-2 text-xl font-black text-slate-900">Shape the question mix</h3>
            </div>
            <button
              type="button"
              onClick={handleAddSection}
              className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Add Section
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {blueprint.sections.map((section, index) => {
              const insight = sectionInsights[index]
              const availabilityLabel =
                insight.shortfall > 0
                  ? `${insight.shortfall} more needed`
                  : `${insight.availableCount} ready to use`

              return (
                <article key={section.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-4 md:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          className="min-w-[180px] flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                          type="text"
                          value={section.title}
                          onChange={(event) => updateSectionField(section.id, 'title', event.target.value)}
                          aria-label={`Section ${index + 1} title`}
                        />
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${
                            insight.shortfall > 0
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {availabilityLabel}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSection(section.id)}
                      disabled={blueprint.sections.length === 1}
                      className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-600 transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <FormField label="Question Type">
                      <select
                        className={baseInputClassName}
                        value={section.questionType}
                        onChange={(event) => updateSectionField(section.id, 'questionType', event.target.value)}
                      >
                        <option value="">Any type</option>
                        {questionTypeOptions.map((questionType) => (
                          <option key={questionType} value={questionType}>
                            {questionType}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label="Difficulty">
                      <select
                        className={baseInputClassName}
                        value={section.difficulty}
                        onChange={(event) => updateSectionField(section.id, 'difficulty', event.target.value)}
                      >
                        <option value="">Any difficulty</option>
                        {difficultyOptions.map((difficulty) => (
                          <option key={difficulty} value={difficulty}>
                            {difficulty}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label="Questions Needed">
                      <input
                        className={baseInputClassName}
                        type="number"
                        min="0"
                        value={section.count}
                        onChange={(event) => updateSectionField(section.id, 'count', event.target.value)}
                      />
                    </FormField>

                    <FormField label="Marks Each">
                      <input
                        className={baseInputClassName}
                        type="number"
                        min="0"
                        value={section.marksPerQuestion}
                        onChange={(event) => updateSectionField(section.id, 'marksPerQuestion', event.target.value)}
                      />
                    </FormField>
                  </div>
                </article>
              )
            })}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Draft Summary</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">{blueprint.title || 'Untitled paper'}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {blueprint.subject || 'All subjects'} {blueprint.grade ? `| Grade ${blueprint.grade}` : ''}
              {blueprint.chapter ? ` | ${blueprint.chapter}` : ''} {blueprint.duration ? `| ${blueprint.duration} min` : ''}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <InsightTile label="Questions" value={String(totalQuestions)} />
              <InsightTile label="Total Marks" value={String(totalMarks)} tone="amber" />
              <InsightTile label="Bank Match" value={String(scopedQuestions.length)} tone="emerald" />
            </div>

            <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50 px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Instructions</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {blueprint.instructions || 'No instructions added yet.'}
              </p>
            </div>
          </SectionCard>

          <SectionCard>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Blueprint Preview</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Section plan</h2>

            <div className="mt-6 space-y-4">
              {sectionInsights.map((section) => (
                <article key={section.id} className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{section.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {section.questionType || 'Mixed types'} | {section.difficulty || 'Mixed difficulty'} |{' '}
                        {section.requestedCount} question(s)
                      </p>
                    </div>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-indigo-700">
                      {section.plannedMarks} marks
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-700">
                      {loadingQuestionBank
                        ? 'Checking matching questions from the backend...'
                        : section.shortfall > 0
                        ? `Needs ${section.shortfall} more matching question(s) to complete this section.`
                        : `Coverage check passed with ${section.availableCount} matching question(s).`}
                    </p>
                    <div className="mt-3 space-y-2">
                      {loadingQuestionBank ? (
                        <p className="text-sm leading-6 text-slate-500">
                          Refreshing paper samples for the selected scope.
                        </p>
                      ) : section.sampleQuestions.length > 0 ? (
                        section.sampleQuestions.map((question) => (
                          <p key={question._id} className="text-sm leading-6 text-slate-500">
                            {question.questionText || 'Untitled question'}
                          </p>
                        ))
                      ) : (
                        <p className="text-sm leading-6 text-slate-500">
                          No sample questions match this filter combination yet.
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

export default TeacherGeneratePaperPage
