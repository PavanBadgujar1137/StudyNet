import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams, useLocation } from 'react-router-dom'
import { 
  FiGrid, 
  FiTag, 
  FiUsers, 
  FiCircle, 
  FiVideo, 
  FiDollarSign, 
  FiTrendingUp, 
  FiMenu, 
  FiX, 
  FiZap,
  FiUser,
  FiMessageSquare,
  FiBookOpen,
  FiShare2,
  FiCheckSquare,
  FiLock,
  FiPercent,
  FiCalendar,
  FiSearch,
  FiBell,
  FiSun,
  FiChevronRight
} from 'react-icons/fi'
import Overview from './Overview'
import MyOffers from './MyOffers'
import MyScheduleBookings from './MyScheduleBookings'
import MyLearners from './MyLearners'

import Circles from './Circles'
import SessionRoom from './SessionRoom'
import PayoutsInvoices from './PayoutsInvoices'
import GrowthTools from './GrowthTools'
import MyCourses from './MyCourses'
import SocialPostStudio from './SocialPostStudio'
import PractitionerCoupons from './PractitionerCoupons'
import Settings from '../Settings'
import CommunityChatHub from '../CommunityChatHub'
import AuraChat from '../AuraChat'
import { PractitionerOnboarding } from '../../../../pages/PractitionerOnboarding'
import OHPricingSection from '../../../openhand/OHPricingSection'
import OHPricingModal from '../../../openhand/OHPricingModal'
import PayGlocalCheckoutModal from '../../../openhand/PayGlocalCheckoutModal'
import { toast } from 'react-hot-toast'

import { apiConnector } from '../../../../services/apiConnector'
import { fetchPractitionerDashboardData } from '../../../../services/operations/dashboardAPI'

import { formatPractitionerName } from '../../../../utils/formatName'
import ProfileDropdown from '../../Auth/ProfileDropdown'
import logoMark from '../../../../assets/Logo/openhand-mark.png'

export function PractitionerDashboard() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const getActiveSection = () => {
    const tabParam = searchParams.get('tab')
    if (tabParam) return tabParam
    const path = decodeURIComponent(location.pathname.toLowerCase())
    if (path.includes('profile') || path.includes('settings')) return 'profile'
    if (path.includes('aura') || path.includes('assistant')) return 'aura'
    if (path.includes('coupon')) return 'coupons'
    if (path.includes('community') || path.includes('chat')) return 'community'
    if (path.includes('offer')) return 'offers'
    if (path.includes('schedule') || path.includes('bookings')) return 'schedule'
    if (path.includes('course')) return 'courses'
    if (path.includes('client') || path.includes('learner')) return 'clients'
    if (path.includes('circle')) return 'circles'
    if (path.includes('room')) return 'room'
    if (path.includes('payout')) return 'payouts'
    if (path.includes('growth')) return 'growth'
    if (path.includes('social')) return 'social'
    return 'dash'
  }

  const activeSection = getActiveSection()

  const setActiveSection = useCallback((section) => {
    setSearchParams({ tab: section })
  }, [setSearchParams])

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [telemetryData, setTelemetryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subStatus, setSubStatus] = useState(null)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [payglocalModalOpen, setPayglocalModalOpen] = useState(false)
  const [payglocalOrderData, setPayglocalOrderData] = useState(null)

  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)

  const practitionerName = formatPractitionerName(user, 'Practitioner')
  const rawFirst = user?.firstName || ''
  const rawLast  = user?.lastName  || ''
  const initials = `${rawFirst?.[0] || 'P'}${rawLast?.[0] || 'R'}`.toUpperCase()

  const fetchSubStatus = useCallback(async () => {
    if (!token) return
    try {
      const res = await apiConnector('GET', '/api/v1/payments/subscription/mine', null, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) {
        setSubStatus(res.data)
      }
    } catch (e) {}
  }, [token])

  const loadData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    await fetchSubStatus()
    const data = await fetchPractitionerDashboardData(token)
    if (data) setTelemetryData(data)
    setLoading(false)
  }, [token, fetchSubStatus])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handlePayGlocalSuccess = async (response) => {
    if (!payglocalOrderData) return
    const vToast = toast.loading('Verifying PayGlocal payment...')
    try {
      const vRes = await apiConnector('POST', '/api/v1/plans/verify-payment', {
        payglocal_order_id: response.payglocal_order_id || response.merchantTxnId,
        payglocal_payment_id: response.payglocal_payment_id || response.gid,
        payglocal_gid: response.payglocal_gid || response.gid,
        payglocal_signature: response.signature,
        planKey: payglocalOrderData.planKey,
      }, { Authorization: `Bearer ${token}` })

      if (vRes?.data?.success) {
        toast.success(`🎉 ${payglocalOrderData.displayPlanName || 'Plan'} Activated! Platform Unlocked.`, { id: vToast })
        fetchSubStatus()
        loadData()
      } else {
        toast.error(vRes?.data?.message || 'Verification failed', { id: vToast })
      }
    } catch (e) {
      toast.error('Payment verification error', { id: vToast })
    } finally {
      setPayglocalModalOpen(false)
      setPayglocalOrderData(null)
    }
  }

  const activePlan = subStatus?.effectivePlan || user?.activePlan || 'open'
  const isFreePlan = activePlan === 'open' || activePlan === 'free' || activePlan === 'none'
  const isPractitionerExpired = false

  // Navigation Items exactly corresponding to Reference Image & application features
  const practiceItems = [
    { id: 'dash',      label: 'Dashboard',             icon: <FiGrid /> },
    { id: 'schedule',  label: 'My Sessions',           icon: <FiCalendar /> },
    { id: 'clients',   label: 'My Learners',           icon: <FiUsers /> },
    { id: 'schedule',  label: 'Session Schedule',      icon: <FiCalendar /> },
    { id: 'community', label: 'Community Hub',         icon: <FiMessageSquare /> },
    { id: 'offers',    label: 'Offers & Resources',    icon: <FiTag /> },
    { id: 'courses',   label: 'My Courses',            icon: <FiBookOpen /> },
    { id: 'coupons',   label: 'Coupons & Grants',      icon: <FiPercent /> },
    { id: 'circles',   label: 'Circles',               icon: <FiCircle /> },
    { id: 'aura',      label: 'AURA Assistant',        icon: <FiZap /> },
    { id: 'social',    label: 'Social Posts',          icon: <FiShare2 /> },
  ]

  const liveItems = [
    { id: 'room', label: 'Session Room', icon: <FiVideo />, badge: 'LIVE' },
  ]

  const businessItems = [
    { id: 'setup',   label: 'Practice Setup', icon: <FiCheckSquare /> },
    { id: 'growth',  label: 'Growth Tools',   icon: <FiTrendingUp /> },
    { id: 'payouts', label: 'Payouts',        icon: <FiDollarSign /> },
  ]

  const accountItems = [
    { id: 'profile', label: 'Profile & Settings', icon: <FiUser /> },
  ]

  const handleTabClick = (item) => {
    setActiveSection(item.id)
    setIsMobileSidebarOpen(false)
  }

  return (
    <div className="practitioner-app-layout oh-dashboard-layout">
      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Dark Navy Sidebar Navigation */}
      <aside className={`oh-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {/* Brand Header */}
          <div className="oh-sidebar-head">
            <div 
              className="oh-sidebar-brand"
              onClick={() => setActiveSection('dash')}
              style={{ cursor: 'pointer' }}
              title="Return to Practitioner Dashboard"
            >
              <img src={logoMark} alt="OpenHand" className="oh-sidebar-brand-icon-img" />
              <div>
                <div className="oh-sidebar-brand-title">OpenHand</div>
                <div className="oh-sidebar-brand-sub" style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  <span style={{ color: '#E2E8F0', fontWeight: 600 }}>Practitioner Portal</span>
                  <span style={{ fontSize: '10px', color: '#64748B' }}>Practice Management</span>
                </div>
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

          {/* Navigation Sections Scrollable */}
          <div className="oh-sidebar-section" style={{ overflowY: 'auto', flex: 1 }}>
            {/* Practice Group */}
            <nav className="oh-sidebar-nav" style={{ marginBottom: '14px' }}>
              {practiceItems.map((item, idx) => {
                // Determine active state; avoid marking duplicate schedule labels active at the same time if not desired
                const isActive = activeSection === item.id && (item.label !== 'Session Schedule' || activeSection === 'schedule')
                return (
                  <button
                    key={`${item.id}-${idx}`}
                    onClick={() => handleTabClick(item)}
                    className={`oh-sidebar-btn ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="oh-sidebar-btn-left">
                      <span className="oh-sidebar-btn-icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  </button>
                )
              })}
            </nav>

            {/* Live Group */}
            <span className="oh-sidebar-label">LIVE</span>
            <nav className="oh-sidebar-nav" style={{ marginBottom: '14px' }}>
              {liveItems.map((item) => {
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item)}
                    className={`oh-sidebar-btn ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="oh-sidebar-btn-left">
                      <span className="oh-sidebar-btn-icon" style={{ color: '#F87171' }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="oh-sidebar-live-badge">
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Business Group */}
            <span className="oh-sidebar-label">BUSINESS</span>
            <nav className="oh-sidebar-nav" style={{ marginBottom: '14px' }}>
              {businessItems.map((item) => {
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item)}
                    className={`oh-sidebar-btn ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="oh-sidebar-btn-left">
                      <span className="oh-sidebar-btn-icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  </button>
                )
              })}
            </nav>

            {/* Account Group */}
            <span className="oh-sidebar-label">ACCOUNT</span>
            <nav className="oh-sidebar-nav">
              {accountItems.map((item) => {
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item)}
                    className={`oh-sidebar-btn ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="oh-sidebar-btn-left">
                      <span className="oh-sidebar-btn-icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Bottom: User Profile Card & Promo Card */}
        <div style={{ flexShrink: 0 }}>
          {/* Practitioner Profile Card */}
          <div 
            className="oh-sidebar-user" 
            onClick={() => setActiveSection('profile')}
            title="Click to view & edit your profile"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="oh-sidebar-user-av">
                {user?.image ? (
                  <img src={user.image} alt={practitionerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : initials}
              </div>
              <div>
                <h4 className="oh-sidebar-user-name">{practitionerName}</h4>
                <p className="oh-sidebar-user-role">Practitioner</p>
              </div>
            </div>
            <FiChevronRight style={{ color: '#64748B', fontSize: 16 }} />
          </div>

          {/* Promotional / Profile Manage Card */}
          <div className="oh-sidebar-promo">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', background: 'rgba(139, 92, 246, 0.25)', padding: '3px 6px', borderRadius: '6px', color: '#C084FC' }}>✦</span>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#C7D2FE', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Practice Mastery</span>
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.35 }}>
              Better guidance.<br />Brighter futures.
            </div>
            <button 
              className="oh-sidebar-promo-btn"
              onClick={() => setActiveSection('profile')}
            >
              Manage Profile →
            </button>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="oh-main-viewport" style={activeSection === 'aura' ? { overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' } : {}}>
        {/* Sticky Top Bar */}
        <div className="oh-viewport-header" style={activeSection === 'aura' ? { flexShrink: 0 } : {}}>
          {/* Left: Mobile Menu + Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, maxWidth: '520px' }}>
            <button 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155', padding: '4px' }}
              className="lg:hidden"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <FiMenu fontSize={22} />
            </button>

            <div className="practitioner-header-search">
              <FiSearch style={{ color: '#94A3B8', fontSize: 16, flexShrink: 0 }} />
              <input 
                type="text" 
                placeholder="Search learners, sessions, insights..." 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setActiveSection('clients')
                  }
                }}
              />
              <span className="kbd-badge">Ctrl K</span>
            </div>
          </div>

          {/* Right: Actions, Theme, Notifications, Start Live Session, Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Free Plan / Upgrade Button if on free plan */}
            {isFreePlan && (
              <button
                onClick={() => setIsPlanModalOpen(true)}
                className="oh-action-btn hidden md:flex"
                style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', color: '#ffffff', padding: '8px 14px', fontSize: '12.5px' }}
              >
                <FiZap /> Upgrade Pro
              </button>
            )}

            {/* Theme Toggle (Sun icon) */}
            <button 
              type="button"
              className="practitioner-icon-btn hidden sm:flex"
              title="Light workspace active"
              onClick={() => toast.success("Clean high-contrast theme active", { id: 'theme-toast' })}
            >
              <FiSun style={{ fontSize: 17, color: '#64748B' }} />
            </button>

            {/* Notification Bell with Badge */}
            <button 
              type="button"
              className="practitioner-icon-btn"
              title="4 Active Notifications"
              onClick={() => toast("You have 4 new updates from active learners.", { icon: "🔔" })}
            >
              <FiBell style={{ fontSize: 17, color: '#64748B' }} />
              <span className="practitioner-icon-badge">4</span>
            </button>

            {/* Start Live Session Button (Teal/Green with camera icon) */}
            <button 
              onClick={() => setActiveSection('room')}
              className="practitioner-live-btn"
            >
              <FiVideo style={{ fontSize: 16 }} />
              <span>Start Live Session</span>
            </button>

            {/* Profile Dropdown with working Dashboard & Logout */}
            <div style={{ marginLeft: '4px', display: 'flex', alignItems: 'center' }}>
              <ProfileDropdown onSelectSection={setActiveSection} />
            </div>
          </div>
        </div>

        {/* View Content */}
        <div 
          key={activeSection}
          className={`oh-view-body ${activeSection !== 'aura' ? 'oh-view-fade-in' : ''}`} 
          style={activeSection === 'aura' ? { padding: 0, maxWidth: '100%', width: '100%', flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' } : {}}
        >
          {isPractitionerExpired && activeSection !== 'profile' ? (
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
                      <FiLock size={14} /> Practice Plan Expired
                    </div>
                    <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 10px', color: '#FFFFFF' }}>
                      Your OpenHand Practice is Locked
                    </h2>
                    <p style={{ fontSize: 15, color: '#94A3B8', margin: 0, lineHeight: 1.6 }}>
                      Your subscription trial has completed. Choose a practitioner plan below to immediately regain access to your cockpit, client roster, video room, and payment payouts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Cards */}
              <div style={{ background: '#FFFFFF', borderRadius: 24, padding: 32, border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <OHPricingSection
                  defaultRole="practitioner"
                  hideRoleSwitcher={true}
                  title="Choose a Practitioner Plan to Unlock Practice"
                  subtitle="Instant PayGlocal Checkout — The International Payment Gateway India Builds On"
                  onSuccess={() => loadData()}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Active Section Views */}
              {activeSection === 'dash' && (
                <Overview 
                  practitionerName={practitionerName} 
                  setActiveSection={setActiveSection}
                  telemetryData={telemetryData}
                  loading={loading}
                />
              )}
              {activeSection === 'aura' && (
                <AuraChat role="practitioner" />
              )}
              {activeSection === 'coupons' && (
                <PractitionerCoupons />
              )}
              {activeSection === 'community' && (
                <CommunityChatHub />
              )}
              {activeSection === 'offers' && (
                <MyOffers telemetryData={telemetryData} onUpdate={loadData} />
              )}
              {activeSection === 'schedule' && (
                <MyScheduleBookings />
              )}
              {activeSection === 'courses' && (
                <MyCourses />
              )}
              {activeSection === 'clients' && (
                <MyLearners setActiveSection={setActiveSection} telemetryData={telemetryData} onUpdate={loadData} />
              )}
              {activeSection === 'circles' && (
                <Circles telemetryData={telemetryData} onUpdate={loadData} setActiveSection={setActiveSection} />
              )}
              {activeSection === 'room' && (
                <SessionRoom practitionerName={practitionerName} telemetryData={telemetryData} onUpdate={loadData} setActiveSection={setActiveSection} />
              )}
              {activeSection === 'payouts' && (
                <PayoutsInvoices telemetryData={telemetryData} />
              )}
              {activeSection === 'growth' && (
                <GrowthTools telemetryData={telemetryData} setActiveSection={setActiveSection} />
              )}
              {(activeSection === 'setup' || activeSection === 'onboarding') && (
                <PractitionerOnboarding embedded={true} telemetryData={telemetryData} onUpdate={loadData} />
              )}
              {activeSection === 'social' && (
                <SocialPostStudio />
              )}
              {activeSection === 'profile' && (
                <Settings />
              )}
            </>
          )}
        </div>

        {/* Plan Upgrade Selection Modal */}
        <OHPricingModal
          isOpen={isPlanModalOpen}
          onClose={() => setIsPlanModalOpen(false)}
          defaultRole="practitioner"
          hideRoleSwitcher={true}
          onSuccess={() => {
            loadData()
            setIsPlanModalOpen(false)
          }}
        />

        {payglocalModalOpen && (
          <PayGlocalCheckoutModal
            isOpen={payglocalModalOpen}
            onClose={() => {
              setPayglocalModalOpen(false)
            }}
            orderData={payglocalOrderData}
            onSuccess={handlePayGlocalSuccess}
          />
        )}
      </main>
    </div>

  )
}

export default PractitionerDashboard
