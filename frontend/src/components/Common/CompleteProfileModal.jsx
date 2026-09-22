import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  FiCheckCircle,
  FiArrowRight,
  FiX,
  FiAward,
  FiTag,
} from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi'

const CompleteProfileModal = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.profile)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Show popup ONLY if flagged right after a new registration (supports both sessionStorage and localStorage)
    const shouldShow =
      sessionStorage.getItem('showCompleteProfilePopup') === 'true' ||
      localStorage.getItem('showCompleteProfilePopup') === 'true'
    if (shouldShow) {
      setIsOpen(true)
    }
  }, [])

  const clearFlag = () => {
    sessionStorage.removeItem('showCompleteProfilePopup')
    localStorage.removeItem('showCompleteProfilePopup')
  }

  const handleDismiss = () => {
    clearFlag()
    setIsOpen(false)
  }

  const handleCompleteProfile = () => {
    clearFlag()
    setIsOpen(false)
    navigate('/dashboard?tab=profile')
  }

  const handleAddOffer = () => {
    clearFlag()
    setIsOpen(false)
    navigate('/dashboard?tab=offers&create=true')
  }

  const handleLearnerProceed = () => {
    clearFlag()
    setIsOpen(false)
    navigate('/dashboard?tab=profile')
  }

  if (!isOpen) return null

  const isPractitioner =
    user?.accountType === 'Practitioner' ||
    user?.accountType === 'Instructor'

  const firstName = user?.firstName || 'there'

  // ─── Practitioner Modal ───────────────────────────────────────────────────
  if (isPractitioner) {
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
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 520,
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
            border: '1px solid #E2E8F0',
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
              background: 'linear-gradient(90deg, #7C3AED, #3B82F6)',
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
              transition: 'all 0.15s',
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
              background: 'linear-gradient(135deg, #EFF6FF 0%, #EDE9FE 100%)',
              border: '2px solid #C7D2FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              color: '#6D28D9',
            }}
          >
            <FiAward size={28} />
          </div>

          {/* Pill Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#F5F3FF',
              border: '1px solid #DDD6FE',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 11.5,
              fontWeight: 800,
              color: '#7C3AED',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 12,
            }}
          >
            <FiCheckCircle size={13} /> REGISTRATION SUCCESSFUL
          </div>

          {/* Modal Title */}
          <h2
            style={{
              margin: '0 0 6px',
              fontSize: 22,
              fontWeight: 900,
              color: '#0F172A',
              letterSpacing: -0.3,
            }}
          >
            Welcome to OpenHand, {firstName}! 🎉
          </h2>

          <h3
            style={{
              margin: '0 0 14px',
              fontSize: 14.5,
              fontWeight: 800,
              color: '#6D28D9',
            }}
          >
            Set up your practice to start getting bookings
          </h3>

          {/* Dummy Offer Info Banner */}
          <div
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
              border: '1.5px solid #A7F3D0',
              borderRadius: 14,
              padding: '12px 16px',
              marginBottom: 18,
              textAlign: 'left',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>🟢</span>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: '#065F46', marginBottom: 3 }}>
                You're already on the directory!
              </div>
              <div style={{ fontSize: 12, color: '#047857', lineHeight: 1.5 }}>
                A basic <strong>1:1 Consultation</strong> placeholder is live so learners can discover you right away.
                Add your real offer and it will <strong>automatically replace</strong> the placeholder.
              </div>
            </div>
          </div>

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
              color: '#334155',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
              <span style={{ color: '#10B981', fontSize: 14 }}>✓</span>
              Establish your public practitioner handle
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
              <span style={{ color: '#10B981', fontSize: 14 }}>✓</span>
              Select clinical specialties & languages
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
              <span style={{ color: '#10B981', fontSize: 14 }}>✓</span>
              Publish your live client booking offer & price
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {/* Primary: Add Offer */}
            <button
              type="button"
              onClick={handleAddOffer}
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                border: 'none',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: 14.5,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                transition: 'all 0.15s ease',
              }}
            >
              <FiTag size={16} /> Add Your First Offer <FiArrowRight />
            </button>

            {/* Secondary: Complete Profile */}
            <button
              type="button"
              onClick={handleCompleteProfile}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: 14,
                background: '#EDE9FE',
                border: '1.5px solid #DDD6FE',
                color: '#6D28D9',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.15s ease',
              }}
            >
              <FiAward size={16} /> Complete Your Profile
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                padding: '6px 12px',
              }}
            >
              Explore Dashboard First
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Learner Modal ────────────────────────────────────────────────────────
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
        animation: 'fadeIn 0.25s ease-out',
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
          border: '1px solid #E2E8F0',
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
            background: 'linear-gradient(90deg, #0284C7, #10B981)',
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
            transition: 'all 0.15s',
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
            background: 'linear-gradient(135deg, #ECFDF5 0%, #E0F2FE 100%)',
            border: '2px solid #A7F3D0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            color: '#0284C7',
          }}
        >
          <HiSparkles size={28} />
        </div>

        {/* Pill Tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 11.5,
            fontWeight: 800,
            color: '#0284C7',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 12,
          }}
        >
          <FiCheckCircle size={13} /> REGISTRATION SUCCESSFUL
        </div>

        <h2
          style={{
            margin: '0 0 8px',
            fontSize: 22,
            fontWeight: 900,
            color: '#0F172A',
            letterSpacing: -0.3,
          }}
        >
          Welcome to OpenHand, {firstName}! 🎉
        </h2>

        <h3
          style={{
            margin: '0 0 12px',
            fontSize: 15,
            fontWeight: 800,
            color: '#0284C7',
          }}
        >
          Please Complete Your Profile
        </h3>

        <p
          style={{
            margin: '0 0 20px',
            fontSize: 13.5,
            color: '#475569',
            lineHeight: 1.55,
            maxWidth: 400,
          }}
        >
          Your learner account has been created. Take a moment to complete your profile details and preferences to get personalized wellness matches and join sessions.
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
            color: '#334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <span style={{ color: '#10B981', fontSize: 14 }}>✓</span>
            Set your wellness & learning preferences
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <span style={{ color: '#10B981', fontSize: 14 }}>✓</span>
            Access certified 1:1 practitioners & circles
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <span style={{ color: '#10B981', fontSize: 14 }}>✓</span>
            Track personal reflections & daily check-ins
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={handleLearnerProceed}
            style={{
              width: '100%',
              padding: '13px 20px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #0284C7, #0369A1)',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 14.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
              transition: 'all 0.15s ease',
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
              padding: '6px 12px',
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
