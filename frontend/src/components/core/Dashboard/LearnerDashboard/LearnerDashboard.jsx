import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams, useLocation } from 'react-router-dom'
import {
  FiMapPin,
  FiCheckSquare,
  FiUsers,
  FiBookOpen,
  FiFeather,
  FiMenu,
  FiX,
  FiMessageSquare,
  FiZap,
  FiUserCheck,
  FiUser,
  FiVideo,
  FiCopy,
  FiCheck,
  FiTag,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import MyJourney from './MyJourney'
import CheckIn from './CheckIn'
import Practitioners from './Practitioners'
import MyCircle from './MyCircle'
import SessionsResources from './SessionsResources'
import Reflections from './Reflections'
import Courses from './Courses'
import Settings from '../Settings'
import CommunityChatHub from '../CommunityChatHub'
import AuraChat from '../AuraChat'
import { fetchClientDashboardData } from '../../../../services/operations/dashboardAPI'
import ProfileDropdown from '../../Auth/ProfileDropdown'

export function LearnerDashboard() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const getActiveTab = () => {
    const tabParam = searchParams.get('tab')
    if (tabParam) return tabParam
    const path = decodeURIComponent(location.pathname.toLowerCase())
    if (path.includes('profile') || path.includes('settings')) return 'profile'
    if (path.includes('courses')) return 'courses'
    if (path.includes('checkin')) return 'checkin'
    if (path.includes('practitioner')) return 'practitioners'
    if (path.includes('circle')) return 'circle'
    if (path.includes('community') || path.includes('chat')) return 'community'
    if (path.includes('aura') || path.includes('companion')) return 'aura'
    if (path.includes('session')) return 'sessions'
    if (path.includes('reflection')) return 'reflections'
    return 'journey'
  }

  const activeTab = getActiveTab()

  const setActiveTab = useCallback((tab) => {
    setSearchParams({ tab })
  }, [setSearchParams])

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)

  const clientName = user?.firstName || 'Student'
  const practitionerObj = dashboardData?.practitioner
  const practitionerFirstName = practitionerObj?.firstName || 'Instructor'

  const [copiedId, setCopiedId] = useState(false)

  const handleCopyLearnerId = () => {
    if (!user?.learnerId) return
    navigator.clipboard.writeText(user.learnerId)
    setCopiedId(true)
    toast.success("Learner ID copied to clipboard!")
    setTimeout(() => setCopiedId(false), 2500)
  }

  const loadData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    const data = await fetchClientDashboardData(token)
    if (data) setDashboardData(data)
    setLoading(false)
  }, [token])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCheckInSuccess = () => {
    loadData()
  }

  const navItems = [
    {
      id: 'journey',
      label: 'My journey',
      icon: <FiMapPin />,
      badge: null,
    },
    {
      id: 'aura',
      label: 'AURA Counselor',
      icon: <FiZap />,
      badge: null,
      hasDot: false,
    },
    {
      id: 'checkin',
      label: 'Check in',
      icon: <FiCheckSquare />,
      badge: 'Today',
      hasDot: true,
    },
    {
      id: 'practitioners',
      label: 'Practitioners',
      icon: <FiUserCheck />,
      badge: 'All Guides',
    },
    {
      id: 'courses',
      label: 'Courses',
      icon: <FiVideo />,
      badge: null,
    },
    {
      id: 'circle',
      label: 'My circle',
      icon: <FiUsers />,
      badge: 'Circles',
    },
    {
      id: 'community',
      label: 'Community & Chat',
      icon: <FiMessageSquare />,
      badge: 'Live',
      hasDot: true,
    },
    {
      id: 'sessions',
      label: 'Sessions & resources',
      icon: <FiBookOpen />,
      badge: null,
    },
    {
      id: 'reflections',
      label: 'Reflections',
      icon: <FiFeather />,
      badge: null,
      hasDot: true,
    },
    {
      id: 'profile',
      label: 'Profile & Settings',
      icon: <FiUser />,
      badge: null,
    },
  ]

  return (
    <div className="client-app-shell oh-dashboard-layout">
      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`oh-sidebar ${isMobileSidebarOpen ? 'open' : ''}`} style={{ overflowY: 'hidden', justifyContent: 'flex-start' }}>
        {/* Sidebar Header */}
        <div className="oh-sidebar-head">
          <div 
            className="oh-sidebar-brand"
            onClick={() => setActiveTab('journey')}
            style={{ cursor: 'pointer' }}
            title="Return to Learner Dashboard"
          >
            <div className="oh-sidebar-brand-icon">
              <FiZap />
            </div>
            <div>
              <div className="oh-sidebar-brand-title">Learner Portal</div>
              <div className="oh-sidebar-brand-sub">100% Free Access</div>
            </div>
          </div>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            className="lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <FiX fontSize={20} />
          </button>
        </div>

        {/* Nav Section */}
        <div className="oh-sidebar-section" style={{ flex: 'none', paddingBottom: '8px' }}>
          <span className="oh-sidebar-label">Navigation</span>

          <nav className="oh-sidebar-nav">
            {navItems.map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setIsMobileSidebarOpen(false)
                  }}
                  className={`oh-sidebar-btn ${isActive ? 'active' : ''}`}
                >
                  <div className="oh-sidebar-btn-left">
                    <span className="oh-sidebar-btn-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.hasDot && <span className="oh-sidebar-dot" />}
                    {item.badge && <span className="oh-sidebar-badge">{item.badge}</span>}
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* User Profile Card directly under navigation */}
        <div
          className="oh-sidebar-user"
          onClick={() => setActiveTab('profile')}
          style={{ cursor: 'pointer', borderTop: '1px solid #E2E8F0', marginTop: '4px' }}
          title="Click to edit profile & account details"
        >
          <div className="oh-sidebar-user-av">
            {clientName.slice(0, 1)}{user?.lastName?.slice(0, 1) || ''}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h4 className="oh-sidebar-user-name">{clientName}</h4>
              {user?.learnerId && (
                <span style={{ fontSize: '10px', background: '#EEF2FF', color: '#4338CA', padding: '1px 6px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 700 }}>
                  {user.learnerId}
                </span>
              )}
            </div>
            <p className="oh-sidebar-user-meta">Edit Profile &amp; Settings →</p>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="oh-main-viewport" style={activeTab === 'aura' ? { overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' } : {}}>
        {/* Sticky Top Bar */}
        <div className="oh-viewport-header" style={activeTab === 'aura' ? { flexShrink: 0 } : {}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155', padding: '4px' }}
              className="lg:hidden"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <FiMenu fontSize={22} />
            </button>

            <div>
              <div className="oh-viewport-breadcrumb">
                <span className="oh-viewport-breadcrumb-tag">Dashboard</span>
                <span>/</span>
                <span style={{ textTransform: 'capitalize' }}>{activeTab}</span>
              </div>
              <h1 className="oh-viewport-title">
                {activeTab === 'journey' && `Hello, ${clientName} 👋`}
                {activeTab === 'checkin' && 'Daily Check-in Rhythm'}
                {activeTab === 'practitioners' && 'All Registered Practitioners'}
                {activeTab === 'courses' && 'Courses Library'}
                {activeTab === 'circle' && 'Peer Support & Growth Circles'}
                {activeTab === 'community' && 'Community & Chat Hub'}
                {activeTab === 'sessions' && 'Sessions & Learning Resources'}
                {activeTab === 'reflections' && 'Self Reflection Journal'}
                {activeTab === 'profile' && 'Edit Profile & Account Settings'}
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleCopyLearnerId}
              title="Your Unique Learner ID (Click to copy)"
              style={{
                padding: '5px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: 'monospace',
                background: 'rgba(238, 242, 255, 0.95)',
                color: '#4338CA',
                border: '1px solid #C7D2FE',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <FiTag style={{ fontSize: 13 }} />
              ID: {user?.learnerId || 'Syncing ID...'}
              {copiedId ? <FiCheck style={{ color: '#16A34A', fontSize: 13 }} /> : <FiCopy style={{ opacity: 0.7, fontSize: 13 }} />}
            </button>
            <span style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>✨</span> Free Learner Account (100% Free)
            </span>
            <button
              onClick={() => setActiveTab('checkin')}
              className="oh-action-btn"
            >
              <FiZap /> Quick Check-in
            </button>

            {/* Profile Dropdown with working Dashboard & Logout */}
            <div style={{ marginLeft: '4px', display: 'flex', alignItems: 'center' }}>
              <ProfileDropdown onSelectSection={setActiveTab} />
            </div>
          </div>
        </div>

        {/* View Content */}
        <div className="oh-view-body" style={activeTab === 'aura' ? { padding: 0, maxWidth: '100%', width: '100%', flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' } : {}}>
          {activeTab === 'journey' && (
            <MyJourney
              clientName={clientName}
              practitionerName={practitionerFirstName}
              dashboardData={dashboardData}
              loading={loading}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'checkin' && (
            <CheckIn
              clientName={clientName}
              practitionerName={practitionerFirstName}
              dashboardData={dashboardData}
              onCheckInSuccess={handleCheckInSuccess}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'practitioners' && (
            <Practitioners
              setActiveTab={setActiveTab}
              dashboardData={dashboardData}
              onUpdate={loadData}
            />
          )}
          {activeTab === 'courses' && (
            <Courses />
          )}
          {activeTab === 'circle' && (
            <MyCircle
              setActiveTab={setActiveTab}
              clientName={clientName}
              practitionerName={practitionerFirstName}
              dashboardData={dashboardData}
              onUpdate={loadData}
            />
          )}
          {activeTab === 'community' && (
            <CommunityChatHub defaultPractitionerId={practitionerObj?._id} />
          )}
          {activeTab === 'sessions' && (
            <SessionsResources
              practitionerName={practitionerFirstName}
              dashboardData={dashboardData}
            />
          )}
          {activeTab === 'reflections' && (
            <Reflections
              practitionerName={practitionerFirstName}
              dashboardData={dashboardData}
              onReflectionUpdate={loadData}
            />
          )}
          {activeTab === 'aura' && (
            <AuraChat role="learner" />
          )}
          {activeTab === 'profile' && (
            <Settings />
          )}
        </div>
      </main>
    </div>
  )
}

export default LearnerDashboard
