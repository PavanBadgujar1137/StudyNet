import React, { useState } from 'react'

export function SessionRoom() {
  const [coPilotOn, setCoPilotOn] = useState(true)

  return (
    <section className="view on" id="room">
      <div className="htop">
        <div><div className="crumb">Live session</div><h1>Priya S. — Session 3</h1><p>Consent given at 00:00 · recording will delete in 30 days</p></div>
        <button className="btn-g">End &amp; draft notes</button>
      </div>
      <div className="room">
        <div className="stage">
          <div className="bar"><span className="livep"><i></i> Live</span><span className="t">24:16 · 60 min booked</span></div>
          <div className="vid"><div className="ini">PS</div></div>
          <div className="self">You</div>
          <div className="ctrls">
            <div className="ctrl"><svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3ZM19 10v2a7 7 0 0 1-14 0v-2M12 19v4"/></svg></div>
            <div className="ctrl"><svg viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7ZM14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"/></svg></div>
            <div className="ctrl"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg></div>
            <div className="ctrl end"><svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></div>
          </div>
        </div>

        <div className="cop">
          <div className="h"><b>Co-pilot</b><div className="tog" onClick={() => setCoPilotOn(!coPilotOn)}><i style={{ right: coPilotOn ? '3px' : 'auto', left: coPilotOn ? 'auto' : '3px' }}></i></div></div>
          {coPilotOn ? (
            <div className="b">
              <div className="sug"><div className="k">Try asking</div><p>"You said 'I should be over it by now' — whose voice is the 'should' in?"</p><div className="a"><span className="chp">Use</span><span className="chp">Not now</span></div></div>
              <div className="sug"><div className="k">Pattern across sessions</div><p>Third time work has come up right after family. Worth naming the link?</p><div className="a"><span className="chp">Flag for notes</span></div></div>
              <div className="sug"><div className="k">Technique that fits</div><p>Two-chair work — she's holding both sides herself. Script ready.</p><div className="a"><span className="chp">Open script</span><span className="chp">Save</span></div></div>
            </div>
          ) : (
            <div className="b" style={{ padding: '24px', textAlign: 'center', color: '#8B90B8', fontSize: '13px' }}>Co-pilot paused</div>
          )}
          <div className="f">Visible only to you · Priya can end this any time</div>
        </div>
      </div>
    </section>
  )
}

export default SessionRoom
