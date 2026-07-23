/**
 * OpenHand — Eyebrow pill label
 * Renders the pill eyebrow labels used in section headers.
 */
import React from 'react'
import './OHEyebrow.css'

export function OHEyebrow({ children, dark = false, className = '' }) {
  return (
    <span className={['oh-eyebrow', dark ? 'oh-eyebrow--dark' : '', className].filter(Boolean).join(' ')}>
      {children}
    </span>
  )
}

export default OHEyebrow
