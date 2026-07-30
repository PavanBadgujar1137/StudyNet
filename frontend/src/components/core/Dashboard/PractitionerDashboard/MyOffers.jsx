import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
  FiPlus,
  FiTag,
  FiX,
  FiTrash2,
  FiClock,
  FiEdit2,
  FiUsers,
  FiCalendar,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiZap,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { apiConnector } from '../../../../services/apiConnector'

const PRESETS = [
  {
    label: '⚡ 1:1 Initial Consultation',
    title: '1:1 Initial Consultation & Assessment',
    type: 'session',
    price: 1500,
    durationMinutes: 60,
    maxSeats: '',
    weekCount: '',
    tags: '60 Min 1:1 Video Call, Initial Diagnosis & Goal Setting, Post-Session Action Plan',
    description: 'Comprehensive 60-minute initial consultation to understand your goals, assess current wellbeing, and build a tailored action plan.',
  },
  {
    label: '🌿 1:1 Therapy Session',
    title: '1:1 Deep Healing & Counseling Session',
    type: 'session',
    price: 2500,
    durationMinutes: 50,
    maxSeats: '',
    weekCount: '',
    tags: '50 Min 1:1 Call, Personalized Guided Exercises, AURA AI Notes Summary',
    description: 'Dedicated 50-minute 1:1 session focusing on therapeutic guidance, emotional processing, and personalized coping strategies.',
  },
  {
    label: '👥 Group Support Circle',
    title: 'Weekly Group Support & Healing Circle',
    type: 'circle',
    price: 800,
    durationMinutes: 90,
    maxSeats: 12,
    weekCount: 4,
    tags: '90 Min Weekly Circle, Max 12 Participants, 4-Week Cohort, Private Group Chat',
    description: 'Intimate, safe group healing space designed to build community, share reflections, and practice mindfulness together weekly.',
  },
  {
    label: '🎓 4-Week Mastery Program',
    title: '4-Week Stress & Anxiety Resilience Program',
    type: 'program',
    price: 4999,
    durationMinutes: 60,
    maxSeats: 20,
    weekCount: 4,
    tags: '4 Weekly Sessions, Workbook & Audio Tools, 1:1 Mid-way Check-in, Lifetime Access',
    description: 'Structured 4-week program offering evidence-based tools, weekly guided cohorts, and direct practitioner support to master stress.',
  },
]

export function MyOffers({ telemetryData, onUpdate }) {
  const { token } = useSelector((state) => state.auth)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingOffer, setEditingOffer] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  // Filter tab state ('all' | 'session' | 'circle' | 'program')
  const [activeTab, setActiveTab] = useState('all')

  // Offer Form Inputs State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [type, setType] = useState('session')
  const [durationMinutes, setDurationMinutes] = useState(50)
  const [maxSeats, setMaxSeats] = useState('')
  const [weekCount, setWeekCount] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [status, setStatus] = useState('published')

  const [offersList, setOffersList] = useState(telemetryData?.offers || [])

  // Fetch practitioner's real published offers from backend
  const loadOffers = useCallback(async () => {
    if (!token) return
    try {
      const res = await apiConnector('GET', '/api/v1/offers', null, {
        Authorization: `Bearer ${token}`,
      })
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

  const handleOpenCreateModal = () => {
    setEditingOffer(null)
    setTitle('')
    setDescription('')
    setPrice('')
    setType('session')
    setDurationMinutes(50)
    setMaxSeats('')
    setWeekCount('')
    setTagsInput('')
    setStatus('published')
    setShowCreateModal(true)
  }

  const handleOpenEditModal = (offer) => {
    setEditingOffer(offer)
    setTitle(offer.title || '')
    setDescription(offer.description || '')
    setPrice(offer.price !== undefined ? offer.price : '')
    setType(offer.type || 'session')
    setDurationMinutes(offer.durationMinutes || 50)
    setMaxSeats(offer.maxSeats || '')
    setWeekCount(offer.weekCount || '')
    setTagsInput(Array.isArray(offer.tags) ? offer.tags.join(', ') : '')
    setStatus(offer.status || 'published')
    setShowCreateModal(true)
  }

  const applyPreset = (preset) => {
    setTitle(preset.title)
    setType(preset.type)
    setPrice(preset.price)
    setDurationMinutes(preset.durationMinutes)
    setMaxSeats(preset.maxSeats)
    setWeekCount(preset.weekCount)
    setTagsInput(preset.tags)
    setDescription(preset.description)
    setStatus('published')
    toast.success(`Preset "${preset.label}" applied! Customize any field below.`)
  }



  const handleSubmitOffer = async (e) => {
    e.preventDefault()
    if (!title || price === '' || isNaN(Number(price))) {
      toast.error('Offer title and valid price are required.')
      return
    }

    setSubmitting(true)
    const formattedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const payload = {
      title,
      description,
      price: Number(price),
      type,
      kind: type,
      durationMinutes: Number(durationMinutes) || 50,
      maxSeats: maxSeats ? Number(maxSeats) : undefined,
      weekCount: weekCount ? Number(weekCount) : undefined,
      tags: formattedTags,
      status,
    }

    try {
      let res
      if (editingOffer) {
        // Update existing offer
        res = await apiConnector('PUT', `/api/v1/offers/${editingOffer._id}`, payload, {
          Authorization: `Bearer ${token}`,
        })
      } else {
        // Create new offer
        res = await apiConnector('POST', '/api/v1/offers', payload, {
          Authorization: `Bearer ${token}`,
        })
      }

      if (res?.data?.success) {
        toast.success(
          editingOffer ? 'Offer updated successfully!' : '🎉 Offer published to directory successfully!'
        )
        setShowCreateModal(false)
        loadOffers()
        if (onUpdate) onUpdate()
      } else {
        toast.error(res?.data?.message || 'Failed to save offer')
      }
    } catch (err) {
      console.error('Submit offer error:', err)
      toast.error('Could not save offer')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (offer) => {
    setTogglingId(offer._id)
    const newStatus = offer.status === 'published' ? 'draft' : 'published'
    try {
      const res = await apiConnector(
        'PUT',
        `/api/v1/offers/${offer._id}`,
        { status: newStatus },
        { Authorization: `Bearer ${token}` }
      )
      if (res?.data?.success) {
        toast.success(`Offer marked as ${newStatus === 'published' ? 'LIVE' : 'DRAFT'}`)
        loadOffers()
        if (onUpdate) onUpdate()
      } else {
        toast.error(res?.data?.message || 'Could not update offer status')
      }
    } catch (err) {
      toast.error('Failed to update status')
    } finally {
      setTogglingId(null)
    }
  }

  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return
    setDeletingId(offerId)
    try {
      const res = await apiConnector('DELETE', `/api/v1/offers/${offerId}`, null, {
        Authorization: `Bearer ${token}`,
      })

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

  // Filtered lists
  const filteredOffers = offersList.filter((o) => {
    if (activeTab === 'all') return true
    return (o.type || 'session').toLowerCase() === activeTab
  })

  const sessionCount = offersList.filter((o) => (o.type || 'session').toLowerCase() === 'session').length
  const circleCount = offersList.filter((o) => (o.type || 'session').toLowerCase() === 'circle').length
  const programCount = offersList.filter((o) => (o.type || 'session').toLowerCase() === 'program').length

  return (
    <section className="view on" id="offers">
      {/* HEADER BAR */}
      <div
        className="htop"
        style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div className="crumb">My Offers &amp; Profile</div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: '4px 0 0 0' }}>
            Offers &amp; Practice Settings
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px', margin: '4px 0 0 0' }}>
            Set custom prices for your 1:1 sessions, group circles, and programs. Client payments are processed centrally by Admin and settled via your monthly practitioner salary.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          style={{
            background: 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '14.5px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(31, 95, 224, 0.3)',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <FiPlus size={18} /> + Create New Offer / Program
        </button>
      </div>



      {/* OFFERS HEADER & FILTER TABS */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Published Offers &amp; Programs ({offersList.length})
            </h3>
            <p style={{ color: '#64748B', fontSize: '13.5px', margin: '2px 0 0 0' }}>
              Clients can view, select, and pay for these offers directly on your directory profile.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', background: '#F1F5F9', padding: '4px', borderRadius: '12px' }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                background: activeTab === 'all' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'all' ? '#1F5FE0' : '#64748B',
                boxShadow: activeTab === 'all' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              All ({offersList.length})
            </button>
            <button
              onClick={() => setActiveTab('session')}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                background: activeTab === 'session' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'session' ? '#1F5FE0' : '#64748B',
                boxShadow: activeTab === 'session' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              1:1 Sessions ({sessionCount})
            </button>
            <button
              onClick={() => setActiveTab('circle')}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                background: activeTab === 'circle' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'circle' ? '#1F5FE0' : '#64748B',
                boxShadow: activeTab === 'circle' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Circles ({circleCount})
            </button>
            <button
              onClick={() => setActiveTab('program')}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                background: activeTab === 'program' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'program' ? '#1F5FE0' : '#64748B',
                boxShadow: activeTab === 'program' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Programs ({programCount})
            </button>
          </div>
        </div>

        {/* OFFERS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredOffers.length > 0 ? (
            filteredOffers.map((o) => {
              const offerType = (o.type || 'session').toLowerCase()
              const isPublished = o.status === 'published' || !o.status

              return (
                <div
                  key={o._id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: isPublished ? '1px solid #E2E8F0' : '1px dashed #CBD5E1',
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    boxShadow: isPublished ? '0 2px 12px rgba(0,0,0,0.03)' : 'none',
                    opacity: isPublished ? 1 : 0.78,
                    position: 'relative',
                  }}
                >
                  <div>
                    {/* Top Meta Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            padding: '3px 9px',
                            borderRadius: '6px',
                            background:
                              offerType === 'circle'
                                ? '#FEF3C7'
                                : offerType === 'program'
                                ? '#F3E8FF'
                                : '#DBEAFE',
                            color:
                              offerType === 'circle'
                                ? '#92400E'
                                : offerType === 'program'
                                ? '#6B21A8'
                                : '#1E40AF',
                          }}
                        >
                          {offerType === 'circle' ? 'Group Circle' : offerType === 'program' ? 'Program' : '1:1 Session'}
                        </span>

                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: isPublished ? '#DCFCE7' : '#F1F5F9',
                            color: isPublished ? '#166534' : '#64748B',
                          }}
                        >
                          {isPublished ? '● LIVE' : '○ DRAFT'}
                        </span>
                      </div>

                      <span style={{ fontSize: '20px', fontWeight: 900, color: '#1F5FE0' }}>
                        ₹{o.price}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 style={{ fontSize: '16.5px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                      {o.title}
                    </h3>
                    <p style={{ fontSize: '13.5px', color: '#64748B', margin: '0 0 14px 0', lineHeight: 1.45 }}>
                      {o.description || '1:1 Guidance & wellbeing session with post-session summaries.'}
                    </p>

                    {/* Format Specs */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', fontSize: '12px', color: '#475569' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F8FAFC', padding: '4px 8px', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
                        <FiClock size={13} style={{ color: '#1F5FE0' }} /> {o.durationMinutes || 50} mins
                      </span>
                      {o.maxSeats && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F8FAFC', padding: '4px 8px', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
                          <FiUsers size={13} style={{ color: '#D97706' }} /> Max {o.maxSeats} Seats
                        </span>
                      )}
                      {o.weekCount && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F8FAFC', padding: '4px 8px', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
                          <FiCalendar size={13} style={{ color: '#9333EA' }} /> {o.weekCount} Weeks
                        </span>
                      )}
                    </div>

                    {/* Included Features List */}
                    {Array.isArray(o.tags) && o.tags.length > 0 && (
                      <div style={{ marginBottom: '16px', background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                          What's Included:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {o.tags.map((t, idx) => (
                            <div key={idx} style={{ fontSize: '12px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FiCheckCircle size={12} style={{ color: '#166534', flexShrink: 0 }} />
                              <span>{t}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenEditModal(o)}
                        style={{
                          background: '#EFF6FF',
                          color: '#1D4ED8',
                          border: '1px solid #BFDBFE',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <FiEdit2 size={13} /> Edit
                      </button>

                      <button
                        onClick={() => handleToggleStatus(o)}
                        disabled={togglingId === o._id}
                        style={{
                          background: isPublished ? '#F8FAFC' : '#ECFDF5',
                          color: isPublished ? '#475569' : '#047857',
                          border: `1px solid ${isPublished ? '#CBD5E1' : '#A7F3D0'}`,
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        {isPublished ? <FiEyeOff size={13} /> : <FiEye size={13} />}
                        {togglingId === o._id ? 'Updating...' : isPublished ? 'Unpublish' : 'Make Live'}
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteOffer(o._id)}
                      disabled={deletingId === o._id}
                      style={{
                        background: '#FEF2F2',
                        color: '#991B1B',
                        border: '1px solid #FCA5A5',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <FiTrash2 size={13} /> {deletingId === o._id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <div
              style={{
                gridColumn: '1 / -1',
                background: '#FFFFFF',
                padding: '40px 24px',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                textAlign: 'center',
                color: '#64748B',
              }}
            >
              <FiTag size={32} style={{ color: '#CBD5E1', marginBottom: '10px' }} />
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                No offers found under "{activeTab}"
              </h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '14px' }}>
                Click "+ Create New Offer / Program" above to add your 1:1 sessions, group circles, or multi-week programs!
              </p>
              <button
                onClick={handleOpenCreateModal}
                style={{
                  background: '#1F5FE0',
                  color: '#FFF',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                + Add Your First Offer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT OFFER MODAL */}
      {showCreateModal && (
        <div
          onClick={() => setShowCreateModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            zIndex: 99999,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#FFFFFF',
              borderRadius: '24px',
              width: '90%',
              maxWidth: '560px',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              zIndex: 100000,
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
                  {editingOffer ? '✏️ Edit Practice Offer' : '🚀 Publish Practice Offer / Program'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                  {editingOffer ? 'Update details, pricing, or included features.' : 'Choose a quick preset template below or customize your offer manually.'}
                </p>
              </div>

              <button
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
                onClick={() => setShowCreateModal(false)}
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Quick Presets Bar (only shown when creating new) */}
            {!editingOffer && (
              <div style={{ marginBottom: '20px', background: '#F8FAFC', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FiZap style={{ color: '#D97706' }} /> Quick Preset Templates (1-Click Fill):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(p)}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#1E293B',
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#1F5FE0'
                        e.currentTarget.style.color = '#1F5FE0'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#CBD5E1'
                        e.currentTarget.style.color = '#1E293B'
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmitOffer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Type & Status Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Format / Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none', fontWeight: 700 }}
                  >
                    <option value="session">👤 1:1 Counseling Session</option>
                    <option value="circle">👥 Group Support Circle</option>
                    <option value="program">🎓 Multi-Week Program</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Directory Visibility *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none', fontWeight: 700 }}
                  >
                    <option value="published">● Published (Live on Directory)</option>
                    <option value="draft">○ Draft (Hidden / Private)</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Offer Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1:1 Anxiety & Stress Relief Session"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
                  required
                />
              </div>

              {/* Price & Duration Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Fee Amount (₹ INR) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
                    required
                    min={0}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Session Duration *
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none' }}
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={50}>50 Minutes (Standard)</option>
                    <option value={60}>60 Minutes (1 Hour)</option>
                    <option value={90}>90 Minutes</option>
                    <option value={120}>120 Minutes (2 Hours)</option>
                  </select>
                </div>
              </div>

              {/* Circle / Program conditional fields */}
              {(type === 'circle' || type === 'program') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', background: '#F8FAFC', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Max Seats (Capacity)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 12"
                      value={maxSeats}
                      onChange={(e) => setMaxSeats(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Duration in Weeks
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 4"
                      value={weekCount}
                      onChange={(e) => setWeekCount(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                </div>
              )}

              {/* What's Included / Feature Tags */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  What's Included / Features (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1:1 Video Call, AURA Post-Session Summary, Async Chat Support"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none' }}
                />

                {/* Tags Preview Chips */}
                {tagsInput.trim() && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {tagsInput
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((t, idx) => (
                        <span key={idx} style={{ fontSize: '11px', background: '#DCFCE7', color: '#166534', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FiCheckCircle size={10} /> {t}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Detailed Description &amp; What Client Receives
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what client receives in this session or program..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none', lineHeight: 1.45 }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '11px 18px',
                    borderRadius: '10px',
                    background: '#F1F5F9',
                    border: 'none',
                    color: '#475569',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '13.5px',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '11px 24px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(31, 95, 224, 0.25)',
                  }}
                >
                  {submitting ? 'Saving...' : editingOffer ? 'Update Offer' : 'Publish Offer'}
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
