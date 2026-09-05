import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { FiPlus, FiX, FiUsers, FiMessageSquare, FiEdit2, FiTrash2, FiAlertTriangle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { apiConnector } from '../../../../services/apiConnector'

export function Circles({ telemetryData, onUpdate, setActiveSection }) {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCircle, setEditingCircle] = useState(null)
  const [deletingCircle, setDeletingCircle] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // Create state
  const [name, setName] = useState('')
  const [topic, setTopic] = useState('')
  const [maxCapacity, setMaxCapacity] = useState(8)

  // Edit state
  const [editName, setEditName] = useState('')
  const [editTopic, setEditTopic] = useState('')
  const [editSeats, setEditSeats] = useState(10)

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
      toast.error('Circle name is required.')
      return
    }

    setSubmitting(true)
    try {
      const res = await apiConnector(
        'POST',
        '/api/v1/circle/create',
        { name, topic, seats: Number(maxCapacity) },
        { Authorization: `Bearer ${token}` }
      )

      if (res?.data?.success) {
        toast.success('Circle created & synced to Community Chat!')
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
      const errMsg = err?.response?.data?.message || err?.data?.message || 'Failed to create Circle.'
      toast.error(errMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenEditModal = (circle) => {
    setEditingCircle(circle)
    setEditName(circle.name || '')
    setEditTopic(circle.topic || '')
    setEditSeats(circle.seats || 10)
  }

  const handleSaveCircleEdit = async (e) => {
    e.preventDefault()
    if (!editName) {
      toast.error('Circle name is required.')
      return
    }

    setSubmitting(true)
    try {
      const res = await apiConnector(
        'PUT',
        `/api/v1/circle/${editingCircle._id}`,
        { name: editName, topic: editTopic, seats: Number(editSeats) },
        { Authorization: `Bearer ${token}` }
      )

      if (res?.data?.success) {
        toast.success('Circle updated successfully!')
        setEditingCircle(null)
        loadCircles()
        if (onUpdate) onUpdate()
      } else {
        toast.error(res?.data?.message || 'Could not update circle.')
      }
    } catch (err) {
      console.error('Update circle error:', err)
      const errMsg = err?.response?.data?.message || err?.data?.message || 'Failed to update Circle.'
      toast.error(errMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDeleteCircle = async () => {
    if (!deletingCircle) return
    setDeletingId(deletingCircle._id)
    try {
      const res = await apiConnector(
        'DELETE',
        `/api/v1/circle/${deletingCircle._id}`,
        null,
        { Authorization: `Bearer ${token}` }
      )

      if (res?.data?.success) {
        toast.success('Circle deleted successfully!')
        setDeletingCircle(null)
        loadCircles()
        if (onUpdate) onUpdate()
      } else {
        toast.error(res?.data?.message || 'Could not delete circle.')
      }
    } catch (err) {
      console.error('Delete circle error:', err)
      toast.error('Failed to delete Circle.')
    } finally {
      setDeletingId(null)
    }
  }

  const activeCircles = circlesList.filter((c) => c.status !== 'completed' && c.kanbanStage !== 'completed')

  return (
    <section className="view on" id="circles" style={{ padding: '4px 0 24px 0' }}>
      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            Dashboard / Circles
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Circles Manager
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px', margin: '4px 0 0 0' }}>
            {circlesList.length} Circle(s) active.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            background: 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(31, 95, 224, 0.25)',
          }}
        >
          <FiPlus size={18} /> Open a new circle
        </button>
      </div>

      {/* Active Circles Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Active / Filling Cohorts Container */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '18px',
              borderBottom: '1px solid #F1F5F9',
              paddingBottom: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiUsers size={18} style={{ color: '#2563EB' }} />
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                Active / Filling Circles ({activeCircles.length})
              </h3>
            </div>
            <span
              style={{
                fontSize: '11px',
                color: '#15803D',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                padding: '3px 10px',
                borderRadius: '20px',
                fontWeight: 800,
                textTransform: 'uppercase',
              }}
            >
              Live
            </span>
          </div>

          {activeCircles.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeCircles.map((c) => {
                const isMyCircle = String(c.practitioner?._id || c.practitioner) === String(user?._id)

                return (
                  <div
                    key={c._id}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '14px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>{c.name}</h4>
                      <span style={{ fontSize: '11px', fontWeight: 800, background: '#DBEAFE', color: '#1E40AF', padding: '3px 8px', borderRadius: '6px' }}>
                        {c.status || 'Active'}
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.45 }}>
                      {c.topic || 'Group peer support and mental wellbeing Circle.'}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12.5px',
                        color: '#64748B',
                        fontWeight: 600,
                        paddingTop: '10px',
                        borderTop: '1px dashed #E2E8F0',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <span>👥 {c.seatsFilledCount || c.members?.length || 1} / {c.seats || 10} Members</span>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {/* Edit & Delete Action Buttons (For Practitioner) */}
                        {isMyCircle && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(c)}
                              style={{
                                background: '#FFFFFF',
                                color: '#2563EB',
                                border: '1px solid #93C5FD',
                                padding: '5px 10px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <FiEdit2 size={13} /> Edit
                            </button>

                            <button
                              onClick={() => setDeletingCircle(c)}
                              style={{
                                background: '#FEF2F2',
                                color: '#991B1B',
                                border: '1px solid #FCA5A5',
                                padding: '5px 10px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <FiTrash2 size={13} /> Delete
                            </button>
                          </>
                        )}

                        {setActiveSection && (
                          <button
                            onClick={() => setActiveSection('community')}
                            style={{
                              background: 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)',
                              color: '#FFFFFF',
                              border: 'none',
                              padding: '5px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <FiMessageSquare size={13} /> Chat
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748B', fontSize: '13.5px' }}>
              No active Circles currently filling.
            </div>
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
            zIndex: 999,
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
                Open New Circle
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
                  Circle Name *
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

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Max Member Capacity (Decided by Practitioner)
                </label>
                <input
                  type="number"
                  min={1}
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
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                  Capacity is set by practitioner — enter any custom seat limit for this circle.
                </span>
              </div>

              {/* B2B EAP Mode Badge & Contract */}
              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#2563EB' }}>
                  🏢 B2B Org / EAP Mode Active
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#475569', leading: '1.4' }}>
                  HR gets aggregate participation rates &amp; theme clusters. HR NEVER sees individual names, transcripts, or notes.
                </p>
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
                  {submitting ? 'Publishing...' : 'Publish Circle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Circle Modal */}
      {editingCircle && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
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
                Edit Circle
              </h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                onClick={() => setEditingCircle(null)}
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCircleEdit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Circle Name *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
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
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
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

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Max Member Capacity
                </label>
                <input
                  type="number"
                  value={editSeats}
                  onChange={(e) => setEditSeats(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13.5px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditingCircle(null)}
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
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Pop-Up */}
      {deletingCircle && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              width: '90%',
              maxWidth: '440px',
              padding: '28px',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#FEF2F2',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <FiAlertTriangle size={28} />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
              Delete Circle?
            </h3>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, margin: '0 0 24px 0' }}>
              Are you sure you want to delete <strong style={{ color: '#0F172A' }}>"{deletingCircle.name}"</strong>? This will permanently remove the Circle and its group chat history.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setDeletingCircle(null)}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: '12px',
                  background: '#F1F5F9',
                  border: 'none',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCircle}
                disabled={deletingId === deletingCircle._id}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: '12px',
                  background: '#DC2626',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                }}
              >
                {deletingId === deletingCircle._id ? 'Deleting...' : 'Yes, Delete Circle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Circles
