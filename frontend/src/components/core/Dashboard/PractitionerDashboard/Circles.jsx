import React from 'react'

export function Circles() {
  return (
    <section className="view on" id="circles">
      <div className="htop">
        <div><div className="crumb">Circles</div><h1>Circles manager</h1><p>Four circles at different stages. Drag between columns as they move.</p></div>
        <button className="btn">Open a new circle</button>
      </div>
      <div className="kan">
        <div className="col">
          <h4>Filling <span>2</span></h4><div className="stg" style={{ background: '#1F5FE0' }}></div>
          <div className="kcard"><b>Anxiety &amp; the nervous system</b><div className="m">Starts 4 Aug · ₹15,000/seat</div>
            <div className="seats"><i className="seat f"></i><i className="seat f"></i><i className="seat f"></i><i className="seat f"></i><i className="seat f"></i><i className="seat f"></i><i className="seat"></i><i className="seat"></i></div>
            <div className="m" style={{ margin: '8px 0 0' }}>6 of 8 seats · ₹90,000 committed</div></div>
          <div className="kcard"><b>New parents circle</b><div className="m">Starts 12 Aug · ₹12,000/seat</div>
            <div className="seats"><i className="seat f"></i><i className="seat f"></i><i className="seat f"></i><i className="seat"></i><i className="seat"></i><i className="seat"></i><i className="seat"></i><i className="seat"></i></div>
            <div className="m" style={{ margin: '8px 0 0' }}>3 of 8 seats · ₹36,000 committed</div></div>
        </div>
        <div className="col">
          <h4>Running <span>1</span></h4><div className="stg" style={{ background: '#4733C9' }}></div>
          <div className="kcard"><b>Grief circle — July cohort</b><div className="m">Week 4 of 6 · 8 seats</div>
            <div className="seats"><i className="seat f"></i><i className="seat f"></i><i className="seat f"></i><i className="seat f"></i><i className="seat f"></i><i className="seat f"></i><i className="seat f"></i><i className="seat f"></i></div>
            <div className="m" style={{ margin: '8px 0 0' }}>Attendance 94% · next session Thu 19:00</div></div>
        </div>
        <div className="col">
          <h4>Closing <span>1</span></h4><div className="stg" style={{ background: '#6B33D2' }}></div>
          <div className="kcard"><b>Burnout circle — June</b><div className="m">Final session Friday</div>
            <div className="seats"><i className="seat f"></i><i className="seat f"></i><i className="seat f"></i><i className="seat f"></i><i className="seat f"></i><i className="seat f"></i><i className="seat f"></i><i className="seat"></i></div>
            <div className="m" style={{ margin: '8px 0 0' }}>Testimonial requests queued for Sat</div></div>
        </div>
        <div className="col">
          <h4>Completed <span>3</span></h4><div className="stg" style={{ background: '#8A2BE0' }}></div>
          <div className="kcard"><b>Anxiety circle — May</b><div className="m">8 finished · 5 moved to membership</div></div>
          <div className="kcard"><b>Relationship circle — Apr</b><div className="m">7 finished · 4 moved to membership</div></div>
          <div className="kcard"><b>Grief circle — Mar</b><div className="m">6 finished · 3 moved to membership</div></div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="sechd"><h3>Circle economics</h3></div>
        <div className="g3">
          <div><div className="stat"><div className="lbl">Hours per circle</div><div className="val">9</div><div className="dl flat">6 sessions + prep</div></div></div>
          <div><div className="stat"><div className="lbl">Revenue per circle</div><div className="val">₹1,20,000</div><div className="dl flat">at 8 seats</div></div></div>
          <div><div className="stat"><div className="lbl">Effective hourly</div><div className="val">₹13,333</div><div className="dl up">vs ₹3,500 for 1:1</div></div></div>
        </div>
        <p className="note">This is the argument for circles in one line: the same evening, roughly four times the return, and clients who hold each other between sessions.</p>
      </div>
    </section>
  )
}

export default Circles
