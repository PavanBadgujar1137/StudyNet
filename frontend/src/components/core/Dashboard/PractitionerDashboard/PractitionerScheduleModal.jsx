import React, { useState, useEffect } from 'react'
import { FiX, FiCalendar, FiPlus, FiTrash2 } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { apiConnector } from '../../../../services/apiConnector'
import { useSelector } from 'react-redux'

const DAYS = [
  { id: 0, label: 'Sunday' },
  { id: 1, label: 'Monday' },
  { id: 2, label: 'Tuesday' },
  { id: 3, label: 'Wednesday' },
  { id: 4, label: 'Thursday' },
  { id: 5, label: 'Friday' },
  { id: 6, label: 'Saturday' },
]

export function PractitionerScheduleModal({ isOpen, onClose }) {
  const { token } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [availability, setAvailability] = useState(null)
  
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  const [weeklySchedule, setWeeklySchedule] = useState([])
  const [maxSessionsPerDay, setMaxSessionsPerDay] = useState(5)
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(50)

  useEffect(() => {
    if (isOpen) {
      loadAvailability()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const loadAvailability = async () => {
    setLoading(true)
    try {
      const res = await apiConnector('GET', '/api/v1/calendar/availability', null, {
        Authorization: `Bearer ${token}`
      })
      if (res?.data?.success) {
        setAvailability(res.data.availability)
        setTimezone(res.data.availability.timezone || 'Asia/Kolkata')
        setWeeklySchedule(res.data.availability.weeklySchedule || [])
        setMaxSessionsPerDay(res.data.availability.maxSessionsPerDay || 5)
        setSessionDurationMinutes(res.data.availability.sessionDurationMinutes || 50)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load availability")
    } finally {
      setLoading(false)
    }
  }

  const handleConnectGoogle = async () => {
    try {
      const returnTo = window.location.pathname || "/practice"
      const res = await apiConnector('GET', `/api/v1/calendar/auth/google?returnTo=${encodeURIComponent(returnTo)}`, null, {
        Authorization: `Bearer ${token}`
      })
      if (res?.data?.success) {
        window.location.href = res.data.url
      }
    } catch (err) {
      toast.error("Failed to initiate Google Auth")
    }
  }

  const handleDisconnectGoogle = async () => {
    if (!window.confirm("Are you sure you want to disconnect Google Calendar?")) return
    try {
      const res = await apiConnector('POST', '/api/v1/calendar/disconnect', null, {
        Authorization: `Bearer ${token}`
      })
      if (res?.data?.success) {
        toast.success("Google Calendar disconnected")
        loadAvailability()
      }
    } catch (err) {
      toast.error("Failed to disconnect calendar")
    }
  }

  const addMinutesToTime = (timeStr, minutes) => {
    const [h, m] = (timeStr || "09:00").split(':').map(Number)
    const totalMins = (h * 60 + m + minutes) % (24 * 60)
    const newH = Math.floor(totalMins / 60)
    const newM = totalMins % 60
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`
  }

  const handleDurationChange = (newDur) => {
    const durNum = Number(newDur) || 30
    setSessionDurationMinutes(durNum)
    // Automatically recalculate end times of all existing slots to match the new duration!
    setWeeklySchedule(prev => {
      return prev.map(dayObj => ({
        ...dayObj,
        slots: (dayObj.slots || []).map(s => ({
          ...s,
          endTime: addMinutesToTime(s.startTime, durNum),
        })),
      }))
    })
  }

  const toggleDay = (dayId) => {
    setWeeklySchedule(prev => {
      const dayExists = prev.some(d => d.day === dayId && d.slots && d.slots.length > 0)
      if (dayExists) {
        // Toggle OFF -> completely remove day (100% immutable)
        return prev.filter(d => d.day !== dayId)
      } else {
        // Toggle ON -> add default initial slot using current sessionDurationMinutes!
        const dur = Number(sessionDurationMinutes) || 30
        const initialSlot = {
          startTime: "11:00",
          endTime: addMinutesToTime("11:00", dur),
        }
        return [...prev.filter(d => d.day !== dayId), { day: dayId, slots: [initialSlot] }]
      }
    })
  }

  const addTimeSlot = (dayId) => {
    const dur = Number(sessionDurationMinutes) || 30
    setWeeklySchedule(prev => {
      const dayIndex = prev.findIndex(d => d.day === dayId)
      if (dayIndex < 0) {
        const initialSlot = {
          startTime: "11:00",
          endTime: addMinutesToTime("11:00", dur),
        }
        return [...prev, { day: dayId, slots: [initialSlot] }]
      }

      const currentDay = prev[dayIndex]
      const currentSlots = currentDay.slots || []
      let nextStart = "11:00"
      if (currentSlots.length > 0) {
        const lastSlot = currentSlots[currentSlots.length - 1]
        nextStart = lastSlot.endTime || "12:00"
      }
      const nextEnd = addMinutesToTime(nextStart, dur)
      const newSlot = { startTime: nextStart, endTime: nextEnd }

      // 100% immutable copy
      return prev.map((d, idx) => {
        if (idx !== dayIndex) return d
        return {
          ...d,
          slots: [...currentSlots, newSlot],
        }
      })
    })
  }

  const removeTimeSlot = (dayId, slotIndex) => {
    setWeeklySchedule(prev => {
      return prev
        .map(d => {
          if (d.day !== dayId) return d
          const updatedSlots = (d.slots || []).filter((_, idx) => idx !== slotIndex)
          return {
            ...d,
            slots: updatedSlots,
          }
        })
        .filter(d => d.slots && d.slots.length > 0)
    })
  }

  const updateTimeSlot = (dayId, slotIndex, field, value) => {
    setWeeklySchedule(prev => {
      return prev.map(d => {
        if (d.day !== dayId) return d
        const updatedSlots = (d.slots || []).map((s, idx) => {
          if (idx !== slotIndex) return s
          return { ...s, [field]: value }
        })
        return {
          ...d,
          slots: updatedSlots,
        }
      })
    })
  }

  const saveAvailability = async () => {
    try {
      const res = await apiConnector('PUT', '/api/v1/calendar/availability', {
        timezone,
        weeklySchedule,
        maxSessionsPerDay: Number(maxSessionsPerDay),
        sessionDurationMinutes: Number(sessionDurationMinutes),
      }, {
        Authorization: `Bearer ${token}`
      })
      if (res?.data?.success) {
        toast.success("Schedule & daily session limit saved!")
        onClose()
      }
    } catch (err) {
      toast.error("Failed to save schedule")
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="oh-modal-backdrop-animated"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="oh-modal-box-animated"
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '650px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>🗓️ Schedule & Calendar Sync</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748B' }}>Set your weekly availability for learner bookings.</p>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}>
            <FiX size={18} />
          </button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Google Calendar Section */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Google Calendar Sync</h4>
                  <p style={{ margin: 0, fontSize: '13.5px', color: '#64748B' }}>
                    {availability?.googleCalendarConnected ? 'Your calendar is connected! Bookings will be automatically added.' : 'Connect your calendar to automatically block booked slots.'}
                  </p>
                </div>
                {!availability?.googleCalendarConnected ? (
                  <button onClick={handleConnectGoogle} style={{ background: '#1F5FE0', color: '#FFF', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiCalendar /> Connect Google
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ background: '#DCFCE7', color: '#166534', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ✅ Connected
                    </span>
                    <button
                      onClick={handleDisconnectGoogle}
                      style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>

              {/* Timezone */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Your Timezone</label>
                <select 
                  value={timezone} 
                  onChange={(e) => setTimezone(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                </select>
              </div>

              {/* Daily Session Limit & Slot Duration */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    ⚡ Daily Max Sessions Capacity
                  </label>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748B' }}>
                    Maximum sessions you can accept per day. Once reached, remaining slots become locked/full.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={maxSessionsPerDay}
                      onChange={(e) => setMaxSessionsPerDay(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ width: '90px', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '16px', fontWeight: 800, color: '#1F5FE0', textAlign: 'center', outline: 'none' }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>sessions / day max</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    ⏱️ Default Slot Duration
                  </label>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748B' }}>
                    Length of each bookable session slot generated on your learner booking calendar.
                  </p>
                  <select
                    value={sessionDurationMinutes}
                    onChange={(e) => handleDurationChange(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: 700, color: '#0F172A', outline: 'none' }}
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={50}>50 Minutes (Standard)</option>
                    <option value={60}>60 Minutes (1 Hour)</option>
                    <option value={90}>90 Minutes</option>
                  </select>
                </div>
              </div>

              {/* Weekly Schedule */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Weekly Availability</h4>
                </div>
                
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🗓️</span>
                  <span><b>Only active slots are bookable:</b> Learners can only see and book the exact days and time slots you check and add here. If a day is unchecked ("Unavailable"), no slots will ever be shown for that day.</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {DAYS.map((day) => {
                    const daySchedule = weeklySchedule.find(d => d.day === day.id)
                    const hasSlots = daySchedule && daySchedule.slots.length > 0

                    return (
                      <div key={day.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px', background: hasSlots ? '#FFFFFF' : '#F8FAFC' }}>
                        
                        <div style={{ width: '100px', display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '8px' }}>
                          <input 
                            type="checkbox" 
                            checked={hasSlots}
                            onChange={() => toggleDay(day.id)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '14px', fontWeight: 700, color: hasSlots ? '#0F172A' : '#94A3B8' }}>{day.label}</span>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {!hasSlots ? (
                            <div style={{ fontSize: '14px', color: '#94A3B8', paddingTop: '8px' }}>Unavailable</div>
                          ) : (
                            daySchedule.slots.map((slot, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input 
                                  type="time" 
                                  value={slot.startTime} 
                                  onChange={(e) => updateTimeSlot(day.id, idx, 'startTime', e.target.value)}
                                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: 600 }}
                                />
                                <span style={{ color: '#64748B' }}>to</span>
                                <input 
                                  type="time" 
                                  value={slot.endTime} 
                                  onChange={(e) => updateTimeSlot(day.id, idx, 'endTime', e.target.value)}
                                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: 600 }}
                                />
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    removeTimeSlot(day.id, idx)
                                  }}
                                  style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '6px' }}
                                  title="Delete this slot"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            ))
                          )}

                          {hasSlots && (
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                addTimeSlot(day.id)
                              }}
                              style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#2563EB', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 0' }}
                            >
                              <FiPlus /> Add Time Slot
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          )}
        </div>

        <div style={{ padding: '20px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} style={{ background: '#F1F5F9', color: '#475569', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          <button onClick={saveAvailability} disabled={loading} style={{ background: 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)', color: '#FFF', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  )
}
