import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { FiPlus, FiTag, FiX, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { apiConnector } from '../../../../services/apiConnector'

export function MyOffers({ telemetryData, onUpdate }) {
  const { token } = useSelector((state) => state.auth)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [kind, setKind] = useState('Session')
  const [duration] = useState('60 min')

  const offers = telemetryData?.offers || []
  const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:4000/api/v1'

  const handleCreateOffer = async (e) => {
    e.preventDefault()
    if (!title || !price) {
      toast.error('Title and price are required.')
      return
    }

    setSubmitting(true)
    try {
      const res = await apiConnector(
        'POST',
        `${BASE_URL}/offers`,
        { 
          title, 
          description, 
          price: Number(price), 
          type: kind.toLowerCase() === 'package' ? 'program' : kind.toLowerCase(), 
          kind, 
          duration,
          durationMinutes: 60
        },
        { Authorization: `Bearer ${token}` }
      )

      if (res?.data?.success) {
        toast.success('Offer created successfully!')
        setShowCreateModal(false)
        setTitle('')
        setDescription('')
        setPrice('')
        if (onUpdate) onUpdate()
      } else {
        toast.error(res?.data?.message || 'Failed to create offer')
      }
    } catch (err) {
      console.error('Create offer error:', err)
      toast.error('Could not create offer')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return
    setDeletingId(offerId)
    try {
      const res = await apiConnector(
        'DELETE',
        `${BASE_URL}/offers/${offerId}`,
        null,
        { Authorization: `Bearer ${token}` }
      )
      if (res?.data?.success) {
        toast.success('Offer deleted successfully')
        if (onUpdate) onUpdate()
      } else {
        toast.error(res?.data?.message || 'Failed to delete offer')
      }
    } catch (err) {
      console.error('Delete offer error:', err)
      toast.error('Could not delete offer')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="view on" id="offers">
      <div className="htop" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div className="crumb">My offers</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>What clients can book</h1>
          <p style={{ color: '#64748B', fontSize: '14px' }}>{offers.length} active offer(s) created in your practice directory.</p>
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
          <FiPlus size={18} /> Create an offer
        </button>
      </div>

      <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {offers.length > 0 ? (
          offers.map((offer) => (
            <div key={offer._id} className="offer" style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div className="kind" style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase' }}>
                  {offer.kind || offer.type || 'Session'}
                </div>
                <button
                  onClick={() => handleDeleteOffer(offer._id)}
                  disabled={deletingId === offer._id}
                  title="Delete offer"
                  style={{
                    background: '#FEE2E2',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    color: '#DC2626',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FiTrash2 size={13} /> {deletingId === offer._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>

              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>{offer.title}</h4>
              <p className="d" style={{ fontSize: '13px', color: '#64748B', marginBottom: '12px' }}>{offer.description || 'Practice offer for clients'}</p>
              <div className="prc" style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                ₹{offer.price ? offer.price.toLocaleString('en-IN') : '0'}
              </div>
              <div className="sub" style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '12px' }}>{offer.duration || '60 min'}</div>
              <div className="cap" style={{ fontSize: '12px', fontWeight: 600, color: '#166534', background: '#F0FDF4', padding: '4px 10px', borderRadius: '999px', display: 'inline-block' }}>
                {offer.enrolledCount || 0} booking(s) logged
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '40px 20px', textAlign: 'center', background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <FiTag size={36} style={{ margin: '0 auto 12px', color: '#94A3B8' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>No practice offers published yet</h3>
            <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '16px' }}>Create custom 1:1 session packages or circle cohort seats for your clients.</p>
            <button
              className="btn"
              style={{
                background: 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)',
                color: '#FFF',
                padding: '10px 22px',
                borderRadius: '12px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => setShowCreateModal(true)}
            >
              <FiPlus size={16} style={{ display: 'inline', marginRight: '6px' }} /> Create your first offer
            </button>
          </div>
        )}
      </div>

      {/* Breakdown Table */}
      {offers.length > 0 && (
        <div className="card" style={{ marginTop: '20px', background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px' }}>
          <div className="sechd"><h3 style={{ fontSize: '16px', fontWeight: 700 }}>Practice Offer Breakdown</h3></div>
          <div className="scroll" style={{ overflowX: 'auto', marginTop: '12px' }}>
            <table className="tbl" style={{ width: '100%', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                  <th style={{ padding: '10px' }}>Offer</th>
                  <th style={{ padding: '10px' }}>Type</th>
                  <th style={{ padding: '10px' }}>Price</th>
                  <th style={{ padding: '10px' }}>Enrolled</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((o) => (
                  <tr key={o._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px' }}><b>{o.title}</b></td>
                    <td style={{ padding: '10px' }}>{o.kind || o.type || 'Session'}</td>
                    <td style={{ padding: '10px' }}>₹{o.price ? o.price.toLocaleString('en-IN') : '0'}</td>
                    <td style={{ padding: '10px' }}>{o.enrolledCount || 0}</td>
                    <td style={{ padding: '10px' }}><span style={{ color: '#166534', fontWeight: 700 }}>Active</span></td>
                    <td style={{ padding: '10px' }}>
                      <button
                        onClick={() => handleDeleteOffer(o._id)}
                        disabled={deletingId === o._id}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#DC2626',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <FiTrash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Offer Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#FFF', borderRadius: '20px', maxWidth: '480px', width: '100%', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>Create Practice Offer</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><FiX size={20} /></button>
            </div>

            <form onSubmit={handleCreateOffer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Offer Title *</label>
                <input
                  type="text"
                  placeholder="e.g. 1:1 Executive Coaching Session"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Description</label>
                <textarea
                  placeholder="Briefly describe what is included in this offer..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="3500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Offer Type</label>
                  <select
                    value={kind}
                    onChange={(e) => setKind(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  >
                    <option value="Session">1:1 Session</option>
                    <option value="Circle">Circle Cohort</option>
                    <option value="Package">Multi-Session Package</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)', color: '#FFF', fontSize: '13px', fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Creating...' : 'Save & Publish Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default MyOffers
