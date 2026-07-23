/**
 * OpenHand — Modal
 * Accessible modal with focus trap, keyboard dismiss (Esc), backdrop click dismiss.
 * Uses React Portal to render at body root.
 */
import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import './OHModal.css'

export function OHModal({
  open = false,
  onClose,
  title,
  children,
  size = 'md',  /* sm | md | lg | full */
  className = '',
}) {
  const overlayRef = useRef(null)
  const contentRef = useRef(null)

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // ESC key dismiss
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Focus trap — focus first focusable element
  useEffect(() => {
    if (!open || !contentRef.current) return
    const focusable = contentRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    focusable[0]?.focus()
  }, [open])

  if (!open) return null

  return ReactDOM.createPortal(
    <div
      className="oh-modal-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose?.() }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={['oh-modal', `oh-modal--${size}`, className].filter(Boolean).join(' ')}
        ref={contentRef}
      >
        {/* Header */}
        {title && (
          <div className="oh-modal__header">
            <h2 className="oh-modal__title">{title}</h2>
            <button
              className="oh-modal__close"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {/* Body */}
        <div className="oh-modal__body">{children}</div>
      </div>
    </div>,
    document.body
  )
}

export default OHModal
