import React, { useState } from 'react'

export function MyClients({ setActiveSection }) {
  return (
    <section className="view on" id="clients">
      <div className="htop">
        <div><div className="crumb">My clients</div><h1>27 people</h1><p>Records, notes, and consent status. Only you can see this.</p></div>
        <button className="btn">Add a client</button>
      </div>
      <div className="card">
        <div className="scroll"><table className="tbl">
          <thead><tr><th>Client</th><th>Working on</th><th>Sessions</th><th>Last check-in</th><th>Co-pilot consent</th><th>Notes</th></tr></thead>
          <tbody>
            <tr><td><b>Priya S.</b></td><td>Health anxiety</td><td>3</td><td>2 days ago</td><td><span className="pill ok">Given</span></td><td><span className="pill inf">2 drafts</span></td></tr>
            <tr><td><b>Arun K.</b></td><td>Work burnout</td><td>1</td><td>Intake only</td><td><span className="pill wait">Not asked</span></td><td>—</td></tr>
            <tr><td><b>Kavya R.</b></td><td>Grief</td><td>8</td><td><span style={{ color: 'var(--warn)' }}>11 days ago</span></td><td><span className="pill ok">Given</span></td><td>Up to date</td></tr>
            <tr><td><b>Nikhil D.</b></td><td>Panic episodes</td><td>5</td><td>Yesterday</td><td><span className="pill no">Declined</span></td><td>Manual</td></tr>
            <tr><td><b>Sara M.</b></td><td>Relationship</td><td>12</td><td>Today</td><td><span className="pill ok">Given</span></td><td><span className="pill inf">1 draft</span></td></tr>
            <tr><td><b>Rehan A.</b></td><td>Career transition</td><td>2</td><td>4 days ago</td><td><span className="pill ok">Given</span></td><td>Up to date</td></tr>
          </tbody>
        </table></div>
      </div>

      <div className="g2" style={{ marginTop: '18px' }}>
        <div className="card">
          <div className="sechd"><h3>Consent at a glance</h3></div>
          <div className="row"><div className="av g">21</div><div className="who"><b>Consent given</b><span>Co-pilot active in session</span></div><div className="rt"><span className="pill ok">78%</span></div></div>
          <div className="row"><div className="av g">4</div><div className="who"><b>Not yet asked</b><span>Usually new clients pre-first-session</span></div><div className="rt"><span className="pill wait">15%</span></div></div>
          <div className="row"><div className="av g">2</div><div className="who"><b>Declined</b><span>Sessions run normally, notes are manual</span></div><div className="rt"><span className="pill no">7%</span></div></div>
          <p className="note">Consent can be withdrawn at any time by the client, including mid-session.</p>
        </div>
        <div className="card">
          <div className="sechd"><h3>Draft notes waiting</h3><a href="#">Approve all →</a></div>
          <div className="row"><div className="av">PS</div><div className="who"><b>Priya S. — Session 3</b><span>Drafted 2 days ago</span></div><div className="rt"><button className="mini">Review</button></div></div>
          <div className="row"><div className="av">SM</div><div className="who"><b>Sara M. — Session 12</b><span>Drafted today</span></div><div className="rt"><button className="mini">Review</button></div></div>
          <p className="note">Nothing is saved to a client record or sent until you approve it.</p>
        </div>
      </div>
    </section>
  )
}

export default MyClients
