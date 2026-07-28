import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { FiPlus, FiTag, FiX, FiTrash2, FiClock } from 'react-icons/fi'
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

  const [offersList, setOffersList] = useState(telemetryData?.offers || [])

  // Fetch practitioner's real published offers from backend
  const loadOffers = useCallback(async () => {
    if (!token) return
    try {
      const res = await apiConnector(
        'GET',
        '/api/v1/offers',
        null,
        { Authorization: `Bearer ${token}` }
      )
      if (res?.data?.success) {
        setOffersList(res.data.offers || [])
      }
    } catch (err) {
      console.error('Error loading practitioner offers:', err)
    }
  }, [token])

  useEffect(() => {
    loadOffers()
  }, [loadOffers])

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
        '/api/v1/offers',
        { 
          title, 
          description, 
          price: Number(price), 
          type: kind.toLowerCase() === 'package' ? 'program' : kind.toLowerCase(), 
          kind, 
          durationMinutes: 60
        },
        { Authorization: `Bearer ${token}` }
      )

      if (res?.data?.success) {
        toast.success('Offer created & published successfully!')
        setShowCreateModal(false)
        setTitle('')
        setDescription('')
        setPrice('')
        loadOffers()
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
        `/api/v1/offers/${offerId}`,
        null,
        { Authorization: `Bearer ${token}` }
      )

      if (res?.data?.success) {
        toast.success('Offer deleted successfully')
        loadOffers()
        if (onUpdate) onUpdate()
      } else {
        toast.error(res?.data?.message || 'Could not delete offer')
      }
    } catch (err) {
      console.error('Delete offer error:', err)
      toast.error('Failed to delete offer')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="view on" id="offers">
      <div className="htop" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="crumb">My offers</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>Offers &amp; Services Manager</h1>
          <p style={{ color: '#64748B', fontSize: '14px' }}>
            Published offers appear live on the public directory &amp; client dashboard.
          </p>
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
          <FiPlus size={18} /> Create new offer
        </button>
      </div>

      {/* Grid of Offers */}
      {offersList.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {offersList.map((o) => (
            <div
              key={o._id}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      background: '#DBEAFE',
                      color: '#1E40AF',
                      padding: '3px 9px',
                      borderRadius: '20px',
                      textTransform: 'uppercase'
                    }}
                  >
                    {o.type || o.kind || 'Session'}
                  </span>
                  <span style={{ fontSize: '16px', fontWeight: 900, color: '#2563EB' }}>
                    ₹{o.price}
                  </span>
                </div>

                <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                  {o.title}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: 1.4 }}>
                  {o.description || 'Standard guidance and wellbeing session.'}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiClock size={13} /> {o.durationMinutes || 60} mins
                </span>

                <button
                  onClick={() => handleDeleteOffer(o._id)}
                  disabled={deletingId === o._id}
                  style={{
                    background: '#FEF2F2',
                    color: '#991B1B',
                    border: '1px solid #FCA5A5',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <FiTrash2 size={13} /> {deletingId === o._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', color: '#64748B', fontSize: '14px' }}>
          No custom offers created yet. Click "Create new offer" above to publish your services!
        </div>
      )}

      {/* Create Offer Modal */}
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
              maxWidth: '460px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                Create New Service Offer
              </h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                onClick={() => setShowCreateModal(false)}
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOffer}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Offer Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1:1 Stress Management & Mindfulness Session"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what client receives in this offer..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                    Price (INR ₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="2500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Type / Format
                  </label>
                  <select
                    value={kind}
                    onChange={(e) => setKind(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                    }}
                  >
                    <option value="Session">1:1 Session</option>
                    <option value="Circle">Group Circle</option>
                    <option value="Package">Multi-Week Program</option>
                  </select>
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
                  {submitting ? 'Publishing...' : 'Publish Offer'}
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
