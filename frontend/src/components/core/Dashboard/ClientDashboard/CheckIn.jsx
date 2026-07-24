import React, { useState } from 'react'

export function CheckIn({ clientName = 'Priya', practitionerName = 'Meera', onCheckInSuccess }) {
  const [selectedMood, setSelectedMood] = useState('Steady')
  const [sleepScore, setSleepScore] = useState(6)
  const [note, setNote] = useState('')
  const [isSaved, setIsSaved] = useState(false)

  const moods = [
    { label: 'Heavy', symbol: '◯' },
    { label: 'Stretched thin', symbol: '◑' },
    { label: 'Steady', symbol: '◐' },
    { label: 'Lighter', symbol: '◕' },
    { label: 'Good', symbol: '●' },
  ]

  const handleSave = (e) => {
    e.preventDefault()
    setIsSaved(true)
    if (onCheckInSuccess) {
      onCheckInSuccess({ mood: selectedMood, sleepScore, note })
    }
  }

  return (
    <div id="checkin">
      <div className="hd">
        <div className="k">Check in</div>
        <h1>How are you today?</h1>
        <p>Takes about fifteen seconds. {practitionerName} sees this before your next session, so you don't have to remember it all on the day.</p>
      </div>

      {!isSaved ? (
        <div className="ci" id="ciForm">
          <h2>Tuesday, 21 July</h2>
          <p className="sub">There's no right answer here, and nothing you pick is a problem.</p>

          <div className="fld">
            <label>Which of these is closest?</label>
            <div className="moods">
              {moods.map((m) => (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => setSelectedMood(m.label)}
                  className={`mood ${selectedMood === m.label ? 'on' : ''}`}
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
              placeholder="Sunday evenings again. Not as bad as last week."
            />
          </div>

          <button className="go" id="save" onClick={handleSave}>
            Save today's check-in
          </button>
          <p className="privacy">Only you and {practitionerName} can see this. It is never shared with your employer, your circle, or anyone else.</p>
        </div>
      ) : (
        <div className="done-msg" id="ciDone" style={{ display: 'block' }}>
          <b>Saved. Thanks, {clientName}.</b>
          That's your third this week — the rhythm you set yourself. Nothing else needed today.
          <div style={{ marginTop: '18px' }}>
            <button className="btn" onClick={() => setIsSaved(false)}>
              Update check-in
            </button>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '22px' }}>
        <div className="sechd">
          <h3>Your last six weeks</h3>
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Yours only</span>
        </div>
        <svg className="hist" viewBox="0 0 620 170" role="img" aria-label="Line chart of check-in ratings">
          <defs>
            <linearGradient id="hg" x1="0" y1="0" x2="620" y2="0">
              <stop offset="0" stopColor="#1F5FE0"/>
              <stop offset="1" stopColor="#8A2BE0"/>
            </linearGradient>
          </defs>
          <line x1="30" y1="135" x2="600" y2="135" stroke="rgba(14,18,53,.10)"/>
          <line x1="30" y1="85" x2="600" y2="85" stroke="rgba(14,18,53,.07)" strokeDasharray="3 5"/>
          <line x1="30" y1="35" x2="600" y2="35" stroke="rgba(14,18,53,.07)" strokeDasharray="3 5"/>
          <path d="M50 112 L142 100 L234 118 L326 78 L418 84 L510 62 L588 54" fill="none" stroke="url(#hg)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="234" cy="118" r="4.5" fill="#4733C9"/>
          <circle cx="588" cy="54" r="5" fill="#8A2BE0"/>
          <text x="234" y="140" textAnchor="middle">a harder week</text>
          <text x="50" y="158" textAnchor="middle">Wk 1</text>
          <text x="588" y="158" textAnchor="middle">Now</text>
        </svg>
        <p className="note">Dips are information, not failure. {practitionerName} looks at the shape, not any single day.</p>
      </div>
    </div>
  )
}

export default CheckIn
