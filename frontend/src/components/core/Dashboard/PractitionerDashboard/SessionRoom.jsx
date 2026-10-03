import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FiVideo, FiExternalLink, FiPlus, FiCopy, FiCheckCircle, FiX, FiCalendar, FiUser, FiClock, FiRefreshCw, FiBell, FiEdit3 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { scheduleLiveClass, cancelClass, rescheduleClass } from '../../../../services/operations/liveClassAPI'
import { formatClassTitle } from '../../../../utils/formatTitle'
import { apiConnector } from '../../../../services/apiConnector'

export function SessionRoom({ practitionerName = 'Dr. Meera Iyer', telemetryData, onUpdate }) {
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(true)

  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancellingClassId, setCancellingClassId] = useState(null)

  const [copiedId, setCopiedId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [editSubmitting, setEditSubmitting] = useState(false)

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
  const [sessionType, setSessionType] = useState('1-on-1') // '1-on-1' | 'group'
  const [selectedClientId, setSelectedClientId] = useState('')
  const [maxAttendees, setMaxAttendees] = useState('')
  const [instantStarting, setInstantStarting] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledStart, setScheduledStart] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)

  // Edit Form State
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editScheduledStart, setEditScheduledStart] = useState('')
  const [editDurationMinutes, setEditDurationMinutes] = useState(60)
  const [editSessionType, setEditSessionType] = useState('1-on-1')

  const upcomingClasses = telemetryData?.upcomingClasses || []

  // Pre-fill modal for a booked learner
  const handleScheduleForLearner = (booking) => {
    const client = booking?.client
    const clientName = client ? `${client.firstName} ${client.lastName}`.trim() : 'Learner'
    setTitle(`1-on-1 Live Session: ${clientName}`)
    setDescription(`Exclusive 1-on-1 consultation and coaching session with ${clientName}.`)
    setSessionType('1-on-1')
    setSelectedClientId(client?._id || '')
    if (booking?.scheduledAt) {
      const dt = new Date(booking.scheduledAt)
      if (dt > new Date()) {
        setScheduledStart(dt.toISOString().slice(0, 16))
      } else {
        const soon = new Date(Date.now() + 10 * 60 * 1000)
        setScheduledStart(soon.toISOString().slice(0, 16))
      }
    } else {
      const soon = new Date(Date.now() + 10 * 60 * 1000)
      setScheduledStart(soon.toISOString().slice(0, 16))
    }
    setShowScheduleModal(true)
  }

  // Fast-start instant 1-on-1 LiveKit room
  const handleStartInstantSession = async () => {
    if (!token) return
    setInstantStarting(true)
    const now = new Date()
    const endDate = new Date(now.getTime() + 60 * 60 * 1000)
    const payload = {
      title: `Instant 1-on-1 Session (${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      description: 'Immediate LiveKit WebRTC 1-on-1 session created by practitioner.',
      scheduledStart: now.toISOString(),
      scheduledEnd: endDate.toISOString(),
      sessionType: '1-on-1',
      maxAttendees: 2,
      streamProvider: 'livekit',
    }

    const result = await scheduleLiveClass(token, payload)
    setInstantStarting(false)

    if (result) {
      const createdClass = Array.isArray(result) ? result[0] : (result?.data?.[0] || result?.data || result)
      const targetId = createdClass?._id || createdClass?.classId
      if (targetId) {
        toast.success('Instant 1-on-1 LiveKit room ready!')
        navigate(`/live/${targetId}`)
      } else if (onUpdate) {
        onUpdate()
      }
    }
  }

  const handleScheduleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !scheduledStart) {
      toast.error('Please provide session title and start date/time.')
      return
    }

    const startDate = new Date(scheduledStart)
    const now = new Date()

    // Prevent backdated meeting creation
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
      sessionType,
      clientId: sessionType === '1-on-1' && selectedClientId ? selectedClientId : undefined,
      maxAttendees: sessionType === 'group' && maxAttendees ? Number(maxAttendees) : (sessionType === '1-on-1' ? 1 : undefined),
      streamProvider: 'livekit',
    }

    const result = await scheduleLiveClass(token, payload)
    setSubmitting(false)

    if (result) {
      setShowScheduleModal(false)
      setTitle('')
      setDescription('')
      setScheduledStart('')
      setSelectedClientId('')
      setMaxAttendees('')
      setDurationMinutes(60)
      if (onUpdate) onUpdate()
    }
  }

  const handleOpenEditModal = (cls) => {
    setEditingClass(cls)
    setEditTitle(cls.title || '')
    setEditDescription(cls.description || '')
    const startIso = cls.scheduledStart ? new Date(cls.scheduledStart).toISOString().slice(0, 16) : ''
    setEditScheduledStart(startIso)
    const dur = (cls.scheduledEnd && cls.scheduledStart)
      ? Math.max(15, Math.round((new Date(cls.scheduledEnd) - new Date(cls.scheduledStart)) / 60000))
      : 60
    setEditDurationMinutes(dur)
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editTitle || !editScheduledStart || !editingClass) {
      toast.error('Please provide session title and start date/time.')
      return
    }
    const startDate = new Date(editScheduledStart)
    const endDate = new Date(startDate.getTime() + Number(editDurationMinutes) * 60 * 1000)
    setEditSubmitting(true)
    const res = await rescheduleClass(token, editingClass._id, {
      title: editTitle.slice(0, 100),
      description: editDescription.slice(0, 500),
      scheduledStart: startDate.toISOString(),
      scheduledEnd: endDate.toISOString(),
    })
    setEditSubmitting(false)
    if (res) {
      setShowEditModal(false)
      setEditingClass(null)
      if (onUpdate) onUpdate()
    }
  }

  const handleOpenCancelModal = (classId) => {
    setCancellingClassId(classId)
    setShowCancelModal(true)
  }

  const confirmCancelSession = async () => {
    if (!cancellingClassId) return
    const ok = await cancelClass(token, cancellingClassId)
    setShowCancelModal(false)
    setCancellingClassId(null)
    if (ok && onUpdate) onUpdate()
  }

  const handleCopyLink = (url, id) => {
    if (!url) return
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast.success('Copied live session link to clipboard!')
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

                  {/* Amount + Status + 1-on-1 Action */}
                  <div style={{ flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                    <button
                      type="button"
                      onClick={() => handleScheduleForLearner(booking)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 10px',
                        background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 700,
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(139, 92, 246, 0.2)'
                      }}
                    >
                      <FiVideo size={12} /> Schedule 1-on-1
                    </button>
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
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>Live Session Hub</h1>
          <p style={{ color: '#64748B', fontSize: '14px' }}>
            {upcomingClasses.length} session(s) configured with LiveKit WebRTC.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn"
            style={{
              background: '#0F172A',
              color: '#38BDF8',
              border: '1px solid #38BDF8',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: 700,
              cursor: instantStarting ? 'not-allowed' : 'pointer',
              opacity: instantStarting ? 0.7 : 1,
            }}
            onClick={handleStartInstantSession}
            disabled={instantStarting}
          >
            <FiVideo size={17} /> {instantStarting ? 'Starting...' : 'Instant 1-on-1 Room'}
          </button>
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
            onClick={() => {
              setTitle('')
              setDescription('')
              setSessionType('1-on-1')
              setSelectedClientId('')
              setMaxAttendees('')
              setShowScheduleModal(true)
            }}
          >
            <FiPlus size={18} /> Schedule Live Session
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
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onClick={() => navigate(`/live/${upcomingClasses[0]._id}`)}
            >
              <FiExternalLink size={15} /> Launch Next Room
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px' }}>
        <div className="sechd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>Your Live Sessions</h3>
          <span style={{ fontSize: '12px', color: '#64748B', background: '#F1F5F9', padding: '4px 10px', borderRadius: '999px', fontWeight: 600 }}>
            Powered by LiveKit WebRTC
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
                    background: cls.sessionType === 'group' ? '#2563EB' : 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {cls.sessionType === 'group' ? <FiVideo size={20} /> : <FiUser size={20} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <b style={{ fontSize: '15px', color: '#0F172A' }}>{formatClassTitle(cls.title)}</b>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: cls.sessionType === 'group' ? '#EFF6FF' : '#F5F3FF',
                        color: cls.sessionType === 'group' ? '#1D4ED8' : '#7C3AED',
                        border: cls.sessionType === 'group' ? '1px solid #BFDBFE' : '1px solid #DDD6FE'
                      }}
                    >
                      {cls.sessionType === 'group' ? '👥 GROUP' : '👤 1-on-1'}
                    </span>
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
                  <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    <span><FiCalendar size={12} style={{ display: 'inline', marginRight: '4px' }} />{new Date(cls.scheduledStart).toLocaleString()}</span>
                    {cls.client && (
                      <span style={{ color: '#475569' }}>
                        <FiUser size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        Client: <strong style={{ color: '#1E293B' }}>{cls.client.firstName} {cls.client.lastName}</strong>
                      </span>
                    )}
                    {cls.livekitRoomName && <span>Room: <code style={{ fontWeight: 600, color: '#1E293B' }}>{cls.livekitRoomName}</code></span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleCopyLink(`${window.location.origin}/live/${cls._id}`, cls._id)}
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
                  title="Copy Live Session Link"
                >
                  {copiedId === cls._id ? <FiCheckCircle color="#10B981" /> : <FiCopy />} Copy Link
                </button>

                <button
                  onClick={() => handleOpenEditModal(cls)}
                  style={{
                    padding: '8px 14px',
                    fontSize: '12px',
                    background: '#F8FAFC',
                    color: '#334155',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 600
                  }}
                  title="Edit Schedule"
                >
                  <FiEdit3 size={14} /> Edit
                </button>

                <button
                  className="btn"
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    background: cls.sessionType === 'group' ? '#2563EB' : 'linear-gradient(135deg, #7C3AED, #2563EB)',
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
                  <FiExternalLink size={14} /> {cls.sessionType === 'group' ? 'Open Portal' : 'Launch 1-on-1'}
                </button>

                <button
                  onClick={() => handleOpenCancelModal(cls._id)}
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
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>No live sessions currently scheduled</h4>
            <p style={{ marginBottom: '16px', fontSize: '13px' }}>Schedule a live video conferencing session powered by LiveKit WebRTC.</p>
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
              <FiPlus size={16} style={{ display: 'inline', marginRight: '6px' }} /> Schedule Live Session
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
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>Schedule Live Session</h2>
                <p style={{ fontSize: '13px', color: '#64748B' }}>Creates an active WebRTC room powered by LiveKit</p>
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
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Session Type *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setSessionType('1-on-1')}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: sessionType === '1-on-1' ? '2px solid #8B5CF6' : '1px solid #E2E8F0',
                      background: sessionType === '1-on-1' ? '#F5F3FF' : '#FFFFFF',
                      color: sessionType === '1-on-1' ? '#6D28D9' : '#64748B',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: sessionType === '1-on-1' ? '0 2px 6px rgba(139, 92, 246, 0.2)' : 'none',
                    }}
                  >
                    <FiUser size={16} /> 1-on-1 Session
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSessionType('group')
                      setSelectedClientId('')
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: sessionType === 'group' ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                      background: sessionType === 'group' ? '#EFF6FF' : '#FFFFFF',
                      color: sessionType === 'group' ? '#1D4ED8' : '#64748B',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: sessionType === 'group' ? '0 2px 6px rgba(59, 130, 246, 0.2)' : 'none',
                    }}
                  >
                    <FiVideo size={16} /> Group Session / Circle
                  </button>
                </div>
              </div>

              {sessionType === '1-on-1' ? (
                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    <span>Booked Learner (Optional)</span>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Locks room to this client</span>
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => {
                      setSelectedClientId(e.target.value)
                      const found = bookings.find((b) => b.client?._id === e.target.value)
                      if (found && !title) {
                        setTitle(`1-on-1 Session: ${found.client?.firstName} ${found.client?.lastName}`)
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      background: '#FFF'
                    }}
                  >
                    <option value="">Open / Share Direct LiveKit Link</option>
                    {bookings.map((b) => (
                      <option key={b._id} value={b.client?._id}>
                        {b.client?.firstName} {b.client?.lastName} ({b.client?.email}) — {b.offer?.title || 'Booked Client'}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    <span>Max Attendees Limit</span>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Leave empty for unlimited</span>
                  </label>
                  <input
                    type="number"
                    min="2"
                    placeholder="e.g. 20 (or blank for unlimited)"
                    value={maxAttendees}
                    onChange={(e) => setMaxAttendees(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px'
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Session Title / Topic *
                </label>
                <input
                  type="text"
                  placeholder={sessionType === '1-on-1' ? 'e.g. 1-on-1 Coaching: Breakthrough Consultation' : 'e.g. Masterclass: Mindfulness & Deep Focus'}
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
                  {submitting ? 'Creating Live Session...' : 'Create Live Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {showEditModal && editingClass && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '520px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F1F5F9', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiEdit3 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Edit Live Session</h3>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Update session title, description, or start time.</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Session Title *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Weekly Mindful Reflection & Group Coaching"
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Description / Agenda (Optional)
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Brief agenda or instructions for learners..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', color: '#0F172A', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Scheduled Start *
                  </label>
                  <input
                    type="datetime-local"
                    value={editScheduledStart}
                    onChange={(e) => setEditScheduledStart(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', color: '#0F172A' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Duration
                  </label>
                  <select
                    value={editDurationMinutes}
                    onChange={(e) => setEditDurationMinutes(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', color: '#0F172A', background: '#FFF' }}
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
                  onClick={() => setShowEditModal(false)}
                  style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: 'pointer', opacity: editSubmitting ? 0.7 : 1 }}
                >
                  {editSubmitting ? 'Saving Changes...' : 'Save Schedule Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Class Confirmation Modal */}
      {showCancelModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowCancelModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '32px 28px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon Badge */}
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)',
              }}
            >
              <FiX size={32} />
            </div>

            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
                Cancel Live Session?
              </h3>
              <p style={{ fontSize: '13.5px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                Are you sure you want to cancel this scheduled live session? This action will remove the session from your schedule.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                style={{
                  flex: 1,
                  background: '#F1F5F9',
                  color: '#0F172A',
                  border: '1px solid #CBD5E1',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                }}
              >
                No, Keep Session
              </button>

              <button
                type="button"
                onClick={confirmCancelSession}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
                }}
              >
                Yes, Cancel Class
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default SessionRoom
