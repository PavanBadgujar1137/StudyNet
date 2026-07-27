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
  FiMessageSquare
} from 'react-icons/fi'
import Overview from './Overview'
import MyOffers from './MyOffers'
import MyClients from './MyClients'
import Circles from './Circles'
import SessionRoom from './SessionRoom'
import PayoutsInvoices from './PayoutsInvoices'
import GrowthTools from './GrowthTools'
import Settings from '../Settings'
import CommunityChatHub from '../CommunityChatHub'
import { fetchPractitionerDashboardData } from '../../../../services/operations/dashboardAPI'

export function PractitionerDashboard() {
  const [activeSection, setActiveSection] = useState('dash')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [telemetryData, setTelemetryData] = useState(null)
  const [loading, setLoading] = useState(true)

  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)

  const practitionerName = user ? `Dr. ${user.firstName} ${user.lastName}` : 'Practitioner'
  const initials = `${user?.firstName?.slice(0, 1) || 'P'}${user?.lastName?.slice(0, 1) || 'R'}`

  const loadData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    const data = await fetchPractitionerDashboardData(token)
    if (data) setTelemetryData(data)
    setLoading(false)
  }, [token])

  useEffect(() => {
    loadData()
  }, [loadData])

  const practiceItems = [
    { id: 'dash', label: 'Dashboard', icon: <FiGrid /> },
    { id: 'community', label: 'Community Hub', icon: <FiMessageSquare /> },
    { id: 'offers', label: 'My offers', icon: <FiTag /> },
    { id: 'clients', label: 'My clients', icon: <FiUsers /> },
    { id: 'circles', label: 'Circles', icon: <FiCircle /> },
  ]

  const liveItems = [
    { id: 'room', label: 'Session room', icon: <FiVideo />, badge: 'LIVE' },
  ]

  const businessItems = [
    { id: 'payouts', label: 'Payouts & invoices', icon: <FiDollarSign /> },
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
                {activeSection === 'dash' && `Welcome back, ${practitionerName} 👋`}
                {activeSection === 'community' && 'Community & Chat Hub'}
                {activeSection === 'offers' && 'My Practice Offers'}
                {activeSection === 'clients' && 'Client Management Hub'}
                {activeSection === 'circles' && 'Active Circles'}
                {activeSection === 'room' && 'Live Session Room'}
                {activeSection === 'payouts' && 'Payouts & Billing Invoices'}
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
          {activeSection === 'clients' && (
            <MyClients setActiveSection={setActiveSection} telemetryData={telemetryData} />
          )}
          {activeSection === 'circles' && (
            <Circles telemetryData={telemetryData} onUpdate={loadData} />
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
        </div>
      </main>
    </div>
  )
}

export default PractitionerDashboard
