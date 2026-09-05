import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiVideo } from 'react-icons/fi'
import { formatPractitionerName } from '../../../../utils/formatName'
import { formatClassTitle } from '../../../../utils/formatTitle'

export function SessionsResources({ practitionerName = 'your instructor', dashboardData }) {
  const navigate = useNavigate()
  const [selectedNotes, setSelectedNotes] = useState(null)
  const upcomingClasses = dashboardData?.upcomingClasses || []
  const activePractitioner = dashboardData?.activePractitioner || dashboardData?.practitioner
  const instructorTitle = formatPractitionerName(activePractitioner || practitionerName, 'your instructor')

  return (
    <div id="sessions">
      <div className="hd">
        <div className="k">Sessions &amp; resources</div>
        <h1>Everything in one place</h1>
        <p>Your Zoom live classes, course materials, and resources shared by {instructorTitle}.</p>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="sechd">
          <h3>Coming up (Zoom Live Classes)</h3>
        </div>

        {upcomingClasses.length > 0 ? (
          upcomingClasses.map((cls) => (
            <div key={cls._id} className="srow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', width: '100%', maxWidth: '100%', overflow: 'hidden', padding: '16px 0', borderBottom: '1px solid #E2E8F0', boxSizing: 'border-box' }}>
              <div className="sdate" style={{ flexShrink: 0, width: '58px', textAlign: 'center', background: '#F1F5F9', borderRadius: '12px', padding: '9px 0' }}>
                <b style={{ display: 'block', fontSize: '19px', color: '#0F172A', lineHeight: 1 }}>{new Date(cls.scheduledStart).getDate()}</b>
                <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{new Date(cls.scheduledStart).toLocaleString('default', { month: 'short' })}</span>
              </div>
              <div className="info" style={{ flex: 1, minWidth: 0, maxWidth: '100%', overflow: 'hidden', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                <b style={{ fontSize: '15px', color: '#0F172A', wordBreak: 'break-word', overflowWrap: 'anywhere', display: 'block', marginBottom: '2px' }}>
                  {formatClassTitle(cls.title)}
                </b>
                <span style={{ fontSize: '13px', color: '#64748B', display: 'block', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  Instructor: {cls.instructor?.firstName ? `Dr. ${cls.instructor.firstName} ${cls.instructor.lastName || ''}` : instructorTitle} · {new Date(cls.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="go" style={{ flexShrink: 0, marginLeft: 'auto' }}>
                <button
                  type="button"
                  onClick={() => navigate(`/live/${cls._id}`)}
                  className="oh-zoom-join-btn"
                >
                  <FiVideo size={16} />
                  <span>Join Zoom Class</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '16px 0', color: '#64748B', fontSize: '13px' }}>
            No upcoming Zoom live classes scheduled at this moment. Scheduled live classes will appear here.
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="sechd"><h3>Past sessions &amp; notes</h3></div>
        <p style={{ fontSize: '13px', color: '#64748B' }}>Past session recordings and instructor notes will appear here as live classes conclude.</p>
      </div>

      <div className="card">
        <div className="sechd"><h3>Course Study Materials &amp; Resources</h3></div>
        <p style={{ fontSize: '13px', color: '#64748B' }}>Resource guides, audio walkthroughs, and worksheets uploaded for your enrolled courses will be accessible here.</p>
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
