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
        justify: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '1140px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #E2E8F0',
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

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'sticky',
            top: '16px',
            right: '16px',
            float: 'right',
            zIndex: 10,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#F1F5F9',
            border: '1.5px solid #CBD5E1',
            color: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '20px',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
        >
          <FiX />
        </button>

        {/* Pricing Section */}
        <div style={{ padding: '24px 16px 40px' }}>
          <OHPricingSection
            defaultRole={defaultRole}
            title="Choose Your Subscription Plan"
            subtitle="Subscribe via Razorpay to instantly unlock all platform features and practitioner courses."
          />
        </div>
      </div>
    </div>
  )
}
