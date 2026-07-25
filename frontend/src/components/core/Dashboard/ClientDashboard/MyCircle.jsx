import React from 'react'

export function MyCircle({ clientName = 'Client', practitionerName = 'Meera', dashboardData }) {
  const memberships = dashboardData?.memberships || []

  return (
    <div id="circle">
      <div className="hd">
        <div className="k">My circle</div>
        <h1>Peer Support &amp; Growth Cohorts</h1>
        <p>Small group cohorts led by Dr. {practitionerName}.</p>
      </div>

      {memberships.length > 0 ? (
        memberships.map((m) => (
          <div key={m._id} className="crc" style={{ marginBottom: '20px' }}>
            <div className="k">{m.cohort?.name || 'Active Circle'}</div>
            <h2>{m.cohort?.topic || 'Peer Growth & Support Cohort'}</h2>
            <p>Schedule: {m.cohort?.scheduleText || 'Weekly sessions'}. Facilitated by Dr. {practitionerName}.</p>
            <div className="wkbar">
              <div className="wk now"><div className="b"></div><span>Wk 1</span></div>
              <div className="wk"><div className="b"></div><span>Wk 2</span></div>
              <div className="wk"><div className="b"></div><span>Wk 3</span></div>
              <div className="wk"><div className="b"></div><span>Wk 4</span></div>
              <div className="wk"><div className="b"></div><span>Wk 5</span></div>
              <div className="wk"><div className="b"></div><span>Wk 6</span></div>
            </div>
          </div>
        ))
      ) : (
        <div className="crc" style={{ marginBottom: '20px' }}>
          <div className="k">Group Cohorts</div>
          <h2>Explore Available Growth Circles</h2>
          <p>You are not currently enrolled in an active circle cohort. Browse active circles to join a group led by Dr. {practitionerName}.</p>
        </div>
      )}

      <div className="g2">
        <div className="card">
          <div className="sechd">
            <h3>Circle Community Guidelines</h3>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Safe space</span>
          </div>
          <p className="note" style={{ marginTop: '8px' }}>
            Nobody sees your private check-ins, your notes, or your 1:1 sessions. What is shared in circle sessions stays in the circle.
          </p>
        </div>

        <div className="card">
          <div className="sechd"><h3>Circle Updates</h3></div>
          <div className="feed">
            <div className="fitem">
              <b>Dr. {practitionerName} shared guidelines</b>
              <p>What's said in group circles stays in the circle. Participation is at your own comfort level.</p>
              <div className="t">Recent</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyCircle
