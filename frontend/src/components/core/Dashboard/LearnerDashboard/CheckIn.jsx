import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { apiConnector } from '../../../../services/apiConnector'
import toast from 'react-hot-toast'
import {
  FiCheck,
  FiArrowLeft,
  FiClock,
  FiEdit2,
} from 'react-icons/fi'

export function CheckIn({ clientName = 'Student', practitionerName = 'your instructor', dashboardData, onCheckInSuccess, setActiveTab, onCancel }) {
  const { token } = useSelector((state) => state.auth)
  const [selectedMood, setSelectedMood] = useState('steady')
  const [sleepScore, setSleepScore] = useState(7)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [editingCheckInId, setEditingCheckInId] = useState(null)

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else if (setActiveTab) {
      setActiveTab('journey')
    } else {
      window.history.back()
    }
  }

  const moods = [
    {
      key: 'peaceful',
      label: 'Good / Grounded',
      icon: '🌿',
      tag: 'Peaceful & content',
      color: '#10B981',
      bgActive: 'rgba(16, 185, 129, 0.15)',
      borderActive: '#10B981',
    },
    {
      key: 'energetic',
      label: 'Lighter',
      icon: '⚡',
      tag: 'Energized & motivated',
      color: '#A855F7',
      bgActive: 'rgba(168, 85, 247, 0.15)',
      borderActive: '#A855F7',
    },
    {
      key: 'steady',
      label: 'Steady',
      icon: '🌊',
      tag: 'Balanced & present',
      color: '#3B82F6',
      bgActive: 'rgba(59, 130, 246, 0.15)',
      borderActive: '#3B82F6',
    },
    {
      key: 'challenged',
      label: 'Stretched thin',
      icon: '🧗',
      tag: 'Under stress, working through it',
      color: '#F59E0B',
      bgActive: 'rgba(245, 158, 11, 0.15)',
      borderActive: '#F59E0B',
    },
    {
      key: 'low',
      label: 'Heavy',
      icon: '🌧️',
      tag: 'Low energy, taking it gently',
      color: '#64748B',
      bgActive: 'rgba(100, 116, 139, 0.15)',
      borderActive: '#64748B',
    },
  ]

  const [localCheckIns, setLocalCheckIns] = useState(() => {
    try {
      const saved = localStorage.getItem('op_local_checkins')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const apiCheckIns = dashboardData?.checkIns || []
  const checkIns = [...localCheckIns, ...apiCheckIns.filter((ac) => !localCheckIns.some((lc) => lc._id === ac._id))]
  const streak = Math.max(dashboardData?.streak || 0, checkIns.length > 0 ? 1 : 0)

  const handleSave = async (e) => {
    e.preventDefault()

    const numericSleep = Number(sleepScore)
    if (isNaN(numericSleep) || numericSleep < 0 || numericSleep > 10) {
      toast.error('Sleep score must be between 0 and 10.')
      return
    }

    setSaving(true)

    const newLocalEntry = {
      _id: editingCheckInId || `ci_local_${Date.now()}`,
      mood: selectedMood,
      sleepScore: numericSleep,
      note: note.slice(0, 500),
      createdAt: new Date().toISOString(),
    }

    try {
      if (token) {
        await apiConnector(
          'POST',
          '/api/v1/checkins',
          {
            checkInId: editingCheckInId || undefined,
            mood: selectedMood,
            sleepScore: numericSleep,
            note: note.slice(0, 500),
            isPrivate: false,
          },
          { Authorization: `Bearer ${token}` }
        )
      }
    } catch (err) {
      console.warn('Backend checkin warning, saving locally:', err)
    }

    // Persist to local state & localStorage for immediate reactivity
    setLocalCheckIns((prev) => {
      const filtered = prev.filter((c) => c._id !== newLocalEntry._id)
      const updated = [newLocalEntry, ...filtered]
      try {
        localStorage.setItem('op_local_checkins', JSON.stringify(updated))
      } catch (e) {}
      return updated
    })

    setIsSaved(true)
    setEditingCheckInId(null)
    toast.success('Check-in saved successfully! ✨')
    if (onCheckInSuccess) onCheckInSuccess()
    setSaving(false)
  }

  const handleEditEntry = (entry) => {
    setSelectedMood(entry.mood || 'steady')
    setSleepScore(entry.sleepScore ?? 7)
    setNote(entry.note || '')
    setEditingCheckInId(entry._id)
    setIsSaved(false)
    toast.success(`Editing check-in from ${new Date(entry.createdAt).toLocaleDateString()}`)
    const formEl = document.getElementById('ciFormBox')
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' })
  }

  const getSleepQualityText = (score) => {
    if (score >= 8) return 'Restful & Rejuvenating'
    if (score >= 5) return 'Moderate Rest'
    return 'Restless / Needs Care'
  }

  return (
    <div id="checkin" style={{ color: '#0F172A', maxWidth: '1100px', margin: '0 auto' }}>
      {/* ─── HEADER ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B', marginBottom: '6px', fontWeight: 600 }}>
            <span
              onClick={handleCancel}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#6366F1' }}
            >
              <FiArrowLeft /> Dashboard
            </span>
            <span>›</span>
            <span>Daily Check-in</span>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Daily Rhythm &amp; Wellness Check-in
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748B' }}>
            Takes about fifteen seconds. Track your mood, sleep, and inner state — without judgment.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', padding: '6px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: '#EA580C', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🔥</span> {streak} Day Streak
          </div>
          <button
            onClick={handleCancel}
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#475569',
              padding: '7px 16px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Back to Journey
          </button>
        </div>
      </div>

      {/* ─── CHECK-IN FORM CARD ─── */}
      <div
        id="ciFormBox"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '24px',
          padding: '28px 32px',
          boxShadow: '0 8px 30px rgba(15, 23, 42, 0.04)',
          marginBottom: '28px',
        }}
      >
        {isSaved ? (
          /* Celebratory Success State */
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px' }}>
              <FiCheck />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Today's check-in recorded!
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.5 }}>
              Thank you for pausing and checking in with yourself. Your consistency is building lifelong self-awareness.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setIsSaved(false)}
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
                  padding: '9px 18px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Log another note
              </button>
              <button
                onClick={() => setActiveTab && setActiveTab('journey')}
                style={{
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                }}
              >
                Return to Journey →
              </button>
            </div>
          </div>
        ) : (
          /* Interactive Form */
          <form onSubmit={handleSave}>
            {/* Step 1: Mood */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>1.</span> Which of these best reflects your inner state today?
                </label>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Required</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {moods.map((m) => {
                  const isSelected = selectedMood === m.key
                  return (
                    <div
                      key={m.key}
                      onClick={() => setSelectedMood(m.key)}
                      style={{
                        background: isSelected ? m.bgActive : '#F8FAFC',
                        border: `2px solid ${isSelected ? m.borderActive : '#E2E8F0'}`,
                        borderRadius: '16px',
                        padding: '16px 14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? `0 4px 16px ${m.bgActive}` : 'none',
                      }}
                    >
                      <div style={{ fontSize: '26px', marginBottom: '8px' }}>{m.icon}</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: isSelected ? m.color : '#0F172A' }}>
                        {m.label}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', lineHeight: 1.35 }}>
                        {m.tag}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Step 2: Sleep Score Slider */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>2.</span> How restful was your sleep this week?
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#4F46E5', background: '#EEF2FF', padding: '3px 12px', borderRadius: '8px' }}>
                    {sleepScore} / 10
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                    ({getSleepQualityText(sleepScore)})
                  </span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={sleepScore}
                onChange={(e) => setSleepScore(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#4F46E5',
                  cursor: 'pointer',
                  height: '8px',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginTop: '6px', fontWeight: 600 }}>
                <span>0 · Restless / Exhausted</span>
                <span>5 · Moderate</span>
                <span>10 · Deep &amp; Refreshing</span>
              </div>
            </div>

            {/* Step 3: Reflection Journal Note */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>3.</span> Anything you want to note or reflect on today? (Optional)
                </label>
                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>
                  {note.length} / 500
                </span>
              </div>
              <textarea
                value={note}
                maxLength={500}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Share any thoughts, wins, challenges, or reflections with your instructor..."
                style={{
                  width: '100%',
                  borderRadius: '14px',
                  border: '1px solid #CBD5E1',
                  padding: '12px 16px',
                  fontSize: '13.5px',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  background: '#F8FAFC',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.target.style.background = '#FFFFFF'
                  e.target.style.borderColor = '#6366F1'
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.12)'
                }}
                onBlur={(e) => {
                  e.target.style.background = '#F8FAFC'
                  e.target.style.borderColor = '#CBD5E1'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Submit Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '12px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 20px rgba(139, 92, 246, 0.45)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <span>✨</span>
                {saving ? 'Saving...' : editingCheckInId ? 'Update Check-in' : "Save Today's Check-in →"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ─── PAST CHECK-IN LOGS HISTORY ─── */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '24px',
          padding: '24px 28px',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.02)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiClock style={{ color: '#6366F1' }} /> Recent Check-in Logs
          </h3>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            {checkIns.length} recorded entries
          </span>
        </div>

        {checkIns.length === 0 ? (
          <div style={{ padding: '30px 20px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
            No previous check-in entries logged yet. Complete the form above to start your rhythm!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {checkIns.slice(0, 6).map((item) => {
              const matchedMood = moods.find((m) => m.key === item.mood) || moods[2]
              const entryDate = new Date(item.createdAt).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })

              return (
                <div
                  key={item._id}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '14px',
                    padding: '12px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '22px' }}>{matchedMood.icon}</span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                          {matchedMood.label}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748B' }}>
                          • {entryDate}
                        </span>
                        <span style={{ fontSize: '11px', background: '#EEF2FF', color: '#4338CA', padding: '1px 6px', borderRadius: '6px', fontWeight: 700 }}>
                          Sleep: {item.sleepScore ?? 'N/A'}/10
                        </span>
                      </div>
                      {item.note && (
                        <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748B', fontStyle: 'italic' }}>
                          "{item.note}"
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleEditEntry(item)}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#475569',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <FiEdit2 fontSize={11} /> Edit
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckIn
