/**
 * OpenHand — Card Component
 * surface: 'white' | 'mist' | 'navy'
 * pad:     'sm' | 'md' | 'lg'
 * lift:    boolean — hover-lift animation
 */
import React from 'react'

export function OHCard({
  surface = 'white',
  pad = 'md',
  lift = false,
  className = '',
  children,
  style,
  ...rest
}) {
  const cls = [
    'oh-card',
    `oh-card--${surface}`,
    `oh-card--pad-${pad}`,
    lift ? 'oh-card--lift' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={cls} style={style} {...rest}>
      {children}
    </div>
  )
}

export function OHCardIcon({ children }) {
  return <div className="oh-card__icon">{children}</div>
}

export function OHCardEyebrow({ children }) {
  return <p className="oh-card__eyebrow">{children}</p>
}

export function OHCardTitle({ children, as: Tag = 'h3' }) {
  return <Tag className="oh-card__title">{children}</Tag>
}

export function OHCardBody({ children }) {
  return <p className="oh-card__body">{children}</p>
}

export function OHCardFooter({ children }) {
  return <div className="oh-card__footer">{children}</div>
}

export default OHCard
