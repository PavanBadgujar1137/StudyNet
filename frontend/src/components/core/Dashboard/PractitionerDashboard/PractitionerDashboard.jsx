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
  FiBookOpen
} from 'react-icons/fi'
import Overview from './Overview'
import MyOffers from './MyOffers'
import MyLearners from './MyLearners'
import Circles from './Circles'
import SessionRoom from './SessionRoom'
import PayoutsInvoices from './PayoutsInvoices'
import GrowthTools from './GrowthTools'
import MyCourses from './MyCourses'
import Settings from '../Settings'
import CommunityChatHub from '../CommunityChatHub'
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

  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)

  const practitionerName = user ? `Dr. ${user.firstName} ${user.lastName}` : 'Practitioner'
  const initials = `${user?.firstName?.slice(0, 1) || 'P'}${user?.lastName?.slice(0, 1) || 'R'}`

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

  const isPractitionerSubscribed = subStatus?.hasActiveSubscription || ['starter', 'growth', 'practice', 'master'].includes(user?.activePlan)

  const practiceItems = [
    { id: 'dash', label: 'Dashboard', icon: <FiGrid /> },
    { id: 'community', label: 'Community Hub', icon: <FiMessageSquare /> },
    { id: 'offers', label: 'My offers', icon: <FiTag /> },
    { id: 'courses', label: 'My Courses', icon: <FiBookOpen /> },
    { id: 'clients', label: 'My learners', icon: <FiUsers /> },
    { id: 'circles', label: 'Circles', icon: <FiCircle /> },
  ]

  const liveItems = [
    { id: 'room', label: 'Session room', icon: <FiVideo />, badge: 'LIVE' },
  ]

  const businessItems = [
    { id: 'payouts', label: 'Salary & Payouts', icon: <FiDollarSign /> },
    { id: 'growth', label: 'Growth tools', icon: <FiTrendingUp /> },
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
                {activeSection === 'profile' && 'Edit Profile & Account Settings'}
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
          {!isPractitionerSubscribed && activeSection !== 'profile' ? (
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, padding: '40px 24px', textAlign: 'center', maxWidth: 900, margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28, fontWeight: 800 }}>
                🔒
              </div>
              <h2 style={{ margin: '0 0 8px', color: '#0F172A', fontSize: 24, fontWeight: 800 }}>
                Practitioner Platform Access Locked
              </h2>
              <p style={{ margin: '0 0 24px', color: '#64748B', fontSize: 15, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
                Practitioners do not get a free trial. To publish courses, create 1:1 session offers, host live group circles, and access clinical tools, please subscribe to a Practitioner Plan via <strong>Razorpay</strong>.
              </p>

              {/* Plans Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, textAlign: 'left', marginTop: 24 }}>
                {/* Starter Plan */}
                <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ color: '#0F172A', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Starter Plan</div>
                    <div style={{ color: '#0F172A', fontSize: 26, fontWeight: 900, marginBottom: 12 }}>₹999<small style={{ fontSize: 13, color: '#64748B' }}>/mo</small></div>
                    <ul style={{ margin: '0 0 16px', padding: 0, listStyle: 'none', fontSize: 12, color: '#475569', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <li>✓ Publish courses & 1:1 session offers</li>
                      <li>✓ 1 Live group circle</li>
                      <li>✓ Directory listing & client booking link</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handlePayNow('starter')}
                    disabled={payingPlan === 'starter'}
                    style={{ width: '100%', padding: '10px', background: '#0F172A', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
                  >
                    {payingPlan === 'starter' ? 'Opening Razorpay...' : 'Subscribe Starter — ₹999'}
                  </button>
                </div>

                {/* Growth Plan (Featured) */}
                <div style={{ background: '#0F172A', border: '2px solid #6366F1', borderRadius: 20, padding: 20, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: -10, right: 16, background: '#6366F1', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10 }}>MOST POPULAR</span>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Growth Plan</div>
                    <div style={{ color: '#fff', fontSize: 26, fontWeight: 900, marginBottom: 12 }}>₹2,999<small style={{ fontSize: 13, color: '#94A3B8' }}>/mo</small></div>
                    <ul style={{ margin: '0 0 16px', padding: 0, listStyle: 'none', fontSize: 12, color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <li>✓ Everything in Starter</li>
                      <li>✓ Unlimited live circles & cohorts</li>
                      <li>✓ Automated check-in sequences</li>
                      <li>✓ Priority directory badge</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handlePayNow('growth')}
                    disabled={payingPlan === 'growth'}
                    style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
                  >
                    {payingPlan === 'growth' ? 'Opening Razorpay...' : 'Subscribe Growth — ₹2,999'}
                  </button>
                </div>

                {/* Master VIP Plan */}
                <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ color: '#0F172A', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Master VIP</div>
                    <div style={{ color: '#0F172A', fontSize: 26, fontWeight: 900, marginBottom: 12 }}>₹5,999<small style={{ fontSize: 13, color: '#64748B' }}>/mo</small></div>
                    <ul style={{ margin: '0 0 16px', padding: 0, listStyle: 'none', fontSize: 12, color: '#475569', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <li>✓ Everything in Growth</li>
                      <li>✓ Zero commission options</li>
                      <li>✓ White-label client portal</li>
                      <li>✓ Dedicated care manager</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handlePayNow('master')}
                    disabled={payingPlan === 'master'}
                    style={{ width: '100%', padding: '10px', background: '#0F172A', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
                  >
                    {payingPlan === 'master' ? 'Opening Razorpay...' : 'Subscribe Master — ₹5,999'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
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
                <GrowthTools telemetryData={telemetryData} />
              )}
              {activeSection === 'profile' && (
                <Settings />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default PractitionerDashboard
