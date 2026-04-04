import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const TEAL = '#0d9488'
const TEAL_LIGHT = '#ccfbf1'
const AMBER = '#f59e0b'
const PURPLE = '#a855f7'
const GREEN = '#10b981'
const RED = '#ef4444'

function MetricCard({ value, label }) {
  return (
    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col items-center text-center">
      <span className="text-2xl font-bold text-teal-600 leading-tight">{value}</span>
      <span className="text-xs text-gray-500 mt-1 leading-snug">{label}</span>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      {children}
    </div>
  )
}

export default function Dashboard() {
  // Chart 1 — Horizontal bar: Top barriers reported
  const barriersData = {
    labels: ['Financial', 'Past delays', 'Transportation', 'Stigma', 'Language'],
    datasets: [
      {
        data: [61, 51, 43, 38, 22],
        backgroundColor: TEAL,
        borderRadius: 4,
        barThickness: 18,
      },
    ],
  }
  const barriersOptions = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: ctx => ` ${ctx.raw}% of users` },
      },
    },
    scales: {
      x: {
        max: 100,
        ticks: { callback: v => v + '%', font: { size: 11 } },
        grid: { color: '#f3f4f6' },
      },
      y: {
        ticks: { font: { size: 12 } },
        grid: { display: false },
      },
    },
  }

  // Chart 2 — Donut: Risk level distribution
  const donutData = {
    labels: ['Moderate', 'Low', 'High'],
    datasets: [
      {
        data: [45, 28, 27],
        backgroundColor: [AMBER, GREEN, RED],
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 6,
      },
    ],
  }
  const donutOptions = {
    responsive: true,
    cutout: '62%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 12 }, padding: 16, usePointStyle: true },
      },
      tooltip: {
        callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}%` },
      },
    },
  }

  // Chart 3 — Grouped bar: Avg sub-scores by archetype
  const archetypeLabels = [
    'Financially\nConstrained',
    'Geographically\nIsolated',
    'Socially\nStigmatized',
    'Multi-Barrier',
  ]
  const archetypeData = {
    labels: archetypeLabels,
    datasets: [
      {
        label: 'Financial Risk',
        data: [0.82, 0.30, 0.25, 0.75],
        backgroundColor: TEAL,
        borderRadius: 3,
      },
      {
        label: 'Access Risk',
        data: [0.35, 0.89, 0.30, 0.72],
        backgroundColor: AMBER,
        borderRadius: 3,
      },
      {
        label: 'Social Risk',
        data: [0.25, 0.22, 0.87, 0.78],
        backgroundColor: PURPLE,
        borderRadius: 3,
      },
    ],
  }
  const archetypeOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 11 }, padding: 12, usePointStyle: true },
      },
      tooltip: {
        callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.raw.toFixed(2)}` },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 1,
        ticks: { callback: v => v.toFixed(1), font: { size: 11 } },
        grid: { color: '#f3f4f6' },
      },
      x: {
        ticks: {
          font: { size: 10 },
          maxRotation: 0,
          callback: function (val) {
            // Split label on \n for multi-line
            return this.getLabelForValue(val).split('\n')
          },
        },
        grid: { display: false },
      },
    },
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-[1200px] mx-auto px-4 pt-6 space-y-4">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">Community Insights</h2>
          <p className="text-xs text-gray-400 mt-1">Based on anonymized submissions</p>
        </div>

        {/* Metric cards */}
        <div className="flex gap-3">
          <MetricCard value="247" label="assessments completed" />
          <MetricCard value="63%" label="report financial barriers" />
          <MetricCard value="0.58" label="avg risk score" />
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-4 space-y-4 lg:space-y-0">
          {/* Chart 1 — Top barriers */}
          <ChartCard title="Top Barriers Reported">
            <Bar data={barriersData} options={barriersOptions} />
          </ChartCard>

          {/* Chart 2 — Risk level distribution */}
          <ChartCard title="Risk Level Distribution">
            <div className="max-w-xs mx-auto">
              <Doughnut data={donutData} options={donutOptions} />
            </div>
          </ChartCard>

          {/* Chart 3 — Sub-scores by archetype (full width) */}
          <div className="lg:col-span-2">
            <ChartCard title="Avg Sub-Scores by Archetype">
              <Bar data={archetypeData} options={archetypeOptions} />
            </ChartCard>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pt-2">
          Based on anonymized submissions — no personal data stored
        </p>
      </div>
    </div>
  )
}
