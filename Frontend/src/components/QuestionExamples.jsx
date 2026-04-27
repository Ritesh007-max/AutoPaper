import { questionExamples } from '../constants/questionForm'

function ExampleBlock({ label, value, multiline = false }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
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
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Paper Preview</p>
          <h2 className="mt-2 text-xl font-black text-slate-900">Question Format Example</h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Select a question type in the form to see the recommended input format.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl min-w-0">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Paper Preview</p>
      <h2 className="mt-2 text-xl font-black text-slate-900">Question Format Example</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        Use this sample as a guide for how the selected question type should be entered in the form.
      </p>

      <div className="mt-6 w-full">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
              {selectedExample.type}
            </span>
            <h3 className="text-base font-bold text-slate-900">{selectedExample.title}</h3>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-600">{selectedExample.description}</p>

          <div className="mt-4 grid gap-3 xl:grid-cols-2">
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
