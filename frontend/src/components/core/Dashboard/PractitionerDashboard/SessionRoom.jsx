import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiVideo, FiExternalLink } from 'react-icons/fi'

export function SessionRoom({ practitionerName = 'Dr. Meera Iyer', telemetryData }) {
  const navigate = useNavigate()
  const [coPilotOn, setCoPilotOn] = useState(true)
  const upcomingClasses = telemetryData?.upcomingClasses || []

  return (
    <section className="view on" id="room">
      <div className="htop">
        <div>
          <div className="crumb">Live session room</div>
          <h1>Zoom Live Session Hub</h1>
          <p>{upcomingClasses.length} class(es)/session(s) configured for Zoom streaming.</p>
        </div>
        {upcomingClasses.length > 0 && (
          <button
            className="btn"
            onClick={() => navigate(`/live/${upcomingClasses[0]._id}`)}
          >
            Launch Active Zoom Room
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="sechd">
          <h3>Your Zoom Live Sessions</h3>
        </div>

        {upcomingClasses.length > 0 ? (
          upcomingClasses.map((cls) => (
            <div key={cls._id} className="row" style={{ alignItems: 'center', padding: '14px', borderBottom: '1px solid #E2E8F0' }}>
              <div className="av" style={{ background: '#2563EB', color: '#FFF' }}>
                <FiVideo size={16} />
              </div>
              <div className="who">
                <b>{cls.title}</b>
                <span>
                  Start Time: {new Date(cls.scheduledStart).toLocaleString()}
                </span>
              </div>
              <div className="rt">
                <button
                  className="btn"
                  style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => navigate(`/live/${cls._id}`)}
                >
                  <FiExternalLink size={14} /> Open Zoom Portal
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
            <p style={{ marginBottom: '12px' }}>No live Zoom class currently scheduled.</p>
            <button className="btn" onClick={() => navigate('/dashboard')}>
              Schedule a Zoom Class
            </button>
          </div>
        )}
      </div>

      <div className="cop" style={{ width: '100%', marginTop: '20px' }}>
        <div className="h">
          <b>Practitioner AURA Assistant</b>
          <div className="tog" onClick={() => setCoPilotOn(!coPilotOn)}>
            <i style={{ right: coPilotOn ? '3px' : 'auto', left: coPilotOn ? 'auto' : '3px' }}></i>
          </div>
        </div>
        {coPilotOn ? (
          <div className="b">
            <div className="sug">
              <div className="k">Dynamic Session Prompt</div>
              <p>"Review client's recent check-in rhythm and previous reflection notes."</p>
            </div>
          </div>
        ) : (
          <div className="b" style={{ padding: '24px', textAlign: 'center', color: '#8B90B8', fontSize: '13px' }}>
            AURA paused
          </div>
        )}
      </div>
    </section>
  )
}

export default SessionRoom
