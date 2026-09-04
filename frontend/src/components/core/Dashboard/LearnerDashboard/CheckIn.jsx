import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { apiConnector } from '../../../../services/apiConnector'
import toast from 'react-hot-toast'
import CheckInRhythm from './CheckInRhythm'

export function CheckIn({ clientName = 'Student', practitionerName = 'your instructor', dashboardData, onCheckInSuccess, setActiveTab, onCancel }) {
  const { token } = useSelector((state) => state.auth)
  const [selectedMood, setSelectedMood] = useState('steady')
  const [sleepScore, setSleepScore] = useState(7)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else if (setActiveTab) {
      setActiveTab('journey')
    } else {
      window.history.back()
    }
  }

  const instructorTitle = practitionerName ? (practitionerName.includes('Instructor') ? practitionerName : practitionerName) : 'your instructor'

  const moods = [
    { key: 'low', label: 'Heavy', symbol: '◯' },
    { key: 'challenged', label: 'Stretched thin', symbol: '◑' },
    { key: 'steady', label: 'Steady', symbol: '◐' },
    { key: 'energetic', label: 'Lighter', symbol: '◕' },
    { key: 'peaceful', label: 'Good', symbol: '●' },
  ]

  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const checkIns = dashboardData?.checkIns || []

  // Check if check-in exists for today (ITEM 13)
  const todayDateStr = new Date().toDateString()
  const todayCheckIn = checkIns.find(
    (c) => new Date(c.createdAt).toDateString() === todayDateStr
  )

  const handleSave = async (e) => {
    e.preventDefault()
    if (!token) return

    // ITEM 11 FIX: Numeric range validation for sleep score (0 to 10)
    const numericSleep = Number(sleepScore)
    if (isNaN(numericSleep) || numericSleep < 0 || numericSleep > 10) {
      toast.error('Sleep score must be between 0 and 10.')
      return
    }

    setSaving(true)

    try {
      const response = await apiConnector(
        'POST',
        '/api/v1/checkins',
        {
          mood: selectedMood,
          sleepScore: numericSleep,
          note: note.slice(0, 500),
          isPrivate: false,
        },
        { Authorization: `Bearer ${token}` }
      )

      if (response?.data?.success) {
        setIsSaved(true)
        toast.success(response.data.message || 'Check-in saved successfully!')
        if (onCheckInSuccess) onCheckInSuccess()
      } else {
        toast.error(response?.data?.message || 'Failed to log check-in')
      }
    } catch (err) {
      console.error('Checkin submit error:', err)
      toast.error(err?.response?.data?.message || 'Could not save check-in')
    } finally {
      setSaving(false)
    }
  }

  // ITEM 12 FIX: Explicit form reset for logging another check-in
  const handleLogAnother = () => {
    setIsSaved(false)
    setNote('')
    setSleepScore(7)
    setSelectedMood('steady')
  }

  // Edit today's check-in prefill
  const handleEditToday = () => {
    if (todayCheckIn) {
      setSelectedMood(todayCheckIn.mood || 'steady')
      setSleepScore(todayCheckIn.sleepScore !== undefined ? todayCheckIn.sleepScore : 7)
      setNote(todayCheckIn.note || '')
      setIsSaved(false)
    }
  }

  return (
    <div id="checkin">
      <div className="hd" style={{ marginBottom: '18px' }}>
        <div className="k">Check in</div>
        <h1>How are you today?</h1>
        <p>Takes about fifteen seconds. {instructorTitle} can review your check-ins to track your ongoing progress.</p>
      </div>

      <CheckInRhythm
        dashboardData={dashboardData}
        onLogClick={() => {
          const formEl = document.getElementById('ciForm')
          if (formEl) formEl.scrollIntoView({ behavior: 'smooth' })
        }}
      />

      {!isSaved ? (
        <div className="ci" id="ciForm">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                title="Cancel / Go Back"
              >
                ← Back / Cancel
              </button>
              <h2 style={{ margin: 0 }}>{todayStr}</h2>
            </div>
            {todayCheckIn && (
              <span style={{ fontSize: '12px', background: '#DBEAFE', color: '#1E40AF', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
                Updating Today's Check-in
              </span>
            )}
          </div>
          <p className="sub">There's no right answer here, and nothing you pick is a problem.</p>

          <div className="fld">
            <label>Which of these is closest to how you are feeling?</label>
            <div className="moods">
              {moods.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setSelectedMood(m.key)}
                  className={`mood ${selectedMood === m.key ? 'on' : ''}`}
                >
                  <span className="e">{m.symbol}</span>
                  <b>{m.label}</b>
                </button>
              ))}
            </div>
          </div>

          <div className="fld">
            <label>How much did sleep help this week? ({sleepScore} / 10)</label>
            <input
              type="range"
              id="sl"
              min="0"
              max="10"
              value={sleepScore}
              onChange={(e) => setSleepScore(Number(e.target.value))}
            />
            <div className="rng">
              <span>Not at all (0)</span>
              <span id="slv">{sleepScore} / 10</span>
              <span>Completely (10)</span>
            </div>
          </div>

          {/* ITEM 12 & 17 FIX: Clear label, placeholder & character counter */}
          <div className="fld">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="nt" style={{ margin: 0 }}>Anything you want to note or update for this check-in? (Optional)</label>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>{note.length} / 500</span>
            </div>
            <textarea
              id="nt"
              value={note}
              maxLength={500}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Share any thoughts, feelings, or notes for your practitioner..."
              rows={3}
              style={{ color: '#0F172A', WebkitTextFillColor: '#0F172A', backgroundColor: '#FFFFFF' }}
              className="oh-intake-textarea"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
            <button className="go" id="save" onClick={handleSave} disabled={saving} style={{ margin: 0 }}>
              {saving ? 'Saving...' : todayCheckIn ? "Update today's check-in" : "Save today's check-in"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                background: 'transparent',
                color: '#CBD5E1',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '12px 24px',
                borderRadius: '999px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Cancel / Exit
            </button>
          </div>
          <p className="privacy">Only you and {practitionerName} can see this. It is never shared with your employer, your circle, or anyone else.</p>
        </div>
      ) : (
        <div
          className="done-msg"
          id="ciDone"
          style={{
            display: 'block',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
            border: '1px solid #312E81',
            borderRadius: '16px',
            padding: '24px',
            color: '#CBD5E1',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '20px' }}>✅</span>
            <b style={{ color: '#FFFFFF', fontSize: '18px', margin: 0, fontWeight: 700 }}>
              Saved to database. Thanks, {clientName}.
            </b>
          </div>
          <p style={{ margin: '0 0 18px 30px', color: '#94A3B8', fontSize: '14px', lineHeight: '1.5' }}>
            Your check-in has been logged in real-time.
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', marginLeft: '30px' }}>
            <button
              className="btn"
              onClick={handleLogAnother}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '10px 18px',
                borderRadius: '999px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Log another check-in / Reset
            </button>
            <button
              className="btn"
              onClick={handleEditToday}
              style={{
                background: '#6366F1',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '999px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Edit today's check-in
            </button>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '22px' }}>
        <div className="sechd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Your check-in log history ({checkIns.length} recorded)</h3>
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Yours only</span>
        </div>

        {checkIns.length > 0 ? (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {checkIns.slice(0, 5).map((c) => {
              const isToday = new Date(c.createdAt).toDateString() === todayDateStr
              return (
                <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: isToday ? '#EFF6FF' : '#F8FAFC', borderRadius: '10px', border: isToday ? '1px solid #BFDBFE' : '1px solid #E2E8F0', fontSize: '13px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <b style={{ textTransform: 'capitalize', color: '#0F172A' }}>{c.mood} Mood</b>
                      {isToday && <span style={{ fontSize: '10px', background: '#3B82F6', color: '#fff', padding: '2px 6px', borderRadius: '8px', fontWeight: 700 }}>Today</span>}
                    </div>
                    {c.note && <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0 0' }}>"{c.note}"</p>}
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Sleep: {c.sleepScore}/10</span>
                    <div>{new Date(c.createdAt).toLocaleDateString()}</div>
                    {isToday && (
                      <button onClick={handleEditToday} style={{ marginTop: '4px', fontSize: '11px', background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="note">No past check-ins recorded yet. Log your first check-in above!</p>
        )}
      </div>
    </div>
  )
}

export default CheckIn
