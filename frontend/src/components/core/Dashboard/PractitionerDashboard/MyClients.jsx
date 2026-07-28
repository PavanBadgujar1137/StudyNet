import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { FiSearch, FiUserPlus, FiMessageSquare, FiVideo, FiX, FiCheckCircle, FiClock, FiShieldAlert } from 'react-icons/fi'
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

  useEffect(() => {
    loadApprovals()
  }, [loadApprovals])

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

  const filteredClients = clients.filter((c) => {
    const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase()
    const email = (c.email || '').toLowerCase()
    const query = searchTerm.toLowerCase()
    return fullName.includes(query) || email.includes(query)
  })

  return (
    <section className="view on" id="clients">
      {/* Header */}
      <div className="htop" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="crumb">My clients &amp; Connection Requests</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>{clients.length} Active Client(s) &amp; Students</h1>
          <p style={{ color: '#64748B', fontSize: '14px' }}>Review payment verifications, approve new clients, and manage 1-on-1 sessions.</p>
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
          onClick={() => setShowInviteModal(true)}
        >
          <FiUserPlus size={18} /> Add / Connect Client
        </button>
      </div>

      {/* PENDING PAYMENT APPROVALS SECTION */}
      {pendingApprovals.length > 0 && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B45309', fontWeight: 800, fontSize: '16px', marginBottom: '12px' }}>
            <FiClock size={20} /> Pending Payment Verifications &amp; Client Approvals ({pendingApprovals.length})
          </div>
          <p style={{ color: '#92400E', fontSize: '13px', marginBottom: '16px' }}>
            The following clients selected you on the Practitioners directory and paid their session fee via Razorpay. Review and approve to connect.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingApprovals.map((pa) => {
              const cl = pa.client || {}
              const cName = `${cl.firstName || 'Client'} ${cl.lastName || ''}`
              return (
                <div
                  key={pa._id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #FDE68A',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
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
                      <FiCheckCircle size={15} /> Approve Client
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

      {/* Search Bar */}
      <div style={{ marginBottom: '16px', position: 'relative' }}>
        <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} size={18} />
        <input
          type="text"
          placeholder="Search client by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px 12px 46px',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            background: '#FFFFFF',
            fontSize: '14px',
            color: '#0F172A',
            outline: 'none',
          }}
        />
      </div>

      {/* Clients Table */}
      <div className="card">
        <div className="scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Email</th>
                <th>Joined Date</th>
                <th>Connection Status</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => {
                  const initials = `${client.firstName?.slice(0, 1) || 'C'}${client.lastName?.slice(0, 1) || ''}`
                  return (
                    <tr key={client._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                              color: '#FFF',
                              fontWeight: 700,
                              fontSize: '13px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textTransform: 'uppercase'
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <b style={{ color: '#0F172A' }}>{client.firstName} {client.lastName}</b>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: '#64748B', fontSize: '13px' }}>{client.email}</td>
                      <td style={{ color: '#64748B', fontSize: '13px' }}>
                        {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'Active Member'}
                      </td>
                      <td><span className="pill ok">Approved &amp; Connected</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
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
                    {searchTerm ? `No clients matching "${searchTerm}".` : 'No connected clients found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                Add / Connect Client Direct
              </h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                onClick={() => setShowInviteModal(false)}
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleAddClient}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Client Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. client@example.com"
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
                  {submitting ? 'Connecting...' : 'Connect Client'}
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
