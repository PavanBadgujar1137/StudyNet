import React from 'react'

export function MyCircle({ clientName = 'Student', practitionerName = 'your instructor', dashboardData }) {
  const memberships = dashboardData?.memberships || []
  const instructorTitle = practitionerName ? (practitionerName.includes('Instructor') ? practitionerName : `Dr. ${practitionerName}`) : 'your instructor'

  return (
    <div id="circle">
      <div className="hd">
        <div className="k">My circle</div>
        <h1>Peer Support &amp; Growth Cohorts</h1>
        <p>Small group cohorts led by certified StudyNet instructors.</p>
      </div>

      {memberships.length > 0 ? (
        memberships.map((m) => (
          <div key={m._id} className="crc" style={{ marginBottom: '20px' }}>
            <div className="k">{m.cohort?.name || 'Active Circle'}</div>
            <h2>{m.cohort?.topic || 'Peer Growth & Support Cohort'}</h2>
            <p>Schedule: {m.cohort?.scheduleText || 'Weekly sessions'}. Facilitated by {instructorTitle}.</p>
          </div>
        ))
      ) : (
        <div className="crc" style={{ marginBottom: '20px' }}>
          <div className="k">Group Cohorts</div>
          <h2>Explore Available Growth Circles</h2>
          <p>You are not currently enrolled in an active circle cohort. Enrolled circle cohorts and peer growth sessions will appear here as you join them.</p>
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
          <div className="sechd"><h3>Circle Guidelines & Updates</h3></div>
          <div className="feed">
            <div className="fitem">
              <b>Peer Community Guidelines</b>
              <p>What's said in group circles stays in the circle. Participation is at your own comfort level.</p>
              <div className="t">Official Note</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyCircle
