import React, { useState } from "react"
import { FiTrash2, FiAlertTriangle, FiX, FiCalendar, FiClock, FiLogOut } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { deleteProfile } from "../../../../services/operations/SettingsAPI"
import { logout } from "../../../../services/operations/authAPI"

export default function DeleteAccount() {
  const { token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // 30-Day Scheduled Deletion Confirmation Popup Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [deletionData, setDeletionData] = useState(null)

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
      await dispatch(
        deleteProfile(token, (resData) => {
          setIsModalOpen(false)
          setDeletionData(resData)
          setShowSuccessModal(true)
        })
      )
    } catch (error) {
      console.error("Delete account error:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAcknowledgeAndLogout = () => {
    setShowSuccessModal(false)
    dispatch(logout(navigate))
  }

  const effectiveDateStr = deletionData?.deletionEffectiveDate
    ? new Date(deletionData.deletionEffectiveDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })

  return (
    <>
      <div
        style={{
          background: "#FEF2F2",
          border: "1px solid #FECDD3",
          borderRadius: "24px",
          padding: "28px",
          display: "flex",
          gap: "20px",
          alignItems: "flex-start",
          textAlign: "left",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: "#FEE2E2",
            color: "#DC2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 6px rgba(220,38,38,0.1)",
          }}
        >
          <FiAlertTriangle style={{ fontSize: "22px" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#991B1B", margin: 0 }}>
              Delete Account
            </h3>
            <p style={{ fontSize: "12px", color: "#9F1239", margin: "2px 0 0", fontWeight: 600 }}>
              30-day permanent account removal queue
            </p>
          </div>

          <div style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6", maxWidth: "600px" }}>
            <p style={{ fontWeight: 700, color: "#991B1B", margin: 0 }}>
              Would you like to delete your account?
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748B" }}>
              Requesting permanent deletion will initiate a <strong>30-day grace period</strong>. After 30 days, your account and all associated data, enrolled spaces, and learning records will be completely wiped from the database.
            </p>
          </div>

          <div style={{ paddingTop: "8px" }}>
            <button
              type="button"
              style={{
                background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                color: "#FFFFFF",
                border: "none",
                padding: "12px 24px",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(220, 38, 38, 0.4)",
                transition: "all 0.15s ease",
              }}
              onClick={handleOpenModal}
            >
              <FiTrash2 style={{ fontSize: "15px" }} /> Delete My Account Permanently
            </button>
          </div>
        </div>
      </div>

      {/* PERMANENT ACCOUNT DELETION CONFIRMATION MODAL */}
      {isModalOpen && (
        <div
          onClick={handleCloseModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FFFFFF",
              borderRadius: "24px",
              maxWidth: "520px",
              width: "100%",
              padding: "32px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
              border: "1px solid #E2E8F0",
              textAlign: "left",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: "#FEE2E2",
                    color: "#DC2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FiAlertTriangle size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "19px", fontWeight: 800, color: "#0F172A" }}>
                    Permanently Delete Account?
                  </h3>
                  <p style={{ margin: "3px 0 0", fontSize: "13px", color: "#DC2626", fontWeight: 700 }}>
                    Scheduled for permanent removal in 30 days
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isDeleting}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94A3B8",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  padding: "4px",
                  display: "flex",
                }}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Warning Callout Box */}
            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: "14px",
                padding: "16px",
                marginBottom: "20px",
                fontSize: "13px",
                color: "#991B1B",
                lineHeight: 1.55,
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <FiClock size={16} /> 30-Day Permanent Deletion Policy:
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>Your account access will immediately be deactivated.</li>
                <li>Your profile, credentials, enrolled courses, circles, and records are queued for complete database removal in <strong>30 days</strong>.</li>
                <li>You may reach out to support within this 30-day period if you wish to restore your account.</li>
              </ul>
            </div>

            {/* Mandatory Confirmation Checkbox */}
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                background: "#F8FAFC",
                border: isConfirmed ? "1.5px solid #EF4444" : "1.5px solid #E2E8F0",
                borderRadius: "14px",
                padding: "14px",
                cursor: isDeleting ? "not-allowed" : "pointer",
                userSelect: "none",
                marginBottom: "24px",
                transition: "all 0.2s",
              }}
            >
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                disabled={isDeleting}
                style={{ marginTop: "3px", width: "17px", height: "17px", accentColor: "#DC2626", cursor: "pointer" }}
              />
              <span style={{ fontSize: "13px", color: "#334155", fontWeight: 600, lineHeight: 1.45 }}>
                Yes, I understand and request that my account be permanently deleted from the database in 30 days.
              </span>
            </label>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: "12px 18px",
                  background: "#F1F5F9",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  color: "#475569",
                  fontWeight: 700,
                  fontSize: "13.5px",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
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
                  padding: "12px 18px",
                  background: !isConfirmed || isDeleting ? "#FCA5A5" : "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                  border: "none",
                  borderRadius: "12px",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "13.5px",
                  cursor: !isConfirmed || isDeleting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: isConfirmed && !isDeleting ? "0 4px 14px rgba(220, 38, 38, 0.35)" : "none",
                  transition: "all 0.2s",
                }}
              >
                <FiTrash2 size={16} />
                {isDeleting ? "Scheduling Deletion..." : "Schedule Permanent Deletion"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP MODAL: ACCOUNT SCHEDULED FOR DELETION IN 30 DAYS */}
      {showSuccessModal && (
        <div
          onClick={handleAcknowledgeAndLogout}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100000,
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FFFFFF",
              borderRadius: "28px",
              maxWidth: "540px",
              width: "100%",
              padding: "36px",
              boxShadow: "0 30px 70px rgba(0, 0, 0, 0.4)",
              border: "1px solid #E2E8F0",
              textAlign: "center",
              animation: "popIn 0.3s ease",
            }}
          >
            {/* Top Icon Badge */}
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "22px",
                background: "linear-gradient(135deg, #FEF3C7 0%, #FEE2E2 100%)",
                border: "2px solid #FDE68A",
                color: "#D97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                boxShadow: "0 8px 20px rgba(217, 119, 6, 0.15)",
              }}
            >
              <FiClock size={34} color="#D97706" />
            </div>

            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "22px",
                fontWeight: 900,
                color: "#0F172A",
                letterSpacing: "-0.4px",
              }}
            >
              Account Scheduled for Permanent Deletion
            </h2>

            <p
              style={{
                margin: "0 0 24px",
                fontSize: "14px",
                color: "#64748B",
                lineHeight: "1.6",
              }}
            >
              Your account deletion request has been registered. Your account and all associated data will be completely and permanently wiped from our database in <strong>30 days</strong>.
            </p>

            {/* Highlighted Timeline Box */}
            <div
              style={{
                background: "#F8FAFC",
                border: "1.5px solid #E2E8F0",
                borderRadius: "18px",
                padding: "18px 20px",
                marginBottom: "24px",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "#64748B", display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
                  <FiCalendar size={15} color="#3B82F6" /> Permanent Deletion Date:
                </span>
                <span style={{ fontSize: "13.5px", fontWeight: 800, color: "#DC2626" }}>
                  {effectiveDateStr}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "#64748B", display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
                  <FiClock size={15} color="#F59E0B" /> Grace Period:
                </span>
                <span style={{ fontSize: "12px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", background: "#FEF3C7", color: "#B45309" }}>
                  30 Days
                </span>
              </div>

              <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "10px", fontSize: "12.5px", color: "#475569", lineHeight: "1.5" }}>
                ℹ️ <strong>Need to cancel?</strong> If this was a mistake or you wish to recover your data, please contact platform support at <strong>support@openhand.com</strong> before {effectiveDateStr}.
              </div>
            </div>

            {/* Acknowledge Button */}
            <button
              type="button"
              onClick={handleAcknowledgeAndLogout}
              style={{
                width: "100%",
                padding: "14px 24px",
                background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "14px",
                fontWeight: 800,
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 6px 20px rgba(15, 23, 42, 0.25)",
                transition: "all 0.2s",
              }}
            >
              <FiLogOut size={16} /> Acknowledge &amp; Sign Out Now
            </button>
          </div>
        </div>
      )}
    </>
  )
}
