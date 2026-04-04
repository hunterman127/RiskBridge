import { useState } from 'react'

// --- SVG Gauge helpers ---

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 0 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`
}

// --- Static data ---

const GAUGE_COLOR = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
}

const ARCHETYPE_INFO = {
  financially_constrained: {
    label: 'Uninsured + Financial Stress',
    description: 'Cost and coverage are the biggest obstacles to your primary care access.',
    pill: 'bg-orange-100 text-orange-800 border-orange-200',
    border: 'border-l-orange-400',
  },
  geographically_isolated: {
    label: 'Rural + Transport Gap',
    description: 'Distance and lack of transportation are limiting your access to care.',
    pill: 'bg-blue-100 text-blue-800 border-blue-200',
    border: 'border-l-blue-400',
  },
  socially_stigmatized: {
    label: 'High Stigma + Privacy Concern',
    description: 'Stigma or privacy concerns are making it harder to seek care.',
    pill: 'bg-purple-100 text-purple-800 border-purple-200',
    border: 'border-l-purple-400',
  },
  multi_barrier: {
    label: 'Multi-Barrier Profile',
    description: 'You face a combination of financial, geographic, and social barriers to care.',
    pill: 'bg-red-100 text-red-800 border-red-200',
    border: 'border-l-red-400',
  },
}

const CONFIDENCE_MAP = {
  high:   { label: 'High confidence',       classes: 'bg-green-100 text-green-700 border-green-200' },
  medium: { label: 'Moderate confidence',   classes: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  low:    { label: 'Model uncertain',        classes: 'bg-gray-100 text-gray-600 border-gray-200' },
}

const TYPE_BADGE = {
  mental_health:  'bg-purple-50 text-purple-700 border-purple-200',
  crisis:         'bg-red-50 text-red-700 border-red-200',
  medical:        'bg-teal-50 text-teal-700 border-teal-200',
  primary_care:   'bg-teal-50 text-teal-700 border-teal-200',
  telehealth:     'bg-blue-50 text-blue-700 border-blue-200',
  helpline:       'bg-amber-50 text-amber-700 border-amber-200',
}

const COST_BADGE = {
  free:          'bg-green-50 text-green-700 border-green-200',
  sliding_scale: 'bg-blue-50 text-blue-700 border-blue-200',
  low_cost:      'bg-sky-50 text-sky-700 border-sky-200',
}

function subScoreColor(value) {
  if (value < 0.4) return 'bg-green-400'
  if (value < 0.7) return 'bg-yellow-400'
  return 'bg-red-400'
}

// --- Sub-components ---

function RiskGauge({ riskScore, riskLevel }) {
  const pct = Math.round(riskScore * 100)
  const color = GAUGE_COLOR[riskLevel] ?? GAUGE_COLOR.medium
  const bgArc = describeArc(100, 100, 80, 135, 405)
  const scoreEndAngle = 135 + (pct / 100) * 270
  const scoreArc = pct > 0 ? describeArc(100, 100, 80, 135, scoreEndAngle) : null

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 200" className="w-44 h-44">
        {/* Background arc */}
        <path
          d={bgArc}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Score arc */}
        {scoreArc && (
          <path
            d={scoreArc}
            fill="none"
            stroke={color}
            strokeWidth="16"
            strokeLinecap="round"
          />
        )}
        {/* Center score */}
        <text
          x="100"
          y="98"
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-bold"
          style={{ fontSize: 40, fill: color, fontWeight: 700 }}
        >
          {pct}
        </text>
        <text
          x="100"
          y="126"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: 13, fill: '#6b7280', textTransform: 'capitalize' }}
        >
          {riskLevel} barrier
        </text>
      </svg>
    </div>
  )
}

function ArchetypeBadge({ archetype, confidence }) {
  const info = ARCHETYPE_INFO[archetype] ?? {
    label: archetype ?? 'Unknown pattern',
    description: 'Your barrier profile has been assessed.',
    pill: 'bg-gray-100 text-gray-700 border-gray-200',
    border: 'border-l-gray-400',
  }
  const conf = CONFIDENCE_MAP[confidence] ?? CONFIDENCE_MAP.medium

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 border-l-4 ${info.border} p-4 shadow-sm`}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${info.pill}`}>
          {info.label}
        </span>
        <span className={`text-xs px-2.5 py-0.5 rounded-full border ${conf.classes}`}>
          {conf.label}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{info.description}</p>
    </div>
  )
}

function SubScoreBar({ label, value }) {
  const pct = Math.round((value ?? 0) * 100)
  const barColor = subScoreColor(value ?? 0)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-sm font-bold text-gray-800">{pct}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function CalloutCard({ color, text }) {
  const styles = {
    blue:   'bg-blue-50 border-blue-200 text-blue-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
  }
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles[color] ?? styles.blue}`}>
      {text}
    </div>
  )
}

function ResourceCard({ resource, highlightLanguage }) {
  const typeBadge = TYPE_BADGE[resource.type] ?? 'bg-gray-50 text-gray-600 border-gray-200'
  const costBadge = COST_BADGE[resource.cost]
  const typeLabel = (resource.type ?? '').replace(/_/g, ' ')
  const costLabel =
    resource.cost === 'sliding_scale' ? 'sliding scale'
    : resource.cost === 'low_cost' ? 'low cost'
    : resource.cost ?? ''

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-2">
      {/* Name + type + cost badges */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-800 leading-snug">{resource.name}</p>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${typeBadge}`}>
            {typeLabel}
          </span>
          {costBadge && (
            <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${costBadge}`}>
              {costLabel}
            </span>
          )}
        </div>
      </div>

      {/* Tags row */}
      <div className="flex flex-wrap gap-1.5">
        {resource.telehealth && (
          <span className="bg-teal-50 text-teal-700 border border-teal-200 text-xs px-2 py-0.5 rounded-full">
            Telehealth
          </span>
        )}
        {resource.anonymous && (
          <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs px-2 py-0.5 rounded-full">
            Anonymous
          </span>
        )}
        {resource.languages?.map((lang) => (
          <span
            key={lang}
            className={`text-xs px-2 py-0.5 rounded-full border ${
              highlightLanguage
                ? 'bg-amber-50 text-amber-700 border-amber-200 font-semibold'
                : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}
          >
            {lang}
          </span>
        ))}
      </div>

      {/* Description */}
      {resource.description && (
        <p className="text-xs text-gray-500 leading-relaxed">{resource.description}</p>
      )}

      {/* Links */}
      {(resource.phone || resource.url) && (
        <div className="flex flex-wrap gap-3 pt-0.5">
          {resource.phone && (
            <a
              href={`tel:${resource.phone}`}
              className="text-xs font-medium text-teal-600 hover:underline"
            >
              {resource.phone}
            </a>
          )}
          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-teal-600 hover:underline"
            >
              Visit site
            </a>
          )}
        </div>
      )}
    </div>
  )
}

// --- Main component ---

export default function ResultsPage({ result, stigmaSensitive, onRestart }) {
  const [copied, setCopied] = useState(false)

  const pct = Math.round((result.risk_score ?? 0) * 100)
  const topBarriers = result.top_barriers ?? []
  const hasTransportBarrier = topBarriers.includes('access')
  const hasStigmaRisk = (result.social_risk ?? 0) > 0.5 || stigmaSensitive

  // Filter + sort resources
  let resources = result.resources ?? []
  if (stigmaSensitive) {
    resources = resources.filter((r) => r.anonymous)
  }
  if (hasTransportBarrier) {
    resources = [
      ...resources.filter((r) => r.telehealth),
      ...resources.filter((r) => !r.telehealth),
    ]
  }
  resources = resources.slice(0, 5)

  const hasLanguageBarrier = resources.some((r) => (r.languages ?? []).length > 1)

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start space-y-5 lg:space-y-0">
      {/* ── Left column: score + breakdown ── */}
      <div className="space-y-5">
        {/* 0. Stigma-sensitive mode banner */}
        {stigmaSensitive && (
          <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3">
            <span className="text-purple-600 text-xl leading-none">🔒</span>
            <div>
              <p className="text-sm font-semibold text-purple-800">Privacy-first mode active</p>
              <p className="text-xs text-purple-600">Showing only anonymous resources</p>
            </div>
          </div>
        )}

        {/* 1. Gauge */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col items-center gap-1">
          <RiskGauge riskScore={result.risk_score ?? 0} riskLevel={result.risk_level ?? 'medium'} />
          <p className="text-xs text-gray-400">Barrier score: {pct} / 100</p>
        </div>

        {/* 2. Archetype badge + confidence */}
        <ArchetypeBadge archetype={result.archetype} confidence={result.confidence} />

        {/* 3. Sub-scores */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Barrier breakdown</h3>
          <SubScoreBar label="Financial Risk" value={result.financial_risk} />
          <SubScoreBar label="Access Risk"    value={result.access_risk} />
          <SubScoreBar label="Social Risk"    value={result.social_risk} />
        </div>

        {/* 4. Top barriers tags */}
        {topBarriers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {topBarriers.map((b) => (
              <span
                key={b}
                className="bg-orange-50 text-orange-700 border border-orange-200 text-xs font-medium px-3 py-1 rounded-full capitalize"
              >
                {b.replace(/_/g, ' ')} barrier
              </span>
            ))}
          </div>
        )}

        {/* 5. Barrier-specific callouts */}
        {(hasTransportBarrier || hasStigmaRisk) && (
          <div className="space-y-2">
            {hasTransportBarrier && (
              <CalloutCard
                color="blue"
                text="Telehealth options are listed first — no travel required."
              />
            )}
            {hasStigmaRisk && (
              <CalloutCard
                color="purple"
                text="You can text instead of call — Crisis Text Line and others support SMS."
              />
            )}
          </div>
        )}
      </div>

      {/* ── Right column: resources + actions ── */}
      <div className="space-y-5">
        {/* 6. Resources */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {stigmaSensitive ? '🔒 Private & anonymous options' : 'Recommended resources'}
          </h3>
          {resources.length > 0 ? (
            <div className="space-y-3">
              {resources.map((r) => (
                <ResourceCard
                  key={r.id ?? r.name}
                  resource={r}
                  highlightLanguage={hasLanguageBarrier}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 bg-white rounded-xl border border-gray-200 p-4">
              No matching resources found. Try turning off privacy-first mode for more options.
            </p>
          )}
        </div>

        {/* 7. Action buttons */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onRestart}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-600 hover:border-teal-300 hover:text-teal-700 transition-colors"
          >
            Retake
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 py-3 rounded-xl border-2 border-teal-200 text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors"
          >
            {copied ? 'Link copied!' : 'Share anonymously'}
          </button>
        </div>
      </div>
    </div>
  )
}
