import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { FiPlus, FiX, FiUsers, FiCalendar, FiCheckCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { apiConnector } from '../../../../services/apiConnector'

export function Circles({ telemetryData, onUpdate }) {
  const { token } = useSelector((state) => state.auth)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [name, setName] = useState('')
  const [topic, setTopic] = useState('')
  const [maxCapacity, setMaxCapacity] = useState(10)
  const [scheduleText, setScheduleText] = useState('Thursdays at 7:00 PM IST')

  const [circlesList, setCirclesList] = useState(telemetryData?.circles || [])

  // Load all circles from backend DB
  const loadCircles = useCallback(async () => {
    try {
      const res = await apiConnector('GET', '/api/v1/circle/all')
      if (res?.data?.success) {
        setCirclesList(res.data.circles || [])
      }
    } catch (err) {
      console.error('Error loading circles:', err)
    }
  }, [])

  useEffect(() => {
    loadCircles()
  }, [loadCircles])

  const handleCreateCircle = async (e) => {
    e.preventDefault()
    if (!name) {
      toast.error('Circle cohort name is required.')
      return
    }

    setSubmitting(true)
    try {
      const res = await apiConnector(
        'POST',
        '/api/v1/circle/create',
        { name, topic, seats: Number(maxCapacity), scheduleText },
        { Authorization: `Bearer ${token}` }
      )

      if (res?.data?.success) {
        toast.success('Circle cohort created & published successfully!')
        setShowCreateModal(false)
        setName('')
        setTopic('')
        loadCircles()
        if (onUpdate) onUpdate()
      } else {
        toast.error(res?.data?.message || 'Could not create circle.')
      }
    } catch (err) {
      console.error('Create circle error:', err)
      toast.error('Failed to create circle cohort.')
    } finally {
      setSubmitting(false)
    }
  }

  const activeCircles = circlesList.filter((c) => c.status !== 'completed' && c.kanbanStage !== 'completed')
  const completedCircles = circlesList.filter((c) => c.status === 'completed' || c.kanbanStage === 'completed')

  return (
    <section className="view on" id="circles">
      {/* Header */}
      <div className="htop" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="crumb">Circles</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>Circles &amp; Group Cohorts Manager</h1>
          <p style={{ color: '#64748B', fontSize: '14px' }}>{circlesList.length} circle cohort(s) active in your database.</p>
        </div>
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
          onClick={() => setShowCreateModal(true)}
        >
          <FiPlus size={18} /> Open a new circle
        </button>
      </div>

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Active Cohorts Box */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
              Active / Filling Cohorts ({activeCircles.length})
            </h3>
            <span style={{ fontSize: '12px', color: '#166534', background: '#F0FDF4', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
              Live
            </span>
          </div>

          {activeCircles.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activeCircles.map((c) => (
                <div
                  key={c._id}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{c.name}</h4>
                    <span style={{ fontSize: '11px', fontWeight: 800, background: '#DBEAFE', color: '#1E40AF', padding: '2px 7px', borderRadius: '6px' }}>
                      {c.status || 'Active'}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: '#475569', lineHeight: 1.4 }}>
                    {c.topic || 'Group peer support and mental wellbeing circle cohort.'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                    <span>👥 {c.seatsFilledCount || c.members?.length || 1} / {c.seats || 10} Members</span>
                    <span>🗓️ {c.scheduleText || 'Weekly Sessions'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>No active circle cohorts currently filling.</p>
          )}
        </div>

        {/* Completed Cohorts Box */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
              Completed Cohorts ({completedCircles.length})
            </h3>
            <span style={{ fontSize: '12px', color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
              Archived
            </span>
          </div>

          {completedCircles.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {completedCircles.map((c) => (
                <div key={c._id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{c.name}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>Completed Cohort</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>No completed circle cohorts yet.</p>
          )}
        </div>
      </div>

      {/* Create Circle Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              width: '90%',
              maxWidth: '480px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                Create New Circle Cohort
              </h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                onClick={() => setShowCreateModal(false)}
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCircle}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Circle Cohort Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mindfulness & Stress Resilience Circle"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Topic &amp; Overview
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the peer group focus and goals..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13.5px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Max Member Capacity
                  </label>
                  <input
                    type="number"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Schedule
                  </label>
                  <input
                    type="text"
                    value={scheduleText}
                    onChange={(e) => setScheduleText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    background: '#F1F5F9',
                    border: 'none',
                    color: '#475569',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)',
                    border: 'none',
                    color: '#FFF',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {submitting ? 'Publishing...' : 'Publish Circle Cohort'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default Circles
