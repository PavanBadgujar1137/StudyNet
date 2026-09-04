import React, { useState } from 'react'

export function CheckInRhythm({ dashboardData, onLogClick }) {
  const checkIns = dashboardData?.checkIns || []
  const streak = dashboardData?.streak || 0
  const checkInCount = dashboardData?.checkInCount || checkIns.length || 0

  // Calculate current week's 7 days: Monday to Sunday
  const getWeekDays = () => {
    const now = new Date()
    const currentDayOfWeek = now.getDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const distanceToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1

    const monday = new Date(now)
    monday.setDate(now.getDate() - distanceToMonday)
    monday.setHours(0, 0, 0, 0)

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    return dayNames.map((dayName, idx) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + idx)
      const dateString = d.toDateString()
      return {
        dayName,
        date: d,
        dateString,
        isToday: dateString === now.toDateString(),
      }
    })
  }

  const weekDays = getWeekDays()
  const todayDay = weekDays.find((d) => d.isToday) || weekDays[0]

  // Default selected day to today
  const [selectedDayStr, setSelectedDayStr] = useState(todayDay.dateString)

  const selectedDayObj = weekDays.find((d) => d.dateString === selectedDayStr) || todayDay

  // Find check-in for a given day object (matches current week date first, then falls back to weekday name)
  const findCheckInForDay = (dayObj) => {
    if (!dayObj) return null
    // 1. Exact match by dateString for current week
    const exactMatch = checkIns.find((c) => new Date(c.createdAt).toDateString() === dayObj.dateString)
    if (exactMatch) return exactMatch

    // 2. Fallback: match by day of week name from all recorded check-ins
    const targetDayName = dayObj.dayName.toLowerCase()
    return checkIns.find((c) => {
      const cDayName = new Date(c.createdAt).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
      return cDayName === targetDayName
    })
  }

  const selectedCheckIn = findCheckInForDay(selectedDayObj)

  const moodMap = {
    low: { label: 'Heavy', symbol: '◯', color: '#64748B', bg: '#F1F5F9' },
    challenged: { label: 'Stretched thin', symbol: '◑', color: '#D97706', bg: '#FEF3C7' },
    steady: { label: 'Steady', symbol: '◐', color: '#2563EB', bg: '#EFF6FF' },
    energetic: { label: 'Lighter', symbol: '◕', color: '#7C3AED', bg: '#F3E8FF' },
    peaceful: { label: 'Good', symbol: '●', color: '#16A34A', bg: '#DCFCE7' },
  }

  return (
    <div className="card rhythm-card" style={{ marginBottom: '22px' }}>
      <div className="sechd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>Your check-in rhythm</h3>
        <span style={{ fontSize: '13px', color: '#64748B' }}>
          Current streak: <b style={{ color: '#0F172A' }}>{streak} day{streak !== 1 ? 's' : ''}</b> ({checkInCount} total check-ins)
        </span>
      </div>

      <div className="streak">
        {weekDays.map((day) => {
          const checkIn = findCheckInForDay(day)
          const isSelected = day.dateString === selectedDayStr
          const hasCheckIn = !!checkIn

          return (
            <button
              key={day.dayName}
              type="button"
              onClick={() => setSelectedDayStr(day.dateString)}
              className={`sd ${day.isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasCheckIn ? 'has-checkin' : ''}`}
              title={`${day.dayName} (${day.date.toLocaleDateString()}) - ${hasCheckIn ? 'Check-in Logged' : 'No Check-in'}`}
              aria-label={`Select ${day.dayName}`}
            >
              <span className="sd-name">{day.dayName}</span>
              {hasCheckIn && <span className="sd-badge">✓</span>}
            </button>
          )
        })}
      </div>

      {/* Detail panel for selected day */}
      <div className="rhythm-detail-panel" style={{
        marginTop: '16px',
        padding: '16px 18px',
        borderRadius: '14px',
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        transition: 'all 0.2s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B', fontWeight: 700 }}>
              {selectedDayObj.dayName}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
              {selectedDayObj.date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              {selectedDayObj.isToday && (
                <span style={{ marginLeft: '8px', fontSize: '11px', background: '#8A2BE0', color: '#FFF', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                  Today
                </span>
              )}
            </div>
          </div>

          <div>
            {selectedCheckIn ? (
              <span style={{ fontSize: '12px', background: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC', padding: '4px 12px', borderRadius: '12px', fontWeight: 700 }}>
                ✓ Check-in Logged
              </span>
            ) : (
              <span style={{ fontSize: '12px', background: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1', padding: '4px 12px', borderRadius: '12px', fontWeight: 600 }}>
                No Check-in
              </span>
            )}
          </div>
        </div>

        {selectedCheckIn ? (
          <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Mood:</span>
                {moodMap[selectedCheckIn.mood] ? (
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: moodMap[selectedCheckIn.mood].color,
                    background: moodMap[selectedCheckIn.mood].bg,
                    padding: '3px 10px',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>{moodMap[selectedCheckIn.mood].symbol}</span>
                    <span>{moodMap[selectedCheckIn.mood].label}</span>
                  </span>
                ) : (
                  <b style={{ textTransform: 'capitalize', color: '#0F172A', fontSize: '13px' }}>{selectedCheckIn.mood}</b>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Sleep Score:</span>
                <b style={{ color: '#0F172A', fontSize: '13px' }}>{selectedCheckIn.sleepScore !== undefined ? selectedCheckIn.sleepScore : 7} / 10</b>
              </div>
            </div>

            {selectedCheckIn.note && (
              <div style={{ fontSize: '13px', color: '#334155', background: '#FFFFFF', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontStyle: 'italic' }}>
                "{selectedCheckIn.note}"
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
              Missed a day? Nothing breaks. Come back whenever — the point is the noticing, not the streak.
            </p>
            {selectedDayObj.isToday && onLogClick && (
              <button
                type="button"
                onClick={onLogClick}
                style={{
                  background: '#8A2BE0',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Log Today's Check-in →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckInRhythm
