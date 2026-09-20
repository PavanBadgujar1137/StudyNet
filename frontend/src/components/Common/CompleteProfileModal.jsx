import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  FiCheckCircle,
  FiArrowRight,
  FiX,
  FiAward
} from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi'

const CompleteProfileModal = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.profile)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Show popup ONLY if flagged right after a new registration
    const shouldShow = sessionStorage.getItem('showCompleteProfilePopup') === 'true'
    if (shouldShow) {
      setIsOpen(true)
    }
  }, [])

  const handleDismiss = () => {
    sessionStorage.removeItem('showCompleteProfilePopup')
    setIsOpen(false)
  }

  const handleProceed = () => {
    sessionStorage.removeItem('showCompleteProfilePopup')
    setIsOpen(false)

    // Direct Profile Page Open
    navigate('/dashboard?tab=profile')
  }

  if (!isOpen) return null

  const isPractitioner =
    user?.accountType === 'Practitioner' ||
    user?.accountType === 'Instructor'

  const firstName = user?.firstName || 'there'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#FFFFFF',
          borderRadius: 24,
          padding: '32px 28px 28px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          border: '1px solid #E2E8F0'
        }}
      >
        {/* Decorative Top Accent Bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: isPractitioner
              ? 'linear-gradient(90deg, #7C3AED, #3B82F6)'
              : 'linear-gradient(90deg, #0284C7, #10B981)'
          }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748B',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          title="Close"
        >
          <FiX size={16} />
        </button>

        {/* Floating Icon Badge */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: isPractitioner
              ? 'linear-gradient(135deg, #EFF6FF 0%, #EDE9FE 100%)'
              : 'linear-gradient(135deg, #ECFDF5 0%, #E0F2FE 100%)',
            border: isPractitioner ? '2px solid #C7D2FE' : '2px solid #A7F3D0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            color: isPractitioner ? '#6D28D9' : '#0284C7'
          }}
        >
          {isPractitioner ? <FiAward size={28} /> : <HiSparkles size={28} />}
        </div>

        {/* Pill Tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: isPractitioner ? '#F5F3FF' : '#EFF6FF',
            border: isPractitioner ? '1px solid #DDD6FE' : '1px solid #BFDBFE',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 11.5,
            fontWeight: 800,
            color: isPractitioner ? '#7C3AED' : '#0284C7',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 12
          }}
        >
          <FiCheckCircle size={13} /> REGISTRATION SUCCESSFUL
        </div>

        {/* Modal Title */}
        <h2
          style={{
            margin: '0 0 8px',
            fontSize: 22,
            fontWeight: 900,
            color: '#0F172A',
            letterSpacing: -0.3
          }}
        >
          Welcome to OpenHand, {firstName}! 🎉
        </h2>

        {/* Sub-heading */}
        <h3
          style={{
            margin: '0 0 12px',
            fontSize: 15,
            fontWeight: 800,
            color: isPractitioner ? '#6D28D9' : '#0284C7'
          }}
        >
          Please Complete Your Profile
        </h3>

        {/* Description Body */}
        <p
          style={{
            margin: '0 0 20px',
            fontSize: 13.5,
            color: '#475569',
            lineHeight: 1.55,
            maxWidth: 400
          }}
        >
          {isPractitioner
            ? 'Your practitioner account is now active. Set up your practice details, clinical focus areas, and availability to publish your live booking profile and connect with clients.'
            : 'Your learner account has been created. Take a moment to complete your profile details and preferences to get personalized wellness matches and join sessions.'}
        </p>

        {/* Features Checklist */}
        <div
          style={{
            width: '100%',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 14,
            padding: '14px 18px',
            marginBottom: 24,
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            fontSize: 12.5,
            color: '#334155'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <span style={{ color: '#10B981', fontSize: 14 }}>✓</span>
            {isPractitioner ? 'Establish your public practitioner handle' : 'Set your wellness & learning preferences'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <span style={{ color: '#10B981', fontSize: 14 }}>✓</span>
            {isPractitioner ? 'Select clinical specialties & languages' : 'Access certified 1:1 practitioners & circles'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <span style={{ color: '#10B981', fontSize: 14 }}>✓</span>
            {isPractitioner ? 'Publish your live client booking space' : 'Track personal reflections & daily check-ins'}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}
        >
          <button
            type="button"
            onClick={handleProceed}
            style={{
              width: '100%',
              padding: '13px 20px',
              borderRadius: 14,
              background: isPractitioner
                ? 'linear-gradient(135deg, #7C3AED, #6D28D9)'
                : 'linear-gradient(135deg, #0284C7, #0369A1)',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 14.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: isPractitioner
                ? '0 4px 14px rgba(124, 58, 237, 0.35)'
                : '0 4px 14px rgba(2, 132, 199, 0.35)',
              transition: 'all 0.15s ease'
            }}
          >
            OK, Complete Profile <FiArrowRight />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              padding: '6px 12px'
            }}
          >
            Explore Dashboard First
          </button>
        </div>
      </div>
    </div>
  )
}

export default CompleteProfileModal
