import { questionExamples } from '../constants/questionForm'

function ExampleBlock({ label, value, multiline = false }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      {multiline ? (
        <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{value}</pre>
      ) : (
        <p className="mt-2 text-sm leading-6 text-slate-700">{value}</p>
      )}
    </div>
  )
}

function QuestionExamples({ selectedType }) {
  const selectedExample = questionExamples.find((item) => item.type === selectedType)

  if (!selectedExample) {
    return (
      <div className="flex min-h-full items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Input Reference</p>
          <h2 className="mt-3 text-2xl font-black text-slate-900">Question Format Example</h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
            Select a question type in the form to see the recommended input format.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Input Reference</p>
      <h2 className="mt-2 text-2xl font-black text-slate-900">Question Format Example</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        Use this sample as a guide for how the selected question type should be entered in the form.
      </p>

      <div className="mt-8">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              {selectedExample.type}
            </span>
            <h3 className="text-lg font-bold text-slate-900">{selectedExample.title}</h3>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">{selectedExample.description}</p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <ExampleBlock label="Question Text" value={selectedExample.example.questionText} />
            <ExampleBlock label="Subject" value={selectedExample.example.subject} />
            <ExampleBlock label="Chapter" value={selectedExample.example.chapter} />
            <ExampleBlock label="Answer" value={selectedExample.example.answer} />
            {selectedExample.example.optionsText ? (
              <div className="md:col-span-2">
                <ExampleBlock label="Options" value={selectedExample.example.optionsText} multiline />
              </div>
            ) : null}
          </div>
        </article>
      </div>
    </div>
  )
}

export default QuestionExamples
