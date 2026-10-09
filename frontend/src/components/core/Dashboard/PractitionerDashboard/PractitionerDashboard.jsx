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
  FiPercent
} from 'react-icons/fi'
import Overview from './Overview'
import MyOffers from './MyOffers'
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
  // const [payingPlan, setPayingPlan] = useState(null)
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

  /*
  const handlePayNow = async (planKey) => {
    setPayingPlan(planKey)
    const toastId = toast.loading('Initializing PayGlocal Checkout...')
    try {
      const res = await apiConnector('POST', '/api/v1/plans/create-order', { planKey }, { Authorization: `Bearer ${token}` })
      if (!res?.data?.success || !res?.data?.order) {
        toast.error('Failed to create order', { id: toastId })
        setPayingPlan(null)
        return
      }

      const { order, key, planName } = res.data
      toast.dismiss(toastId)

      setPayglocalOrderData({
        orderId: order?.id || order?.merchantTxnId || `txn_plan_${Date.now()}`,
        gid: order?.gid || `GL_${Date.now()}`,
        amount: order?.amount ? (order.amount > 1000 ? order.amount / 100 : order.amount) : 0,
        currency: order?.currency || 'INR',
        planName: `Subscription: ${planName}`,
        keyId: key || process.env.REACT_APP_PAYGLOCAL_KEY_ID,
        merchantId: order?.merchantId || process.env.REACT_APP_PAYGLOCAL_MERCHANT_ID,
        customerData: {
          name: practitionerName || '',
          email: user?.email || '',
          phone: user?.additionalDetails?.contactNumber || user?.contactNumber || '',
        },
        planKey,
        displayPlanName: planName,
      })
      setPayglocalModalOpen(true)
    } catch (e) {
      toast.error('Payment initialization failed', { id: toastId })
      // setPayingPlan(null)
    }
  }
  */

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

  // No trial concept; users default to the "Open" free plan.
  // We don't lock them out.
  const isPractitionerExpired = false

  const rawPracticeItems = [
    { id: 'dash',      label: 'My Dashboard', icon: <FiGrid /> },
    { id: 'aura',      label: 'AURA Assistant',   icon: <FiZap />, badge: 'Assistant' },
    { id: 'social',    label: 'Social Posts',     icon: <FiShare2 /> },
    { id: 'community', label: 'Community Hub',    icon: <FiMessageSquare /> },
    { id: 'offers',    label: 'Offers',           icon: <FiTag /> },
    { id: 'courses',   label: 'My Courses',       icon: <FiBookOpen /> },
    { id: 'coupons',   label: 'Coupons & Grants', icon: <FiPercent /> },
    { id: 'clients',   label: 'Learners',         icon: <FiUsers /> },
    { id: 'circles',   label: 'Circles',          icon: <FiCircle /> },
  ]

  const rawLiveItems = [
    { id: 'room', label: 'Session room', icon: <FiVideo />, badge: 'LIVE' },
  ]

  const rawBusinessItems = [
    { id: 'setup',   label: 'Practice Setup Wizard', icon: <FiCheckSquare /> },
    { id: 'growth',  label: 'Growth tools',          icon: <FiTrendingUp /> },
    { id: 'payouts', label: 'Payouts',               icon: <FiDollarSign /> },
  ]

  const practiceItems = rawPracticeItems
  const liveItems     = rawLiveItems
  const businessItems = rawBusinessItems

  const handleTabClick = (item) => {
    setActiveSection(item.id)
    setIsMobileSidebarOpen(false)
  }

  const accountItems = [
    { id: 'profile', label: 'Profile & Settings', icon: <FiUser /> },
  ]

  return (
    <div className="practitioner-app-layout oh-dashboard-layout">
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
      <aside className={`oh-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        <div>
          {/* Sidebar Header */}
          <div className="oh-sidebar-head">
            <div 
              className="oh-sidebar-brand"
              onClick={() => setActiveSection('dash')}
              style={{ cursor: 'pointer' }}
              title="Return to Practitioner Dashboard"
            >
              <div className="oh-sidebar-brand-icon" style={{ background: 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)' }}>
                <FiZap />
              </div>
              <div>
                <div className="oh-sidebar-brand-title">Practitioner Portal</div>
                <div className="oh-sidebar-brand-sub">Practice Management</div>
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

          {/* Nav Sections */}
          <div className="oh-sidebar-section">
            {/* Practice Group */}
            <span className="oh-sidebar-label">Practice</span>
            <nav className="oh-sidebar-nav" style={{ marginBottom: '16px' }}>
              {practiceItems.map((item) => {
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item)}
                    className={`oh-sidebar-btn ${isActive ? 'active' : ''}`}
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
            <span className="oh-sidebar-label">Live</span>
            <nav className="oh-sidebar-nav" style={{ marginBottom: '16px' }}>
              {liveItems.map((item) => {
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item)}
                    className={`oh-sidebar-btn ${isActive ? 'active' : ''}`}
                  >
                    <div className="oh-sidebar-btn-left">
                      <span className="oh-sidebar-btn-icon" style={{ color: '#EF4444' }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="oh-sidebar-badge" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Business Group */}
            <span className="oh-sidebar-label">Business</span>
            <nav className="oh-sidebar-nav" style={{ marginBottom: '16px' }}>
              {businessItems.map((item) => {
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item)}
                    className={`oh-sidebar-btn ${isActive ? 'active' : ''}`}
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
            <span className="oh-sidebar-label">Account</span>
            <nav className="oh-sidebar-nav">
              {accountItems.map((item) => {
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item)}
                    className={`oh-sidebar-btn ${isActive ? 'active' : ''}`}
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

        {/* Practitioner Footer Card */}
        <div 
          className="oh-sidebar-user" 
          onClick={() => setActiveSection('profile')}
          style={{ cursor: 'pointer' }}
          title="Click to edit profile & account details"
        >
          <div className="oh-sidebar-user-av">
            {initials}
          </div>
          <div>
            <h4 className="oh-sidebar-user-name">{practitionerName}</h4>
            <p className="oh-sidebar-user-meta">Edit Profile &amp; Settings →</p>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="oh-main-viewport" style={activeSection === 'aura' ? { overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' } : {}}>
        {/* Sticky Top Bar */}
        <div className="oh-viewport-header" style={activeSection === 'aura' ? { flexShrink: 0 } : {}}>
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
                <span className="oh-viewport-breadcrumb-tag" style={{ background: '#F0FDF4', color: '#166534' }}>
                  Practitioner
                </span>
                <span>/</span>
                <span style={{ textTransform: 'capitalize' }}>{activeSection}</span>
              </div>
              <h1 className="oh-viewport-title">
                {activeSection === 'dash' && `Hello, ${practitionerName} 👋`}
                {activeSection === 'coupons' && 'Coupons & Learner Discounts'}
                {activeSection === 'community' && 'Community & Chat Hub'}
                {activeSection === 'offers' && 'My Practice Offers'}
                {activeSection === 'courses' && 'My Courses'}
                {activeSection === 'clients' && 'Learner Management Hub'}
                {activeSection === 'circles' && 'Active Circles'}
                {activeSection === 'room' && 'Live Session Room'}
                {activeSection === 'payouts' && 'Salary & Payout Ledger'}
                {activeSection === 'growth' && 'Growth & Practice Tools'}
                {(activeSection === 'setup' || activeSection === 'onboarding') && 'Practice Setup & Profile Link Builder'}
                {activeSection === 'social' && 'Social Post & Media Studio'}
                {activeSection === 'profile' && 'Edit Profile & Account Settings'}
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* FREE TIER: Show "Open Plan" indicator and Upgrade button */}
            {isFreePlan && (
              <>
                <div
                  style={{
                    border: '1px solid #BFDBFE',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    background: '#EFF6FF',
                    color: '#1D4ED8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap'
                  }}
                  title="You are currently on the Open free plan"
                >
                  <FiCheckSquare /> Open Plan (Free)
                </div>

                <button
                  onClick={() => setIsPlanModalOpen(true)}
                  className="oh-action-btn"
                  style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', color: '#ffffff' }}
                >
                  <FiZap /> Upgrade to Pro
                </button>
              </>
            )}
            <button 
              onClick={() => setActiveSection('room')}
              className="oh-action-btn"
              style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
            >
              <FiVideo /> Start Live Session
            </button>

            {/* Profile Dropdown with working Dashboard & Logout */}
            <div style={{ marginLeft: '4px', display: 'flex', alignItems: 'center' }}>
              <ProfileDropdown onSelectSection={setActiveSection} />
            </div>
          </div>
        </div>

        {/* View Content */}
        <div className="oh-view-body" style={activeSection === 'aura' ? { padding: 0, maxWidth: '100%', width: '100%', flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' } : {}}>
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
