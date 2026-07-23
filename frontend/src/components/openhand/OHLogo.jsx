/**
 * OpenHand — Logo Component
 * Uses the official OpenHand infinity-into-open-hand logo image asset.
 * 4 variants: full-color | dark-navy | icon-only | white-on-navy
 */
import React from 'react'
import logoIcon from '../../assets/Logo/Logo-Icon-transparent.png'

/* ─── Icon: Official OpenHand Logo Asset ─────────────────────────── */
function IconMark({ size = 36 }) {
  return (
    <img
      src={logoIcon}
      alt="OpenHand logo — infinity symbol resolving into an open hand"
      style={{
        height: `${size}px`,
        width: 'auto',
        objectFit: 'contain',
        display: 'block',
      }}
    />
  )
}

/**
 * variant: 'full-color' | 'dark-navy' | 'icon-only' | 'white-on-navy'
 * size: icon size in px (wordmark scales proportionally)
 */
export function OHLogo({ variant = 'full-color', size = 36, className = '' }) {
  const textColor = {
    'full-color':    '#FFFFFF',
    'dark-navy':     'var(--oh-navy)',
    'icon-only':     undefined,
    'white-on-navy': '#FFFFFF',
  }[variant] || '#FFFFFF'

  const wrapStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: Math.round(size * 0.28) + 'px',
    textDecoration: 'none',
  }

  const textStyle = {
    fontFamily: 'var(--oh-font-head)',
    fontWeight: 700,
    fontSize: Math.round(size * 0.52) + 'px',
    letterSpacing: '-0.02em',
    color: textColor,
    lineHeight: 1,
  }

  return (
    <span style={wrapStyle} className={className}>
      <IconMark size={size} />
      {variant !== 'icon-only' && (
        <span style={textStyle}>
          Open<span style={{ background: 'linear-gradient(90deg, #60A5FA, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hand</span>
        </span>
      )}
    </span>
  )
}

export default OHLogo
