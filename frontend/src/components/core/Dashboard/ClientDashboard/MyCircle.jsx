import React from 'react'

export function MyCircle({ clientName = 'Priya', practitionerName = 'Meera' }) {
  return (
    <div id="circle">
      <div className="hd">
        <div className="k">My circle</div>
        <h1>Anxiety &amp; the nervous system</h1>
        <p>Eight people, six weeks, Thursday evenings. Led by Dr. {practitionerName} Iyer.</p>
      </div>

      <div className="crc">
        <div className="k">Starts in 14 days</div>
        <h2>First session — Thursday 4 August, 7:00 pm</h2>
        <p>Ninety minutes. You'll get a reminder the morning of, and a link an hour before. Camera optional for the first one.</p>
        <div className="wkbar">
          <div className="wk now"><div className="b"></div><span>Wk 1</span></div>
          <div className="wk"><div className="b"></div><span>Wk 2</span></div>
          <div className="wk"><div className="b"></div><span>Wk 3</span></div>
          <div className="wk"><div className="b"></div><span>Wk 4</span></div>
          <div className="wk"><div className="b"></div><span>Wk 5</span></div>
          <div className="wk"><div className="b"></div><span>Wk 6</span></div>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="sechd">
            <h3>Who's in it</h3>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>First names only</span>
          </div>
          <div className="members">
            <div className="mem"><div className="a lead">MI</div><b>Meera</b><span>Facilitator</span></div>
            <div className="mem"><div className="a">P</div><b>{clientName}</b><span>You</span></div>
            <div className="mem"><div className="a">A</div><b>Arun</b><span></span></div>
            <div className="mem"><div className="a">K</div><b>Kavya</b><span></span></div>
            <div className="mem"><div className="a">N</div><b>Nikhil</b><span></span></div>
            <div className="mem"><div className="a">S</div><b>Sara</b><span></span></div>
            <div className="mem"><div className="a">R</div><b>Rehan</b><span></span></div>
            <div className="mem"><div className="a" style={{ background: 'rgba(14,18,53,.05)', color: '#9DA2C2' }}>+2</div><b>Joining</b><span>2 seats left</span></div>
          </div>
          <p className="note">Nobody sees your check-ins, your notes, or your 1:1 sessions. What you say in the circle stays in the circle — that's the only rule Meera enforces hard.</p>
        </div>

        <div className="card">
          <div className="sechd"><h3>Circle feed</h3></div>
          <div className="feed">
            <div className="fitem"><b>Meera shared a resource</b><p>A short reading on what "nervous system regulation" actually means — worth ten minutes before week one.</p><div className="t">Yesterday</div></div>
            <div className="fitem"><b>Kavya joined the circle</b><p>Say hello whenever you're ready. No pressure to introduce yourself before the first session.</p><div className="t">3 days ago</div></div>
            <div className="fitem"><b>Meera set the ground rules</b><p>What's said here stays here. You can pass at any point. You can turn your camera off.</p><div className="t">5 days ago</div></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyCircle
