import React, { useState } from 'react'

export function SessionsResources({ practitionerName = 'Meera' }) {
  const [selectedNotes, setSelectedNotes] = useState(null)

  return (
    <div id="sessions">
      <div className="hd">
        <div className="k">Sessions &amp; resources</div>
        <h1>Everything in one place</h1>
        <p>Your bookings, your recordings where you've agreed to them, and whatever {practitionerName} has shared with you.</p>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="sechd"><h3>Coming up</h3><a href="#">Book another →</a></div>
        <div className="srow">
          <div className="sdate"><b>24</b><span>Jul</span></div>
          <div className="info"><b>1:1 with Dr. Meera Iyer</b><span>Session 4 · 60 minutes · 10:00 am</span></div>
          <div className="go"><span className="pill up">Confirmed</span></div>
        </div>
        <div className="srow">
          <div className="sdate"><b>04</b><span>Aug</span></div>
          <div className="info"><b>Anxiety circle — week 1</b><span>Group · 90 minutes · 7:00 pm</span></div>
          <div className="go"><span className="pill up">Confirmed</span></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="sechd"><h3>Past sessions</h3></div>
        <div className="srow">
          <div className="sdate"><b>08</b><span>Jul</span></div>
          <div className="info"><b>Session 3</b><span>60 minutes · notes shared with you</span></div>
          <div className="go">
            <button className="mini" onClick={() => setSelectedNotes('Session 3: Worked on Sunday-evening maps and breathing exercises.')}>Read notes</button>
          </div>
        </div>
        <div className="srow">
          <div className="sdate"><b>01</b><span>Jul</span></div>
          <div className="info"><b>Session 2</b><span>60 minutes</span></div>
          <div className="go"><span className="pill past">Completed</span></div>
        </div>
        <div className="srow">
          <div className="sdate"><b>17</b><span>Jun</span></div>
          <div className="info"><b>Session 1</b><span>60 minutes · first session</span></div>
          <div className="go"><span className="pill past">Completed</span></div>
        </div>
        <p className="note">Meera chooses what to share with you. Anything not shared stays in her private notes — that's normal clinical practice.</p>
      </div>

      <div className="card">
        <div className="sechd"><h3>Shared with you</h3></div>
        <div className="res">
          <div className="rc"><div className="ty">Reading</div><b>What regulation actually means</b><span>10 min · shared 20 July</span></div>
          <div className="rc"><div className="ty">Audio</div><b>Four-count breathing</b><span>6 min · shared 8 July</span></div>
          <div className="rc"><div className="ty">Worksheet</div><b>Sunday-evening map</b><span>PDF · shared 1 July</span></div>
        </div>
      </div>

      {selectedNotes && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(14,18,53,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ maxWidth: '480px', width: '90%' }}>
            <h3 style={{ marginBottom: '12px' }}>Session Notes</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '18px' }}>{selectedNotes}</p>
            <button className="btn" onClick={() => setSelectedNotes(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SessionsResources
