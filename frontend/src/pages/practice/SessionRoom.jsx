import React, { useState } from 'react'
import toast from 'react-hot-toast'

export function SessionRoom({ practitionerName = 'Meera' }) {
  const [copilotEnabled, setCopilotEnabled] = useState(true)
  const [suggestions] = useState([
    {
      id: 1,
      kind: 'Try asking',
      text: '"You said \'I should be over it by now\' — whose voice is the \'should\' in?"',
      actions: ['Use', 'Not now'],
    },
    {
      id: 2,
      kind: 'Pattern across sessions',
      text: 'Third time work has come up right after family. Worth naming the link?',
      actions: ['Flag for notes'],
    },
    {
      id: 3,
      kind: 'Technique that fits',
      text: "Two-chair work — she's holding both sides herself. Script ready.",
      actions: ['Open script', 'Save'],
    },
  ])

  const handleEndSession = () => {
    toast.success('Session ended! Generating post-session draft notes with Co-Pilot...')
  }

  return (
    <div className="practice-sec-room">
      <div className="htop">
        <div>
          <div className="crumb">Live session</div>
          <h1>Priya S. — Session 3</h1>
          <p>Consent given at 00:00 · recording will delete in 30 days</p>
        </div>
        <button type="button" className="btn-g" onClick={handleEndSession}>
          End &amp; draft notes
        </button>
      </div>

      <div className="room">
        {/* Stage Video Frame */}
        <div className="stage">
          <div className="bar">
            <span className="livep"><i /> Live</span>
            <span className="t">24:16 · 60 min booked</span>
          </div>

          <div className="vid">
            <div className="ini">PS</div>
          </div>

          <div className="self">You ({practitionerName.split(' ')[0]})</div>

          {/* Room Controls */}
          <div className="ctrls">
            <div className="ctrl" title="Mute Microphone">
              <svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3ZM19 10v2a7 7 0 0 1-14 0v-2M12 19v4"/></svg>
            </div>
            <div className="ctrl" title="Toggle Camera">
              <svg viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7ZM14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"/></svg>
            </div>
            <div className="ctrl" title="Share Screen">
              <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            </div>
            <div className="ctrl end" title="End Call" onClick={handleEndSession}>
              <svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </div>
          </div>
        </div>

        {/* Live Co-Pilot Panel */}
        <div className="cop">
          <div className="h">
            <b>Co-pilot</b>
            <div
              className="tog"
              style={{ opacity: copilotEnabled ? 1 : 0.4, cursor: 'pointer' }}
              onClick={() => setCopilotEnabled(!copilotEnabled)}
              title="Toggle Live Co-Pilot Suggestions"
            >
              <i />
            </div>
          </div>

          <div className="b">
            {copilotEnabled ? (
              suggestions.map((s) => (
                <div key={s.id} className="sug">
                  <div className="k">{s.kind}</div>
                  <p>{s.text}</p>
                  <div className="a">
                    {s.actions.map((act, i) => (
                      <span key={i} className="chp" onClick={() => toast.success(`Applied: ${act}`)}>
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#8B90B8', fontSize: 13, padding: 12 }}>
                Co-Pilot suggestions paused. Click toggle above to resume.
              </p>
            )}
          </div>

          <div className="f">Visible only to you · Priya can end this any time</div>
        </div>
      </div>
    </div>
  )
}

export default SessionRoom
