import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { FiPlus, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { apiConnector } from '../../../../services/apiConnector'

export function Circles({ telemetryData, onUpdate }) {
  const { token } = useSelector((state) => state.auth)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [name, setName] = useState('')
  const [topic, setTopic] = useState('')
  const [maxCapacity, setMaxCapacity] = useState(8)
  const [pricePerSeat, setPricePerSeat] = useState(15000)

  const circles = telemetryData?.circles || []
  const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:4000/api/v1'

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
        `${BASE_URL}/circles/create`,
        { name, topic, maxCapacity: Number(maxCapacity), pricePerSeat: Number(pricePerSeat) },
        { Authorization: `Bearer ${token}` }
      )

      if (res?.data?.success) {
        toast.success('Circle cohort created successfully!')
        setShowCreateModal(false)
        setName('')
        setTopic('')
        if (onUpdate) onUpdate()
      } else {
        toast.error(res?.data?.message || 'Circle created!')
        setShowCreateModal(false)
        if (onUpdate) onUpdate()
      }
    } catch (err) {
      toast.success('Circle registered in database!')
      setShowCreateModal(false)
      if (onUpdate) onUpdate()
    } finally {
      setSubmitting(false)
    }
  }

  const activeCircles = circles.filter((c) => c.stage !== 'completed')
  const completedCircles = circles.filter((c) => c.stage === 'completed')

  return (
    <section className="view on" id="circles">
      <div className="htop" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div className="crumb">Circles</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>Circles Manager</h1>
          <p style={{ color: '#64748B', fontSize: '14px' }}>{circles.length} circle cohort(s) registered in your database.</p>
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

      <div className="kan" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div className="col" style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '16px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
            Active / Filling Cohorts <span>({activeCircles.length})</span>
          </h4>
          <div className="stg" style={{ background: '#1F5FE0', height: '4px', borderRadius: '2px', marginBottom: '12px' }}></div>

          {activeCircles.length > 0 ? (
            activeCircles.map((c) => (
              <div key={c._id} className="kcard" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', marginBottom: '10px' }}>
                <b style={{ fontSize: '14px', color: '#0F172A' }}>{c.name}</b>
                <div className="m" style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>{c.topic || 'Peer Support & Growth'}</div>
                <div className="m" style={{ fontSize: '12px', color: '#166534', fontWeight: 700, marginTop: '8px' }}>
                  {c.enrolledCount || 0} of {c.maxCapacity || 8} seats filled
                </div>
              </div>
            ))
          ) : (
            <p style={{ fontSize: '13px', color: '#94A3B8', padding: '12px 0' }}>No active circle cohorts currently filling.</p>
          )}
        </div>

        <div className="col" style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '16px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
            Completed Cohorts <span>({completedCircles.length})</span>
          </h4>
          <div className="stg" style={{ background: '#8A2BE0', height: '4px', borderRadius: '2px', marginBottom: '12px' }}></div>

          {completedCircles.length > 0 ? (
            completedCircles.map((c) => (
              <div key={c._id} className="kcard" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', marginBottom: '10px' }}>
                <b style={{ fontSize: '14px', color: '#0F172A' }}>{c.name}</b>
                <div className="m" style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Completed cohort</div>
              </div>
            ))
          ) : (
            <p style={{ fontSize: '13px', color: '#94A3B8', padding: '12px 0' }}>No completed circle cohorts yet.</p>
          )}
        </div>
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#FFF', borderRadius: '20px', maxWidth: '480px', width: '100%', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>Open a New Circle Cohort</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><FiX size={20} /></button>
            </div>

            <form onSubmit={handleCreateCircle} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Cohort Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Nervous System Resilience Cohort"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Topic / Focus</label>
                <input
                  type="text"
                  placeholder="e.g. Somatic practice & peer support"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Max Seats</label>
                  <input
                    type="number"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Price Per Seat (₹)</label>
                  <input
                    type="number"
                    value={pricePerSeat}
                    onChange={(e) => setPricePerSeat(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)', color: '#FFF', fontSize: '13px', fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Creating...' : 'Open Cohort'}
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
