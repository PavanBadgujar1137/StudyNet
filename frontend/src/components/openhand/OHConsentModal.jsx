import React from 'react'
import { FiShield, FiAlertTriangle, FiCheck, FiX } from 'react-icons/fi'

export function OHConsentModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Consent & Confirmation Required",
  subtitle = "Please review and explicitly confirm your consent before proceeding.",
  items = [],
  confirmText = "I Agree & Grant Consent",
  cancelText = "Decline / Cancel",
  type = "consent", // consent | warning | danger
  loading = false,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 sm:p-8 text-left transition-all transform scale-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Close modal"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${
            type === 'danger'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : type === 'warning'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
          }`}>
            {type === 'danger' || type === 'warning' ? (
              <FiAlertTriangle className="w-6 h-6" />
            ) : (
              <FiShield className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {type === 'consent' ? 'Explicit Platform Consent' : 'Confirmation Needed'}
            </span>
          </div>
        </div>

        {subtitle && (
          <p className="text-sm text-slate-300 leading-relaxed mb-5">
            {subtitle}
          </p>
        )}

        {/* Items List */}
        {items.length > 0 && (
          <ul className="space-y-2.5 mb-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                <FiCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3 px-5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              type === 'danger'
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25'
            }`}
          >
            {loading ? 'Processing…' : confirmText}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="py-3 px-5 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default OHConsentModal
