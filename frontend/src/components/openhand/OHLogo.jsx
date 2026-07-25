/**
 * OpenHand — Logo Component
 * Uses the official OpenHand logo mark with optional subtag.
 * 4 variants: full-color | dark-navy | icon-only | white-on-navy
 */
import React from 'react'
import logoIcon from '../../assets/Logo/Logo-Icon-transparent.png'

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
        <span style={{ display: 'inline-flex', flexDirection: 'column' }}>
          <span style={textStyle}>
            Open<span style={{ background: 'linear-gradient(90deg, #60A5FA, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hand</span>
          </span>
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#60A5FA', opacity: 0.85, marginTop: '2px' }}>
            Your Growth, Our Guidance.
          </span>
        </span>
      )}
    </span>
  )
}

export default OHLogo
