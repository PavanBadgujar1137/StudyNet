import React, { useState } from 'react'
import OHConsentModal from './OHConsentModal'

const CONSENT_TYPES = {
  copilot_notes: {
    label: 'Session notes only',
    description:
      'After the session, AURA will draft session notes and suggested reflection prompts for your review. You approve before anything is saved.',
    risk: 'low',
  },
  copilot_audio: {
    label: 'Live in-session AURA',
    description:
      'During this session, audio will be transcribed in real time to generate live suggestions — visible only to you, not your learner. You can revoke this any time.',
    risk: 'medium',
  },
}

export function OHConsentGate({
  clientName = 'your learner',
  activeConsents = [],     /* ['copilot_notes', 'copilot_audio'] */
  onGrant,                 /* (type) => void */
  onRevoke,                /* (type) => void */
  sessionId,
  className = '',
}) {
  const [loading, setLoading] = useState(null)
  const [modalState, setModalState] = useState({ isOpen: false, type: null, isActive: false })

  const handleOpenModal = (type, isActive) => {
    setModalState({ isOpen: true, type, isActive })
  }

  const handleConfirmModal = async () => {
    const { type, isActive } = modalState
    if (!type) return
    setLoading(type)
    try {
      if (isActive) {
        await onRevoke?.(type, sessionId)
      } else {
        await onGrant?.(type, sessionId)
      }
    } finally {
      setLoading(null)
      setModalState({ isOpen: false, type: null, isActive: false })
    }
  }

  const selectedTypeInfo = modalState.type ? CONSENT_TYPES[modalState.type] : null

  return (
    <div className={['oh-consent', className].filter(Boolean).join(' ')}>
      {/* Centered Screen Consent Modal (Item 6) */}
      {modalState.isOpen && selectedTypeInfo && (
        <OHConsentModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ isOpen: false, type: null, isActive: false })}
          onConfirm={handleConfirmModal}
          loading={loading === modalState.type}
          title={modalState.isActive ? `Revoke ${selectedTypeInfo.label}?` : `Grant ${selectedTypeInfo.label}?`}
          subtitle={`This consent setting applies strictly to session with ${clientName}.`}
          confirmText={modalState.isActive ? "Yes, Revoke Consent" : "Yes, Grant Consent"}
          type={modalState.isActive ? "warning" : "consent"}
          items={[
            selectedTypeInfo.description,
            "Consent can be revoked at any time mid-session.",
            "Recordings & insights are end-to-end encrypted and never used for public training."
          ]}
        />
      )}

      <div className="oh-consent__header">
        <div className="oh-consent__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
          </svg>
        </div>
        <div>
          <h3 className="oh-consent__title">AURA consent</h3>
          <p className="oh-consent__sub">
            For <strong>{clientName}</strong> — this session only.
            Revocable at any time.
          </p>
        </div>
      </div>

      <div className="oh-consent__items">
        {Object.entries(CONSENT_TYPES).map(([type, info]) => {
          const isActive = activeConsents.includes(type)
          const isLoading = loading === type
          return (
            <div key={type} className={['oh-consent__item', isActive ? 'oh-consent__item--on' : ''].filter(Boolean).join(' ')}>
              <div className="oh-consent__item-info">
                <p className="oh-consent__item-label">{info.label}</p>
                <p className="oh-consent__item-desc">{info.description}</p>
                {info.risk === 'medium' && (
                  <p className="oh-consent__item-risk">
                    ⚠ Requires explicit learner acknowledgement before session.
                  </p>
                )}
              </div>
              <button
                className={['oh-consent__toggle', isActive ? 'oh-consent__toggle--on' : ''].filter(Boolean).join(' ')}
                onClick={() => handleOpenModal(type, isActive)}
                disabled={isLoading}
                aria-pressed={isActive}
                aria-label={`${isActive ? 'Revoke' : 'Grant'} consent for ${info.label}`}
              >
                {isLoading ? '…' : isActive ? 'Revoke' : 'Grant'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Hard rules */}
      <div className="oh-consent__rules">
        <p className="oh-consent__rules-title">Always / never</p>
        <ul>
          <li>✓ Only you see AURA suggestions — never your learner</li>
          <li>✓ Notes save only after your approval</li>
          <li>✗ Never diagnoses or suggests medication</li>
          <li>✗ Never messages your learner directly</li>
          <li>✗ Nothing records without this live consent</li>
        </ul>
      </div>
    </div>
  )
}

export default OHConsentGate
