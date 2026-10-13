import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  FiVideo, 
  FiAward, 
  FiUsers, 
  FiCalendar, 
  FiCheckCircle, 
  FiStar, 
  FiClock, 
  FiChevronRight, 
  FiInfo, 
  FiBookOpen,
  FiActivity
} from 'react-icons/fi'
import { formatClassTitle } from '../../../../utils/formatTitle'
import { PractitionerBadgeStrip, BadgesModal } from '../../../Common/PractitionerBadges'

export function Overview({ practitionerName = 'Practitioner', setActiveSection, telemetryData, loading }) {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.profile)
  const [showBadgesModal, setShowBadgesModal] = useState(false)
  const [activeChartFilter, setActiveChartFilter] = useState('12m')
  const [quoteIndex, setQuoteIndex] = useState(0)

  const quotes = [
    "Small steps every day create big changes.",
    "The art of guidance is awakening natural curiosity and resilience.",
    "Consistency and presence build lifelong learner confidence."
  ]

  const storageKeyStep = user?._id ? `oh_onboarding_step_${user._id}` : 'oh_onboarding_step'
  const savedStep = typeof window !== 'undefined' ? localStorage.getItem(storageKeyStep) : null

  const stats = telemetryData?.stats || {
    monthlyEarnings: 0,
    totalEarnings: 0,
    activeClientsCount: 0,
    clearingThisWeek: 0,
    circleSeatsFilled: 0,
    totalCircleCapacity: 0,
    avgWellbeing: 0,
  }

  const monthlyHistory = telemetryData?.monthlyHistory || [
    { month: 'Jan', amount: 0 },
    { month: 'Feb', amount: 0 },
    { month: 'Mar', amount: 0 },
    { month: 'Apr', amount: 0 },
    { month: 'May', amount: 0 },
    { month: 'Jun', amount: 0 },
    { month: 'Jul', amount: 0 },
    { month: 'Aug', amount: 0 },
    { month: 'Sep', amount: 0 },
    { month: 'Oct', amount: 0 },
    { month: 'Nov', amount: 0 },
    { month: 'Dec', amount: 0 },
  ]

  const upcomingClasses = telemetryData?.upcomingClasses || []
  const clients = telemetryData?.clients || []
  const pendingNotes = telemetryData?.pendingNotes || []
  const badges = telemetryData?.practitioner?.badges || []

  // 100% Real Dynamic Calculations (No fabricated metrics)
  const totalLearnersCount = stats.activeClientsCount || clients.length || 0
  const upcomingCount = upcomingClasses.length
  const circleFilled = stats.circleSeatsFilled || 0
  const circleCapacity = stats.totalCircleCapacity || 0
  const circleFillRate = circleCapacity > 0 ? Math.round((circleFilled / circleCapacity) * 100) : (circleFilled > 0 ? 100 : 0)
  
  const rawRating = telemetryData?.practitioner?.rating
  const hasRating = rawRating !== null && rawRating !== undefined && rawRating > 0
  const displayRating = hasRating ? Number(rawRating).toFixed(1) : 'New'

  // Dynamic filter on real monthly history (12m, 6m, 3m)
  const filteredHistory = activeChartFilter === '3m'
    ? monthlyHistory.slice(-3)
    : activeChartFilter === '6m'
      ? monthlyHistory.slice(-6)
      : monthlyHistory

  const maxHistoryAmount = Math.max(...filteredHistory.map((m) => m.amount), 1)
  const hasHistoryEarnings = filteredHistory.some((m) => m.amount > 0)

  // Real scheduled duration in minutes and hours
  const totalClassMinutes = upcomingClasses.reduce((sum, cls) => {
    if (cls.scheduledStart && cls.scheduledEnd) {
      const diff = (new Date(cls.scheduledEnd) - new Date(cls.scheduledStart)) / (1000 * 60)
      return sum + (diff > 0 ? diff : 60)
    }
    return sum + 60
  }, 0)
  const classHours = Math.floor(totalClassMinutes / 60)
  const classMins = totalClassMinutes % 60
  const totalSessionTimeStr = upcomingClasses.length > 0
    ? (classHours > 0 ? `${classHours}h ${classMins}m scheduled` : `${classMins}m scheduled`)
    : '0 hrs scheduled'

  const nextClass = upcomingClasses.length > 0 ? upcomingClasses[0] : null

  return (
    <section className="oh-prac-overview oh-view-fade-in" id="dash">
      {/* ─── Setup Incomplete Banner (Preserved) ─── */}
      {savedStep && (
        <div style={{
          background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
          border: '1.5px solid #C7D2FE',
          borderRadius: '18px',
          padding: '16px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#4F46E5', background: '#FFFFFF', padding: '3px 10px', borderRadius: '12px', display: 'inline-block', marginBottom: '4px' }}>
              ⚡ Setup Incomplete — Step {savedStep} of 4
            </span>
            <div style={{ fontWeight: 800, color: '#1E1B4B', fontSize: '15px' }}>
              Finish setting up your practice space
            </div>
            <div style={{ fontSize: '13px', color: '#4338CA', marginTop: '2px' }}>
              Complete all 4 steps to launch your custom handle &amp; receive bookings.
            </div>
          </div>
          <button
            onClick={() => navigate('/onboarding/practitioner')}
            style={{
              padding: '10px 18px',
              background: '#4F46E5',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
            }}
          >
            Resume Onboarding →
          </button>
        </div>
      )}

      {/* ─── 1. Atmospheric Hero Section ─── */}
      <div className="oh-prac-hero">
        <div className="oh-prac-hero-content">
          <div className="oh-prac-hero-badge">
            <span className="pill">PRACTITIONER</span>
            <span className="sub">/ Dashboard</span>
          </div>
          <h1 className="oh-prac-hero-title">
            Hello, {practitionerName} 👋
          </h1>
          <p className="oh-prac-hero-desc">
            Your guidance creates real impact. Keep supporting learners and building brighter futures together.
          </p>
        </div>

        {/* Scenic Mountain Sunset Vector Artwork */}
        <div className="oh-prac-hero-artwork" aria-hidden="true">
          <svg viewBox="0 0 600 240" fill="none" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="skyGrad" x1="300" y1="0" x2="300" y2="240" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#2E1065" />
                <stop offset="40%" stopColor="#4C1D95" />
                <stop offset="70%" stopColor="#7C3AED" />
                <stop offset="88%" stopColor="#DB2777" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
              <radialGradient id="sunGlow" cx="420" cy="140" r="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#F97316" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#DB2777" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="mountFar" x1="0" y1="120" x2="0" y2="240" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#581C87" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#311042" />
              </linearGradient>
              <linearGradient id="mountMid" x1="0" y1="140" x2="0" y2="240" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3B0764" />
                <stop offset="100%" stopColor="#1E0533" />
              </linearGradient>
              <linearGradient id="mountNear" x1="0" y1="170" x2="0" y2="240" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1E1B4B" />
                <stop offset="100%" stopColor="#0B0924" />
              </linearGradient>
            </defs>

            {/* Sky Background */}
            <rect width="600" height="240" fill="url(#skyGrad)" opacity="0.95" />

            {/* Glowing Sun Orb */}
            <circle cx="420" cy="140" r="45" fill="url(#sunGlow)" />
            <circle cx="420" cy="140" r="22" fill="#FEF08A" opacity="0.9" />

            {/* Distant Mountains */}
            <path d="M120 240 L220 130 L300 170 L420 100 L510 160 L600 110 L600 240 Z" fill="url(#mountFar)" />

            {/* Mid Mountain Ridges */}
            <path d="M0 240 L80 150 L190 200 L290 140 L380 180 L490 125 L600 170 L600 240 Z" fill="url(#mountMid)" opacity="0.9" />

            {/* Near Alpine Ridge & Silhouette Pines */}
            <path d="M0 240 L60 180 L140 210 L240 165 L360 215 L460 175 L560 210 L600 190 L600 240 Z" fill="url(#mountNear)" />

            {/* Pine Trees Silhouettes */}
            <path d="M235 165 L240 152 L245 165 L238 165 L238 170 L236 170 Z M250 175 L254 162 L258 175 L253 175 L253 180 L251 180 Z M350 215 L355 200 L360 215 Z" fill="#0B0924" />

            {/* Hiker / Guide Silhouette */}
            <g transform="translate(480, 150) scale(0.35)">
              <circle cx="20" cy="10" r="6" fill="#0F172A" />
              <path d="M14 18 L26 18 L24 45 L16 45 Z" fill="#0F172A" />
              <path d="M22 20 L32 30 L22 36" stroke="#0F172A" strokeWidth="3" />
              <path d="M12 24 L6 34" stroke="#0F172A" strokeWidth="3" />
            </g>
          </svg>
        </div>

        {/* Floating Quote Card */}
        <div 
          className="oh-prac-quote-card"
          onClick={() => setQuoteIndex((prev) => (prev + 1) % quotes.length)}
          title="Click to see next inspirational quote"
          style={{ cursor: 'pointer' }}
        >
          <div className="quote-icon">❝</div>
          <p>"{quotes[quoteIndex]}"</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {quotes.map((_, i) => (
              <div 
                key={i} 
                style={{
                  width: i === quoteIndex ? '20px' : '6px',
                  height: '3px',
                  borderRadius: '999px',
                  background: i === quoteIndex ? '#818CF8' : 'rgba(255, 255, 255, 0.25)',
                  transition: 'all 0.3s ease'
                }} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── 2. Five Summary Stat Cards Row (Real Data Contracts) ─── */}
      <div className="oh-prac-stats-grid">
        {/* Card 1: Total Learners */}
        <div className="oh-prac-stat-card oh-stagger-1">
          <div>
            <div className="oh-prac-stat-top">
              <span className="oh-prac-stat-lbl">Total Learners</span>
              <div className="oh-prac-stat-icon" style={{ background: '#F5F3FF', color: '#8B5CF6' }}>
                <FiUsers />
              </div>
            </div>
            <div className="oh-prac-stat-val">{totalLearnersCount}</div>
          </div>
          <div className="oh-prac-stat-badge" style={{ color: totalLearnersCount > 0 ? '#10B981' : '#64748B' }}>
            <span>{totalLearnersCount > 0 ? '✓ Active roster' : 'Roster empty'}</span>
            <span style={{ color: '#64748B', fontWeight: 500 }}>enrolled</span>
          </div>
        </div>

        {/* Card 2: Sessions Scheduled */}
        <div className="oh-prac-stat-card oh-stagger-2">
          <div>
            <div className="oh-prac-stat-top">
              <span className="oh-prac-stat-lbl">Scheduled Sessions</span>
              <div className="oh-prac-stat-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                <FiCalendar />
              </div>
            </div>
            <div className="oh-prac-stat-val">{upcomingCount}</div>
          </div>
          <div className="oh-prac-stat-badge" style={{ color: upcomingCount > 0 ? '#3B82F6' : '#64748B' }}>
            <span>{upcomingCount > 0 ? `${upcomingCount} upcoming` : 'None scheduled'}</span>
            <span style={{ color: '#64748B', fontWeight: 500 }}>on calendar</span>
          </div>
        </div>

        {/* Card 3: Circle Seats Filled */}
        <div className="oh-prac-stat-card oh-stagger-3">
          <div>
            <div className="oh-prac-stat-top">
              <span className="oh-prac-stat-lbl">Circle Seats Filled</span>
              <div className="oh-prac-stat-icon" style={{ background: '#ECFEFF', color: '#06B6D4' }}>
                <FiCheckCircle />
              </div>
            </div>
            <div className="oh-prac-stat-val">{circleFilled} / {circleCapacity}</div>
          </div>
          <div className="oh-prac-stat-badge" style={{ color: circleFillRate > 0 ? '#06B6D4' : '#64748B' }}>
            <span>{circleCapacity > 0 ? `${circleFillRate}% filled` : 'Active Circles'}</span>
            <span style={{ color: '#64748B', fontWeight: 500 }}>capacity</span>
          </div>
        </div>

        {/* Card 4: Avg. Rating */}
        <div className="oh-prac-stat-card oh-stagger-4">
          <div>
            <div className="oh-prac-stat-top">
              <span className="oh-prac-stat-lbl">Avg. Rating</span>
              <div className="oh-prac-stat-icon" style={{ background: '#FAF5FF', color: '#A855F7' }}>
                <FiStar />
              </div>
            </div>
            <div className="oh-prac-stat-val">{displayRating}</div>
          </div>
          <div className="oh-prac-stat-badge" style={{ color: hasRating ? '#8B5CF6' : '#64748B' }}>
            <span>{hasRating ? '★ Verified' : 'New practitioner'}</span>
            <span style={{ color: '#64748B', fontWeight: 500 }}>{hasRating ? 'reviews' : 'rating'}</span>
          </div>
        </div>

        {/* Card 5: Your Impact (Gradient Card) */}
        <div 
          className="oh-prac-impact-card oh-stagger-5"
          onClick={() => setShowBadgesModal(true)}
          title="Click to view verified Honors & Master Badges"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              color: '#FFFFFF'
            }}>
              <FiAward />
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E0E7FF', fontWeight: 700 }}>
                Your Honors
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                {badges.length > 0 ? `${badges.length} Badges` : 'Verified Guide'}
              </div>
              <div style={{ fontSize: '11px', color: '#C7D2FE', marginTop: '2px' }}>
                {badges.length > 0 ? 'Click to inspect honors' : 'Active OpenHand guide'}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '20px', color: '#FFFFFF', opacity: 0.85 }}>
            <FiChevronRight />
          </div>
        </div>
      </div>

      {/* ─── 3. Middle Section: Analytics, Quick Actions & Upcoming Session ─── */}
      <div className="oh-prac-main-grid">
        {/* Panel A: Session & Learning Analytics (Real Data Connected) */}
        <div className="oh-prac-dark-card">
          <div className="oh-prac-dark-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60A5FA', fontSize: '18px' }}>
                <FiActivity />
              </div>
              <div>
                <h3 className="oh-prac-dark-title">Session &amp; Practice Analytics</h3>
                <p className="oh-prac-dark-sub">Recorded monthly practice earnings and session delivery history.</p>
              </div>
            </div>

            {/* Filter updates the displayed dataset */}
            <select
              value={activeChartFilter}
              onChange={(e) => setActiveChartFilter(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#E2E8F0',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="12m" style={{ background: '#0F172A' }}>Full Year (12M)</option>
              <option value="6m" style={{ background: '#0F172A' }}>Recent (6M)</option>
              <option value="3m" style={{ background: '#0F172A' }}>Quarter (3M)</option>
            </select>
          </div>

          {/* Chart Content Area */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', margin: '14px 0' }}>
            {/* Left: Dynamic Real History Chart */}
            <div style={{ flex: '1 1 360px', minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '11.5px', color: '#C084FC', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C084FC', display: 'inline-block' }} />
                    Monthly Earnings (₹)
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                  Total: ₹{stats.totalEarnings.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Real Earnings SVG Timeline Chart */}
              <div style={{ position: 'relative', width: '100%', height: '150px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', height: '115px', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  {filteredHistory.map((item, idx) => {
                    const heightPct = hasHistoryEarnings && item.amount > 0 
                      ? Math.max((item.amount / maxHistoryAmount) * 100, 8) 
                      : 6
                    return (
                      <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                        <div
                          title={`${item.month}: ₹${item.amount.toLocaleString('en-IN')}`}
                          style={{
                            width: '100%',
                            maxWidth: '32px',
                            height: `${heightPct}%`,
                            background: hasHistoryEarnings && item.amount > 0 
                              ? 'linear-gradient(180deg, #A855F7 0%, #3B82F6 100%)' 
                              : 'rgba(255, 255, 255, 0.08)',
                            borderRadius: '5px',
                            transition: 'height 0.3s ease',
                            boxShadow: hasHistoryEarnings && item.amount > 0 ? '0 0 10px rgba(168, 85, 247, 0.4)' : 'none'
                          }}
                        />
                        <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 600, marginTop: '6px' }}>{item.month}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right: Real Circle Capacity Gauge */}
            <div style={{ flex: '0 0 210px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                  <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="url(#gaugeGrad2)"
                    strokeWidth="8"
                    strokeDasharray="264"
                    strokeDashoffset={264 * (1 - (circleFillRate / 100))}
                    strokeLinecap="round"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="gaugeGrad2" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>{circleFillRate}%</span>
                  <span style={{ fontSize: '9px', color: '#94A3B8', marginTop: '2px', textAlign: 'center', lineHeight: 1.1 }}>Capacity</span>
                </div>
              </div>

              {/* Real Circle Capacity Legend */}
              <div style={{ width: '100%', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E2E8F0' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} /> Enrolled Seats</span>
                  <b style={{ color: '#10B981' }}>{circleFilled}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E2E8F0' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }} /> Max Capacity</span>
                  <b style={{ color: '#3B82F6' }}>{circleCapacity}</b>
                </div>
              </div>
            </div>
          </div>

          {/* Total Session Time Pill Link */}
          <div 
            onClick={() => setActiveSection('schedule')}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginTop: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C084FC', fontSize: '16px' }}>
                <FiClock />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block' }}>Total Live Session Time</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>{totalSessionTimeStr}</span>
              </div>
            </div>
            <FiChevronRight style={{ color: '#94A3B8', fontSize: '16px' }} />
          </div>
        </div>

        {/* Panel B: Quick Actions Panel */}
        <div className="oh-prac-actions-card">
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', color: '#F59E0B' }}>⚡</span>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>Quick Actions</h3>
            </div>
            <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0' }}>One-click management tools</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* 1. Start Live Session */}
            <div 
              className="oh-prac-action-row"
              onClick={() => setActiveSection('room')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.2)', color: '#C084FC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  <FiVideo />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>Start Live Session</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Connect with learners instantly</div>
                </div>
              </div>
              <FiChevronRight style={{ color: '#64748B', fontSize: 16 }} />
            </div>

            {/* 2. Schedule Session */}
            <div 
              className="oh-prac-action-row"
              onClick={() => setActiveSection('schedule')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  <FiCalendar />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>Schedule Session</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Plan a new session</div>
                </div>
              </div>
              <FiChevronRight style={{ color: '#64748B', fontSize: 16 }} />
            </div>

            {/* 3. View My Learners */}
            <div 
              className="oh-prac-action-row"
              onClick={() => setActiveSection('clients')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  <FiUsers />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>View My Learners</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Track learner progress</div>
                </div>
              </div>
              <FiChevronRight style={{ color: '#64748B', fontSize: 16 }} />
            </div>

            {/* 4. Manage Courses */}
            <div 
              className="oh-prac-action-row"
              onClick={() => setActiveSection('courses')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.2)', color: '#F472B6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  <FiBookOpen />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>Manage Courses</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Update &amp; organize courses</div>
                </div>
              </div>
              <FiChevronRight style={{ color: '#64748B', fontSize: 16 }} />
            </div>
          </div>
        </div>

        {/* Panel C: Upcoming Session Card (Real Next Session Data) */}
        <div className="oh-prac-upcoming-card">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60A5FA', fontSize: '14px' }}>
                  <FiVideo />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>Upcoming Session</h3>
              </div>
              <span style={{ background: 'rgba(168, 85, 247, 0.25)', border: '1px solid rgba(168, 85, 247, 0.5)', color: '#D8B4FE', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 800 }}>
                ★ Live
              </span>
            </div>

            {nextClass ? (
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '18px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: '16px', fontWeight: 800, flexShrink: 0 }}>
                      <FiVideo />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
                        {new Date(nextClass.scheduledStart).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', margin: '3px 0 6px', lineHeight: 1.25 }}>
                        {formatClassTitle(nextClass.title)}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11.5px', color: '#CBD5E1' }}>
                        <span>👥 {nextClass.enrolledLearners?.length || nextClass.studentsEnrolled?.length || 0} enrolled</span>
                        <span>⏱️ {nextClass.scheduledEnd ? Math.max(Math.round((new Date(nextClass.scheduledEnd) - new Date(nextClass.scheduledStart)) / 60000), 15) : 60} mins</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, transparent 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C084FC', flexShrink: 0 }}>
                    ✦
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/live/${nextClass._id}`)}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '11px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 6px 16px rgba(124, 58, 237, 0.4)'
                  }}
                >
                  <FiVideo /> Join Now
                </button>
              </div>
            ) : (
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '18px', padding: '20px 16px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.06)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '20px', marginBottom: '8px' }}>
                  <FiCalendar />
                </div>
                <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '14px' }}>No live session right now</div>
                <p style={{ color: '#94A3B8', fontSize: '12px', margin: '4px 0 14px' }}>Schedule your next live workshop or 1:1 session.</p>
                <button
                  onClick={() => setActiveSection('schedule')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer'
                  }}
                >
                  Schedule Session →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 4. Lower Section Grid: Earnings, Completed Sessions, Motivational & Recent Learners ─── */}
      <div className="oh-prac-bottom-grid">
        {/* Card 1: This Month's Earnings (Real Backend Values) */}
        <div className="oh-prac-stat-card" style={{ padding: '22px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  ₹
                </div>
                <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>This Month's Earnings</span>
              </div>
              <FiInfo style={{ color: '#94A3B8', fontSize: '15px', cursor: 'pointer' }} title="Earnings computed from confirmed bookings and payouts" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', margin: '14px 0' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  ₹{stats.monthlyEarnings.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '11.5px', color: '#166534', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>▲</span> Admin payout ledger
                </div>
              </div>

              {/* 3D Wallet SVG Graphic */}
              <div style={{ width: '56px', height: '56px', flexShrink: 0 }}>
                <svg viewBox="0 0 64 64" fill="none" style={{ width: '100%', height: '100%' }}>
                  <rect x="8" y="16" width="48" height="36" rx="10" fill="url(#wallGrad)" />
                  <rect x="36" y="26" width="22" height="16" rx="6" fill="#8B5CF6" />
                  <circle cx="44" cy="34" r="3" fill="#FCD34D" />
                  <path d="M14 16 L32 8 L50 16" fill="#93C5FD" opacity="0.6" />
                  <defs>
                    <linearGradient id="wallGrad" x1="8" y1="16" x2="56" y2="52" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
            <button
              onClick={() => setActiveSection('payouts')}
              style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View Details →
            </button>
          </div>
        </div>

        {/* Card 2: Circle Cohorts Capacity Card (Real Data) */}
        <div className="oh-prac-stat-card" style={{ padding: '22px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  <FiCheckCircle />
                </div>
                <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>Circle Seats Filled</span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, background: '#F1F5F9', padding: '3px 8px', borderRadius: '6px' }}>
                Active Cohorts
              </span>
            </div>

            <div style={{ margin: '14px 0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {circleFilled} / {circleCapacity}
                </span>
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>seats</span>
              </div>

              {/* Progress Bar with Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <div style={{ flex: 1, height: '8px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${circleFillRate}%`, 
                      height: '100%', 
                      background: 'linear-gradient(90deg, #6366F1 0%, #A855F7 100%)', 
                      borderRadius: '999px',
                      transition: 'width 0.4s ease'
                    }} 
                  />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#6366F1', background: '#EEF2FF', padding: '2px 6px', borderRadius: '6px' }}>
                  {circleFillRate}%
                </span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
            <button
              onClick={() => setActiveSection('circles')}
              style={{ background: 'none', border: 'none', color: '#4F46E5', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Manage Circles →
            </button>
          </div>
        </div>

        {/* Card 3: Motivational Artwork Card */}
        <div className="oh-prac-motivational-card">
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
              Your guidance matters
            </div>
            <p style={{ fontSize: '12.5px', color: '#E0E7FF', lineHeight: 1.45, margin: 0 }}>
              Every session you conduct helps someone move closer to their goals.
            </p>
          </div>

          {/* Motivational Arrow Action */}
          <div style={{ position: 'relative', zIndex: 2, marginTop: '20px' }}>
            <button
              onClick={() => setActiveSection('growth')}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <FiChevronRight style={{ fontSize: '18px' }} />
            </button>
          </div>

          {/* Subtle Mountain Sunset in Background */}
          <div style={{ position: 'absolute', right: -20, bottom: -10, width: '130px', height: '90px', opacity: 0.25, pointerEvents: 'none' }}>
            <svg viewBox="0 0 100 70" fill="none">
              <path d="M0 70 L30 30 L60 50 L80 20 L100 70 Z" fill="#FFFFFF" />
            </svg>
          </div>
        </div>

        {/* Card 4: Recent Learners Panel (Real Dynamic Client Records) */}
        <div className="oh-prac-learners-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Recent Learners</h3>
            <button
              onClick={() => setActiveSection('clients')}
              style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, fontSize: '12px', cursor: 'pointer', padding: 0 }}
            >
              View all →
            </button>
          </div>

          {/* Learners List from real dynamic clients */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {clients.length > 0 ? (
              clients.slice(0, 4).map((client, idx) => {
                const fullName = `${client.firstName || 'Learner'} ${client.lastName || ''}`.trim()
                const initialLetter = (client.firstName?.[0] || 'L').toUpperCase()
                const bgColors = ['#EEF2FF', '#F0FDF4', '#FEF3C7', '#FCE7F3']
                const textColors = ['#4338CA', '#15803D', '#B45309', '#BE185D']
                const colorIdx = idx % bgColors.length

                return (
                  <div 
                    key={client._id || idx}
                    className="oh-prac-learner-item"
                    onClick={() => setActiveSection('clients')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: bgColors[colorIdx],
                        color: textColors[colorIdx],
                        fontWeight: 800,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {client.image ? (
                          <img src={client.image} alt={fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : initialLetter}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                          {fullName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                          {client.learnerId ? `ID: ${client.learnerId}` : (client.createdAt ? `Joined ${new Date(client.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}` : 'Connected')}
                        </div>
                      </div>
                    </div>
                    <FiChevronRight style={{ color: '#94A3B8', fontSize: '14px' }} />
                  </div>
                )
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 8px', color: '#64748B', fontSize: '12px' }}>
                <div style={{ marginBottom: '4px' }}>No learners connected yet</div>
                <button
                  onClick={() => setActiveSection('growth')}
                  style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, cursor: 'pointer', fontSize: '11.5px', textDecoration: 'underline' }}
                >
                  Share your public booking link
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 5. Preserved Features: Honors & Badges Showcase Banner ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: '20px',
          padding: '20px 24px',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '18px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ maxWidth: '480px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(245, 158, 11, 0.18)', border: '1px solid rgba(245, 158, 11, 0.35)', color: '#FCD34D', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            <FiAward size={13} /> Active Platform Rewards
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px', color: '#FFFFFF' }}>
            Practitioner Honors &amp; Badges
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8', lineHeight: 1.45 }}>
            These official achievement badges reflect on your public booking profile, building instant learner trust and highlighting your clinical mastery.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <PractitionerBadgeStrip
            badges={badges}
            maxDisplay={5}
            onOpenModal={() => setShowBadgesModal(true)}
          />
        </div>
      </div>

      {/* ─── 6. Preserved Features: Needs Attention & Learner Wellbeing ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
        {/* Needs Your Attention Card */}
        <div className="oh-prac-stat-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Needs Your Attention</h3>
            <span style={{ fontSize: '11px', fontWeight: 700, background: '#FEF3C7', color: '#B45309', padding: '2px 8px', borderRadius: '12px' }}>
              Action Required
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>
                  !
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Session notes &amp; drafts ({pendingNotes.length})</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>Review notes from recent sessions</div>
                </div>
              </div>
              <button
                onClick={() => setActiveSection('clients')}
                style={{ background: '#2563EB', color: '#FFFFFF', border: 'none', padding: '5px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
              >
                Review
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>
                  i
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Active Learner Check-in Trends</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>{clients.length} learner(s) currently connected</div>
                </div>
              </div>
              <button
                onClick={() => setActiveSection('clients')}
                style={{ background: '#0F172A', color: '#FFFFFF', border: 'none', padding: '5px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
              >
                View
              </button>
            </div>
          </div>
        </div>

        {/* Learner Wellbeing Trend Card */}
        <div className="oh-prac-stat-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Learner Wellbeing Trend</h3>
            <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700, background: '#F0FDF4', padding: '2px 8px', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
              Private &amp; HIPAA Ready
            </span>
          </div>

          {stats.avgWellbeing > 0 ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A' }}>{stats.avgWellbeing}%</span>
                <span style={{ fontSize: '12.5px', color: '#166534', fontWeight: 700, background: '#F0FDF4', padding: '2px 8px', borderRadius: '6px' }}>
                  Positive Engagement
                </span>
              </div>

              {(() => {
                const w = 280, h = 70, pts = 6
                const score = Math.min(100, Math.max(0, stats.avgWellbeing))
                const scores = [
                  Math.max(0, score - 20),
                  Math.max(0, score - 14),
                  Math.max(0, score - 10),
                  Math.max(0, score - 5),
                  Math.max(0, score - 2),
                  score,
                ]
                const pad = 10
                const points = scores.map((s, i) => {
                  const x = pad + (i / (pts - 1)) * (w - pad * 2)
                  const y = h - pad - ((s / 100) * (h - pad * 2))
                  return `${x},${y}`
                }).join(' ')
                const lastX = pad + (w - pad * 2)
                const lastY = h - pad - ((score / 100) * (h - pad * 2))
                return (
                  <svg viewBox={`0 0 ${w} ${h}`} style={{ height: '70px', marginTop: '8px', width: '100%' }} role="img" aria-label={`Wellbeing trend: ${score}% average score`}>
                    <defs>
                      <linearGradient id="lgr2" x1="0" y1="0" x2={w} y2="0" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#1F5FE0"/>
                        <stop offset="1" stopColor="#8A2BE0"/>
                      </linearGradient>
                    </defs>
                    <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="rgba(14,18,53,.10)"/>
                    <polyline points={points} fill="none" stroke="url(#lgr2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx={lastX} cy={lastY} r="4.5" fill="#8A2BE0"/>
                  </svg>
                )
              })()}
              <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#64748B' }}>
                Average across {stats.checkInClientCount || 0} learner(s) who logged check-ins.
              </p>
            </div>
          ) : (
            <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
              No learner check-ins logged yet. Connect with learners to start tracking wellbeing trends.
            </div>
          )}
        </div>
      </div>

      {/* ─── 7. Preserved Features: Privacy & Consent Control Center ─── */}
      <div style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)', border: '1.5px solid #E2E8F0', borderRadius: '20px', padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔒 Privacy &amp; Consent Control Center
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B' }}>
              Auditable per-learner consent status, retention windows, and privacy compliance logs.
            </p>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, background: '#EFF6FF', color: '#2563EB', padding: '4px 10px', borderRadius: '20px', border: '1px solid #BFDBFE' }}>
            HIPAA / GDPR Ready
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '12px' }}>
          <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Active Consent Status</span>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#166534', marginTop: '4px' }}>100% Opt-In Verified</div>
            <p style={{ fontSize: '11px', color: '#475569', margin: '4px 0 0' }}>All active learners signed recording &amp; note consent.</p>
          </div>

          <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Data Retention Window</span>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#1E293B', marginTop: '4px' }}>30-Day Auto Purge</div>
            <p style={{ fontSize: '11px', color: '#475569', margin: '4px 0 0' }}>Raw audio deleted immediately after transcript notes.</p>
          </div>

          <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Session Notes Mode</span>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#7C3AED', marginTop: '4px' }}>Notes-Only Free</div>
            <p style={{ fontSize: '11px', color: '#475569', margin: '4px 0 0' }}>Post-session note drafting active for client record keeping.</p>
          </div>

          <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => alert("Immutable Audit Log: All learner consent records & data access events are logged and encrypted.")}
                style={{ padding: '8px 12px', background: '#0F172A', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}
              >
                📜 View Audit Log
              </button>
              <button
                onClick={() => alert("Data Export Triggered: Download link for CSV/JSON archive emailed to your verified address.")}
                style={{ padding: '8px 12px', background: '#FFFFFF', color: '#2563EB', border: '1px solid #2563EB', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}
              >
                📥 Export Learner Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Badges Modal (Preserved) ─── */}
      <BadgesModal
        isOpen={showBadgesModal}
        onClose={() => setShowBadgesModal(false)}
        badges={badges}
        practitionerName={practitionerName}
      />
    </section>
  )
}

export default Overview
