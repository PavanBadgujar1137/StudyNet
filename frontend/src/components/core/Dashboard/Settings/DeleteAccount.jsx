import React, { useState } from "react"
import { FiTrash2, FiAlertTriangle, FiX } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { deleteProfile } from "../../../../services/operations/SettingsAPI"

export default function DeleteAccount() {
  const { token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleOpenModal = () => {
    setIsConfirmed(false)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    if (isDeleting) return
    setIsModalOpen(false)
    setIsConfirmed(false)
  }

  const handleConfirmDelete = async () => {
    if (!isConfirmed || isDeleting) return
    setIsDeleting(true)
    try {
      await dispatch(deleteProfile(token, navigate))
    } catch (error) {
      console.error("Delete account error:", error)
    } finally {
      setIsDeleting(false)
      setIsModalOpen(false)
    }
  }

  return (
    <>
      <div style={{ background: '#FEF2F2', border: '1px solid #FECDD3', borderRadius: '24px', padding: '28px', display: 'flex', gap: '20px', alignItems: 'flex-start', textAlign: 'left' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(220,38,38,0.1)' }}>
          <FiAlertTriangle style={{ fontSize: '22px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#991B1B', margin: 0 }}>
              Delete Account
            </h3>
            <p style={{ fontSize: '12px', color: '#9F1239', margin: '2px 0 0', fontWeight: 600 }}>Permanent account removal</p>
          </div>
          
          <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', maxWidth: '600px' }}>
            <p style={{ fontWeight: 700, color: '#991B1B', margin: 0 }}>Would you like to delete your account?</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B' }}>
              Deleting your account is permanent and will remove all your data, enrolled spaces, progress history, and active sessions. This action cannot be reverted.
            </p>
          </div>

          <div style={{ paddingTop: '8px' }}>
            <button
              type="button"
              style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)',
                transition: 'all 0.15s ease'
              }}
              onClick={handleOpenModal}
            >
              <FiTrash2 style={{ fontSize: '15px' }} /> Delete My Account Permanently
            </button>
          </div>
        </div>
      </div>

      {/* PERMANENT ACCOUNT DELETION CONFIRMATION MODAL */}
      {isModalOpen && (
        <div
          onClick={handleCloseModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '500px',
              width: '100%',
              padding: '30px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid #E2E8F0',
              textAlign: 'left',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: '#FEE2E2',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FiAlertTriangle size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18.5px', fontWeight: 800, color: '#0F172A' }}>
                    Permanently Delete Account?
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#DC2626', fontWeight: 700 }}>
                    This action is permanent and cannot be undone.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isDeleting}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  padding: '4px',
                  display: 'flex',
                }}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Warning Callout Box */}
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '14px',
                padding: '14px 16px',
                marginBottom: '20px',
                fontSize: '12.5px',
                color: '#991B1B',
                lineHeight: 1.55,
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: '6px' }}>
                ⚠️ The following will be wiped immediately:
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>Your profile, credentials, and personal information.</li>
                <li>All enrolled courses, group circles, session records, and notes.</li>
                <li>Any active subscriptions and payment connections will be terminated.</li>
              </ul>
            </div>

            {/* Mandatory Confirmation Checkbox */}
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                background: '#F8FAFC',
                border: isConfirmed ? '1.5px solid #EF4444' : '1.5px solid #E2E8F0',
                borderRadius: '14px',
                padding: '14px',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                userSelect: 'none',
                marginBottom: '24px',
                transition: 'all 0.2s',
              }}
            >
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                disabled={isDeleting}
                style={{ marginTop: '3px', width: '17px', height: '17px', accentColor: '#DC2626', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '13px', color: '#334155', fontWeight: 600, lineHeight: 1.45 }}>
                Yes, I understand that my account and all associated data will be permanently deleted and cannot be recovered.
              </span>
            </label>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={!isConfirmed || isDeleting}
                style={{
                  flex: 1.5,
                  padding: '12px 18px',
                  background: !isConfirmed || isDeleting ? '#FCA5A5' : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: !isConfirmed || isDeleting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: isConfirmed && !isDeleting ? '0 4px 14px rgba(220, 38, 38, 0.35)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <FiTrash2 size={16} />
                {isDeleting ? 'Deleting Account...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
