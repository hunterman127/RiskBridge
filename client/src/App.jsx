import { useState } from 'react'
import Questionnaire from './components/Questionnaire'
import ResultsPage from './components/ResultsPage'
import Dashboard from './components/Dashboard'

// ── Stigma toggle (shared across views) ──────────────────────────────────────

function StigmaToggle({ value, onChange }) {
  return (
    <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-2xl px-4 py-3">
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
          value ? 'bg-teal-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            value ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <div>
        <p className="text-sm font-semibold text-teal-800">Stigma-sensitive mode</p>
        <p className="text-xs text-teal-600">
          Uses softer language · filters to anonymous resources only
        </p>
      </div>
    </div>
  )
}

// ── Landing screen ────────────────────────────────────────────────────────────

const LANDING_CARDS = [
  { emoji: '🟢', label: 'I need help finding affordable care' },
  { emoji: '🟡', label: "I'm unsure what options are available" },
  { emoji: '🔴', label: 'I face real barriers to getting care' },
  { emoji: '❓', label: "I'm just exploring what's out there" },
]

function LandingPage({ stigmaSensitive, onToggleStigma, onStart }) {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-white flex flex-col">
      <div className="flex-1 max-w-lg mx-auto w-full px-5 pt-8 pb-6 flex flex-col">
        {/* Badge */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />
            A private space for you
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3">
          How can we help you find care <span className="text-teal-600">today?</span>
        </h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          Take a moment to check in with yourself. There are no wrong answers — this
          tool helps match you with primary care resources in Texas.
        </p>

        {/* Illustrative cards */}
        <div className="space-y-3 mb-8">
          {LANDING_CARDS.map((card) => (
            <div
              key={card.label}
              className="flex items-center gap-4 bg-white border-2 border-gray-100 rounded-2xl px-4 py-3.5 shadow-sm"
            >
              <span className="text-xl leading-none">{card.emoji}</span>
              <span className="text-sm font-medium text-gray-700">{card.label}</span>
            </div>
          ))}
        </div>

        {/* Kindness callout */}
        <div className="bg-teal-600 rounded-2xl px-5 py-4 mb-6 text-white">
          <p className="font-semibold text-sm mb-1">Kindness matters.</p>
          <p className="text-xs text-teal-100 leading-relaxed">
            Every experience is valid. This tool connects you with compassionate,
            no-judgment resources — the right care exists for you.
          </p>
        </div>

        {/* Stigma toggle */}
        <div className="mb-6">
          <StigmaToggle value={stigmaSensitive} onChange={onToggleStigma} />
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onStart}
          className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-base transition-colors shadow-md"
        >
          Continue
        </button>

        {/* Privacy note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          No login required · No data shared · Anonymous by design
        </p>
      </div>
    </div>
  )
}

// ── Nav ───────────────────────────────────────────────────────────────────────

function Nav({ view, stigmaSensitive, onToggleStigma, onLogoClick, onDashboardClick }) {
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
      <div className="max-w-[1200px] mx-auto flex items-center px-4 py-3 gap-3">
        {/* Logo */}
        <button
          type="button"
          onClick={onLogoClick}
          className="flex items-center gap-2 mr-auto"
        >
          <span className="text-base font-bold text-teal-700 tracking-tight">RiskBridge</span>
          {view !== 'landing' && (
            <span className="text-xs text-gray-400 font-normal hidden sm:inline">
              · Texas Primary Care
            </span>
          )}
        </button>

        {/* Stigma mode pill — shown when not on landing (toggle is on landing) */}
        {view !== 'landing' && (
          <button
            type="button"
            onClick={() => onToggleStigma(!stigmaSensitive)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
              stigmaSensitive
                ? 'bg-purple-100 text-purple-700 border-purple-200'
                : 'bg-gray-100 text-gray-500 border-gray-200'
            }`}
            title="Toggle stigma-sensitive mode"
          >
            {stigmaSensitive ? '🔒 Private' : '🔓 Standard'}
          </button>
        )}

        {/* Dashboard link */}
        <button
          type="button"
          onClick={onDashboardClick}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
            view === 'dashboard'
              ? 'bg-teal-600 text-white'
              : 'text-gray-500 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Community
        </button>
      </div>
    </nav>
  )
}

// ── App root ──────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState('landing')   // 'landing' | 'questionnaire' | 'results' | 'dashboard'
  const [stigmaSensitive, setStigmaSensitive] = useState(false)
  const [result, setResult] = useState(null)
  const [prevView, setPrevView] = useState('landing')  // remember where to go back from dashboard

  function handleStart() {
    setView('questionnaire')
  }

  function handleComplete(data) {
    setResult(data)
    setView('results')
  }

  function handleRestart() {
    setResult(null)
    setView('landing')
  }

  function handleDashboardClick() {
    if (view === 'dashboard') {
      setView(prevView === 'dashboard' ? 'landing' : prevView)
    } else {
      setPrevView(view)
      setView('dashboard')
    }
  }

  function handleLogoClick() {
    if (view !== 'landing') setView('landing')
  }

  return (
    <div className="min-h-screen bg-white">
      <Nav
        view={view}
        stigmaSensitive={stigmaSensitive}
        onToggleStigma={setStigmaSensitive}
        onLogoClick={handleLogoClick}
        onDashboardClick={handleDashboardClick}
      />

      {view === 'landing' && (
        <LandingPage
          stigmaSensitive={stigmaSensitive}
          onToggleStigma={setStigmaSensitive}
          onStart={handleStart}
        />
      )}

      {view === 'questionnaire' && (
        <Questionnaire
          stigmaSensitive={stigmaSensitive}
          onComplete={handleComplete}
        />
      )}

      {view === 'results' && result && (
        <div className="min-h-[calc(100vh-56px)] bg-gray-50">
          <div className="max-w-[1200px] mx-auto px-4 py-6">
            <ResultsPage
              result={result}
              stigmaSensitive={stigmaSensitive}
              onRestart={handleRestart}
            />
          </div>
        </div>
      )}

      {view === 'dashboard' && <Dashboard />}
    </div>
  )
}
