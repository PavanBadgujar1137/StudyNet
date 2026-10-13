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
  FiMessageSquare,
  FiZap,
  FiUserCheck,
  FiUser,
  FiBell,
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
import NotificationDropdown from './NotificationDropdown'
import { fetchClientDashboardData } from '../../../../services/operations/dashboardAPI'

const DEFAULT_LEARNER_NOTIFICATIONS = [
  {
    id: 'notif_session_1',
    type: 'session',
    title: 'Upcoming 1-on-1 Practice Session',
    message: 'Your personal practice session is scheduled. Check your agenda and Zoom details.',
    time: '25m ago',
    unread: true,
    tab: 'sessions',
    iconColor: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
  },
  {
    id: 'notif_reflection_1',
    type: 'reflection',
    title: 'Daily Reflection Prompt Awaiting',
    message: 'Where did you find stillness today? Take 2 minutes to write your thoughts.',
    time: '2h ago',
    unread: true,
    tab: 'reflections',
    iconColor: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
  },
  {
    id: 'notif_checkin_1',
    type: 'checkin',
    title: 'Daily Mindful Pulse Check-in',
    message: 'Log your mood, body tension, and somatic state to keep your streak alive.',
    time: '5h ago',
    unread: true,
    tab: 'checkin',
    iconColor: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
  },
  {
    id: 'notif_circle_1',
    type: 'circle',
    title: 'New Activity in Your Cohort Circle',
    message: 'Members in your circle shared new progress notes and mutual encouragement.',
    time: 'Yesterday',
    unread: false,
    tab: 'circle',
    iconColor: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
  {
    id: 'notif_course_1',
    type: 'course',
    title: 'New Video Lecture Available',
    message: 'A new practice session and guided meditation have been published to your course.',
    time: '2 days ago',
    unread: false,
    tab: 'courses',
    iconColor: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
  },
]

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

  const [searchQuery, setSearchQuery] = useState('')

  // Theme Management (Light / Dark)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('op_dashboard_theme') || 'light'
    } catch (e) {
      return 'light'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('op_dashboard_theme', theme)
    } catch (e) {}
  }, [theme])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    toast.success(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`, {
      icon: nextTheme === 'dark' ? '🌙' : '☀️',
      duration: 2000,
    })
  }

  // Notifications Management
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('op_learner_notifications_v2')
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return DEFAULT_LEARNER_NOTIFICATIONS
  })
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const unreadNotifCount = notifications.filter((n) => n.unread).length

  useEffect(() => {
    try {
      localStorage.setItem('op_learner_notifications_v2', JSON.stringify(notifications))
    } catch (e) {}
  }, [notifications])

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
    toast.success('All notifications marked as read', { icon: '✅' })
  }

  const handleMarkSingleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    )
  }

  const handleDeleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    toast('Notification removed', { icon: '🗑️' })
  }

  const handleClearAllNotifications = () => {
    setNotifications([])
    toast('All notifications cleared', { icon: '🧹' })
  }

  const handleRestoreNotifications = () => {
    setNotifications(DEFAULT_LEARNER_NOTIFICATIONS)
    toast.success('Sample notifications restored', { icon: '🔔' })
  }

  const handleSelectNotification = (notif) => {
    handleMarkSingleRead(notif.id)
    setIsNotificationsOpen(false)
    if (notif.tab) {
      setActiveTab(notif.tab)
    }
  }

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await fetchClientDashboardData(token)
      if (data) setDashboardData(data)
    } catch (e) {
      console.warn("Could not fetch dashboard telemetry:", e)
    } finally {
      setLoading(false)
    }
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
    },
    {
      id: 'checkin',
      label: 'Check in',
      icon: <FiCheckSquare />,
      badge: 'TODAY',
      hasDot: true,
      dotColor: '#60A5FA',
    },
    {
      id: 'practitioners',
      label: 'Practitioners',
      icon: <FiUserCheck />,
      badge: 'ALL GUIDES',
    },
    {
      id: 'courses',
      label: 'Courses',
      icon: <FiBookOpen />,
      badge: null,
    },
    {
      id: 'circle',
      label: 'My circle',
      icon: <FiUsers />,
      badge: 'CIRCLES',
    },
    {
      id: 'community',
      label: 'Community & Chat',
      icon: <FiMessageSquare />,
      badge: 'LIVE',
      hasDot: true,
      dotColor: '#C084FC',
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
      dotColor: '#A855F7',
    },
    {
      id: 'profile',
      label: 'Profile & Settings',
      icon: <FiUser />,
      badge: null,
    },
  ]

  return (
    <div className={`exact-learner-shell ${theme === 'dark' ? 'exact-theme-dark' : ''}`}>
      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            background: 'rgba(10, 14, 39, 0.7)',
            backdropFilter: 'blur(6px)'
          }}
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Dark Midnight Sidebar */}
      <aside className={`exact-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Logo & Brand Header */}
          <div
            className="exact-sidebar-brand"
            onClick={() => setActiveTab('journey')}
          >
            {/* Glowing Infinity SVG Icon */}
            <div className="exact-sidebar-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.228-8-5.096 0-5.096 8 0 8 5.095 0 7.133-8 12.228-8z" />
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  OpenHand
                </span>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#E2E8F0', marginTop: '1px' }}>
                Learner Portal
              </div>
              <div style={{ fontSize: '10.5px', color: '#6A789E' }}>
                100% Free Access
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="exact-nav-section-title">
            NAVIGATION
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {navItems.map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setIsMobileSidebarOpen(false)
                  }}
                  className={`exact-nav-btn ${isActive ? 'active' : ''}`}
                >
                  <div className="exact-nav-btn-left">
                    <span style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.hasDot && !item.badge && (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.dotColor || '#A855F7' }} />
                    )}
                    {item.badge && (
                      <span
                        className="exact-nav-badge"
                        style={isActive ? { background: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF', borderColor: 'transparent' } : {}}
                      >
                        {item.hasDot && (
                          <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', background: item.dotColor || '#60A5FA', marginRight: '4px' }} />
                        )}
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Profile & Upgrade Promo */}
        <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
          {/* User Profile Card */}
          <div
            onClick={() => setActiveTab('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 8px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              }}
            >
              {clientName.slice(0, 1)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
                {clientName}
              </div>
              <div style={{ fontSize: '11px', color: '#7E8BAE' }}>
                Edit Profile &amp; Settings →
              </div>
            </div>
          </div>

          {/* Upgrade Card */}
          <div className="exact-sidebar-upgrade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#A5B4FC', letterSpacing: '0.1em' }}>
                SEEK
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818CF8' }}>
                👑
              </div>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
              Upgrade Your Journey
            </div>
            <div style={{ fontSize: '11px', color: '#8A97C2', lineHeight: 1.4, marginBottom: '12px' }}>
              Unlock advanced AI insights, personalised reports and more.
            </div>
            <button
              onClick={() => toast.success("Opening Premium Explorer...")}
              style={{
                width: '100%',
                padding: '7px 12px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.35)',
              }}
            >
              Explore Premium →
            </button>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="exact-main-viewport">
        {/* Sticky Top Header Bar */}
        <header className="exact-topbar">
          {/* Mobile hamburger */}
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155', padding: '4px' }}
            className="lg:hidden"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <FiMenu fontSize={22} />
          </button>

          {/* Search Bar with Ctrl | K */}
          <div className="exact-search-bar">
            <span style={{ color: '#94A3B8', fontSize: '15px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search courses, practitioners, sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="exact-search-badge">Ctrl | K</span>
          </div>

          {/* Right Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
              className="exact-theme-toggle-btn"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Notification Bell Button & Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                title="Notifications"
                aria-label="Notifications"
                className={`exact-notification-btn ${isNotificationsOpen ? 'active' : ''}`}
              >
                <FiBell size={17} />
                {unreadNotifCount > 0 && (
                  <span className="exact-notification-badge">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              <NotificationDropdown
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={notifications}
                unreadCount={unreadNotifCount}
                onMarkAllRead={handleMarkAllRead}
                onMarkSingleRead={handleMarkSingleRead}
                onDeleteNotification={handleDeleteNotification}
                onClearAll={handleClearAllNotifications}
                onRestoreDefaultNotifications={handleRestoreNotifications}
                onSelectNotification={handleSelectNotification}
                theme={theme}
              />
            </div>

            {/* Profile Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setActiveTab('profile')}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {clientName.slice(0, 1)}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                {clientName} ▾
              </span>
            </div>
          </div>
        </header>

        {/* View Body */}
        <div style={{ padding: '24px 32px 36px', maxWidth: '1480px', width: '100%', margin: '0 auto', boxSpacing: 'border-box' }}>
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

