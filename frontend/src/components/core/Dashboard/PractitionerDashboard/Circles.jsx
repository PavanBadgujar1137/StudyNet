import React from 'react'

export function Circles({ telemetryData }) {
  const circles = telemetryData?.circles || []

  return (
    <section className="view on" id="circles">
      <div className="htop">
        <div>
          <div className="crumb">Circles</div>
          <h1>Circles Manager</h1>
          <p>{circles.length} circle cohort(s) active in database.</p>
        </div>
        <button className="btn">Open a new circle</button>
      </div>

      <div className="kan">
        <div className="col">
          <h4>Filling / Active <span>{circles.length || 2}</span></h4>
          <div className="stg" style={{ background: '#1F5FE0' }}></div>
          {circles.length > 0 ? (
            circles.map((c) => (
              <div key={c._id} className="kcard">
                <b>{c.name || 'Group Circle'}</b>
                <div className="m">{c.topic || 'Peer Support & Growth'}</div>
                <div className="seats">
                  <i className="seat f"></i>
                  <i className="seat f"></i>
                  <i className="seat f"></i>
                  <i className="seat f"></i>
                  <i className="seat"></i>
                  <i className="seat"></i>
                </div>
                <div className="m" style={{ margin: '8px 0 0' }}>
                  {c.enrolledCount || 0} of {c.maxCapacity || 8} seats filled
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="kcard">
                <b>Anxiety &amp; the nervous system</b>
                <div className="m">Starts soon · ₹15,000/seat</div>
                <div className="seats">
                  <i className="seat f"></i>
                  <i className="seat f"></i>
                  <i className="seat f"></i>
                  <i className="seat f"></i>
                  <i className="seat"></i>
                  <i className="seat"></i>
                </div>
                <div className="m" style={{ margin: '8px 0 0' }}>6 of 8 seats filled</div>
              </div>
            </>
          )}
        </div>

        <div className="col">
          <h4>Running <span>1</span></h4>
          <div className="stg" style={{ background: '#4733C9' }}></div>
          <div className="kcard">
            <b>Grief circle — July cohort</b>
            <div className="m">Week 4 of 6 · 8 seats</div>
            <div className="seats">
              <i className="seat f"></i>
              <i className="seat f"></i>
              <i className="seat f"></i>
              <i className="seat f"></i>
              <i className="seat f"></i>
              <i className="seat f"></i>
            </div>
            <div className="m" style={{ margin: '8px 0 0' }}>Attendance 94% · Live</div>
          </div>
        </div>

        <div className="col">
          <h4>Completed <span>1</span></h4>
          <div className="stg" style={{ background: '#8A2BE0' }}></div>
          <div className="kcard">
            <b>Anxiety circle — May</b>
            <div className="m">8 finished · Moved to membership</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="sechd"><h3>Circle Economics Overview</h3></div>
        <div className="g3">
          <div><div className="stat"><div className="lbl">Hours per circle</div><div className="val">9</div><div className="dl flat">6 sessions + prep</div></div></div>
          <div><div className="stat"><div className="lbl">Revenue per circle</div><div className="val">₹1,20,000</div><div className="dl flat">at 8 seats</div></div></div>
          <div><div className="stat"><div className="lbl">Effective hourly</div><div className="val">₹13,333</div><div className="dl up">vs 1:1 rate</div></div></div>
        </div>
      </div>
    </section>
  )
}

export default Circles
