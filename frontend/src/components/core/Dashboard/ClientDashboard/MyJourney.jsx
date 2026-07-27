import React from 'react'

export function MyJourney({ clientName = 'Student', practitionerName = 'your instructor', dashboardData, loading }) {
  const daysActive = dashboardData?.user?.daysActive || 1
  const checkInCount = dashboardData?.checkInCount || 0
  const streak = dashboardData?.streak || 0
  const milestones = dashboardData?.milestones || []

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  return (
    <div id="journey">
      <div className="hd">
        <div className="k">My journey</div>
        <h1>You're {daysActive} day{daysActive > 1 ? 's' : ''} in, {clientName}.</h1>
        <p>This is your personal learning path — kept private to you and your instructor. There's no score, no comparison with anyone else, and no wrong pace.</p>
      </div>

      <div className="card" style={{ marginBottom: '22px' }}>
        <div className="sechd">
          <h3>Your check-in rhythm</h3>
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Current streak: <b>{streak} day{streak !== 1 ? 's' : ''}</b> ({checkInCount} total check-ins)</span>
        </div>
        <div className="streak">
          {daysOfWeek.map((dayName) => {
            const isToday = dayName.toLowerCase() === todayDayName.toLowerCase()
            return (
              <div
                key={dayName}
                className={`sd ${isToday ? 'today' : ''}`}
                style={isToday ? { backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' } : {}}
              >
                {dayName}
              </div>
            )
          })}
        </div>
        <p className="note">Missed a day? Nothing breaks. Come back whenever — the point is the noticing, not the streak.</p>
      </div>

      <div className="jrn">
        <svg className="jsvg" viewBox="0 0 80 1000" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="jg" x1="0" y1="0" x2="0" y2="1000" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#1F5FE0"/>
              <stop offset=".55" stopColor="#4733C9"/>
              <stop offset="1" stopColor="#8A2BE0"/>
            </linearGradient>
          </defs>
          <path d="M40 10 C 70 120, 10 200, 40 320 C 70 440, 10 520, 40 640 C 70 760, 10 850, 40 990" stroke="rgba(14,18,53,.10)"/>
          <path d="M40 10 C 70 120, 10 200, 40 320 C 70 440, 10 520, 40 640" stroke="url(#jg)"/>
        </svg>

        <div className="step done">
          <div className="mark"><div className="ring">✓</div><div className="when">Step 1</div></div>
          <div className="bub">
            <h3>You created your StudyNet account</h3>
            <p>Your personalized space was initialized, connected with your practitioner and course resources.</p>
            <span className="tagline">Where it started</span>
          </div>
        </div>

        <div className={`step ${checkInCount > 0 ? 'done' : 'now'}`}>
          <div className="mark"><div className="ring">{checkInCount > 0 ? '✓' : '2'}</div><div className="when">{checkInCount > 0 ? `${checkInCount} Logged` : 'Action'}</div></div>
          <div className="bub">
            <h3>Daily Check-in Rhythm</h3>
            <p>{checkInCount > 0 ? `You have logged ${checkInCount} check-ins so far. Keep up the rhythm!` : 'Log your first daily check-in to track your mood and sleep rhythm.'}</p>
            <span className="tagline">{checkInCount > 0 ? 'Active Rhythm' : 'Next Step'}</span>
          </div>
        </div>

        <div className={`step ${dashboardData?.upcomingClasses?.length ? 'done' : 'locked'}`}>
          <div className="mark"><div className="ring">3</div><div className="when">Live</div></div>
          <div className="bub">
            <h3>Zoom Live Classes & Sessions</h3>
            <p>{dashboardData?.upcomingClasses?.length ? `You have ${dashboardData.upcomingClasses.length} live Zoom class(es) scheduled.` : 'Enroll in live classes to join Zoom sessions with your instructor.'}</p>
            <span className="tagline">Live Learning</span>
          </div>
        </div>

        <div className="step locked">
          <div className="mark"><div className="ring">4</div><div className="when">Ongoing</div></div>
          <div className="bub">
            <h3>Peer Support & Growth Circles</h3>
            <p>Join group cohorts to share reflections, track milestones, and learn alongside peers.</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '8px' }}>
        <div className="sechd"><h3>Milestones you've reached</h3></div>
        <div className="ms">
          {milestones.length > 0 ? (
            milestones.map((m) => (
              <div key={m.id} className={`mcard ${m.achieved ? 'got' : ''}`}>
                <span className="ic">{m.achieved ? '◆' : '◇'}</span>
                <b>{m.label}</b>
                <span>{m.date}</span>
              </div>
            ))
          ) : (
            <div className="mcard got"><span className="ic">◆</span><b>Joined Platform</b><span>Today</span></div>
          )}
        </div>
        <p className="note">Milestones are private by default. If you ever want to share one, that's your choice.</p>
      </div>
    </div>
  )
}

export default MyJourney
