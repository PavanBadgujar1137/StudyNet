import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
  FiLock,
  FiLogOut
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
import { OHPricingModal } from '../../../openhand'
import OHPricingSection from '../../../openhand/OHPricingSection'
import { logout } from '../../../../services/operations/authAPI'
import { apiConnector } from '../../../../services/apiConnector'
import { fetchClientDashboardData } from '../../../../services/operations/dashboardAPI'

export function LearnerDashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'journey'

  const setActiveTab = useCallback((tab) => {
    setSearchParams({ tab })
  }, [setSearchParams])

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [subStatus, setSubStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPricingModal, setShowPricingModal] = useState(false)

  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)

  const clientName = user?.firstName || 'Student'
  const practitionerObj = dashboardData?.practitioner
  const practitionerFirstName = practitionerObj?.firstName || 'Instructor'

  const fetchSubStatus = useCallback(async () => {
    if (!token) return
    try {
      const res = await apiConnector('GET', '/api/v1/payments/subscription/mine', null, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) setSubStatus(res.data)
    } catch (e) {}
  }, [token])

  const loadData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    await fetchSubStatus()
    const data = await fetchClientDashboardData(token)
    if (data) setDashboardData(data)
    setLoading(false)
  }, [token, fetchSubStatus])

  useEffect(() => {
    loadData()
  }, [loadData])

  const isLearnerExpired = Boolean(
    subStatus &&
    !subStatus.hasActiveSubscription &&
    !subStatus.isTrialActive
  )

  const handleLogout = () => {
    dispatch(logout(navigate))
  }

  const handleCheckInSuccess = () => {
    loadData()
  }

  const rawNavItems = [
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

  const navItems = rawNavItems.map((item) => {
    if (isLearnerExpired && item.id !== 'profile') {
      return { ...item, badge: '🔒 Locked', hasDot: false }
    }
    return item
  })

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
              <button onClick={() => setShowPricingModal(true)} style={{ border: '1px solid #E9D5FF', cursor: 'pointer', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: '#F3E8FF', color: '#7E22CE' }}>
                ⚡ 7-Day Trial ({dashboardData.subscriptionStatus.trialDaysRemaining}d left) →
              </button>
            ) : (
              <button onClick={() => setShowPricingModal(true)} style={{ border: '1px solid #FCA5A5', cursor: 'pointer', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: '#FEE2E2', color: '#DC2626' }}>
                ⚠️ Trial Expired — Select Plan →
              </button>
            )}
            <button
              onClick={() => setActiveTab('checkin')}
              className="oh-action-btn"
            >
              <FiZap /> Quick Check-in
            </button>
          </div>
        </div>

        {/* Trial Expired Alert Banner */}
        {subStatus && !subStatus.hasActiveSubscription && !subStatus.isTrialActive && (
          <div style={{ background: 'linear-gradient(135deg, #FEF2F2, #FFF7ED)', border: '1px solid #FCA5A5', borderRadius: 16, padding: '16px 20px', margin: '0 24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, boxShadow: '0 2px 10px rgba(220,38,38,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚠️</div>
              <div>
                <div style={{ color: '#991B1B', fontWeight: 800, fontSize: 14 }}>Your 7-Day Free Trial Has Expired</div>
                <div style={{ color: '#7F1D1D', fontSize: 12 }}>Subscribe to a Learner Plan (Beginner ₹51, Advance ₹151, Champion ₹1,500) to keep accessing free practitioner courses, or logout.</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setShowPricingModal(true)} style={{ padding: '9px 18px', background: 'linear-gradient(135deg, #EF4444, #DC2626)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Subscribe Now →
              </button>
              <button onClick={handleLogout} style={{ padding: '9px 18px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 8, color: '#475569', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Logout
              </button>
            </div>
          </div>
        )}

        {/* View Content */}
        <div className="oh-view-body">
          {isLearnerExpired && activeTab !== 'profile' ? (
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '10px 0 40px' }}>
              {/* Expired Lock Header Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #0D1B3D 0%, #1E293B 100%)',
                borderRadius: 24,
                padding: '36px 32px',
                color: '#FFFFFF',
                boxShadow: '0 20px 40px rgba(13, 27, 61, 0.15)',
                marginBottom: 32,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, position: 'relative', zIndex: 2 }}>
                  <div style={{ maxWidth: '650px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#FCA5A5', padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>
                      <FiLock size={14} />
                      <span>Access Locked</span>
                      <span>•</span>
                      <span>Free Trial / Subscription Ended</span>
                    </div>
                    <h2 style={{ fontSize: 26, fontWeight: 800, color: '#FFFFFF', margin: '0 0 12px', fontFamily: 'Poppins, sans-serif', lineHeight: 1.3 }}>
                      Your Free Trial or Subscription Has Ended
                    </h2>
                    <p style={{ fontSize: 14, color: '#94A3B8', margin: 0, lineHeight: 1.6 }}>
                      Your 7-day free trial or paid subscription has expired. All platform features (live Zoom sessions, course access, reflection journals, community circles, and daily check-ins) are locked until a plan is chosen. Select a plan below to renew and unlock full access immediately.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        padding: '11px 20px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 12,
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <FiLogOut /> Sign Out
                    </button>
                  </div>
                </div>
              </div>

              {/* Directly Embedded Pricing Panel */}
              <div style={{ background: '#FFFFFF', borderRadius: 24, padding: '32px 24px', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                <OHPricingSection
                  defaultRole="learner"
                  hideRoleSwitcher={true}
                  title="Choose a Learner Plan to Unlock Platform"
                  subtitle="Instant Razorpay Checkout — Choose a plan to unlock all features"
                  onSuccess={() => loadData()}
                />
              </div>
            </div>
          ) : (
            <>
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
              {activeTab === 'profile' && (
                <Settings />
              )}
            </>
          )}
        </div>
      </main>

      {/* Pricing Section Modal Overlay */}
      <OHPricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        defaultRole="learner"
      />
    </div>
  )
}

export default LearnerDashboard
