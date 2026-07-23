/**
 * OpenHand — Button Component
 * Variants: primary (gradient pill) | ghost (border pill) | text (link-style)
 * Sizes: sm | md (default) | lg
 */
import React from 'react'
import './OHButton.css'

export function OHButton({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = false,
  href,
  className = '',
  ...rest
}) {
  const cls = [
    'oh-btn',
    `oh-btn--${variant}`,
    `oh-btn--${size}`,
    fullWidth ? 'oh-btn--full' : '',
    className,
  ].filter(Boolean).join(' ')

  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <button
      type={type}
      className={cls}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}

export default OHButton
