import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { FiSearch, FiMessageSquare, FiVideo, FiX, FiCheckCircle, FiClock, FiFeather, FiSend, FiBookOpen } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { apiConnector } from '../../../../services/apiConnector'

export function MyClients({ setActiveSection, telemetryData, onUpdate }) {
  const { token } = useSelector((state) => state.auth)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [clientEmail, setClientEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [pendingApprovals, setPendingApprovals] = useState([])
  const [approvingId, setApprovingId] = useState(null)

  // Reflections state
  const [reflectionModalLearner, setReflectionModalLearner] = useState(null)
  const [reflectionsList, setReflectionsList] = useState([])
  const [newPromptText, setNewPromptText] = useState('')
  const [sendingPrompt, setSendingPrompt] = useState(false)

  const clients = telemetryData?.clients || []

  // Load connected clients and pending connection payment approvals
  const loadApprovals = useCallback(async () => {
    if (!token) return
    try {
      const res = await apiConnector(
        'GET',
        '/api/v1/practitioners/connected-clients',
        null,
        { Authorization: `Bearer ${token}` }
      )
      if (res?.data?.success) {
        setPendingApprovals(res.data.pendingApprovals || [])
      }
    } catch (err) {
      console.error('Error fetching pending approvals:', err)
    }
  }, [token])

  // Load reflections assigned/answered
  const loadReflections = useCallback(async () => {
    if (!token) return
    try {
      const res = await apiConnector(
        'GET',
        '/api/v1/reflections/practitioner',
        null,
        { Authorization: `Bearer ${token}` }
      )
      if (res?.data?.success) {
        setReflectionsList(res.data.prompts || [])
      }
    } catch (err) {
      console.error('Error fetching practitioner reflections:', err)
    }
  }, [token])

  useEffect(() => {
    loadApprovals()
    loadReflections()
  }, [loadApprovals, loadReflections])

  // Handle Practitioner approving or rejecting a client payment connection request
  const handleApproveConnection = async (connectionId, status = 'approved') => {
    if (!token) return
    setApprovingId(connectionId)
    try {
      const res = await apiConnector(
        'POST',
        '/api/v1/practitioners/approve-connection',
        { connectionId, status },
        { Authorization: `Bearer ${token}` }
      )

      if (res?.data?.success) {
        toast.success(res.data.message || `Client connection ${status}!`)
        loadApprovals()
        if (onUpdate) onUpdate()
      } else {
        toast.error(res?.data?.message || 'Action failed.')
      }
    } catch (err) {
      console.error('Approve connection error:', err)
      toast.error('Could not update connection approval status.')
    } finally {
      setApprovingId(null)
    }
  }

  const handleAddClient = async (e) => {
    e.preventDefault()
    if (!clientEmail) {
      toast.error('Please enter client email address.')
      return
    }

    setSubmitting(true)
    try {
      const res = await apiConnector(
        'POST',
        '/api/v1/practitioners/connect',
        { practitionerId: telemetryData?.practitioner?.id, email: clientEmail },
        { Authorization: `Bearer ${token}` }
      )
      if (res?.data?.success) {
        toast.success(res.data.message || 'Client added/connected successfully!')
        setShowInviteModal(false)
        setClientEmail('')
        if (onUpdate) onUpdate()
      } else {
        toast.error(res?.data?.message || 'Could not add client.')
      }
    } catch (err) {
      console.error('Add client error:', err)
      toast.error('Could not connect client.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendReflectionPrompt = async (e) => {
    e.preventDefault()
    if (!newPromptText.trim() || !reflectionModalLearner) return
    setSendingPrompt(true)
    try {
      const res = await apiConnector(
        'POST',
        '/api/v1/reflections/create',
        { clientId: reflectionModalLearner._id, promptText: newPromptText },
        { Authorization: `Bearer ${token}` }
      )
      if (res?.data?.success) {
        toast.success('Reflection prompt sent to learner!')
        setNewPromptText('')
        loadReflections()
      } else {
        toast.error(res?.data?.message || 'Failed to send prompt.')
      }
    } catch (err) {
      console.error('Send reflection error:', err)
      toast.error('Could not send reflection prompt.')
    } finally {
      setSendingPrompt(false)
    }
  }

  const filteredClients = clients.filter((c) => {
    const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase()
    const email = (c.email || '').toLowerCase()
    const query = searchTerm.toLowerCase()
    return fullName.includes(query) || email.includes(query)
  })

  // Filter reflections for currently selected learner in modal
  const learnerReflections = reflectionModalLearner
    ? reflectionsList.filter((r) => r.client?._id === reflectionModalLearner._id || r.client === reflectionModalLearner._id)
    : []

  return (
    <section className="view on" id="clients">
      {/* Header */}
      <div className="htop" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="crumb">My learners &amp; Connection Requests</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>{clients.length} Active Learner(s) &amp; Students</h1>
        </div>
      </div>

      {/* PENDING PAYMENT APPROVALS SECTION */}
      {pendingApprovals.length > 0 && (
        <div style={{ background: '#EFF6FF', border: '1px solid #93C5FD', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E40AF', fontWeight: 800, fontSize: '16px', marginBottom: '12px' }}>
            <FiClock size={20} /> Pending Learner Connections ({pendingApprovals.length})
          </div>
          <p style={{ color: '#1E3A8A', fontSize: '13px', marginBottom: '16px' }}>
            The following learners have booked your session or offer via the directory. Confirm connection to start managing sessions.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingApprovals.map((pa) => {
              const cl = pa.client || {}
              const cName = `${cl.firstName || 'Learner'} ${cl.lastName || ''}`
              return (
                <div
                  key={pa._id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #FDE68A',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    display: 'flex',
                    justifyInContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                        color: '#FFF',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {cName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{cName}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                        {cl.email} • Paid: <b style={{ color: '#166534' }}>₹{pa.amountPaid || 2500}</b> • Ref: {pa.paymentId || 'Razorpay Verified'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleApproveConnection(pa._id, 'approved')}
                      disabled={approvingId === pa._id}
                      style={{
                        background: '#166534',
                        color: '#FFF',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <FiCheckCircle size={15} /> Approve Learner
                    </button>
                    <button
                      onClick={() => handleApproveConnection(pa._id, 'rejected')}
                      disabled={approvingId === pa._id}
                      style={{
                        background: '#FEF2F2',
                        color: '#991B1B',
                        border: '1px solid #FCA5A5',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Main Connected Learners Table */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>Learners Booked With You</h3>
          <div style={{ position: 'relative', width: '260px' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search learners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div className="scroll" style={{ overflowX: 'auto' }}>
          <table className="tbl" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Learner</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enrolled Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => {
                  return (
                    <tr key={client._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: '#2563EB',
                              color: '#FFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '13px',
                            }}
                          >
                            {client.image ? (
                              <img src={client.image} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              `${client.firstName?.[0] || 'L'}${client.lastName?.[0] || ''}`
                            )}
                          </div>
                          <div>
                            <b style={{ color: '#0F172A' }}>{client.firstName} {client.lastName}</b>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748B', fontSize: '13px' }}>{client.email}</td>
                      <td style={{ padding: '14px 16px', color: '#64748B', fontSize: '13px' }}>
                        {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'Active Member'}
                      </td>
                      <td style={{ padding: '14px 16px' }}><span className="pill ok">Approved &amp; Connected</span></td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            className="mini"
                            style={{ background: '#FAF5FF', color: '#7C3AED', border: '1px solid #E9D5FF', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', fontWeight: 600 }}
                            onClick={() => setReflectionModalLearner(client)}
                            title="Assign and view reflection prompts"
                          >
                            <FiFeather size={13} /> Reflections
                          </button>
                          <button
                            className="mini"
                            style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', fontWeight: 600 }}
                            onClick={() => setActiveSection('community')}
                            title="Open direct chat in Community Hub"
                          >
                            <FiMessageSquare size={13} /> Message
                          </button>
                          <button
                            className="mini"
                            style={{ background: '#2563EB', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', fontWeight: 600 }}
                            onClick={() => setActiveSection('room')}
                            title="Schedule Zoom session"
                          >
                            <FiVideo size={13} /> Zoom
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                    {searchTerm ? `No learners matching "${searchTerm}".` : 'No connected learners found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LEARNER REFLECTIONS MODAL */}
      {reflectionModalLearner && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              width: '90%',
              maxWidth: '620px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #2563EB)', color: '#FFF', display: 'flex', alignItems: 'center', justify: 'center', fontWeight: 800 }}>
                  <FiFeather size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                    Reflections for {reflectionModalLearner.firstName} {reflectionModalLearner.lastName}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>{reflectionModalLearner.email}</p>
                </div>
              </div>
              <button
                onClick={() => setReflectionModalLearner(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: '20px' }}
              >
                <FiX />
              </button>
            </div>

            {/* Form to Assign New Reflection Prompt */}
            <form onSubmit={handleSendReflectionPrompt} style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#6B21A8', marginBottom: '6px' }}>
                ✍️ Send a New Reflection Journal Prompt
              </label>
              <textarea
                rows={3}
                placeholder="e.g. What is one pattern or intention you want to explore before our next session?"
                value={newPromptText}
                onChange={(e) => setNewPromptText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #D8B4FE',
                  fontSize: '13.5px',
                  outline: 'none',
                  marginBottom: '10px',
                  background: '#FFF',
                }}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={sendingPrompt}
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
                    color: '#FFF',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <FiSend size={14} /> {sendingPrompt ? 'Sending...' : 'Send Prompt to Learner'}
                </button>
              </div>
            </form>

            {/* Reflection Journal History */}
            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiBookOpen size={16} className="text-purple-600" /> Reflection History &amp; Responses
              </h4>

              {learnerReflections.length === 0 ? (
                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '13.5px' }}>
                  No reflection prompts assigned to this learner yet. Use the form above to send their first prompt!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {learnerReflections.map((r) => (
                    <div
                      key={r._id}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '14px 16px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#1E293B', fontSize: '14px' }}>"{r.promptText}"</span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: r.status === 'answered' ? '#DCFCE7' : r.status === 'skipped' ? '#F1F5F9' : '#FEF3C7',
                            color: r.status === 'answered' ? '#166534' : r.status === 'skipped' ? '#64748B' : '#92400E',
                          }}
                        >
                          {r.status === 'answered' ? (r.isPrivate ? 'Private Answer' : 'Shared Answer') : r.status === 'skipped' ? 'Skipped' : 'Pending Learner'}
                        </span>
                      </div>

                      {r.status === 'answered' ? (
                        <div style={{ background: '#F8FAFC', borderLeft: '3px solid #7C3AED', padding: '10px 12px', borderRadius: '6px', fontSize: '13px', color: '#334155' }}>
                          <b>Learner's Reflection:</b> {r.answerText}
                          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                            Answered on {r.answeredAt ? new Date(r.answeredAt).toLocaleDateString() : 'Recently'}
                          </div>
                        </div>
                      ) : r.status === 'skipped' ? (
                        <div style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>
                          Learner opted to skip this prompt.
                        </div>
                      ) : (
                        <div style={{ fontSize: '12px', color: '#D97706', fontStyle: 'italic' }}>
                          Waiting for learner to write their reflection...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
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
              maxWidth: '460px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                Connect Learner
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: '20px' }}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleAddClient}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Learner Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. learner@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
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

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
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
                  {submitting ? 'Connecting...' : 'Connect Learner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default MyClients
