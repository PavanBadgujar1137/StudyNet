import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiVideo, FiExternalLink } from 'react-icons/fi'

export function SessionsResources({ practitionerName = 'Meera', dashboardData }) {
  const navigate = useNavigate()
  const [selectedNotes, setSelectedNotes] = useState(null)
  const upcomingClasses = dashboardData?.upcomingClasses || []

  return (
    <div id="sessions">
      <div className="hd">
        <div className="k">Sessions &amp; resources</div>
        <h1>Everything in one place</h1>
        <p>Your Zoom live classes, bookings, and whatever {practitionerName} has shared with you.</p>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="sechd">
          <h3>Coming up (Zoom Live Classes)</h3>
        </div>

        {upcomingClasses.length > 0 ? (
          upcomingClasses.map((cls) => (
            <div key={cls._id} className="srow" style={{ alignItems: 'center' }}>
              <div className="sdate">
                <b>{new Date(cls.scheduledStart).getDate()}</b>
                <span>{new Date(cls.scheduledStart).toLocaleString('default', { month: 'short' })}</span>
              </div>
              <div className="info">
                <b>{cls.title}</b>
                <span>
                  Instructor: Dr. {cls.instructor?.firstName || practitionerName} · {new Date(cls.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="go">
                <button
                  onClick={() => navigate(`/live/${cls._id}`)}
                  className="btn"
                  style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FiVideo size={14} /> Join Zoom Class
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '16px 0', color: '#64748B', fontSize: '13px' }}>
            No upcoming Zoom live classes scheduled at this moment.
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="sechd"><h3>Past sessions & notes</h3></div>
        <p style={{ fontSize: '13px', color: '#64748B' }}>Past session recordings and practitioner notes will appear here as sessions conclude.</p>
      </div>

      <div className="card">
        <div className="sechd"><h3>Shared Study Materials</h3></div>
        <div className="res">
          <div className="rc"><div className="ty">Reading</div><b>Course Study Guide</b><span>PDF · Updated recently</span></div>
          <div className="rc"><div className="ty">Audio</div><b>Mindful Focus Audio</b><span>10 min · Audio guide</span></div>
          <div className="rc"><div className="ty">Worksheet</div><b>Self-Reflection Workbook</b><span>PDF · Workspace resource</span></div>
        </div>
      </div>

      {selectedNotes && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(14,18,53,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ maxWidth: '480px', width: '90%' }}>
            <h3 style={{ marginBottom: '12px' }}>Session Notes</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '18px' }}>{selectedNotes}</p>
            <button className="btn" onClick={() => setSelectedNotes(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SessionsResources
