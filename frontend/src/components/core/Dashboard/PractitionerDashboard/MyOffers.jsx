import React from 'react'

export function MyOffers() {
  return (
    <section className="view on" id="offers">
      <div className="htop">
        <div><div className="crumb">My offers</div><h1>What people can book</h1><p>Three live offers. Start with one, add the rest when the first one sells.</p></div>
        <button className="btn">Create an offer</button>
      </div>
      <div className="g3">
        <div className="offer">
          <div className="kind">Session</div>
          <h4>Individual therapy hour</h4>
          <p className="d">A single 60-minute session. For people who want to start without committing to a package.</p>
          <div className="prc">₹3,500</div><div className="sub">per session · 60 min</div>
          <div className="bar"><i style={{ width: '78%' }}></i></div>
          <div className="cap">14 of 18 weekly slots booked</div>
          <div className="acts"><button className="mini">Edit</button><button className="mini">Share link</button></div>
        </div>
        <div className="offer">
          <div className="kind">Circle</div>
          <h4>Anxiety &amp; the nervous system</h4>
          <p className="d">Six weeks, eight people, one evening a week. Includes between-session check-ins and a private group feed.</p>
          <div className="prc">₹15,000</div><div className="sub">per seat · 6 weeks</div>
          <div className="bar"><i style={{ width: '75%' }}></i></div>
          <div className="cap">6 of 8 seats filled · starts 4 Aug</div>
          <div className="acts"><button className="mini">Manage</button><button className="mini">Share link</button></div>
        </div>
        <div className="offer">
          <div className="kind">Membership</div>
          <h4>The ongoing circle</h4>
          <p className="d">Monthly access for people who've finished a circle: group calls, recordings, and weekly reflection prompts.</p>
          <div className="prc">₹799</div><div className="sub">per month · recurring</div>
          <div className="bar"><i style={{ width: '41%' }}></i></div>
          <div className="cap">37 active members · 4 joined this month</div>
          <div className="acts"><button className="mini">Edit</button><button className="mini">Members</button></div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="sechd"><h3>What each offer earned this month</h3></div>
        <div className="scroll"><table className="tbl">
          <thead><tr><th>Offer</th><th>Bookings</th><th>Collected</th><th>OpenHand fee (5%)</th><th>You keep</th></tr></thead>
          <tbody>
            <tr><td><b>Individual therapy hour</b></td><td>21</td><td>₹73,500</td><td>₹3,675</td><td><b>₹69,825</b></td></tr>
            <tr><td><b>Anxiety &amp; the nervous system</b></td><td>6 seats</td><td>₹90,000</td><td>₹4,500</td><td><b>₹85,500</b></td></tr>
            <tr><td><b>The ongoing circle</b></td><td>37 members</td><td>₹29,563</td><td>₹1,478</td><td><b>₹28,085</b></td></tr>
          </tbody>
        </table></div>
        <p className="note">Illustrative figures. Payment gateway charges and GST are separate.</p>
      </div>
    </section>
  )
}

export default MyOffers
