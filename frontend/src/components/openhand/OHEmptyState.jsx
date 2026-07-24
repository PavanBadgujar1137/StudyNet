/**
 * OpenHand — Empty State
 * Illustrated empty state for data-less views.
 * type: 'no-data' | 'no-results' | 'no-clients' | 'no-offers' | 'no-circle'
 */
import React from 'react'

const ICONS = {
  'no-data': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="36" height="36" rx="8" stroke="url(#es-g)" strokeWidth="2.4" strokeDasharray="5 3"/>
      <path d="M18 24h12M24 18v12" stroke="url(#es-g)" strokeWidth="2.4" strokeLinecap="round"/>
    </svg>
  ),
  'no-results': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="22" r="14" stroke="url(#es-g)" strokeWidth="2.4"/>
      <path d="m32 32 8 8" stroke="url(#es-g)" strokeWidth="2.4" strokeLinecap="round"/>
      <path d="M17 22h10M22 17v10" stroke="url(#es-g)" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
    </svg>
  ),
  'no-clients': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="16" r="8" stroke="url(#es-g)" strokeWidth="2.4"/>
      <path d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="url(#es-g)" strokeWidth="2.4" strokeLinecap="round"/>
    </svg>
  ),
  'no-offers': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="14" width="32" height="22" rx="5" stroke="url(#es-g)" strokeWidth="2.4"/>
      <path d="M16 14V10a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" stroke="url(#es-g)" strokeWidth="2.4"/>
      <path d="M24 22v8M20 26h8" stroke="url(#es-g)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  'no-circle': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="16" stroke="url(#es-g)" strokeWidth="2.4" strokeDasharray="4 3"/>
      <circle cx="24" cy="18" r="4" stroke="url(#es-g)" strokeWidth="2"/>
      <circle cx="14" cy="30" r="4" stroke="url(#es-g)" strokeWidth="2"/>
      <circle cx="34" cy="30" r="4" stroke="url(#es-g)" strokeWidth="2"/>
    </svg>
  ),
}

export function OHEmptyState({
  type = 'no-data',
  title = 'Nothing here yet',
  body,
  action,
  className = '',
}) {
  return (
    <div className={['oh-empty', className].filter(Boolean).join(' ')}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="es-g" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--oh-blue)" />
            <stop offset="100%" stopColor="var(--oh-violet)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="oh-empty__icon" aria-hidden="true">
        {ICONS[type] || ICONS['no-data']}
      </div>
      <h3 className="oh-empty__title">{title}</h3>
      {body && <p className="oh-empty__body">{body}</p>}
      {action && <div className="oh-empty__action">{action}</div>}
    </div>
  )
}

export default OHEmptyState
