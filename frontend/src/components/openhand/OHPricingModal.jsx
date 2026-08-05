import React from 'react'
import { FiX } from 'react-icons/fi'
import OHPricingSection from './OHPricingSection'

export default function OHPricingModal({ isOpen, onClose, defaultRole = 'learner' }) {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '28px',
          width: '100%',
          maxWidth: '1280px',
          maxHeight: '92vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalSlideUp 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes modalSlideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Modal Sticky Header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid #F1F5F9',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>💳</span>
            <span style={{ fontWeight: 800, fontSize: '16px', color: '#0F172A' }}>
              Select Subscription Plan
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '18px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#EF4444'
              e.currentTarget.style.color = '#FFFFFF'
              e.currentTarget.style.borderColor = '#EF4444'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F1F5F9'
              e.currentTarget.style.color = '#0F172A'
              e.currentTarget.style.borderColor = '#CBD5E1'
            }}
            aria-label="Close modal"
          >
            <FiX />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '20px 24px 48px' }}>
          <OHPricingSection
            defaultRole={defaultRole}
            title="Choose Your Subscription Plan"
            subtitle="Subscribe via Razorpay to instantly unlock all platform features and practitioner courses."
            isModal={true}
          />
        </div>
      </div>
    </div>
  )
}
