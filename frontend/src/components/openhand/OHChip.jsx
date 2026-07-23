/**
 * OpenHand — Chip component
 * Filter chips with on/off state. Used in find-a-practitioner filters.
 */
import React from 'react'
import './OHChip.css'

export function OHChip({ label, active = false, onClick, disabled = false }) {
  return (
    <button
      type="button"
      className={['oh-chip', active ? 'oh-chip--on' : ''].filter(Boolean).join(' ')}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}

/**
 * OHChipGroup — manages a set of chips with single-select behavior.
 * options: [{ value, label }]
 */
export function OHChipGroup({ label, options, value, onChange }) {
  return (
    <div className="oh-chip-group" role="group" aria-label={label}>
      <span className="oh-chip-group__label">{label}</span>
      <div className="oh-chip-group__row">
        {options.map((opt) => (
          <OHChip
            key={opt.value}
            label={opt.label}
            active={value === opt.value}
            onClick={() => onChange(opt.value)}
          />
        ))}
      </div>
    </div>
  )
}

export default OHChip
