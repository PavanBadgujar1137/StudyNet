import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { apiConnector } from '../services/apiConnector'
import { endpoints } from '../services/apis'
import { setUser } from '../slices/profileSlice'

const { ACCEPT_CONSENT_API } = endpoints

const CONSENT_ITEMS = [
  {
    id: 'c1',
    text: "I consent to OpenHand and its authorised partners processing my personal data to provide and improve the platform's services (GDPR Art. 6(1)(a)).",
  },
  {
    id: 'c2',
    text: 'I agree to the Terms of Service and Privacy Policy. I understand how my data is stored, used, and that I may withdraw consent at any time.',
  },
  {
    id: 'c3',
    text: 'I declare that all information I have provided during registration is accurate and complete to the best of my knowledge.',
  },
]

export default function ConsentDeclaration() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState({ c1: false, c2: false, c3: false })

  const allChecked = CONSENT_ITEMS.every((item) => checked[item.id])

  const toggle = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }))

  const handleSubmit = async () => {
    if (!allChecked || loading) return
    setLoading(true)
    try {
      const res = await apiConnector('POST', ACCEPT_CONSENT_API, {}, {
        Authorization: `Bearer ${token}`,
      })
      if (res?.data?.success) {
        toast.success('Consent accepted — welcome to OpenHand!')
        dispatch(setUser({ ...user, hasConsented: true }))

        // Route based on account type
        const role = user?.accountType
        if (role === 'Practitioner' || role === 'Instructor') {
          navigate('/practice')
        } else if (role === 'Admin') {
          navigate('/admin')
        } else if (role === 'OrgAdmin') {
          navigate('/org/dashboard')
        } else {
          navigate('/dashboard')
        }
      } else {
        toast.error(res?.data?.message || 'Something went wrong. Please try again.')
      }
    } catch (err) {
      console.error('Consent error:', err)
      toast.error('Could not save consent. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      <div style={{
        width: '100%',
        maxWidth: '680px',
        background: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 20px 60px -12px rgba(29, 33, 169, 0.12), 0 4px 16px rgba(0,0,0,0.06)',
        border: '1px solid rgba(91, 47, 224, 0.08)',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '36px 40px 28px',
          borderBottom: '1px solid #EEF2FF',
          background: 'linear-gradient(135deg, #F5F3FF 0%, #EEF2FF 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '28px' }}>🤝</span>
            <h1 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 800,
              color: '#0D1B45',
              letterSpacing: '-0.025em',
            }}>
              Consent &amp; Declaration
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748B', lineHeight: 1.6 }}>
            Before you access your dashboard, please review and accept the following terms. This is a one-time step.
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '32px 40px' }}>

          {/* Data usage notice */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '18px 20px',
            marginBottom: '28px',
          }}>
            <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              How we use your data
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '13.5px', lineHeight: 1.75 }}>
              <li>Used solely to provide and improve platform services for you.</li>
              <li>Never sold or used for advertising.</li>
              <li>Retained for 3 years or until you request deletion — you may access, correct, or delete your data at any time.</li>
            </ul>
          </div>

          {/* Checkboxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '36px' }}>
            {CONSENT_ITEMS.map((item) => (
              <label
                key={item.id}
                onClick={() => toggle(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  cursor: 'pointer',
                  padding: '16px 18px',
                  borderRadius: '14px',
                  border: `1.5px solid ${checked[item.id] ? 'rgba(91, 47, 224, 0.35)' : '#E2E8F0'}`,
                  background: checked[item.id] ? 'rgba(91, 47, 224, 0.04)' : '#FAFAFA',
                  transition: 'all 0.2s ease',
                  userSelect: 'none',
                }}
              >
                {/* Custom checkbox */}
                <div style={{
                  flexShrink: 0,
                  marginTop: '2px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  border: `2px solid ${checked[item.id] ? '#5B2FE0' : '#CBD5E1'}`,
                  background: checked[item.id] ? '#5B2FE0' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}>
                  {checked[item.id] && (
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                      <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span style={{ fontSize: '14px', color: '#1E293B', lineHeight: 1.6 }}>
                  {item.text}
                </span>
              </label>
            ))}
          </div>

          {/* Status line */}
          <p style={{ margin: '0 0 28px', fontSize: '13px', color: '#94A3B8', textAlign: 'center' }}>
            {allChecked
              ? '✅ All items accepted — you\'re ready to proceed'
              : `${Object.values(checked).filter(Boolean).length} of ${CONSENT_ITEMS.length} items accepted`}
          </p>

          {/* Footer buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid #EEF2FF' }}>
            <button
              onClick={handleBack}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: '1.5px solid #E2E8F0',
                background: '#fff',
                color: '#64748B',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              ← Back
            </button>

            <button
              onClick={handleSubmit}
              disabled={!allChecked || loading}
              style={{
                padding: '12px 32px',
                borderRadius: '12px',
                border: 'none',
                background: allChecked
                  ? 'linear-gradient(135deg, #5B2FE0 0%, #2563EB 100%)'
                  : '#E2E8F0',
                color: allChecked ? '#fff' : '#94A3B8',
                fontSize: '14px',
                fontWeight: 700,
                cursor: allChecked ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                boxShadow: allChecked ? '0 8px 20px rgba(91, 47, 224, 0.3)' : 'none',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Saving...' : 'Accept & Continue →'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
