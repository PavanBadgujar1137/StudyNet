import React, { useState, useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { 
  FiUser, 
  FiCamera, 
  FiLock, 
  FiCheckCircle, 
  FiMail, 
  FiTrash2,
  FiZap,
  FiCopy,
  FiCheck,
  FiTag,
  FiShare2
} from "react-icons/fi"
import toast from "react-hot-toast"
import ChangeProfilePicture from "./ChangeProfilePicture"
import DeleteAccount from "./DeleteAccount"
import EditProfile from "./EditProfile"
import UpdatePassword from "./UpdatePassword"
import MySubscription from "./MySubscription"
import { getUserDetails } from "../../../../services/operations/profileAPI"

export default function Settings() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const [activeSubTab, setActiveSubTab] = useState("profile")
  const [copiedId, setCopiedId] = useState(false)
  const hasFetchedRef = useRef(false)

  // Ensure latest user details & learnerId are loaded if missing
  useEffect(() => {
    if (token && !user?.learnerId && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(getUserDetails(token, navigate))
    }
  }, [dispatch, token, navigate, user?.learnerId])

  const fullName = `${user?.firstName || 'User'} ${user?.lastName || ''}`.trim()
  const isLearner = user?.accountType === "Learner" || user?.accountType === "Client" || user?.accountType === "Student"
  const roleName = user?.accountType === "Instructor" || user?.accountType === "Practitioner" ? "Practitioner" : "Learner"

  const handleCopyLearnerId = () => {
    if (!user?.learnerId) {
      toast.error("Learner ID is syncing, please wait...")
      if (token) dispatch(getUserDetails(token, navigate))
      return
    }
    navigator.clipboard.writeText(user.learnerId)
    setCopiedId(true)
    toast.success(`Learner ID ${user.learnerId} copied to clipboard!`)
    setTimeout(() => setCopiedId(false), 2500)
  }

  const handleShareWithPractitioner = () => {
    if (!user?.learnerId) {
      toast.error("Learner ID is syncing, please wait...")
      if (token) dispatch(getUserDetails(token, navigate))
      return
    }
    const message = `Hello! My OpenHand Learner ID is ${user.learnerId} (${fullName}). Please use this ID to find my profile and apply my personalized discount or scholarship.`
    navigator.clipboard.writeText(message)
    toast.success("Share message copied! You can paste this to your Practitioner.", { duration: 4000 })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {/* Profile Hero Header Card */}
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', background: '#0F172A', color: '#FFFFFF', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)' }}>
        {/* Background Gradients */}
        <div style={{ position: 'absolute', top: 0, right: 0, marginTop: '-40px', marginRight: '-40px', height: '240px', width: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />

        {/* Hero Banner Header */}
        <div style={{ height: '120px', width: '100%', background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #0F172A 100%)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }} />

        {/* User Info Container */}
        <div style={{ position: 'relative', padding: '0 32px 24px', marginTop: '-50px', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '20px' }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              {user?.image ? (
                <img
                  src={user.image}
                  alt={fullName}
                  style={{ width: '100px', height: '100px', borderRadius: '16px', border: '4px solid #0F172A', objectFit: 'cover', background: '#1E293B', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}
                />
              ) : (
                <div
                  style={{ width: '100px', height: '100px', borderRadius: '16px', border: '4px solid #0F172A', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 900, color: '#FFFFFF', boxShadow: '0 10px 20px rgba(0,0,0,0.3)', letterSpacing: '-1px' }}
                >
                  {`${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase() || '?'}
                </div>
              )}
              <span style={{ position: 'absolute', bottom: '4px', right: '4px', height: '14px', width: '14px', borderRadius: '50%', background: '#10B981', border: '3px solid #0F172A' }} title="Active Account" />
            </div>

            {/* Title & Email */}
            <div style={{ marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>{fullName}</h1>
                <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#A5B4FC', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                  {roleName}
                </span>

                {/* Unique Learner ID Badge */}
                {isLearner && (
                  <button
                    onClick={handleCopyLearnerId}
                    title="Click to copy your unique Learner ID"
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#34D399',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <FiTag style={{ fontSize: '12px' }} />
                    ID: {user?.learnerId || 'Syncing ID...'}
                    {copiedId ? <FiCheck style={{ color: '#34D399' }} /> : <FiCopy style={{ opacity: 0.8 }} />}
                  </button>
                )}
              </div>
              <p style={{ color: '#94A3B8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0 0', fontWeight: 500 }}>
                <FiMail style={{ color: '#818CF8' }} /> {user?.email}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {isLearner && (
              <div
                style={{
                  background: 'rgba(30, 41, 59, 0.9)',
                  border: '1px solid rgba(148, 163, 184, 0.25)',
                  borderRadius: '14px',
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Unique Learner ID
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#38BDF8', fontFamily: 'monospace' }}>
                    {user?.learnerId || 'Generating...'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={handleCopyLearnerId}
                    style={{
                      background: copiedId ? '#10B981' : '#3B82F6',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title="Copy Learner ID for scholarships & Practitioner discounts"
                  >
                    {copiedId ? <><FiCheck size={12} /> Copied</> : <><FiCopy size={12} /> Copy ID</>}
                  </button>
                  <button
                    onClick={handleShareWithPractitioner}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#E2E8F0',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title="Copy friendly message to share with your Practitioner"
                  >
                    <FiShare2 size={12} /> Share
                  </button>
                </div>
              </div>
            )}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <FiCheckCircle style={{ color: '#34D399' }} /> Account Verified
            </span>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div style={{ background: '#020617', borderTop: '1px solid rgba(255, 255, 255, 0.1)', padding: '0 24px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveSubTab("profile")}
            style={{
              background: activeSubTab === "profile" ? "rgba(255, 255, 255, 0.1)" : "transparent",
              color: activeSubTab === "profile" ? "#818CF8" : "#94A3B8",
              borderBottom: activeSubTab === "profile" ? "3px solid #818CF8" : "3px solid transparent",
              padding: "14px 18px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease"
            }}
          >
            <FiUser style={{ fontSize: '15px' }} /> Personal Details
          </button>

          <button
            onClick={() => setActiveSubTab("picture")}
            style={{
              background: activeSubTab === "picture" ? "rgba(255, 255, 255, 0.1)" : "transparent",
              color: activeSubTab === "picture" ? "#818CF8" : "#94A3B8",
              borderBottom: activeSubTab === "picture" ? "3px solid #818CF8" : "3px solid transparent",
              padding: "14px 18px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease"
            }}
          >
            <FiCamera style={{ fontSize: '15px' }} /> Profile Photo
          </button>

          <button
            onClick={() => setActiveSubTab("subscription")}
            style={{
              background: activeSubTab === "subscription" ? "rgba(255, 255, 255, 0.1)" : "transparent",
              color: activeSubTab === "subscription" ? "#818CF8" : "#94A3B8",
              borderBottom: activeSubTab === "subscription" ? "3px solid #818CF8" : "3px solid transparent",
              padding: "14px 18px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease"
            }}
          >
            <FiZap style={{ fontSize: '15px', color: '#F59E0B' }} /> My Subscription &amp; Billing
          </button>

          <button
            onClick={() => setActiveSubTab("security")}
            style={{
              background: activeSubTab === "security" ? "rgba(255, 255, 255, 0.1)" : "transparent",
              color: activeSubTab === "security" ? "#818CF8" : "#94A3B8",
              borderBottom: activeSubTab === "security" ? "3px solid #818CF8" : "3px solid transparent",
              padding: "14px 18px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease"
            }}
          >
            <FiLock style={{ fontSize: '15px' }} /> Security &amp; Password
          </button>

          <button
            onClick={() => setActiveSubTab("danger")}
            style={{
              background: activeSubTab === "danger" ? "rgba(239, 68, 68, 0.15)" : "transparent",
              color: activeSubTab === "danger" ? "#F87171" : "#94A3B8",
              borderBottom: activeSubTab === "danger" ? "3px solid #F87171" : "3px solid transparent",
              padding: "14px 18px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease"
            }}
          >
            <FiTrash2 style={{ fontSize: '15px' }} /> Account Management
          </button>
        </div>
      </div>

      {/* Tab Content Panels */}
      <div>
        {activeSubTab === "profile" && <EditProfile />}
        {activeSubTab === "picture" && <ChangeProfilePicture />}
        {activeSubTab === "subscription" && <MySubscription />}
        {activeSubTab === "security" && <UpdatePassword />}
        {activeSubTab === "danger" && <DeleteAccount />}
      </div>
    </div>
  )
}

