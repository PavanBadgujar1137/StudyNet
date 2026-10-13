import React, { useState, useEffect } from 'react'
import {
  FiX,
  FiClock,
  FiCheck,
  FiLock,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { apiConnector } from '../../services/apiConnector'

export function LearnerScheduleSelectionModal({
  isOpen,
  onClose,
  practitionerId,
  practitionerName,
  onSlotSelected,
  offer,
}) {
  const [loading, setLoading] = useState(false)
  const [slotsData, setSlotsData] = useState({
    slots: [],
    maxSessionsPerDay: 5,
    bookedCount: 0,
    remainingCount: 5,
    dayIsFull: false,
    dayLabel: '',
    message: '',
  })

  // Start with today (YYYY-MM-DD local)
  const getTodayStr = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [selectedDate, setSelectedDate] = useState(getTodayStr)
  const [selectedSlot, setSelectedSlot] = useState(null) // holds selected slot object

  // Generate 14 upcoming days for quick-pick carousel strip
  const upcomingDays = React.useMemo(() => {
    const days = []
    const start = new Date()
    for (let i = 0; i < 14; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      days.push({
        dateStr,
        dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        isToday: i === 0,
      })
    }
    return days
  }, [])

  useEffect(() => {
    if (isOpen && practitionerId) {
      loadSlots(selectedDate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, practitionerId, selectedDate])

  const loadSlots = async (dateStr) => {
    setLoading(true)
    setSelectedSlot(null)
    try {
      const durationParam = offer?.durationMinutes ? `&duration=${offer.durationMinutes}` : ''
      const res = await apiConnector(
        'GET',
        `/api/v1/calendar/slots/${practitionerId}?date=${dateStr}${durationParam}`
      )
      if (res?.data?.success) {
        setSlotsData({
          slots: res.data.slots || [],
          maxSessionsPerDay: res.data.maxSessionsPerDay || 5,
          bookedCount: res.data.bookedCount || 0,
          remainingCount: res.data.remainingCount || 0,
          dayIsFull: !!res.data.dayIsFull,
          dayLabel: res.data.dayLabel || '',
          message: res.data.message || '',
        })
      } else {
        toast.error(res?.data?.message || 'Failed to load slots')
      }
    } catch (err) {
      console.error('Error fetching calendar slots:', err)
      toast.error('Unable to fetch practitioner schedule for this date')
    } finally {
      setLoading(false)
    }
  }

  const handlePrevDay = () => {
    const d = new Date(selectedDate)
    const today = new Date(getTodayStr())
    d.setDate(d.getDate() - 1)
    if (d >= today) {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      setSelectedDate(`${year}-${month}-${day}`)
    }
  }

  const handleNextDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    setSelectedDate(`${year}-${month}-${day}`)
  }

  const handleConfirm = () => {
    if (!selectedSlot) return
    const dateTimeString = selectedSlot.fullDateTime || `${selectedDate}T${selectedSlot.time}:00`

    // Provide both string format for backwards-compatibility and detailed payload
    onSlotSelected(dateTimeString, {
      fullDateTime: dateTimeString,
      slotTime: selectedSlot.label,
      date: selectedDate,
      slot: selectedSlot,
      offer,
    })
  }

  if (!isOpen) return null

  const isToday = selectedDate === getTodayStr()
  const displayFormattedDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  background: '#EEF2FF',
                  color: '#4F46E5',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                1:1 Booking Calendar
              </span>
              {practitionerName && (
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                  with {practitionerName}
                </span>
              )}
            </div>
            <h3 style={{ margin: '6px 0 2px 0', fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
              Select Date &amp; Time Slot
            </h3>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#64748B' }}>
              {offer?.title ? (
                <>
                  Booking: <b>{offer.title}</b> •{' '}
                  <span style={{ color: '#2563EB', fontWeight: 700 }}>₹{offer.price}</span>
                  {offer.durationMinutes ? ` (${offer.durationMinutes} mins)` : ''}
                </>
              ) : (
                'Choose an available slot to reserve your live counseling session.'
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#E2E8F0')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#F1F5F9')}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* 14-Day Horizontal Quick-Pick Strip */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                📅 Upcoming 14 Days
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="date"
                  min={getTodayStr()}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                  }}
                  title="Pick specific date"
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '8px',
                scrollbarWidth: 'thin',
              }}
            >
              {upcomingDays.map((d) => {
                const isSelected = selectedDate === d.dateStr
                return (
                  <button
                    key={d.dateStr}
                    onClick={() => setSelectedDate(d.dateStr)}
                    style={{
                      flexShrink: 0,
                      width: '64px',
                      padding: '10px 6px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      background: isSelected ? '#EFF6FF' : '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: isSelected ? '#2563EB' : '#64748B',
                        textTransform: 'uppercase',
                      }}
                    >
                      {d.dayOfWeek}
                    </span>
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: 900,
                        color: isSelected ? '#1D4ED8' : '#0F172A',
                      }}
                    >
                      {d.dayNum}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        color: isSelected ? '#3B82F6' : '#94A3B8',
                      }}
                    >
                      {d.month}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Current Date Navigator & Daily Capacity Badge */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handlePrevDay}
                disabled={isToday}
                style={{
                  background: isToday ? '#F1F5F9' : '#FFFFFF',
                  color: isToday ? '#CBD5E1' : '#1E293B',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isToday ? 'not-allowed' : 'pointer',
                }}
                title="Previous Day"
              >
                <FiChevronLeft size={16} />
              </button>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                  {displayFormattedDate}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  Practitioner Timezone: <b>Asia/Kolkata (IST)</b>
                </div>
              </div>
              <button
                onClick={handleNextDay}
                style={{
                  background: '#FFFFFF',
                  color: '#1E293B',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title="Next Day"
              >
                <FiChevronRight size={16} />
              </button>
            </div>

            {/* Daily Sessions Capacity Pill */}
            <div>
              {slotsData.slots.length === 0 ? (
                <span
                  style={{
                    background: '#F1F5F9',
                    color: '#64748B',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '5px 12px',
                    borderRadius: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  Unavailable on this day
                </span>
              ) : slotsData.dayIsFull ? (
                <span
                  style={{
                    background: '#FEE2E2',
                    color: '#991B1B',
                    border: '1px solid #FECACA',
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '5px 12px',
                    borderRadius: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <FiLock size={12} /> Daily Limit Reached ({slotsData.bookedCount}/{slotsData.maxSessionsPerDay})
                </span>
              ) : (
                <span
                  style={{
                    background: '#ECFDF5',
                    color: '#065F46',
                    border: '1px solid #A7F3D0',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '5px 12px',
                    borderRadius: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <FiCheckCircle size={12} /> {slotsData.remainingCount} of {slotsData.maxSessionsPerDay} daily sessions available
                </span>
              )}
            </div>
          </div>

          {/* Slots View */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>
                Select From Available Times
              </span>
              <div style={{ display: 'flex', gap: '12px', fontSize: '11.5px', color: '#64748B' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB' }} /> Available
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} /> Booked (Locked)
                </span>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid #E2E8F0',
                    borderTopColor: '#2563EB',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 12px auto',
                  }}
                />
                Loading available slots for {displayFormattedDate}...
              </div>
            ) : slotsData.slots.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '36px 20px',
                  background: '#F8FAFC',
                  borderRadius: '16px',
                  border: '1px dashed #CBD5E1',
                  color: '#475569',
                }}
              >
                <FiClock size={32} style={{ marginBottom: '8px', color: '#94A3B8' }} />
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#1E293B' }}>
                  No Slots Scheduled for this Day
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  {slotsData.message || 'The practitioner is unavailable on this day. Please select another date from the calendar.'}
                </p>
              </div>
            ) : slotsData.dayIsFull ? (
              <div
                style={{
                  padding: '24px',
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: '16px',
                  textAlign: 'center',
                  color: '#991B1B',
                }}
              >
                <FiAlertCircle size={28} style={{ marginBottom: '8px', color: '#DC2626' }} />
                <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 800 }}>
                  Practitioner's Daily Capacity Reached
                </h4>
                <p style={{ margin: '0 0 12px 0', fontSize: '13px' }}>
                  This practitioner takes a maximum of {slotsData.maxSessionsPerDay} sessions per day and has already reached their capacity for {displayFormattedDate}.
                </p>
                <button
                  onClick={handleNextDay}
                  style={{
                    background: '#DC2626',
                    color: '#FFF',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                  }}
                >
                  View Next Day's Availability →
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '10px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  paddingRight: '4px',
                }}
              >
                {slotsData.slots.map((slot, idx) => {
                  const isSelected = selectedSlot?.time === slot.time
                  const isBooked = slot.isBooked
                  const isPast = slot.isPast

                  if (isBooked) {
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: '1px solid #FECACA',
                          background: '#FFF1F2',
                          color: '#991B1B',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          opacity: 0.75,
                          cursor: 'not-allowed',
                          userSelect: 'none',
                        }}
                        title="This slot is already booked by another learner."
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 800 }}>
                            {slot.label}
                          </span>
                          <span
                            style={{
                              background: '#FEE2E2',
                              color: '#DC2626',
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <FiLock size={9} /> Booked
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#B91C1C' }}>
                          Reserved by another learner
                        </span>
                      </div>
                    )
                  }

                  if (isPast) {
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: '1px solid #E2E8F0',
                          background: '#F8FAFC',
                          color: '#94A3B8',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          opacity: 0.6,
                          cursor: 'not-allowed',
                          userSelect: 'none',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 700 }}>
                            {slot.label}
                          </span>
                          <span style={{ fontSize: '10px', fontWeight: 700 }}>Past</span>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #2563EB' : '1px solid #CBD5E1',
                        background: isSelected ? 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' : '#FFFFFF',
                        color: isSelected ? '#1E40AF' : '#0F172A',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        boxShadow: isSelected ? '0 4px 14px rgba(37, 99, 235, 0.2)' : '0 1px 3px rgba(0,0,0,0.03)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800 }}>
                          {slot.label}
                        </span>
                        {isSelected ? (
                          <span
                            style={{
                              background: '#2563EB',
                              color: '#FFFFFF',
                              borderRadius: '50%',
                              width: '18px',
                              height: '18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <FiCheck size={11} />
                          </span>
                        ) : (
                          <span
                            style={{
                              background: '#ECFDF5',
                              color: '#059669',
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            Available
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: isSelected ? '#1D4ED8' : '#64748B' }}>
                        {offer?.durationMinutes || 50} Min 1:1 Live Video
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Selected Slot Summary Callout */}
          {selectedSlot && (
            <div
              style={{
                background: '#F0FDF4',
                border: '1.5px solid #86EFAC',
                borderRadius: '14px',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#166534', letterSpacing: '0.4px' }}>
                  ✓ Your Chosen Session Time
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                  {displayFormattedDate} • {selectedSlot.label} (IST)
                </div>
                <div style={{ fontSize: '12px', color: '#475569' }}>
                  An automated calendar invitation and WhatsApp &amp; Email alerts will be sent immediately upon payment.
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Fee</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#166534' }}>₹{offer?.price || 0}</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#F8FAFC',
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748B' }}>
            {selectedSlot ? (
              <span style={{ color: '#0F172A', fontWeight: 700 }}>
                Selected: {selectedSlot.label}
              </span>
            ) : (
              'Click an available slot above to proceed'
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                background: '#FFFFFF',
                color: '#475569',
                border: '1px solid #CBD5E1',
                padding: '11px 20px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedSlot}
              style={{
                background: selectedSlot
                  ? 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)'
                  : '#CBD5E1',
                color: '#FFFFFF',
                border: 'none',
                padding: '11px 24px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '13.5px',
                cursor: selectedSlot ? 'pointer' : 'not-allowed',
                boxShadow: selectedSlot ? '0 4px 14px rgba(31, 95, 224, 0.3)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {selectedSlot ? `Confirm Slot & Pay ₹${offer?.price || 0} →` : 'Select a Slot'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
