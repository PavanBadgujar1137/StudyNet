import { FiTrash2, FiAlertTriangle } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { deleteProfile } from "../../../../services/operations/SettingsAPI"

export default function DeleteAccount() {
  const { token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  async function handleDeleteAccount() {
    if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      try {
        dispatch(deleteProfile(token, navigate))
      } catch (error) {
        console.log("ERROR MESSAGE - ", error.message)
      }
    }
  }

  return (
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
            onClick={handleDeleteAccount}
          >
            <FiTrash2 style={{ fontSize: '15px' }} /> Delete My Account Permanently
          </button>
        </div>
      </div>
    </div>
  )
}

