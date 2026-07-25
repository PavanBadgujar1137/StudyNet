import React, { useState, useEffect } from 'react'
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
  FiCalendar, 
  FiZap,
  FiHeart,
  FiUser
} from 'react-icons/fi'
import MyJourney from './MyJourney'
import CheckIn from './CheckIn'
import MyCircle from './MyCircle'
import SessionsResources from './SessionsResources'
import Reflections from './Reflections'
import Settings from '../Settings'
import { fetchClientDashboardData } from '../../../../services/operations/dashboardAPI'

export function ClientDashboard() {
  const [activeTab, setActiveTab] = useState('journey')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)

  const clientName = user?.firstName || 'Client'
  const practitionerName = dashboardData?.practitioner?.name || 'Dr. Meera Iyer'
  const practitionerFirstName = dashboardData?.practitioner?.firstName || 'Meera'

  const loadData = async () => {
    if (!token) return
    setLoading(true)
    const data = await fetchClientDashboardData(token)
    if (data) setDashboardData(data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [token])

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
      id: 'circle',
      label: 'My circle',
      icon: <FiUsers />,
      badge: 'Group',
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
      <aside className={`oh-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        <div>
          {/* Sidebar Header */}
          <div className="oh-sidebar-head">
            <div className="oh-sidebar-brand">
              <div className="oh-sidebar-brand-icon">
                <FiZap />
              </div>
              <div>
                <div className="oh-sidebar-brand-title">Client Portal</div>
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
          <div className="oh-sidebar-section">
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

            {/* Practitioner Widget */}
            <div className="oh-practitioner-card">
              <div className="oh-practitioner-header">
                <div className="oh-practitioner-av">
                  {practitionerFirstName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="oh-practitioner-name">{practitionerName}</h4>
                  <p className="oh-practitioner-role">Clinical Practitioner</p>
                </div>
              </div>

              <div className="oh-practitioner-actions">
                <button 
                  onClick={() => setActiveTab('sessions')}
                  className="oh-practitioner-btn oh-practitioner-btn-secondary"
                >
                  <FiCalendar /> Book
                </button>
                <button 
                  onClick={() => setActiveTab('reflections')}
                  className="oh-practitioner-btn oh-practitioner-btn-primary"
                >
                  <FiMessageSquare /> Note
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Footer Card */}
        <div 
          className="oh-sidebar-user" 
          onClick={() => setActiveTab('profile')} 
          style={{ cursor: 'pointer' }}
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
                {activeTab === 'journey' && `Welcome back, ${clientName} 👋`}
                {activeTab === 'checkin' && 'Daily Check-in Rhythm'}
                {activeTab === 'circle' && 'Peer Support Circle'}
                {activeTab === 'sessions' && 'Sessions & Learning Resources'}
                {activeTab === 'reflections' && 'Self Reflection Journal'}
                {activeTab === 'profile' && 'Edit Profile & Account Settings'}
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#475569',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              padding: '6px 14px',
              borderRadius: '999px',
              fontWeight: 600
            }}>
              <FiHeart style={{ color: '#F43F5E' }} />
              <span>Working with <b style={{ color: '#0F172A' }}>{practitionerName}</b></span>
            </div>

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
          {activeTab === 'circle' && (
            <MyCircle 
              clientName={clientName} 
              practitionerName={practitionerFirstName} 
              dashboardData={dashboardData}
            />
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
