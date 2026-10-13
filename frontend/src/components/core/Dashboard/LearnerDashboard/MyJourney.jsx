import React, { useState } from 'react'
import {
  FiCheck,
  FiTarget,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiLock,
  FiCheckSquare,
  FiSmile,
  FiUserCheck,
  FiVideo,
} from 'react-icons/fi'
import toast from 'react-hot-toast'

// Imported exact assets
import heroJourneyImg from '../../../../assets/Images/learner_hero_journey.jpg'
import auraRobotImg from '../../../../assets/Images/aura_robot_avatar.jpg'
import planetAvatarImg from '../../../../assets/Images/planet_checkin_avatar.jpg'
import quoteSunsetImg from '../../../../assets/Images/quote_sunset_mountains.jpg'

export function MyJourney({ clientName = 'Student', practitionerName = 'your instructor', dashboardData, loading, setActiveTab }) {
  const apiCheckIns = dashboardData?.checkIns || []
  let localCheckIns = []
  try {
    const saved = localStorage.getItem('op_local_checkins')
    if (saved) localCheckIns = JSON.parse(saved)
  } catch (e) {}

  let localJoinedCircles = []
  try {
    const savedCircles = localStorage.getItem('op_joined_circles')
    if (savedCircles) localJoinedCircles = JSON.parse(savedCircles)
  } catch (e) {}

  const checkIns = [...localCheckIns, ...apiCheckIns.filter((ac) => !localCheckIns.some((lc) => lc._id === ac._id))]
  const checkInCount = Math.max(dashboardData?.checkInCount || 0, checkIns.length)
  const streak = Math.max(dashboardData?.streak || 0, checkIns.length > 0 ? 1 : 0)
  const enrolledCourses = dashboardData?.enrolledCourses || []
  const rawJoinedCircles = dashboardData?.joinedCircles || dashboardData?.memberships || []
  const hasJoinedCircle = rawJoinedCircles.length > 0 || localJoinedCircles.length > 0

  // Calculate Monday of current week to make weekdays dynamic
  const getWeekDays = () => {
    const now = new Date()
    const currentDay = now.getDay() // 0 = Sun, 1 = Mon ...
    const distanceToMon = currentDay === 0 ? 6 : currentDay - 1
    const mon = new Date(now)
    mon.setDate(now.getDate() - distanceToMon)
    mon.setHours(0, 0, 0, 0)

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    return dayNames.map((dayName, idx) => {
      const d = new Date(mon)
      d.setDate(mon.getDate() + idx)
      return {
        dayName,
        date: d,
        dateString: d.toDateString(),
        formattedDate: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        isToday: d.toDateString() === now.toDateString(),
      }
    })
  }

  const weekDays = getWeekDays()
  const todayDay = weekDays.find((d) => d.isToday) || weekDays[0]

  // Selected Day State (defaults to today)
  const [selectedDayName, setSelectedDayName] = useState(todayDay.dayName)
  const selectedDayObj = weekDays.find((d) => d.dayName === selectedDayName) || todayDay

  // Check if a check-in exists for the selected day
  const selectedDayCheckIn = checkIns.find(
    (c) => new Date(c.createdAt).toDateString() === selectedDayObj.dateString
  )

  // Interactive Calendar Selected Date
  const [selectedCalDay, setSelectedCalDay] = useState(12)

  // Calculate Dynamic Progress (out of 5 steps)
  let completedSteps = 1 // Step 1: Account created
  if (checkInCount > 0) completedSteps++
  if (enrolledCourses.length > 0) completedSteps++
  if (dashboardData?.practitioner) completedSteps++
  if (hasJoinedCircle) completedSteps++
  const progressPct = Math.round((completedSteps / 5) * 100)

  const handleWaypointClick = (name) => {
    toast.success(`Milestone focus: ${name}! Keep building your rhythm. ✨`, { icon: '🎯' })
  }

  return (
    <div id="journey" style={{ color: '#0F172A' }}>
      {/* ─── 1. TOP HERO SECTION ─── */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '24px',
          padding: '24px 28px',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'stretch',
          minHeight: '220px',
        }}
      >
        {/* Left Side: Text Greeting & Breadcrumb */}
        <div style={{ zIndex: 3, maxWidth: '440px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B', marginBottom: '14px', fontWeight: 600 }}>
            <span>🏠</span>
            <span>Dashboard</span>
            <span style={{ color: '#CBD5E1' }}>›</span>
            <span style={{ color: '#475569' }}>My Journey</span>
          </div>

          <h1 style={{ fontSize: '34px', fontWeight: 800, color: '#0F172A', margin: '0 0 10px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Hello, {clientName} <span>👋</span>
          </h1>

          <p style={{ margin: 0, fontSize: '14px', color: '#64748B', lineHeight: 1.6 }}>
            Here's your personal learning path — kept private to you and your practitioner. No score, no comparison, just progress at your own pace.
          </p>
        </div>

        {/* Right Side: Scenic Image & Connected Floating Waypoints */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '64%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '24px',
          }}
        >
          {/* Background Scenic Landscape with Soft Gradient Fade */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${heroJourneyImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 40%',
            }}
          />
          {/* Subtle gradient overlay to blend into left white content */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, #FFFFFF 0%, rgba(255,255,255,0.7) 18%, rgba(15,23,42,0.2) 60%, rgba(15,23,42,0.65) 100%)',
            }}
          />

          {/* Connected SVG Path */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: '12%',
              width: '65%',
              height: '100%',
              zIndex: 2,
              pointerEvents: 'none',
            }}
            viewBox="0 0 400 200"
            fill="none"
          >
            <path
              d="M 40 140 Q 120 80, 200 95 T 360 70"
              stroke="rgba(255, 255, 255, 0.85)"
              strokeWidth="2.5"
              strokeDasharray="6 4"
            />
          </svg>

          {/* Floating Waypoint Bubbles */}
          <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 3 }}>
            {/* Waypoint 1: Better Habits */}
            <div
              onClick={() => handleWaypointClick('Better Habits')}
              style={{
                position: 'absolute',
                top: '60%',
                left: '26%',
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Better<br />Habits
            </div>

            {/* Waypoint 2: Deeper Learning */}
            <div
              onClick={() => handleWaypointClick('Deeper Learning')}
              style={{
                position: 'absolute',
                top: '28%',
                left: '42%',
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Deeper<br />Learning
            </div>

            {/* Waypoint 3: Calmer Mind */}
            <div
              onClick={() => handleWaypointClick('Calmer Mind')}
              style={{
                position: 'absolute',
                top: '20%',
                left: '58%',
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Calmer<br />Mind
            </div>

            {/* Waypoint 4: Brighter You */}
            <div
              onClick={() => handleWaypointClick('Brighter You')}
              style={{
                position: 'absolute',
                top: '28%',
                left: '73%',
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Brighter<br />You
            </div>

            {/* Quote Card on Right Edge */}
            <div
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                maxWidth: '150px',
                color: '#FFFFFF',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '13.5px', fontWeight: 600, lineHeight: 1.45, textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>
                “Small steps every day create big changes.”
              </div>
              <div style={{ width: '40px', height: '3px', background: '#A855F7', borderRadius: '999px', marginTop: '12px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. ROW OF 4 TELEMETRY CARDS ─── */}
      <div className="exact-telemetry-grid">
        {/* Card 1: Check-ins */}
        <div
          className="exact-stat-card"
          onClick={() => setActiveTab && setActiveTab('checkin')}
          style={{ cursor: 'pointer' }}
          title="Click to view daily check-in logs"
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: '#F3E8FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9333EA',
              fontSize: '22px',
            }}
          >
            <FiCalendar />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '2px' }}>
              Check-ins
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
              {checkInCount}
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
              Total check-ins so far
            </div>
          </div>
        </div>

        {/* Card 2: Current streak */}
        <div
          className="exact-stat-card"
          onClick={() => setActiveTab && setActiveTab('checkin')}
          style={{ cursor: 'pointer' }}
          title="Click to build and view streak"
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: '#FFEDD5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EA580C',
              fontSize: '22px',
            }}
          >
            🔥
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '2px' }}>
              Current streak
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
              {streak} days
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
              Keep going, you've got this!
            </div>
          </div>
        </div>

        {/* Card 3: Journey progress */}
        <div
          className="exact-stat-card"
          onClick={() => {
            const el = document.querySelector('.exact-steps-container')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }}
          style={{ cursor: 'pointer' }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB',
              fontSize: '22px',
            }}
          >
            <FiTarget />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '2px' }}>
              Journey progress
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
              {completedSteps} of 5
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <div style={{ flex: 1, height: '6px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, #6366F1, #A855F7)', borderRadius: '999px', transition: 'width 0.4s ease' }} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B' }}>{progressPct}%</span>
            </div>
          </div>
        </div>

        {/* Card 4: Talk to AURA (Dark Midnight Card) */}
        <div
          onClick={() => setActiveTab && setActiveTab('aura')}
          style={{
            background: 'linear-gradient(135deg, #0F1538 0%, #161D48 100%)',
            border: '1px solid #232D68',
            borderRadius: '18px',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 18px rgba(10, 14, 39, 0.3)',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          {/* Robot Avatar Image */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
            }}
          >
            <img src={auraRobotImg} alt="AURA Robot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', marginBottom: '2px' }}>
              Talk to AURA ✨
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.35 }}>
              Your personal AI learning counselor
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              if (setActiveTab) setActiveTab('aura')
            }}
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '7px 14px',
              borderRadius: '10px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.35)',
            }}
          >
            Chat now →
          </button>
        </div>
      </div>

      {/* ─── 3. LOWER SECTION: 2-COLUMN GRID ─── */}
      <div className="exact-bottom-grid">
        {/* LEFT COLUMN: Rhythm Card & 5-Step Learning Journey */}
        <div>
          {/* Dark Rhythm Card */}
          <div className="exact-rhythm-card">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(124, 58, 237, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A855F7', fontSize: '18px' }}>
                  <FiCalendar />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
                    Your check-in rhythm
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#8A96C2' }}>
                    A simple daily check-in to track your mood and sleep rhythm. Consistency helps you understand yourself better.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#8A96C2', background: 'rgba(255, 255, 255, 0.05)', padding: '5px 12px', borderRadius: '8px' }}>
                <span>Current streak: <b style={{ color: '#FFFFFF' }}>{streak} days</b> ({checkInCount} total check-ins)</span>
                <span>📊</span>
              </div>
            </div>

            {/* Weekday Selection Pills */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {weekDays.map((d) => {
                const isActive = selectedDayName === d.dayName
                const hasEntry = checkIns.some((c) => new Date(c.createdAt).toDateString() === d.dateString)
                return (
                  <button
                    key={d.dayName}
                    onClick={() => setSelectedDayName(d.dayName)}
                    className={`exact-day-btn ${isActive ? 'active' : ''}`}
                    style={hasEntry && !isActive ? { borderColor: '#10B981', color: '#A7F3D0' } : {}}
                  >
                    {d.dayName} {hasEntry ? '✓' : ''}
                  </button>
                )
              })}
            </div>

            {/* Inner Dark Details Box */}
            <div
              style={{
                background: '#080C26',
                border: '1px solid #1C2456',
                borderRadius: '16px',
                padding: '20px 22px',
              }}
            >
              {/* Day Date Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#8A96C2', letterSpacing: '0.06em' }}>
                    {selectedDayObj.dayName.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                    {selectedDayObj.formattedDate}
                  </span>
                  {selectedDayObj.isToday && (
                    <span style={{ background: '#7C3AED', color: '#FFFFFF', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                      Today
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '12px', color: selectedDayCheckIn ? '#34D399' : '#6A78A5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{selectedDayCheckIn ? '●' : '◯'}</span>
                  <span>{selectedDayCheckIn ? `Logged (${selectedDayCheckIn.mood || 'Saved'})` : 'No Check-in yet'}</span>
                </div>
              </div>

              {/* Body: Planet Avatar, Message, Action Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '260px' }}>
                  {/* Planet Artwork */}
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      flexShrink: 0,
                      boxShadow: '0 4px 16px rgba(168, 85, 247, 0.35)',
                    }}
                  >
                    <img src={planetAvatarImg} alt="Checkin Planet" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', marginBottom: '3px' }}>
                      {selectedDayCheckIn ? 'Check-in logged for this day!' : 'No check-in yet'}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#8A96C2', lineHeight: 1.45, maxWidth: '440px' }}>
                      {selectedDayCheckIn
                        ? `Mood: ${selectedDayCheckIn.mood} · Sleep: ${selectedDayCheckIn.sleepScore ?? 'N/A'}/10 ${selectedDayCheckIn.note ? `· "${selectedDayCheckIn.note}"` : ''}`
                        : 'Missed a day? Nothing breaks. Come back whenever — the point is the noticing, not the streak.'}
                    </div>
                  </div>
                </div>

                {/* Log Check-in Button */}
                <button
                  onClick={() => setActiveTab && setActiveTab('checkin')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 6px 20px rgba(139, 92, 246, 0.45)',
                  }}
                >
                  <span>✨</span> {selectedDayCheckIn ? "Update Check-in →" : "Log Today's Check-in →"}
                </button>
              </div>
            </div>
          </div>

          {/* 5-Step Learning Journey Section */}
          <div className="exact-steps-container">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333EA', fontSize: '18px' }}>
                  <FiTarget />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                    Your learning journey
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                    Complete these steps to set up your personalized learning experience.
                  </p>
                </div>
              </div>

              <span
                onClick={() => setActiveTab && setActiveTab('checkin')}
                style={{ fontSize: '12.5px', fontWeight: 700, color: '#2563EB', cursor: 'pointer' }}
              >
                View all steps →
              </span>
            </div>

            {/* 5 Horizontal Steps */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', alignItems: 'stretch' }}>
              {/* Step 1: Completed */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '16px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)',
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', marginBottom: '10px' }}>
                  <FiCheck />
                </div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  STEP 1
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', margin: '4px 0 10px', minHeight: '36px' }}>
                  Create your OpenHand account
                </div>
                <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', marginTop: 'auto' }}>
                  Completed
                </span>
              </div>

              {/* Step 2: In Progress */}
              <div
                onClick={() => setActiveTab && setActiveTab('checkin')}
                style={{
                  background: '#FFFFFF',
                  border: '2px solid #8B5CF6',
                  borderRadius: '14px',
                  padding: '16px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  boxShadow: '0 4px 14px rgba(139, 92, 246, 0.15)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'transparent', border: '2px solid #8B5CF6', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, marginBottom: '10px' }}>
                  2
                </div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#8B5CF6', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  STEP 2
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', margin: '4px 0 10px', minHeight: '36px' }}>
                  Daily Check-in Rhythm
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (setActiveTab) setActiveTab('checkin')
                  }}
                  style={{
                    background: '#F3E8FF',
                    color: '#7C3AED',
                    border: '1px solid #DDD6FE',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 12px',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    marginTop: 'auto',
                  }}
                >
                  Start now
                </button>
              </div>

              {/* Step 3: Explore Courses & Resources */}
              <div
                onClick={() => setActiveTab && setActiveTab('courses')}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '16px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#93C5FD')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E2E8F0')}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: enrolledCourses.length > 0 ? '#10B981' : '#E2E8F0', color: enrolledCourses.length > 0 ? '#FFFFFF' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', marginBottom: '10px' }}>
                  {enrolledCourses.length > 0 ? <FiCheck /> : <FiLock />}
                </div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  STEP 3
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#475569', margin: '4px 0', minHeight: '36px' }}>
                  Explore Courses &amp; Resources
                </div>
              </div>

              {/* Step 4: Connect with Practitioners */}
              <div
                onClick={() => setActiveTab && setActiveTab('practitioners')}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '16px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#93C5FD')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E2E8F0')}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: dashboardData?.practitioner ? '#10B981' : '#E2E8F0', color: dashboardData?.practitioner ? '#FFFFFF' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', marginBottom: '10px' }}>
                  {dashboardData?.practitioner ? <FiCheck /> : <FiLock />}
                </div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  STEP 4
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#475569', margin: '4px 0', minHeight: '36px' }}>
                  Connect with Practitioners
                </div>
              </div>

              {/* Step 5: Join a Circle */}
              <div
                onClick={() => setActiveTab && setActiveTab('circle')}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '16px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#93C5FD')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E2E8F0')}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: hasJoinedCircle ? '#10B981' : '#E2E8F0', color: hasJoinedCircle ? '#FFFFFF' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', marginBottom: '10px' }}>
                  {hasJoinedCircle ? <FiCheck /> : <FiLock />}
                </div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  STEP 5
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#475569', margin: '4px 0', minHeight: '36px' }}>
                  Join a Circle &amp; Community
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Calendar Card, Quick Actions & Sunset Quote */}
        <div>
          {/* Dark Calendar Card */}
          <div className="exact-dark-side-card">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                October 2026
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => toast("Viewing previous month")}
                  style={{ background: 'transparent', border: 'none', color: '#8A96C2', cursor: 'pointer', padding: '2px' }}
                >
                  <FiChevronLeft fontSize={16} />
                </button>
                <button
                  onClick={() => toast("Viewing next month")}
                  style={{ background: 'transparent', border: 'none', color: '#8A96C2', cursor: 'pointer', padding: '2px' }}
                >
                  <FiChevronRight fontSize={16} />
                </button>
              </div>
            </div>

            {/* Calendar Days Matrix */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', fontSize: '11px' }}>
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <span key={d} style={{ color: '#6A78A5', fontWeight: 700, paddingBottom: '4px' }}>
                  {d}
                </span>
              ))}

              {/* Days of Month */}
              {[
                { day: 27, muted: true }, { day: 28, muted: true }, { day: 29, muted: true }, { day: 30, muted: true },
                { day: 1 }, { day: 2 }, { day: 3 },
                { day: 4 }, { day: 5 }, { day: 6 }, { day: 7 }, { day: 8 }, { day: 9 }, { day: 10 },
                { day: 11 }, { day: 12, highlight: true }, { day: 13 }, { day: 14 }, { day: 15 }, { day: 16 }, { day: 17 },
                { day: 18 }, { day: 19 }, { day: 20 }, { day: 21 }, { day: 22 }, { day: 23 }, { day: 24 },
                { day: 25 }, { day: 26 }, { day: 27 }, { day: 28 }, { day: 29 }, { day: 30 }, { day: 31 },
              ].map((item, idx) => {
                const isSelected = selectedCalDay === item.day && !item.muted
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!item.muted) {
                        setSelectedCalDay(item.day)
                        toast(`Selected Oct ${item.day}, 2026`)
                      }
                    }}
                    style={{
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      color: item.highlight || isSelected ? '#FFFFFF' : item.muted ? '#434E75' : '#8A96C2',
                      background: item.highlight || isSelected ? '#7C3AED' : 'transparent',
                      fontWeight: item.highlight || isSelected ? 800 : 600,
                      boxShadow: item.highlight || isSelected ? '0 0 12px rgba(124, 58, 237, 0.6)' : 'none',
                      cursor: item.muted ? 'default' : 'pointer',
                    }}
                  >
                    {item.day}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="exact-dark-side-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 800, color: '#FFFFFF', marginBottom: '14px' }}>
              <span>🧭</span> Quick Actions
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Action 1: Log Check-in */}
              <div
                onClick={() => setActiveTab && setActiveTab('checkin')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.15)', color: '#F472B6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>
                    <FiCheckSquare />
                  </div>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFFFFF' }}>
                      Log Check-in
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#8A96C2' }}>
                      Track your mood today
                    </div>
                  </div>
                </div>
                <span style={{ color: '#8A96C2', fontSize: '13px' }}>→</span>
              </div>

              {/* Action 2: Talk to AURA */}
              <div
                onClick={() => setActiveTab && setActiveTab('aura')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>
                    <FiSmile />
                  </div>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFFFFF' }}>
                      Talk to AURA
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#8A96C2' }}>
                      Get personal guidance
                    </div>
                  </div>
                </div>
                <span style={{ color: '#8A96C2', fontSize: '13px' }}>→</span>
              </div>

              {/* Action 3: Find a Practitioner */}
              <div
                onClick={() => setActiveTab && setActiveTab('practitioners')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>
                    <FiUserCheck />
                  </div>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFFFFF' }}>
                      Find a Practitioner
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#8A96C2' }}>
                      Connect with experts
                    </div>
                  </div>
                </div>
                <span style={{ color: '#8A96C2', fontSize: '13px' }}>→</span>
              </div>

              {/* Action 4: Explore Courses */}
              <div
                onClick={() => setActiveTab && setActiveTab('courses')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>
                    <FiVideo />
                  </div>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFFFFF' }}>
                      Explore Courses
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#8A96C2' }}>
                      Continue learning
                    </div>
                  </div>
                </div>
                <span style={{ color: '#8A96C2', fontSize: '13px' }}>→</span>
              </div>
            </div>
          </div>

          {/* Inspirational Sunset Quote Card */}
          <div
            style={{
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              height: '130px',
              boxShadow: '0 8px 25px rgba(10, 14, 39, 0.3)',
            }}
          >
            {/* Background image */}
            <img
              src={quoteSunsetImg}
              alt="Sunset mountains"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Dark gradient overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.75) 100%)',
              }}
            />
            {/* Quote content */}
            <div style={{ position: 'absolute', inset: 0, padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: '#FFFFFF' }}>
              <div style={{ fontSize: '20px', lineHeight: 1, opacity: 0.8, marginBottom: '2px' }}>
                “
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                Progress,<br />not perfection.”
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyJourney
