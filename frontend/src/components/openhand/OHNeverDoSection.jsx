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
        color: isDark ? '#F1F5F9' : '#0F172A'
      }}
    >
      {/* Header Badge */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'
          }`}
        >
          <FiShield className="w-5 h-5" style={{ color: isDark ? '#F87171' : '#DC2626' }} />
        </div>
        <div>
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
              isDark ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-100 text-red-900 border border-red-200'
            } mb-1`}
          >
            Strict Ethical Standard
          </span>
          <h3
            className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}
            style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}
          >
            {title}
          </h3>
        </div>
      </div>

      {subtitle && (
        <p
          className={`text-sm mb-6 leading-relaxed font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
          style={{ color: isDark ? '#CBD5E1' : '#334155' }}
        >
          {subtitle}
        </p>
      )}

      {/* Never List */}
      <ul className="space-y-3.5">
        {items.map((item, idx) => (
          <li
            key={idx}
            className={`flex items-start gap-3 text-sm leading-snug font-bold ${isDark ? 'text-slate-200' : 'text-slate-950'}`}
            style={{ color: isDark ? '#F1F5F9' : '#0F172A' }}
          >
            <FiXCircle
              className={`w-4.5 h-4.5 shrink-0 mt-0.5 ${isDark ? 'text-red-400' : 'text-red-600'}`}
              style={{ color: isDark ? '#F87171' : '#DC2626' }}
            />
            <span style={{ color: isDark ? '#F1F5F9' : '#0F172A', fontWeight: 700 }}>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default OHNeverDoSection
