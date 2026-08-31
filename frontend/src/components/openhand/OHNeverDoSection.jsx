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
  className = ""
}) {
  return (
    <div className={`oh-never-do-card relative rounded-2xl p-6 sm:p-8 bg-slate-900/90 border border-red-500/30 shadow-2xl backdrop-blur-md ${className}`}>
      {/* Header Badge */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
          <FiShield className="w-5 h-5" />
        </div>
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 mb-1">
            Strict Ethical Standard
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
        </div>
      </div>

      {subtitle && (
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
          {subtitle}
        </p>
      )}

      {/* Never List */}
      <ul className="space-y-3.5">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm text-slate-200 leading-snug">
            <FiXCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="font-medium">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default OHNeverDoSection
