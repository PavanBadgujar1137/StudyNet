import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
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
  FiVideo
} from 'react-icons/fi'
import MyJourney from './MyJourney'
import CheckIn from './CheckIn'
import Practitioners from './Practitioners'
import MyCircle from './MyCircle'
import SessionsResources from './SessionsResources'
import Reflections from './Reflections'
import Courses from './Courses'
import Settings from '../Settings'
import CommunityChatHub from '../CommunityChatHub'
import { useSearchParams } from 'react-router-dom'
import { fetchClientDashboardData } from '../../../../services/operations/dashboardAPI'

export function ClientDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'journey'

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
      badge: 'Cohorts',
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
          <div className="oh-sidebar-brand">
            <div className="oh-sidebar-brand-icon">
              <FiZap />
            </div>
            <div>
              <div className="oh-sidebar-brand-title">Learner Portal</div>
              <div className="oh-sidebar-brand-sub">Personalized Space</div>
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
            <h4 className="oh-sidebar-user-name">{clientName}</h4>
            <p className="oh-sidebar-user-meta">Edit Profile &amp; Settings →</p>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="oh-main-viewport">
        {/* Sticky Top Bar */}
        <div className="oh-viewport-header">
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {dashboardData?.subscriptionStatus?.hasActiveSubscription ? (
              <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0' }}>
                ✨ {dashboardData.subscriptionStatus.subscription?.planName || 'Active Plan'}
              </span>
            ) : dashboardData?.subscriptionStatus?.isTrialActive ? (
              <a href="/pricing" style={{ textDecoration: 'none', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: '#F3E8FF', color: '#7E22CE', border: '1px solid #E9D5FF' }}>
                ⚡ 7-Day Trial ({dashboardData.subscriptionStatus.trialDaysRemaining}d left) →
              </a>
            ) : (
              <a href="/pricing" style={{ textDecoration: 'none', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5' }}>
                ⚠️ Trial Expired — Select Plan →
              </a>
            )}
            <button
              onClick={() => setActiveTab('checkin')}
              className="oh-action-btn"
            >
              <FiZap /> Quick Check-in
            </button>
          </div>
        </div>

        {/* View Content */}
        <div className="oh-view-body">
          {activeTab === 'journey' && (
            <MyJourney
              clientName={clientName}
              practitionerName={practitionerFirstName}
              dashboardData={dashboardData}
              loading={loading}
            />
          )}
          {activeTab === 'checkin' && (
            <CheckIn
              clientName={clientName}
              practitionerName={practitionerFirstName}
              dashboardData={dashboardData}
              onCheckInSuccess={handleCheckInSuccess}
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
          {activeTab === 'profile' && (
            <Settings />
          )}
        </div>
      </main>
    </div>
  )
}

export default ClientDashboard
