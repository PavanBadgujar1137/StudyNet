import React from 'react'

export function Overview({ practitionerName = 'Dr. Meera Iyer', setActiveSection }) {
  const firstName = practitionerName.replace('Dr. ', '').split(' ')[0]

  return (
    <section className="view on" id="dash">
      <div className="htop">
        <div>
          <div className="crumb">Dashboard</div>
          <h1>Good morning, {firstName}.</h1>
          <p>Three sessions today. Your next payout clears Thursday.</p>
        </div>
        <button className="btn" onClick={() => setActiveSection('room')}>Start next session</button>
      </div>

      <div className="g4">
        <div className="card stat"><div className="lbl">This month</div><div className="val">₹1,24,500</div><div className="dl up">▲ 18% vs June</div></div>
        <div className="card stat"><div className="lbl">Clearing Thursday</div><div className="val">₹38,200</div><div className="dl flat">3 sessions + 1 circle seat</div></div>
        <div className="card stat"><div className="lbl">Active clients</div><div className="val">27</div><div className="dl up">▲ 4 this month</div></div>
        <div className="card stat"><div className="lbl">Circle seats filled</div><div className="val">6 / 8</div><div className="dl flat">Starts 4 Aug</div></div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="sechd"><h3>Earnings, last 6 months</h3><a href="#" onClick={(e) => { e.preventDefault(); setActiveSection('payouts'); }}>Full report →</a></div>
          <svg className="spark" viewBox="0 0 620 150" preserveAspectRatio="none" role="img" aria-label="Bar chart of monthly earnings">
            <defs><linearGradient id="bg1" x1="0" y1="150" x2="0" y2="0"><stop offset="0" stopColor="#1F5FE0"/><stop offset="1" stopColor="#8A2BE0"/></linearGradient></defs>
            <line x1="0" y1="120" x2="620" y2="120" stroke="rgba(14,18,53,.10)"/>
            <rect x="24" y="82" width="58" height="38" rx="6" fill="url(#bg1)" opacity=".35"/>
            <rect x="126" y="70" width="58" height="50" rx="6" fill="url(#bg1)" opacity=".45"/>
            <rect x="228" y="58" width="58" height="62" rx="6" fill="url(#bg1)" opacity=".58"/>
            <rect x="330" y="46" width="58" height="74" rx="6" fill="url(#bg1)" opacity=".72"/>
            <rect x="432" y="34" width="58" height="86" rx="6" fill="url(#bg1)" opacity=".86"/>
            <rect x="534" y="14" width="58" height="106" rx="6" fill="url(#bg1)"/>
            <text x="53" y="140" textAnchor="middle">Feb</text><text x="155" y="140" textAnchor="middle">Mar</text>
            <text x="257" y="140" textAnchor="middle">Apr</text><text x="359" y="140" textAnchor="middle">May</text>
            <text x="461" y="140" textAnchor="middle">Jun</text><text x="563" y="140" textAnchor="middle">Jul</text>
          </svg>
          <p className="note">Circles began in May — that's the step change.</p>
        </div>

        <div className="card">
          <div className="sechd"><h3>Today</h3><a href="#">Calendar →</a></div>
          <div className="row"><div className="av">PS</div><div className="who"><b>Priya S.</b><span>1:1 · Session 3</span></div><div className="rt"><b>10:00</b>in 40 min</div></div>
          <div className="row"><div className="av">AK</div><div className="who"><b>Arun K.</b><span>1:1 · First session</span></div><div className="rt"><b>12:30</b>intake done</div></div>
          <div className="row"><div className="av g">8</div><div className="who"><b>Anxiety Circle</b><span>Group · Week 2 of 6</span></div><div className="rt"><b>19:00</b>6 confirmed</div></div>
        </div>
      </div>

      <div className="g2" style={{ marginTop: '18px' }}>
        <div className="card">
          <div className="sechd"><h3>Needs your attention</h3></div>
          <div className="row"><div className="av g">!</div><div className="who"><b>4 session notes awaiting approval</b><span>Drafted by the co-pilot · oldest is 3 days old</span></div><div className="rt"><button className="mini" onClick={() => setActiveSection('clients')}>Review</button></div></div>
          <div className="row"><div className="av g">!</div><div className="who"><b>Kavya hasn't checked in for 11 days</b><span>Was checking in weekly before that</span></div><div className="rt"><button className="mini" onClick={() => setActiveSection('clients')}>Reach out</button></div></div>
          <div className="row"><div className="av g">!</div><div className="who"><b>2 seats left in the August circle</b><span>Starts in 14 days</span></div><div className="rt"><button className="mini" onClick={() => setActiveSection('growth')}>Share link</button></div></div>
        </div>
        <div className="card">
          <div className="sechd"><h3>Client wellbeing trend</h3></div>
          <svg className="spark" viewBox="0 0 300 150" role="img" aria-label="Line showing average client check-in scores">
            <defs><linearGradient id="lgr" x1="0" y1="0" x2="300" y2="0"><stop offset="0" stopColor="#1F5FE0"/><stop offset="1" stopColor="#8A2BE0"/></linearGradient></defs>
            <line x1="20" y1="120" x2="290" y2="120" stroke="rgba(14,18,53,.10)"/>
            <path d="M20 96 L74 88 L128 92 L182 70 L236 62 L290 48" fill="none" stroke="url(#lgr)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="290" cy="48" r="4.5" fill="#8A2BE0"/>
            <text x="20" y="140">Wk 1</text><text x="270" y="140">Wk 6</text>
          </svg>
          <p className="note">Average across 27 clients who check in. Individual data stays private.</p>
        </div>
      </div>
    </section>
  )
}

export default Overview
