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
      const res = await apiConnector('GET', '/api/v1/calendar/auth/google', null, {
        Authorization: `Bearer ${token}`
      })
      if (res?.data?.success) {
        window.location.href = res.data.url
      }
    } catch (err) {
      toast.error("Failed to initiate Google Auth")
    }
  }

  const addTimeSlot = (dayId) => {
    setWeeklySchedule(prev => {
      const schedule = [...prev]
      const dayIndex = schedule.findIndex(d => d.day === dayId)
      const newSlot = { startTime: "09:00", endTime: "17:00" }
      
      if (dayIndex >= 0) {
        schedule[dayIndex].slots.push(newSlot)
      } else {
        schedule.push({ day: dayId, slots: [newSlot] })
      }
      return schedule
    })
  }

  const updateTimeSlot = (dayId, slotIndex, field, value) => {
    setWeeklySchedule(prev => {
      const schedule = [...prev]
      const dayIndex = schedule.findIndex(d => d.day === dayId)
      if (dayIndex >= 0) {
        schedule[dayIndex].slots[slotIndex][field] = value
      }
      return schedule
    })
  }

  const removeTimeSlot = (dayId, slotIndex) => {
    setWeeklySchedule(prev => {
      const schedule = [...prev]
      const dayIndex = schedule.findIndex(d => d.day === dayId)
      if (dayIndex >= 0) {
        schedule[dayIndex].slots.splice(slotIndex, 1)
        if (schedule[dayIndex].slots.length === 0) {
          schedule.splice(dayIndex, 1)
        }
      }
      return schedule
    })
  }

  const saveAvailability = async () => {
    try {
      const res = await apiConnector('PUT', '/api/v1/calendar/availability', { timezone, weeklySchedule }, {
        Authorization: `Bearer ${token}`
      })
      if (res?.data?.success) {
        toast.success("Schedule saved successfully!")
        onClose()
      }
    } catch (err) {
      toast.error("Failed to save schedule")
    }
  }

  if (!isOpen) return null

  return (
    <div
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
                  <span style={{ background: '#DCFCE7', color: '#166534', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ✅ Connected
                  </span>
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

              {/* Weekly Schedule */}
              <div>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Weekly Availability</h4>
                
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
                            onChange={() => hasSlots ? removeTimeSlot(day.id, 0) : addTimeSlot(day.id)}
                            style={{ width: '18px', height: '18px' }}
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
                                  onClick={() => removeTimeSlot(day.id, idx)}
                                  style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '6px' }}
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            ))
                          )}

                          {hasSlots && (
                            <button 
                              onClick={() => addTimeSlot(day.id)}
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
