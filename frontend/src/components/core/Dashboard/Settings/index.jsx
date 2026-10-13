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
  FiShare2,
  FiShield,
  FiAward
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

  const fullName = `${user?.title ? `${user.title} ` : ''}${user?.firstName || 'User'} ${user?.lastName || ''}`.trim()
  const isLearner = user?.accountType === "Learner" || user?.accountType === "Client" || user?.accountType === "Student"
  const isPractitioner = user?.accountType === "Instructor" || user?.accountType === "Practitioner"
  const roleName = isPractitioner ? "Verified Practitioner" : "Learner"

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
    <div className="oh-profile-container">
      {/* Profile Hero Header Card */}
      <div className="oh-profile-hero">
        {/* Ambient Decorative Mesh Glow */}
        <div className="oh-profile-hero-mesh" />

        {/* Hero Banner Header with Grid Pattern */}
        <div className="oh-profile-hero-banner" />

        {/* User Info Container */}
        <div style={{ position: 'relative', padding: '0 32px 28px', marginTop: '-54px', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '22px' }}>
            {/* Avatar Wrap with Gradient Glow */}
            <div className="oh-profile-avatar-wrap">
              {user?.image && !user?.image?.includes('dicebear') ? (
                <img
                  src={user.image}
                  alt={fullName}
                  className="oh-profile-avatar-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=4F46E5&color=fff&size=200&bold=true`;
                  }}
                />
              ) : (
                <div className="oh-profile-avatar-placeholder">
                  {`${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase() || 'P'}
                </div>
              )}
              <span
                style={{
                  position: 'absolute',
                  bottom: '6px',
                  right: '6px',
                  height: '16px',
                  width: '16px',
                  borderRadius: '50%',
                  background: '#10B981',
                  border: '3px solid #080D1B',
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)'
                }}
                title="Active Account"
              />
            </div>

            {/* Title & Email Info */}
            <div style={{ marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {fullName}
                </h1>
                
                {/* Role Badge */}
                <span
                  style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)',
                    color: '#C7D2FE',
                    border: '1px solid rgba(129, 140, 248, 0.4)',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <FiAward style={{ color: '#A5B4FC' }} /> {roleName}
                </span>

                {/* Unique Learner ID Badge (for Learners) */}
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                <p style={{ color: '#94A3B8', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0, fontWeight: 500 }}>
                  <FiMail style={{ color: '#818CF8' }} /> {user?.email}
                </p>
                {isPractitioner && (
                  <span style={{ color: '#64748B', fontSize: '12px' }}>• Practice Cockpit Enabled</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Badges / Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {isLearner && (
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(148, 163, 184, 0.25)',
                  borderRadius: '16px',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backdropFilter: 'blur(8px)'
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
                    {copiedId ? <><FiCheck size={12} /> Copied</> : <><FiCopy size={12} /> Copy</>}
                  </button>
                  <button
                    onClick={handleShareWithPractitioner}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#E2E8F0',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
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
            
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                fontSize: '12.5px',
                fontWeight: 600,
                padding: '7px 16px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#34D399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
              }}
            >
              <FiCheckCircle style={{ color: '#34D399', fontSize: '15px' }} /> Account Verified
            </span>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div
          style={{
            background: '#040714',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0 24px',
            display: 'flex',
            gap: '4px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <button
            onClick={() => setActiveSubTab("profile")}
            className={`oh-profile-tab-btn ${activeSubTab === "profile" ? "active" : ""}`}
          >
            <FiUser style={{ fontSize: '16px' }} />
            <span>Personal Details</span>
          </button>

          <button
            onClick={() => setActiveSubTab("picture")}
            className={`oh-profile-tab-btn ${activeSubTab === "picture" ? "active" : ""}`}
          >
            <FiCamera style={{ fontSize: '16px' }} />
            <span>Profile Photo</span>
          </button>

          <button
            onClick={() => setActiveSubTab("subscription")}
            className={`oh-profile-tab-btn ${activeSubTab === "subscription" ? "active" : ""}`}
          >
            <FiZap style={{ fontSize: '16px', color: activeSubTab === "subscription" ? '#F59E0B' : 'inherit' }} />
            <span>Subscription &amp; Billing</span>
          </button>

          <button
            onClick={() => setActiveSubTab("security")}
            className={`oh-profile-tab-btn ${activeSubTab === "security" ? "active" : ""}`}
          >
            <FiLock style={{ fontSize: '16px' }} />
            <span>Security &amp; Password</span>
          </button>

          <button
            onClick={() => setActiveSubTab("danger")}
            className={`oh-profile-tab-btn danger-tab ${activeSubTab === "danger" ? "active" : ""}`}
          >
            <FiTrash2 style={{ fontSize: '16px' }} />
            <span>Account Management</span>
          </button>
        </div>
      </div>

      {/* Tab Content Panels with Smooth Animation */}
      <div key={activeSubTab} className="oh-profile-tab-pane">
        {activeSubTab === "profile" && <EditProfile />}
        {activeSubTab === "picture" && <ChangeProfilePicture />}
        {activeSubTab === "subscription" && <MySubscription />}
        {activeSubTab === "security" && <UpdatePassword />}
        {activeSubTab === "danger" && <DeleteAccount />}
      </div>
    </div>
  )
}

