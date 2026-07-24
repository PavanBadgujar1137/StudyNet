import React, { useState } from "react"
import { useSelector } from "react-redux"
import { 
  FiUser, 
  FiCamera, 
  FiLock, 
  FiCheckCircle, 
  FiMail, 
  FiTrash2
} from "react-icons/fi"
import ChangeProfilePicture from "./ChangeProfilePicture"
import DeleteAccount from "./DeleteAccount"
import EditProfile from "./EditProfile"
import UpdatePassword from "./UpdatePassword"

export default function Settings() {
  const { user } = useSelector((state) => state.profile)
  const [activeSubTab, setActiveSubTab] = useState("profile")

  const fullName = `${user?.firstName || 'User'} ${user?.lastName || ''}`.trim()
  const roleName = user?.accountType === "Instructor" || user?.accountType === "Practitioner" ? "Practitioner" : "Client"

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {/* Profile Hero Header Card */}
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', background: '#0F172A', color: '#FFFFFF', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)' }}>
        {/* Background Gradients */}
        <div style={{ position: 'absolute', top: 0, right: 0, marginTop: '-40px', marginRight: '-40px', height: '240px', width: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />

        {/* Hero Banner Header */}
        <div style={{ height: '120px', width: '100%', background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #0F172A 100%)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }} />

        {/* User Info Container */}
        <div style={{ position: 'relative', padding: '0 32px 24px', marginTop: '-50px', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyBetween: 'space-between', gap: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '20px' }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <img
                src={user?.image}
                alt={fullName}
                style={{ width: '100px', height: '100px', borderRadius: '16px', border: '4px solid #0F172A', objectFit: 'cover', background: '#1E293B', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}
              />
              <span style={{ position: 'absolute', bottom: '4px', right: '4px', height: '14px', width: '14px', borderRadius: '50%', background: '#10B981', border: '3px solid #0F172A' }} title="Active Account" />
            </div>

            {/* Title & Email */}
            <div style={{ marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>{fullName}</h1>
                <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#A5B4FC', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                  {roleName}
                </span>
              </div>
              <p style={{ color: '#94A3B8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0 0', fontWeight: 500 }}>
                <FiMail style={{ color: '#818CF8' }} /> {user?.email}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
        {activeSubTab === "security" && <UpdatePassword />}
        {activeSubTab === "danger" && <DeleteAccount />}
      </div>
    </div>
  )
}

