import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
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
  FiCheckSquare
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
import Settings from '../Settings'
import CommunityChatHub from '../CommunityChatHub'
import { PractitionerOnboarding } from '../../../../pages/PractitionerOnboarding'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { apiConnector } from '../../../../services/apiConnector'
import { fetchPractitionerDashboardData } from '../../../../services/operations/dashboardAPI'

export function PractitionerDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeSection = searchParams.get('tab') || 'dash'

  const setActiveSection = useCallback((section) => {
    setSearchParams({ tab: section })
  }, [setSearchParams])

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [telemetryData, setTelemetryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subStatus, setSubStatus] = useState(null)
  const [payingPlan, setPayingPlan] = useState(null)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)

  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)

  // DASH-BUG fix: build name correctly — don't prefix "Dr." if firstName already
  // contains a title (e.g. "Dr.", "Mr.", "Ms."). Prevent "Dr. dr chawhan".
  const rawFirst = user?.firstName || ''
  const rawLast  = user?.lastName  || ''
  const hasTitlePrefix = /^(dr\.?|mr\.?|ms\.?|mrs\.?|prof\.?)\s*/i.test(rawFirst.trim())
  const practitionerName = user
    ? hasTitlePrefix
      ? `${rawFirst} ${rawLast}`.trim()
      : rawFirst
        ? `${rawFirst} ${rawLast}`.trim()
        : 'Practitioner'
    : 'Practitioner'
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

  const handlePayNow = async (planKey) => {
    setPayingPlan(planKey)
    const toastId = toast.loading('Initializing Razorpay Gateway...')
    try {
      const isLoaded = await new Promise((resolve) => {
        if (window.Razorpay) return resolve(true)
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
      })
      if (!isLoaded) {
        toast.error('Failed to load Razorpay SDK', { id: toastId })
        setPayingPlan(null)
        return
      }

      const res = await apiConnector('POST', '/api/v1/plans/create-order', { planKey }, { Authorization: `Bearer ${token}` })
      if (!res?.data?.success || !res?.data?.order) {
        toast.error('Failed to create order', { id: toastId })
        setPayingPlan(null)
        return
      }

      const { order, key, planName } = res.data
      toast.dismiss(toastId)

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'OpenHand Practitioner Platform',
        description: `Subscription: ${planName}`,
        order_id: order.id,
        prefill: { name: practitionerName, email: user?.email },
        theme: { color: '#1F5FE0' },
        handler: async (response) => {
          const vToast = toast.loading('Verifying Razorpay payment...')
          try {
            const vRes = await apiConnector('POST', '/api/v1/plans/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planKey,
            }, { Authorization: `Bearer ${token}` })

            if (vRes?.data?.success) {
              toast.success(`🎉 ${planName} Activated! Platform Unlocked.`, { id: vToast })
              fetchSubStatus()
              loadData()
            } else {
              toast.error(vRes?.data?.message || 'Verification failed', { id: vToast })
            }
          } catch (e) {
            toast.error('Payment verification error', { id: vToast })
          } finally {
            setPayingPlan(null)
          }
        },
        modal: {
          ondismiss: () => setPayingPlan(null)
        }
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e) {
      toast.error('Payment initialization failed', { id: toastId })
      setPayingPlan(null)
    }
  }

  // 4.2 FREE TIER: isPractitionerSubscribed means they have a PAID plan.
  // A practitioner with NO plan is on the free tier — they are NOT blocked.
  // isTrialActive is only true when the server says so (not inferred from missing plan).
  const isPractitionerSubscribed = subStatus?.hasActiveSubscription || ['starter', 'growth', 'practice', 'master'].includes(user?.activePlan)
  const isTrialActive = subStatus?.isTrialActive === true  // only when server confirms a real trial
  const trialDaysRemaining = subStatus?.trialDaysRemaining ?? 0
  // Free tier: any practitioner who is NOT on a paid plan gets the free tier (no block).

  const practiceItems = [
    { id: 'dash',      label: 'Practice Cockpit', icon: <FiGrid /> },  // 5.7: renamed from "Dashboard"
    { id: 'social',    label: 'Social Posts',     icon: <FiShare2 /> },
    { id: 'community', label: 'Community Hub',    icon: <FiMessageSquare /> },
    { id: 'offers',    label: 'Offers',           icon: <FiTag /> },     // glossary: "Offers"
    { id: 'courses',   label: 'My Courses',       icon: <FiBookOpen /> },
    { id: 'clients',   label: 'Learners',         icon: <FiUsers /> },   // glossary: "Learners"
    { id: 'circles',   label: 'Circles',          icon: <FiCircle /> },  // glossary: "Circles"
  ]

  const liveItems = [
    { id: 'room', label: 'Session room', icon: <FiVideo />, badge: 'LIVE' },
  ]

  const businessItems = [
    { id: 'setup',   label: 'Practice Setup Wizard', icon: <FiCheckSquare /> },
    { id: 'growth',  label: 'Growth tools',          icon: <FiTrendingUp /> },
    { id: 'payouts', label: 'Payouts',               icon: <FiDollarSign /> }, // glossary: "Payouts"
  ]

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
            <div className="oh-sidebar-brand">
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
                    onClick={() => {
                      setActiveSection(item.id)
                      setIsMobileSidebarOpen(false)
                    }}
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
                    onClick={() => {
                      setActiveSection(item.id)
                      setIsMobileSidebarOpen(false)
                    }}
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
                    onClick={() => {
                      setActiveSection(item.id)
                      setIsMobileSidebarOpen(false)
                    }}
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
                    onClick={() => {
                      setActiveSection(item.id)
                      setIsMobileSidebarOpen(false)
                    }}
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
                <span className="oh-viewport-breadcrumb-tag" style={{ background: '#F0FDF4', color: '#166534' }}>
                  Practitioner
                </span>
                <span>/</span>
                <span style={{ textTransform: 'capitalize' }}>{activeSection}</span>
              </div>
              <h1 className="oh-viewport-title">
                {activeSection === 'dash' && `Hello, ${practitionerName} 👋`}
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
            {/* 4.2 FREE TIER: Only show upgrade prompt when user is genuinely on a trial.
                Free-tier practitioners (isFreeTier) get the Practice Cockpit without a countdown. */}
            {isTrialActive && !isPractitionerSubscribed && (
              <>
                <button
                  onClick={() => setIsPlanModalOpen(true)}
                  style={{
                    border: '1px solid #E9D5FF',
                    cursor: 'pointer',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    background: '#F3E8FF',
                    color: '#7E22CE',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap'
                  }}
                  title="Click to view subscription options"
                >
                  <span>⚡ Trial active — {trialDaysRemaining}d remaining →</span>
                </button>

                <button
                  onClick={() => setIsPlanModalOpen(true)}
                  className="oh-action-btn"
                  style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', color: '#ffffff' }}
                >
                  <FiZap /> Upgrade Plan
                </button>
              </>
            )}
            <button 
              onClick={() => setActiveSection('room')}
              className="oh-action-btn"
              style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
            >
              <FiVideo /> Enter Session Room
            </button>
          </div>
        </div>

        {/* View Content */}
        <div className="oh-view-body main">

          {/* Active Section Views */}
          {activeSection === 'dash' && (
            <Overview 
              practitionerName={practitionerName} 
              setActiveSection={setActiveSection}
              telemetryData={telemetryData}
              loading={loading}
            />
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
        </div>

        {/* Plan Upgrade Selection Modal */}
        {isPlanModalOpen && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999,
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setIsPlanModalOpen(false)}
          >
            <div 
              style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                padding: '32px 28px',
                maxWidth: '920px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsPlanModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                <FiX fontSize={18} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  borderRadius: 20,
                  background: '#EEF2FF',
                  color: '#4F46E5',
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 10
                }}>
                  ✨ PRACTITIONER PLATFORM
                </div>
                <h2 style={{ margin: '0 0 8px', color: '#0F172A', fontSize: 26, fontWeight: 800 }}>
                  Unlock More for Your Practice
                </h2>
                <p style={{ margin: 0, color: '#64748B', fontSize: 14 }}>
                  Free tier: 1 offer, directory listing, AURA Aftercare Notes.
                  Upgrade to add Circles, automations, the live AURA panel, and more.
                </p>
              </div>

              {/* Plans Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, textAlign: 'left' }}>
                {/* Starter Plan */}
                <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 20, padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ color: '#0F172A', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Starter Plan</div>
                    <div style={{ color: '#0F172A', fontSize: 28, fontWeight: 900, marginBottom: 14 }}>₹999<small style={{ fontSize: 13, color: '#64748B' }}>/mo</small></div>
                    <ul style={{ margin: '0 0 20px', padding: 0, listStyle: 'none', fontSize: 13, color: '#475569', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <li>✓ Publish courses & 1:1 session offers</li>
                      <li>✓ 1 Live group circle</li>
                      <li>✓ Directory listing & client booking link</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => { handlePayNow('starter'); setIsPlanModalOpen(false); }}
                    disabled={payingPlan === 'starter'}
                    style={{ width: '100%', padding: '12px', background: '#0F172A', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13.5 }}
                  >
                    {payingPlan === 'starter' ? 'Opening Razorpay...' : 'Subscribe Starter — ₹999'}
                  </button>
                </div>

                {/* Growth Plan (Featured) */}
                <div style={{ background: '#0F172A', border: '2px solid #6366F1', borderRadius: 20, padding: 22, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: -11, right: 16, background: '#6366F1', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 10 }}>MOST POPULAR</span>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Growth Plan</div>
                    <div style={{ color: '#fff', fontSize: 28, fontWeight: 900, marginBottom: 14 }}>₹2,999<small style={{ fontSize: 13, color: '#94A3B8' }}>/mo</small></div>
                    <ul style={{ margin: '0 0 20px', padding: 0, listStyle: 'none', fontSize: 13, color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <li>✓ Everything in Starter</li>
                      <li>✓ Unlimited live Circles</li>
                      <li>✓ Automated Check-in sequences</li>
                      <li>✓ Priority directory badge</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => { handlePayNow('growth'); setIsPlanModalOpen(false); }}
                    disabled={payingPlan === 'growth'}
                    style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13.5 }}
                  >
                    {payingPlan === 'growth' ? 'Opening Razorpay...' : 'Subscribe Growth — ₹2,999'}
                  </button>
                </div>

                {/* Master VIP Plan */}
                <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 20, padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                  <div style={{ color: '#0F172A', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Master Plan</div>
                    <div style={{ color: '#0F172A', fontSize: 28, fontWeight: 900, marginBottom: 14 }}>₹5,999<small style={{ fontSize: 13, color: '#64748B' }}>/mo</small></div>
                    <ul style={{ margin: '0 0 20px', padding: 0, listStyle: 'none', fontSize: 13, color: '#475569', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <li>✓ Everything in Growth</li>
                      <li>✓ White-label portal & custom domain</li>
                      <li>✓ Branded app</li>
                      <li>✓ Dedicated account manager</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => { handlePayNow('master'); setIsPlanModalOpen(false); }}
                    disabled={payingPlan === 'master'}
                    style={{ width: '100%', padding: '12px', background: '#0F172A', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13.5 }}
                  >
                    {payingPlan === 'master' ? 'Opening Razorpay...' : 'Subscribe Master — ₹5,999'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default PractitionerDashboard
