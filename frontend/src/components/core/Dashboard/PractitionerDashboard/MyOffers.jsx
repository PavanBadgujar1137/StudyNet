import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { FiPlus, FiTag, FiX, FiTrash2, FiClock, FiUserCheck, FiSave, FiCheckCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { apiConnector } from '../../../../services/apiConnector'

export function MyOffers({ telemetryData, onUpdate }) {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // Offer Creation State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [kind, setKind] = useState('Session')

  // Practitioner Profile Bio & Specialties State
  const [credentialsState, setCredentialsState] = useState(user?.credentials || '')
  const [bioState, setBioState] = useState(user?.bio || '')
  const [specialtiesState, setSpecialtiesState] = useState(
    Array.isArray(user?.specialties) ? user.specialties.join(', ') : (user?.specialties || '')
  )

  const [offersList, setOffersList] = useState(telemetryData?.offers || [])

  // Fetch practitioner's real published offers & profile from backend
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

      // Also load current practitioner profile details
      const resDash = await apiConnector('GET', '/api/v1/profile/practitioner-dashboard', null, { Authorization: `Bearer ${token}` })
      if (resDash?.data?.data?.practitioner) {
        const pInfo = resDash.data.data.practitioner
        if (pInfo.credentials) setCredentialsState(pInfo.credentials)
      }
    } catch (err) {
      console.error('Error loading practitioner offers:', err)
    }
  }, [token])

  useEffect(() => {
    loadOffers()
  }, [loadOffers])

  const handleSavePractitionerDetails = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await apiConnector(
        'PUT',
        '/api/v1/profile/practitioner-details',
        {
          credentials: credentialsState,
          bio: bioState,
          specialties: specialtiesState,
        },
        { Authorization: `Bearer ${token}` }
      )
      if (res?.data?.success) {
        toast.success('Practitioner Bio, Title & Specialty Tags saved live!')
        if (onUpdate) onUpdate()
      } else {
        toast.error(res?.data?.message || 'Could not save profile details')
      }
    } catch (err) {
      console.error('Save profile error:', err)
      toast.error('Failed to save profile details')
    } finally {
      setSavingProfile(false)
    }
  }

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
          <div className="crumb">My offers &amp; Profile</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>Offers &amp; Practitioner Settings</h1>
          <p style={{ color: '#64748B', fontSize: '14px' }}>
            Set your bio, qualification title, specialty tags, and published offers for the public directory.
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
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(31, 95, 224, 0.25)',
          }}
        >
          <FiPlus size={16} /> Create new offer
        </button>
      </div>

      {/* PRACTITIONER BIO & SPECIALTY SETTINGS SECTION */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          marginBottom: '28px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
          <FiUserCheck size={18} style={{ color: '#2563EB' }} />
          <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 800, color: '#0F172A' }}>
            Practitioner Public Bio, Title &amp; Specialties
          </h3>
        </div>

        <form onSubmit={handleSavePractitionerDetails} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Qualification Title / Role *
              </label>
              <input
                type="text"
                placeholder="e.g. Clinical Psychologist • 12 yrs exp"
                value={credentialsState}
                onChange={(e) => setCredentialsState(e.target.value)}
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

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Specialty Tags (Comma separated) *
              </label>
              <input
                type="text"
                placeholder="e.g. anxiety, mindfulness, career, burnout, cbt, relationships"
                value={specialtiesState}
                onChange={(e) => setSpecialtiesState(e.target.value)}
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
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Professional Bio &amp; Approach *
            </label>
            <textarea
              rows={3}
              placeholder="Describe your practice focus, approach, and how you support clients..."
              value={bioState}
              onChange={(e) => setBioState(e.target.value)}
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

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={savingProfile}
              style={{
                background: '#2563EB',
                color: '#FFFFFF',
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '13.5px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FiSave size={15} /> {savingProfile ? 'Saving...' : 'Save Profile & Specialty Tags'}
            </button>
          </div>
        </form>
      </div>

      {/* OFFERS LIST SECTION */}
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px 0' }}>
          Published Offers &amp; Programs ({offersList.length})
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {offersList.length > 0 ? (
          offersList.map((o) => (
            <div
              key={o._id}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', padding: '3px 8px', borderRadius: '6px', background: '#DBEAFE', color: '#1E40AF' }}>
                    {o.type || o.kind || 'Session'}
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#2563EB' }}>
                    ₹{o.price}
                  </span>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                  {o.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 14px 0', lineHeight: 1.45 }}>
                  {o.description || '1:1 Guidance & wellbeing session.'}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiClock size={14} /> {o.durationMinutes || 50} mins
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
                    gap: '4px',
                  }}
                >
                  <FiTrash2 size={13} /> {deletingId === o._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', background: '#FFFFFF', padding: '32px', borderRadius: '16px', border: '1px solid #E2E8F0', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
            No published offers created yet. Click "Create new offer" above to add your 1:1 sessions or group circle pricing!
          </div>
        )}
      </div>

      {/* CREATE OFFER MODAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', width: '90%', maxWidth: '460px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>Publish New Practice Offer</h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }} onClick={() => setShowCreateModal(false)}>
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOffer}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Offer Type *</label>
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
                >
                  <option value="Session">1:1 Wellbeing &amp; Guidance Session</option>
                  <option value="Circle">Group Circle Cohort</option>
                  <option value="Program">Multi-Week Program / Package</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Offer Title *</label>
                <input
                  type="text"
                  placeholder="e.g. 1:1 Guidance &amp; Stress Session"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Fee Amount (₹ INR) *</label>
                <input
                  type="number"
                  placeholder="e.g. 2500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Short Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe what client receives in this session or program..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '10px 16px', borderRadius: '10px', background: '#F1F5F9', border: 'none', color: '#475569', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '10px 20px', borderRadius: '10px', background: 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)', border: 'none', color: '#FFF', fontWeight: 700, cursor: 'pointer' }}
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
