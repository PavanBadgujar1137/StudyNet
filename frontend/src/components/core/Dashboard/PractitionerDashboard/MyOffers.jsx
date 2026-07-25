import React from 'react'

export function MyOffers({ telemetryData }) {
  const offers = telemetryData?.offers || []

  return (
    <section className="view on" id="offers">
      <div className="htop">
        <div>
          <div className="crumb">My offers</div>
          <h1>What people can book</h1>
          <p>{offers.length} active offer(s) created in your practice directory.</p>
        </div>
        <button className="btn">Create an offer</button>
      </div>

      <div className="g3">
        {offers.length > 0 ? (
          offers.map((offer) => (
            <div key={offer._id} className="offer">
              <div className="kind">{offer.kind || 'Session'}</div>
              <h4>{offer.title}</h4>
              <p className="d">{offer.description || 'Practice offer for clients'}</p>
              <div className="prc">₹{offer.price ? offer.price.toLocaleString('en-IN') : '3,500'}</div>
              <div className="sub">{offer.duration || '60 min'}</div>
              <div className="bar"><i style={{ width: '60%' }}></i></div>
              <div className="cap">{offer.enrolledCount || 0} bookings logged</div>
              <div className="acts">
                <button className="mini">Edit</button>
                <button className="mini">Share link</button>
              </div>
            </div>
          ))
        ) : (
          <>
            <div className="offer">
              <div className="kind">Session</div>
              <h4>Individual Therapy Hour</h4>
              <p className="d">A single 60-minute 1:1 session for new and returning clients.</p>
              <div className="prc">₹3,500</div>
              <div className="sub">per session · 60 min</div>
              <div className="bar"><i style={{ width: '70%' }}></i></div>
              <div className="cap">Active offer</div>
              <div className="acts"><button className="mini">Edit</button><button className="mini">Share link</button></div>
            </div>
            <div className="offer">
              <div className="kind">Circle</div>
              <h4>Anxiety &amp; Nervous System Cohort</h4>
              <p className="d">Six weeks group circle container for up to 8 clients.</p>
              <div className="prc">₹15,000</div>
              <div className="sub">per seat · 6 weeks</div>
              <div className="bar"><i style={{ width: '75%' }}></i></div>
              <div className="cap">6 of 8 seats filled</div>
              <div className="acts"><button className="mini">Manage</button><button className="mini">Share link</button></div>
            </div>
          </>
        )}
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="sechd"><h3>Practice Offer Breakdown</h3></div>
        <div className="scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>Offer</th>
                <th>Type</th>
                <th>Price</th>
                <th>Enrolled</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {offers.length > 0 ? (
                offers.map((o) => (
                  <tr key={o._id}>
                    <td><b>{o.title}</b></td>
                    <td>{o.kind || 'Session'}</td>
                    <td>₹{o.price || 3500}</td>
                    <td>{o.enrolledCount || 0}</td>
                    <td><b>Active</b></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td><b>Individual therapy hour</b></td>
                  <td>Session</td>
                  <td>₹3,500</td>
                  <td>14 clients</td>
                  <td><b>Active</b></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default MyOffers
