import React from 'react'

export function MyJourney({ clientName = 'Student', practitionerName = 'your instructor', dashboardData, loading, setActiveTab }) {
  const checkInCount = dashboardData?.checkInCount || 0
  const streak = dashboardData?.streak || 0
  const milestones = dashboardData?.milestones || []

  // Dynamic joined circles calculation
  const rawJoinedCircles = dashboardData?.joinedCircles || dashboardData?.memberships || []
  const joinedCirclesList = rawJoinedCircles.filter((c) => c && (c.cohort || c._id))
  const hasJoinedCircle = joinedCirclesList.length > 0

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  return (
    <div id="journey">
      <div className="hd" style={{ marginBottom: '18px' }}>
        <div className="k">MY JOURNEY</div>
        <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '14px' }}>This is your personal learning path — kept private to you and your practitioner. There's no score, no comparison with anyone else, and no wrong pace.</p>
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
            <h3>You created your OpenHand account</h3>
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

        {/* Step 4: Circles (Dynamic based on whether learner joined any circles) */}
        <div className={`step ${hasJoinedCircle ? 'done' : 'now'}`}>
          <div className="mark">
            <div className="ring">{hasJoinedCircle ? '✓' : '4'}</div>
            <div className="when">{hasJoinedCircle ? `${joinedCirclesList.length} Joined` : 'Ongoing'}</div>
          </div>
          <div className="bub">
            <h3>Peer Support &amp; Growth Circles</h3>
            <p>
              {hasJoinedCircle
                ? `You have joined ${joinedCirclesList.length} peer growth circle(s). Connect with your circle members and practitioner.`
                : 'Join Circles to share reflections, track milestones, and learn alongside peers.'}
            </p>

            {hasJoinedCircle ? (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {joinedCirclesList.map((item, idx) => {
                  const circleObj = item.cohort || item
                  return (
                    <div
                      key={circleObj._id || idx}
                      style={{
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                            ✓ Joined &amp; Active
                          </span>
                          <b style={{ color: '#0F172A', fontSize: '14px' }}>{circleObj.name || circleObj.title || 'Growth Circle'}</b>
                        </div>
                        <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginTop: '3px' }}>
                          {circleObj.subTitle || circleObj.topic || circleObj.description || 'Peer Support & Practitioner Circle'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab && setActiveTab('circle')}
                        style={{
                          background: '#2563EB',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        View Circle →
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab && setActiveTab('circle')}
                style={{
                  marginTop: '10px',
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '7px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Explore &amp; Join Circles →
              </button>
            )}

            <span className="tagline">{hasJoinedCircle ? 'Enrolled Circles' : 'Growth Circles'}</span>
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
