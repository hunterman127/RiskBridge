import { useState } from 'react'

const TOTAL_STEPS = 8 // 7 questions + 1 free-text

const QUESTIONS = [
  {
    id: 'q1',
    normal: 'Do you currently have any coverage that helps pay for doctor visits?',
    soft: 'Do you have any help covering health costs?',
    type: 'radio',
    options: [
      { value: 'none', normal: 'None', soft: 'No coverage right now' },
      { value: 'medicaid', normal: 'Medicaid', soft: 'Medicaid' },
      { value: 'chip', normal: 'CHIP', soft: 'CHIP' },
      { value: 'private', normal: 'Private insurance', soft: 'Private insurance' },
      { value: 'unsure', normal: 'Not sure', soft: 'Not sure' },
    ],
  },
  {
    id: 'q2',
    normal: "How easy is it for you to get to a doctor's office or clinic?",
    soft: 'How easy is it for you to reach a care provider?',
    type: 'radio',
    options: [
      { value: 'easy', normal: 'Easy — clinic is nearby or I have a ride', soft: 'Easy — I can get there when I need to' },
      { value: 'difficult', normal: "Difficult — it's far or hard to get to", soft: 'It takes real effort to get there' },
      { value: 'no_transport', normal: 'No transportation available', soft: "I don't have a reliable way to get there" },
    ],
  },
  {
    id: 'q3',
    normal: 'How much do costs make it harder for you to see a doctor?',
    soft: 'How much does the cost of care affect your choices?',
    type: 'slider',
    min: 1,
    max: 4,
    labels: {
      normal: ['Not at all', 'A little', 'A lot', 'Completely prevents me'],
      soft: ['Rarely affects me', 'Sometimes', 'Often', "It's a major barrier"],
    },
    defaultValue: 1,
  },
  {
    id: 'q4',
    normal: 'Do language or communication differences make it harder for you to get care?',
    soft: 'Are there any communication differences that affect your care?',
    type: 'radio',
    options: [
      { value: 'none', normal: 'No, not an issue', soft: 'Not really' },
      { value: 'some', normal: 'Yes, sometimes', soft: 'Sometimes, a little' },
      { value: 'significant', normal: 'Yes, significantly', soft: 'It does make things harder' },
    ],
  },
  {
    id: 'q5',
    normal: 'In the past 2 years, how often did you delay or avoid getting care when needed?',
    soft: 'How often have you put off seeking care when needed?',
    type: 'slider',
    min: 0,
    max: 4,
    labels: {
      normal: ['Never', 'Rarely', 'Sometimes', 'Often', 'Almost always'],
      soft: ['Never', 'Once or twice', 'A few times', 'Fairly often', 'Almost always'],
    },
    defaultValue: 0,
  },
  {
    id: 'q6',
    normal: 'Do you have someone who can help you get care (transport, advice, support)?',
    soft: 'Do you have people you can count on for support?',
    type: 'slider',
    min: 1,
    max: 4,
    labels: {
      normal: ['Strong support', 'Some support', 'Very little', 'None'],
      soft: ['Strong network', 'Some support', 'Very little', 'On my own'],
    },
    defaultValue: 1,
  },
  {
    id: 'q7',
    normal: 'Which best describes your current work or school situation?',
    soft: 'Which best describes your current situation?',
    type: 'radio',
    options: [
      { value: 'employed', normal: 'Employed full-time', soft: 'Working full-time' },
      { value: 'part_time', normal: 'Employed part-time', soft: 'Working part-time' },
      { value: 'unemployed', normal: 'Unemployed', soft: 'Not currently working' },
      { value: 'student', normal: 'Student', soft: 'In school' },
    ],
  },
]

const FREE_TEXT = {
  normal: "In your own words, what's the biggest barrier to getting care?",
  soft: "What has made it hardest to get the support you need?",
  placeholder: {
    normal: "Feel free to share anything — this is private and helps us find the right resources for you.",
    soft: "Your words help us understand what you're going through — this is confidential.",
  },
}

function buildRiskPayload(answers, stigmaScore, stigmaSensitive) {
  const { q1, q2, q3, q4, q5, q6, q7 } = answers

  const no_insurance = q1 === 'none' || q1 === 'unsure' ? 1 : 0
  const no_transport = q2 === 'no_transport' ? 1 : 0
  const rural = q2 === 'difficult' || q2 === 'no_transport' ? 1 : 0
  const financial_stress = (q3 ?? 1) - 1
  const language_barrier = q4 === 'none' ? 0 : 1
  const past_delays = q5 ?? 0
  const low_social_support = (q6 ?? 1) - 1
  const employment_status = q7 === 'unemployed' || q7 === 'part_time' ? 1 : 0

  return {
    no_insurance,
    financial_stress,
    employment_status,
    no_transport,
    past_delays,
    rural,
    stigma_score: stigmaScore,
    low_social_support,
    language_barrier,
    stigma_sensitive: stigmaSensitive,
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar({ step, total }) {
  const pct = Math.round((step / total) * 100)
  return (
    <div className="mb-6">
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className="bg-teal-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1.5 text-right">
        {step} of {total}
      </p>
    </div>
  )
}

function StigmaModeIndicator({ active }) {
  if (!active) return null
  return (
    <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-3 py-2 mb-5 text-xs">
      <span className="text-purple-600">🔒</span>
      <span className="font-semibold text-purple-800">Stigma-sensitive mode on</span>
      <span className="text-purple-500">· softer language · anonymous resources</span>
    </div>
  )
}

function RadioQuestion({ question, value, onChange, stigmaSensitive }) {
  const label = stigmaSensitive ? question.soft : question.normal
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-5 leading-snug">{label}</h2>
      <div className="space-y-2.5">
        {question.options.map((opt) => {
          const optLabel = stigmaSensitive ? opt.soft : opt.normal
          const selected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 transition-all duration-150 ${
                selected
                  ? 'border-teal-500 bg-teal-50 text-teal-900'
                  : 'border-gray-100 bg-white text-gray-700 hover:border-teal-200 hover:bg-teal-50/40'
              }`}
            >
              <span
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selected ? 'border-teal-500 bg-teal-500' : 'border-gray-300 bg-white'
                }`}
              >
                {selected && (
                  <span className="w-2 h-2 rounded-full bg-white inline-block" />
                )}
              </span>
              <span className="text-sm font-medium">{optLabel}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SliderQuestion({ question, value, onChange, stigmaSensitive }) {
  const label = stigmaSensitive ? question.soft : question.normal
  const labels = stigmaSensitive ? question.labels.soft : question.labels.normal
  const idx = (value ?? question.defaultValue) - question.min
  const currentLabel = labels[idx] ?? ''
  const range = question.max - question.min

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-5 leading-snug">{label}</h2>
      <div className="px-1">
        <div className="flex justify-between text-xs text-gray-400 mb-3">
          <span>{labels[0]}</span>
          <span>{labels[labels.length - 1]}</span>
        </div>
        <input
          type="range"
          min={question.min}
          max={question.max}
          step={1}
          value={value ?? question.defaultValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-500"
        />
        <div className="mt-4 text-center">
          <span className="inline-block bg-teal-100 text-teal-800 text-sm font-bold px-4 py-1.5 rounded-full">
            {currentLabel}
          </span>
        </div>
        <div className="flex justify-between mt-2 px-0.5">
          {Array.from({ length: range + 1 }, (_, i) => (
            <div key={i} className="w-px h-2 bg-gray-200" />
          ))}
        </div>
      </div>
    </div>
  )
}

function FreeTextField({ value, onChange, stigmaSensitive }) {
  const label = stigmaSensitive ? FREE_TEXT.soft : FREE_TEXT.normal
  const placeholder = stigmaSensitive
    ? FREE_TEXT.placeholder.soft
    : FREE_TEXT.placeholder.normal
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-2 leading-snug">{label}</h2>
      <p className="text-sm text-gray-400 mb-4">Optional — skip if you prefer</p>
      <textarea
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:bg-white resize-none transition-colors"
      />
    </div>
  )
}

// ── Loading overlay ───────────────────────────────────────────────────────────

function LoadingOverlay({ step }) {
  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <div className="w-14 h-14 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
      <p className="mt-6 text-base font-semibold text-gray-800 text-center px-8">
        {step === 'analyze'
          ? 'Interpreting your response…'
          : 'Calculating your risk profile…'}
      </p>
      <p className="text-sm text-gray-400 mt-1">This takes just a moment</p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Questionnaire({ stigmaSensitive, onComplete }) {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState({
    q1: null, q2: null, q3: 1, q4: null, q5: 0, q6: 1, q7: null, freeText: '',
  })
  const [loadingStep, setLoadingStep] = useState(null)  // null | 'analyze' | 'risk'
  const [error, setError] = useState(null)

  const currentAnswer = step <= 7 ? answers[`q${step}`] : answers.freeText
  const question = step <= 7 ? QUESTIONS[step - 1] : null

  function setAnswer(value) {
    if (step <= 7) {
      setAnswers((prev) => ({ ...prev, [`q${step}`]: value }))
    } else {
      setAnswers((prev) => ({ ...prev, freeText: value }))
    }
  }

  function canAdvance() {
    if (step === 8) return true
    if (!question) return false
    if (question.type === 'slider') return true
    return currentAnswer !== null
  }

  function handleNext() {
    if (step < 8) setStep((s) => s + 1)
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1)
  }

  async function handleSubmit() {
    setError(null)

    let stigmaScore = 0

    if (answers.freeText.trim()) {
      setLoadingStep('analyze')
      try {
        const res = await fetch('http://localhost:5000/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: answers.freeText }),
        })
        if (res.ok) {
          const data = await res.json()
          stigmaScore = data.stigma_score ?? 0.5
        } else {
          stigmaScore = 0.5  // /analyze failed — use neutral-high fallback
        }
      } catch {
        stigmaScore = 0.5   // model not loaded yet — use neutral-high fallback
      }
    }

    setLoadingStep('risk')
    try {
      const payload = buildRiskPayload(answers, stigmaScore, stigmaSensitive)
      const res = await fetch('http://localhost:5000/risk-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      onComplete(data)
    } catch {
      setError(
        "We couldn't reach the server. Please check that the backend is running and try again."
      )
    } finally {
      setLoadingStep(null)
    }
  }

  return (
    <>
      {loadingStep && <LoadingOverlay step={loadingStep} />}

      <div className="min-h-[calc(100vh-56px)] bg-gray-50 flex flex-col items-center px-4 py-6">
        <div className="w-full max-w-2xl">
          {/* Stigma mode indicator strip */}
          <StigmaModeIndicator active={stigmaSensitive} />

          <ProgressBar step={step} total={TOTAL_STEPS} />

          {/* Question card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5 min-h-[280px] flex flex-col justify-between">
            <div>
              {step <= 7 && question ? (
                question.type === 'radio' ? (
                  <RadioQuestion
                    question={question}
                    value={currentAnswer}
                    onChange={setAnswer}
                    stigmaSensitive={stigmaSensitive}
                  />
                ) : (
                  <SliderQuestion
                    question={question}
                    value={currentAnswer}
                    onChange={setAnswer}
                    stigmaSensitive={stigmaSensitive}
                  />
                )
              ) : (
                <FreeTextField
                  value={answers.freeText}
                  onChange={(v) => setAnswers((prev) => ({ ...prev, freeText: v }))}
                  stigmaSensitive={stigmaSensitive}
                />
              )}
            </div>
          </div>

          {/* Error with retry */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
              <p className="text-sm text-red-700 mb-3">{error}</p>
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:border-teal-300 hover:text-teal-700 transition-colors bg-white"
              >
                Back
              </button>
            )}
            {step < 8 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canAdvance()}
                className={`flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-colors ${
                  canAdvance()
                    ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loadingStep !== null}
                className={`flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-colors shadow-sm ${
                  loadingStep !== null
                    ? 'bg-teal-300 text-white cursor-not-allowed'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                Find my resources
              </button>
            )}
          </div>

          {step === 8 && loadingStep === null && (
            <p className="text-xs text-center text-gray-400 mt-3">
              The text field is optional — tap "Find my resources" to skip it.
            </p>
          )}
        </div>
      </div>
    </>
  )
}
