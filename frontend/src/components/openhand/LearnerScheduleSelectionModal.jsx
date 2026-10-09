import React, { useState, useEffect } from 'react'
import { FiX, FiClock, FiChevronRight, FiChevronLeft } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { apiConnector } from '../../services/apiConnector'

export function LearnerScheduleSelectionModal({ isOpen, onClose, practitionerId, onSlotSelected, offer }) {
  const [loading, setLoading] = useState(false)
  const [availableSlots, setAvailableSlots] = useState([])
  
  // Start with today
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  })
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)

  useEffect(() => {
    if (isOpen && practitionerId) {
      loadSlots(selectedDate)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, practitionerId, selectedDate])

  const loadSlots = async (dateStr) => {
    setLoading(true)
    setAvailableSlots([])
    setSelectedTimeSlot(null)
    try {
      const res = await apiConnector('GET', `/api/v1/calendar/slots/${practitionerId}?date=${dateStr}`)
      if (res?.data?.success) {
        setAvailableSlots(res.data.slots)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load available slots")
    } finally {
      setLoading(false)
    }
  }

  const handleNextDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const handlePrevDay = () => {
    const d = new Date(selectedDate)
    const today = new Date()
    today.setHours(0,0,0,0)
    
    d.setDate(d.getDate() - 1)
    
    if (d >= today) {
      setSelectedDate(d.toISOString().split('T')[0])
    }
  }

  const handleConfirm = () => {
    if (!selectedTimeSlot) return
    const dateTimeString = `${selectedDate}T${selectedTimeSlot}:00`
    onSlotSelected(dateTimeString)
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
          maxWidth: '500px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>🗓️ Choose a Time Slot</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748B' }}>
              Select an available time for <b>{offer?.title || 'your session'}</b>.
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}>
            <FiX size={18} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          
          {/* Date Navigator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <button onClick={handlePrevDay} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1F5FE0' }}><FiChevronLeft size={24} /></button>
            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '16px' }}>
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
            <button onClick={handleNextDay} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1F5FE0' }}><FiChevronRight size={24} /></button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>Finding available slots...</div>
          ) : availableSlots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', background: '#F1F5F9', borderRadius: '12px', color: '#475569' }}>
              <FiClock size={32} style={{ marginBottom: '10px', color: '#94A3B8' }} />
              <div>No slots available on this day.</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>Please try another date.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
              {availableSlots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTimeSlot(slot)}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: selectedTimeSlot === slot ? '2px solid #1F5FE0' : '1px solid #CBD5E1',
                    background: selectedTimeSlot === slot ? '#EFF6FF' : '#FFFFFF',
                    color: selectedTimeSlot === slot ? '#1D4ED8' : '#334155',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
          
        </div>

        <div style={{ padding: '20px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', color: '#64748B' }}>
            {selectedTimeSlot ? `Selected: ${selectedTimeSlot}` : 'Please select a time'}
          </div>
          <button 
            onClick={handleConfirm} 
            disabled={!selectedTimeSlot} 
            style={{ background: selectedTimeSlot ? 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)' : '#CBD5E1', color: '#FFF', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: selectedTimeSlot ? 'pointer' : 'not-allowed' }}>
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  )
}
