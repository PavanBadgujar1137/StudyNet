import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FiVideo, FiExternalLink, FiPlus, FiCopy, FiCheckCircle, FiX, FiCalendar, FiUser, FiClock, FiRefreshCw, FiBell } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { scheduleLiveClass, cancelClass } from '../../../../services/operations/liveClassAPI'
import { apiConnector } from '../../../../services/apiConnector'

export function SessionRoom({ practitionerName = 'Dr. Meera Iyer', telemetryData, onUpdate }) {
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(true)

  const [coPilotOn, setCoPilotOn] = useState(true)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Load practitioner's bookings — who will connect with me
  const loadBookings = useCallback(async () => {
    if (!token) return
    setBookingsLoading(true)
    try {
      const res = await apiConnector('GET', '/api/v1/payment/practitioner-bookings', null, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) setBookings(res.data.bookings || [])
    } catch (e) {
      console.warn('Could not load practitioner bookings:', e.message)
    }
    setBookingsLoading(false)
  }, [token])

  useEffect(() => { loadBookings() }, [loadBookings])


  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledStart, setScheduledStart] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)

  const upcomingClasses = telemetryData?.upcomingClasses || []

  const handleScheduleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !scheduledStart) {
      toast.error('Please provide session title and start date/time.')
      return
    }

    const startDate = new Date(scheduledStart)
    const now = new Date()

    // ITEM 18 FIX: Prevent backdated meeting creation
    if (startDate < new Date(now.getTime() - 5 * 60 * 1000)) {
      toast.error('Cannot schedule a backdated meeting. Please choose a future date and time.')
      return
    }

    setSubmitting(true)
    const endDate = new Date(startDate.getTime() + Number(durationMinutes) * 60 * 1000)

    const payload = {
      title: title.slice(0, 100),
      description: description.slice(0, 500),
      scheduledStart: startDate.toISOString(),
      scheduledEnd: endDate.toISOString(),
      streamProvider: 'zoom',
    }


    const result = await scheduleLiveClass(token, payload)
    setSubmitting(false)

    if (result) {
      setShowScheduleModal(false)
      setTitle('')
      setDescription('')
      setScheduledStart('')
      setDurationMinutes(60)
      if (onUpdate) onUpdate()
    }
  }

  const handleCancelSession = async (classId) => {
    if (window.confirm('Are you sure you want to cancel this Zoom live class?')) {
      const ok = await cancelClass(token, classId)
      if (ok && onUpdate) onUpdate()
    }
  }

  const handleCopyLink = (url, id) => {
    if (!url) return
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast.success('Copied Zoom join link to clipboard!')
    setTimeout(() => setCopiedId(null), 2500)
  }

  return (
    <section className="view on" id="room">
      {/* ── Booked Clients Section ─────────────────────────────────────── */}
      <div style={{ marginBottom: 28, background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #8B5CF620, #EC489920)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiBell size={18} color="#8B5CF6" />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#1E293B', fontSize: 15 }}>Learners Booked With You</div>
              <div style={{ color: '#64748B', fontSize: 12 }}>Learners who have paid and are scheduled to connect with you</div>
            </div>
          </div>
          <button onClick={loadBookings} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 12px', color: '#64748B', cursor: 'pointer', fontSize: 12 }}>
            <FiRefreshCw size={12} /> Refresh
          </button>
        </div>

        {bookingsLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
            <FiRefreshCw style={{ animation: 'spin 1s linear infinite', marginRight: 6 }} />
            Loading your bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: '28px 24px', textAlign: 'center', color: '#94A3B8' }}>
            <FiUser size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
            <div style={{ fontSize: 14 }}>No confirmed bookings yet</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>When learners book your offers, they'll appear here</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {bookings.map((booking, idx) => {
              const client = booking.client
              const offer = booking.offer
              const scheduledAt = booking.scheduledAt ? new Date(booking.scheduledAt) : null
              const isUpcoming = scheduledAt && scheduledAt > new Date()
              return (
                <div key={booking._id} style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px',
                  borderBottom: idx < bookings.length - 1 ? '1px solid #F8FAFC' : 'none',
                  background: isUpcoming ? '#F0FDF4' : '#fff',
                  transition: 'background 0.15s',
                }}>
                  {/* Client Avatar */}
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                    {client?.firstName?.[0]}{client?.lastName?.[0]}
                  </div>

                  {/* Client Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: '#1E293B', fontSize: 14 }}>
                      {client?.firstName} {client?.lastName}
                    </div>
                    <div style={{ color: '#64748B', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {client?.email}
                    </div>
                  </div>

                  {/* Offer */}
                  <div style={{ flexShrink: 0, textAlign: 'center' }}>
                    <div style={{ fontWeight: 600, color: '#334155', fontSize: 13, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {offer?.title || 'Session Booking'}
                    </div>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#F1F5F9', color: '#64748B', textTransform: 'capitalize', fontWeight: 500 }}>
                      {booking.offerType}
                    </span>
                  </div>

                  {/* Scheduled Time */}
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    {scheduledAt ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: isUpcoming ? '#10B981' : '#94A3B8', fontSize: 12, fontWeight: 600, justifyContent: 'flex-end' }}>
                          <FiClock size={11} />
                          {scheduledAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ color: '#94A3B8', fontSize: 11 }}>
                          {scheduledAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#94A3B8', fontSize: 12 }}>Time TBD</span>
                    )}
                  </div>

                  {/* Amount + Status */}
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <div style={{ color: '#10B981', fontWeight: 700, fontSize: 14 }}>
                      ₹{booking.amount?.toLocaleString('en-IN')}
                    </div>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
                      background: booking.status === 'confirmed' ? '#DCFCE7' : booking.status === 'completed' ? '#EFF6FF' : '#FEF3C7',
                      color: booking.status === 'confirmed' ? '#166534' : booking.status === 'completed' ? '#1D4ED8' : '#92400E',
                    }}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div className="htop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div className="crumb">Live session room</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>Zoom Live Session Hub</h1>
          <p style={{ color: '#64748B', fontSize: '14px' }}>
            {upcomingClasses.length} class(es)/session(s) configured for Zoom streaming.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn"
            style={{
              background: 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => setShowScheduleModal(true)}
          >
            <FiPlus size={18} /> Schedule Zoom Class
          </button>
          {upcomingClasses.length > 0 && (
            <button
              className="btn"
              style={{
                background: '#10B981',
                color: '#FFF',
                padding: '10px 18px',
                borderRadius: '12px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/live/${upcomingClasses[0]._id}`)}
            >
              Launch Next Room
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px' }}>
        <div className="sechd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>Your Zoom Live Sessions</h3>
          <span style={{ fontSize: '12px', color: '#64748B', background: '#F1F5F9', padding: '4px 10px', borderRadius: '999px', fontWeight: 600 }}>
            Powered by Zoom Server-to-Server OAuth
          </span>
        </div>

        {upcomingClasses.length > 0 ? (
          upcomingClasses.map((cls) => (
            <div
              key={cls._id}
              className="row"
              style={{
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                padding: '16px',
                border: '1px solid #F1F5F9',
                borderRadius: '12px',
                marginBottom: '12px',
                background: '#FAFAFA'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#2563EB',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <FiVideo size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <b style={{ fontSize: '15px', color: '#0F172A' }}>{cls.title}</b>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: cls.status === 'live' ? '#FEE2E2' : '#E0F2FE',
                        color: cls.status === 'live' ? '#DC2626' : '#0284C7'
                      }}
                    >
                      {cls.status === 'live' ? '🔴 LIVE NOW' : 'SCHEDULED'}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', display: 'flex', gap: '12px' }}>
                    <span><FiCalendar size={12} style={{ display: 'inline', marginRight: '4px' }} />{new Date(cls.scheduledStart).toLocaleString()}</span>
                    {cls.zoomMeetingId && <span>ID: <code style={{ fontWeight: 600, color: '#1E293B' }}>{cls.zoomMeetingId}</code></span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {cls.zoomJoinUrl && (
                  <button
                    onClick={() => handleCopyLink(cls.zoomJoinUrl, cls._id)}
                    style={{
                      padding: '8px 12px',
                      fontSize: '12px',
                      background: '#F1F5F9',
                      color: '#475569',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Copy Join Link"
                  >
                    {copiedId === cls._id ? <FiCheckCircle color="#10B981" /> : <FiCopy />} Copy Link
                  </button>
                )}

                <button
                  className="btn"
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    background: '#2563EB',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 600
                  }}
                  onClick={() => navigate(`/live/${cls._id}`)}
                >
                  <FiExternalLink size={14} /> Open Portal
                </button>

                <button
                  onClick={() => handleCancelSession(cls._id)}
                  style={{
                    padding: '8px 10px',
                    fontSize: '12px',
                    background: '#FEF2F2',
                    color: '#EF4444',
                    border: '1px solid #FCA5A5',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  title="Cancel Class"
                >
                  <FiX size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: '12px' }}>
            <FiVideo size={36} style={{ margin: '0 auto 12px', color: '#94A3B8' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>No live Zoom class currently scheduled</h4>
            <p style={{ marginBottom: '16px', fontSize: '13px' }}>Schedule a live video conferencing session with real Zoom start & join links.</p>
            <button
              className="btn"
              style={{
                background: 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)',
                color: '#FFF',
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => setShowScheduleModal(true)}
            >
              <FiPlus size={16} style={{ display: 'inline', marginRight: '6px' }} /> Schedule Zoom Live Class
            </button>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>Schedule Zoom Live Session</h2>
                <p style={{ fontSize: '13px', color: '#64748B' }}>Creates an active Zoom meeting via OAuth API</p>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Session Title / Topic *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Masterclass: Mindfulness & Deep Focus"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Agenda / Description
                </label>
                <textarea
                  placeholder="Describe session goals, prerequisites, or topics..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    <span>Start Date &amp; Time *</span>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Future Date Only</span>
                  </label>
                  <input
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                    value={scheduledStart}
                    onChange={(e) => setScheduledStart(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px'
                    }}
                  />
                </div>


                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Duration (Minutes)
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px'
                    }}
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes (1 hour)</option>
                    <option value={90}>90 Minutes (1.5 hours)</option>
                    <option value={120}>120 Minutes (2 hours)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? 'Creating Zoom Session...' : 'Create Zoom Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AURA AI Copilot Section */}
      <div style={{ width: '100%', marginTop: '20px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>✨</span>
            <b style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>AURA AI Session Co-Pilot &amp; Notes</b>
          </div>
          <button 
            type="button"
            onClick={() => setCoPilotOn(!coPilotOn)} 
            style={{ 
              cursor: 'pointer', 
              border: 'none', 
              background: 'transparent',
              padding: 0
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, padding: '5px 12px', borderRadius: '14px', background: coPilotOn ? '#DCFCE7' : '#F1F5F9', color: coPilotOn ? '#15803D' : '#64748B', border: `1px solid ${coPilotOn ? '#BBF7D0' : '#CBD5E1'}`, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: coPilotOn ? '#22C55E' : '#94A3B8' }} />
              {coPilotOn ? 'AURA AI Active' : 'AURA AI Paused'}
            </span>
          </button>
        </div>
        {coPilotOn ? (
          <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#2563EB', marginBottom: '6px', letterSpacing: '0.04em' }}>AURA AI PREPARATION &amp; POST-SESSION NOTES PROMPT</div>
              <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                {upcomingClasses.length > 0
                  ? `Upcoming Zoom session: "${upcomingClasses[0].title}". AURA AI will synthesize learner check-in notes and summarize post-session takeaways automatically.`
                  : `No live session active. AURA AI will analyze your Zoom recordings & learner reflections to produce post-session summary notes.`}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ padding: '16px', textAlign: 'center', color: '#64748B', fontSize: '13px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            AURA AI Session Assistant is paused. Click toggle to enable instant AURA AI notes.
          </div>
        )}
      </div>
    </section>
  )
}

export default SessionRoom
