import React from 'react'
import { FiXCircle, FiShield } from 'react-icons/fi'

export function OHNeverDoSection({
  title = "What it will never do",
  subtitle = "Our strict ethical boundaries — hardcoded into the platform and our corporate contracts.",
  items = [
    "Never shares individual names, transcripts, or personal check-ins with HR or employers.",
    "Never diagnoses, prescribes medication, or acts as a clinical replacement.",
    "Never records audio or transcribes sessions without explicit, live learner consent.",
    "Never sells learner data or trains public AI models on private session records.",
    "Never sends direct automated messages to learners without practitioner approval."
  ],
  variant = "light", // "light" | "dark"
  className = ""
}) {
  const isDark = variant === "dark"

  return (
    <div
      className={`oh-never-do-card ${isDark ? 'oh-never-do-card--dark' : 'oh-never-do-card--light'} relative rounded-2xl p-6 sm:p-8 transition-all ${
        isDark
          ? 'bg-slate-900 border border-red-500/30 text-white shadow-2xl'
          : 'bg-white border border-slate-200 text-slate-900 shadow-xl'
      } ${className}`}
      style={{
        backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
        color: isDark ? '#F1F5F9' : '#0F172A',
        WebkitTextFillColor: isDark ? '#F1F5F9' : '#0F172A'
      }}
    >
      {/* Header Badge */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'
          }`}
          style={{
            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
            borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FCA5A5'
          }}
        >
          <FiShield className="w-5 h-5 shrink-0" style={{ color: isDark ? '#F87171' : '#DC2626', stroke: isDark ? '#F87171' : '#DC2626' }} />
        </div>
        <div>
          <span
            className={`oh-never-do-badge inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider mb-1`}
            style={{
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
              color: isDark ? '#FCA5A5' : '#991B1B',
              WebkitTextFillColor: isDark ? '#FCA5A5' : '#991B1B',
              border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #FCA5A5',
              fontWeight: 800
            }}
          >
            Strict Ethical Standard
          </span>
          <h3
            className={`text-xl font-black tracking-tight`}
            style={{ color: isDark ? '#FFFFFF' : '#0F172A', WebkitTextFillColor: isDark ? '#FFFFFF' : '#0F172A' }}
          >
            {title}
          </h3>
        </div>
      </div>

      {subtitle && (
        <p
          className={`text-sm mb-6 leading-relaxed font-bold`}
          style={{ color: isDark ? '#CBD5E1' : '#334155', WebkitTextFillColor: isDark ? '#CBD5E1' : '#334155' }}
        >
          {subtitle}
        </p>
      )}

      {/* Never List */}
      <ul className="space-y-3.5" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((item, idx) => (
          <li
            key={idx}
            className={`flex items-start gap-3 text-sm leading-snug font-bold`}
            style={{
              color: isDark ? '#F1F5F9' : '#0F172A',
              WebkitTextFillColor: isDark ? '#F1F5F9' : '#0F172A',
              opacity: 1
            }}
          >
            <FiXCircle
              className="w-4.5 h-4.5 shrink-0 mt-0.5"
              style={{ color: isDark ? '#F87171' : '#DC2626', stroke: isDark ? '#F87171' : '#DC2626', opacity: 1 }}
            />
            <span
              style={{
                color: isDark ? '#F1F5F9' : '#0F172A',
                WebkitTextFillColor: isDark ? '#F1F5F9' : '#0F172A',
                fontWeight: 700,
                opacity: 1
              }}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default OHNeverDoSection
