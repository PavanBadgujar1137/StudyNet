import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { apiConnector } from '../../../../services/apiConnector'
import { FiCalendar, FiClock, FiVideo, FiUser } from 'react-icons/fi'

export default function MyScheduleBookings() {
  const { token } = useSelector((state) => state.auth)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookings()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const res = await apiConnector('GET', '/api/v1/payments/practitioner-bookings', null, {
        Authorization: `Bearer ${token}`
      })
      if (res?.data?.success) {
        setBookings(res.data.bookings)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>My Schedule & Bookings</h2>
      
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', background: '#F8FAFC', borderRadius: '16px', color: '#64748B' }}>
          <FiCalendar size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
          <h3>No bookings yet.</h3>
          <p>When learners book your sessions, they will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {bookings.map((booking) => (
            <div key={booking._id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                      {booking.offerType?.toUpperCase() || 'SESSION'}
                    </span>
                    <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '16px' }}>{booking.offer?.title}</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '24px', color: '#64748B', fontSize: '14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiUser /> {booking.client?.firstName} {booking.client?.lastName}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiCalendar /> {new Date(booking.scheduledAt).toLocaleDateString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiClock /> {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {booking.meetingLink ? (
                  <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#10B981', color: '#FFFFFF', textDecoration: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 700 }}>
                    <FiVideo /> Join Meeting
                  </a>
                ) : (
                  <span style={{ color: '#94A3B8', fontSize: '13px' }}>No meeting link</span>
                )}
              </div>
              {booking.intakeAnswers && booking.intakeAnswers.length > 0 && (
                <div style={{ marginTop: '16px', padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Learner Intake Responses</h4>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {booking.intakeAnswers.map((ans, idx) => (
                      <div key={idx}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 700, color: '#475569' }}>{ans.question}</p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#0F172A' }}>{ans.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
