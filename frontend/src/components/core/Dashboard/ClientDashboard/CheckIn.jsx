import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { apiConnector } from '../../../../services/apiConnector'
import toast from 'react-hot-toast'

export function CheckIn({ clientName = 'Student', practitionerName = 'your instructor', dashboardData, onCheckInSuccess }) {
  const { token } = useSelector((state) => state.auth)
  const [selectedMood, setSelectedMood] = useState('steady')
  const [sleepScore, setSleepScore] = useState(7)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const instructorTitle = practitionerName ? (practitionerName.includes('Instructor') ? practitionerName : `Dr. ${practitionerName}`) : 'your instructor'

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

  const handleSave = async (e) => {
    e.preventDefault()
    if (!token) return
    setSaving(true)

    try {
      const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:4000/api/v1'
      const response = await apiConnector(
        'POST',
        `${BASE_URL}/checkins`,
        {
          mood: selectedMood,
          sleepScore,
          note,
          isPrivate: false,
        },
        { Authorization: `Bearer ${token}` }
      )

      if (response?.data?.success) {
        setIsSaved(true)
        toast.success(response.data.message || 'Check-in logged successfully!')
        if (onCheckInSuccess) onCheckInSuccess()
      } else {
        toast.error(response?.data?.message || 'Failed to log check-in')
      }
    } catch (err) {
      console.error('Checkin submit error:', err)
      toast.error('Could not save check-in')
    } finally {
      setSaving(false)
    }
  }

  const checkIns = dashboardData?.checkIns || []

  return (
    <div id="checkin">
      <div className="hd">
        <div className="k">Check in</div>
        <h1>How are you today?</h1>
        <p>Takes about fifteen seconds. {instructorTitle} can review your check-ins to track your ongoing progress.</p>
      </div>

      {!isSaved ? (
        <div className="ci" id="ciForm">
          <h2>{todayStr}</h2>
          <p className="sub">There's no right answer here, and nothing you pick is a problem.</p>

          <div className="fld">
            <label>Which of these is closest?</label>
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
            <label>How much did sleep help this week?</label>
            <input
              type="range"
              id="sl"
              min="0"
              max="10"
              value={sleepScore}
              onChange={(e) => setSleepScore(Number(e.target.value))}
            />
            <div className="rng">
              <span>Not at all</span>
              <span id="slv">{sleepScore} / 10</span>
              <span>Completely</span>
            </div>
          </div>

          <div className="fld">
            <label>Anything you want to put down? (Optional)</label>
            <textarea
              id="nt"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How are you feeling today?"
            />
          </div>

          <button className="go" id="save" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : "Save today's check-in"}
          </button>
          <p className="privacy">Only you and {practitionerName} can see this. It is never shared with your employer, your circle, or anyone else.</p>
        </div>
      ) : (
        <div className="done-msg" id="ciDone" style={{ display: 'block' }}>
          <b>Saved to database. Thanks, {clientName}.</b>
          Your check-in has been logged in real-time.
          <div style={{ marginTop: '18px' }}>
            <button className="btn" onClick={() => setIsSaved(false)}>
              Log another check-in
            </button>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '22px' }}>
        <div className="sechd">
          <h3>Your check-in log history ({checkIns.length} recorded)</h3>
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Yours only</span>
        </div>

        {checkIns.length > 0 ? (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {checkIns.slice(0, 5).map((c) => (
              <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '13px' }}>
                <div>
                  <b style={{ textTransform: 'capitalize', color: '#0F172A' }}>{c.mood} Mood</b>
                  {c.note && <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>"{c.note}"</p>}
                </div>
                <div style={{ textAlign: 'right', fontSize: '11px', color: '#94A3B8' }}>
                  <span>Sleep: {c.sleepScore}/10</span>
                  <div>{new Date(c.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="note">No past check-ins recorded yet. Log your first check-in above!</p>
        )}
      </div>
    </div>
  )
}

export default CheckIn
