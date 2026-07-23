import React, { useState, useEffect } from 'react'
import { OHCard, OHSparkline, OHButton } from '../../../components/openhand'
import { apiConnector } from '../../../services/apiConnector'
import toast from 'react-hot-toast'

const MOODS = [
  { key: 'low', label: 'Heavy', icon: '◯' },
  { key: 'challenged', label: 'Stretched thin', icon: '◑' },
  { key: 'peaceful', label: 'Steady', icon: '◐' },
  { key: 'energetic', label: 'Lighter', icon: '◕' },
  { key: 'good', label: 'Good', icon: '●' },
]

export function CheckIn({ clientName = 'Priya', practitionerName = 'Meera' }) {
  const [selectedMood, setSelectedMood] = useState('peaceful')
  const [sleepScore, setSleepScore] = useState(6)
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sparklineData, setSparklineData] = useState([3, 4, 2, 5, 4, 6])

  useEffect(() => {
    async function loadCheckIns() {
      try {
        const res = await apiConnector('GET', '/api/v1/checkins')
        if (res?.data?.success && res.data.sparklineData) {
          setSparklineData(res.data.sparklineData)
        }
      } catch (err) {
        console.warn('CheckIn fetch error:', err)
      }
    }
    loadCheckIns()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await apiConnector('POST', '/api/v1/checkins', {
        mood: selectedMood,
        sleepScore,
        note,
        isPrivate: false,
      })

      if (res?.data?.success) {
        setSubmitted(true)
        toast.success('Check-in saved!')
      }
    } catch (err) {
      console.error('CheckIn submit error:', err)
      toast.error('Failed to save check-in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tab-view-checkin">
      <div className="tab-hd">
        <div className="k">Check in</div>
        <h1>How are you today?</h1>
        <p>Takes about fifteen seconds. {practitionerName} sees this before your next session, so you don't have to remember it all on the day.</p>
      </div>

      {submitted ? (
        <div className="done-msg" style={{ display: 'block' }}>
          <b>Saved. Thanks, {clientName}.</b>
          That's your third check-in this week — the rhythm you set yourself. Nothing else needed today.
          <div style={{ marginTop: 18 }}>
            <OHButton onClick={() => setSubmitted(false)} variant="ghost">Log another entry</OHButton>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="ci">
          <h2>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
          <p className="sub">There's no right answer here, and nothing you pick is a problem.</p>

          <div className="fld">
            <label>Which of these is closest?</label>
            <div className="moods">
              {MOODS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  className={`mood ${selectedMood === m.key ? 'on' : ''}`}
                  onClick={() => setSelectedMood(m.key)}
                >
                  <span className="e">{m.icon}</span>
                  <b>{m.label}</b>
                </button>
              ))}
            </div>
          </div>

          <div className="fld">
            <label>How much did sleep help this week?</label>
            <input
              type="range"
              min="1"
              max="10"
              value={sleepScore}
              onChange={(e) => setSleepScore(e.target.value)}
            />
            <div className="rng">
              <span>Not at all</span>
              <span>{sleepScore} / 10</span>
              <span>Completely</span>
            </div>
          </div>

          <div className="fld">
            <label>Anything you want to put down? (Optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Sunday evenings again. Not as bad as last week."
            />
          </div>

          <OHButton type="submit" disabled={loading} size="lg">
            {loading ? 'Saving…' : "Save today's check-in"}
          </OHButton>

          <p className="privacy">
            Only you and {practitionerName} can see this. It is never shared with your employer, your circle, or anyone else.
          </p>
        </form>
      )}

      {/* History Telemetry Card */}
      <OHCard surface="white" pad="lg" style={{ marginTop: 24 }}>
        <div className="sechd">
          <h3>Your last six weeks</h3>
          <span style={{ fontSize: 13, color: 'var(--oh-muted)' }}>Yours only</span>
        </div>

        <OHSparkline data={sparklineData} width={600} height={140} ariaLabel="Check-in mood rating history sparkline" />

        <p className="note">Dips are information, not failure. {practitionerName} looks at the shape, not any single day.</p>
      </OHCard>
    </div>
  )
}

export default CheckIn
