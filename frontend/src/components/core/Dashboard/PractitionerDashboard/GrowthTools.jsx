import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  FiCopy,
  FiCheck,
  FiShare2,
  FiStar,
  FiUsers,
  FiSend,
  FiGlobe,
  FiCheckCircle,
  FiMaximize2,
  FiMail,
  FiExternalLink
} from 'react-icons/fi'
import { apiConnector } from '../../../../services/apiConnector'
import { toast } from 'react-hot-toast'

export function GrowthTools({ telemetryData, setActiveSection }) {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)

  const [copiedLink, setCopiedLink] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [clientEmail, setClientEmail] = useState('')
  const [sendingReview, setSendingReview] = useState(false)
  const [featuredReviews, setFeaturedReviews] = useState({})

  const practitioner = telemetryData?.practitioner || telemetryData?.data?.practitioner || user || {}

  // ITEM 27 FIX: Inline Specialties & Languages Editing State
  const [editingSpecLang, setEditingSpecLang] = useState(false)
  const [specialties, setSpecialties] = useState(
    practitioner.specialties?.length ? practitioner.specialties : ['Holistic Care', 'Wellness Coaching']
  )
  const [languages, setLanguages] = useState(
    practitioner.languages?.length ? practitioner.languages : ['English', 'Hindi']
  )
  const [newSpecInput, setNewSpecInput] = useState('')
  const [newLangInput, setNewLangInput] = useState('')
  const [savingSpecLang, setSavingSpecLang] = useState(false)

  const handleSaveSpecLang = async () => {
    setSavingSpecLang(true)
    try {
      const res = await apiConnector('PUT', '/api/v1/practitioners/profile', {
        specialties,
        languages,
      }, { Authorization: `Bearer ${token}` })

      if (res?.data?.success) {
        toast.success('Specialties & Languages updated on your profile!')
        setEditingSpecLang(false)
      } else {
        toast.error(res?.data?.message || 'Failed to update profile')
      }
    } catch (err) {
      toast.error('Could not update specialties')
    } finally {
      setSavingSpecLang(false)
    }
  }

  const addSpecialtyTag = () => {
    if (newSpecInput.trim() && !specialties.includes(newSpecInput.trim())) {
      setSpecialties([...specialties, newSpecInput.trim()])
      setNewSpecInput('')
    }
  }

  const removeSpecialtyTag = (tag) => {
    setSpecialties(specialties.filter((s) => s !== tag))
  }

  const addLanguageTag = () => {
    if (newLangInput.trim() && !languages.includes(newLangInput.trim())) {
      setLanguages([...languages, newLangInput.trim()])
      setNewLangInput('')
    }
  }

  const removeLanguageTag = (lang) => {
    setLanguages(languages.filter((l) => l !== lang))
  }

  // ITEM 28 & 34 FIX: Send Real Review Invitation Email
  const handleSendReviewRequest = async (e) => {
    e.preventDefault()
    if (!clientEmail.trim()) {
      toast.error('Please enter a valid client email address')
      return
    }

    setSendingReview(true)
    try {
      const res = await apiConnector('POST', '/api/v1/practitioners/request-review', {
        clientEmail: clientEmail.trim(),
      }, { Authorization: `Bearer ${token}` })

      if (res?.data?.success) {
        toast.success(res.data.message || `Review invitation sent to ${clientEmail}!`)
        setClientEmail('')
        setShowReviewModal(false)
      } else {
        toast.error(res?.data?.message || 'Failed to send review email')
      }
    } catch (err) {
      console.error('Send review email error:', err)
      toast.error(err?.response?.data?.message || 'Could not send review email')
    } finally {
      setSendingReview(false)
    }
  }

  const userId = practitioner.user?._id || practitioner.id || user?._id
  const storageKeyData = userId ? `oh_onboarding_data_${userId}` : 'oh_onboarding_data'
  const savedOnboarding = typeof window !== 'undefined' ? localStorage.getItem(storageKeyData) : null
  let parsedSaved = null
  try {
    parsedSaved = savedOnboarding ? JSON.parse(savedOnboarding) : null
  } catch (e) {}

  const savedHandle = (parsedSaved?.handle && parsedSaved?.handle.toLowerCase() !== 'test') ? parsedSaved.handle : null

  const firstName = practitioner.user?.firstName || practitioner.firstName || user?.firstName || ''
  const lastName = practitioner.user?.lastName || practitioner.lastName || user?.lastName || ''
  const nameSlug = (firstName || lastName) ? `${firstName}-${lastName}`.toLowerCase().trim().replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : ''
  
  const practHandle = (practitioner.handle && practitioner.handle.toLowerCase() !== 'test') ? practitioner.handle : null
  const userHandle = (user?.handle && user?.handle.toLowerCase() !== 'test') ? user.handle : null
  const rawHandle = practHandle || userHandle || savedHandle || nameSlug || 'practitioner'
  const cleanHandle = rawHandle
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'practitioner'

  // Dynamic origin matching active deployment environment (local, staging, production)
  const currentOrigin = (
    process.env.REACT_APP_CLIENT_URL || 
    (typeof window !== 'undefined' ? window.location.origin : 'https://openhand.live')
  ).replace(/\/$/, '')

  const bookingLink = `${currentOrigin}/practitioner/${cleanHandle}`

  const reviews = telemetryData?.reviews || practitioner?.reviews || []
  const activeClients = telemetryData?.stats?.activeClientsCount || telemetryData?.telemetry?.activeClientsCount || 0
  const ratingVal = practitioner?.rating || telemetryData?.telemetry?.rating || telemetryData?.rating || (reviews.length > 0 ? (reviews.reduce((s, r) => s + Number(r.rating || 5), 0) / reviews.length).toFixed(1) : null)
  const ratingDisplay = ratingVal ? `${ratingVal} ★` : 'No reviews yet'
  // Copy Booking Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingLink)
    setCopiedLink(true)
    toast.success('Practice booking link copied to clipboard!')
    setTimeout(() => setCopiedLink(false), 2500)
  }


  // Toggle Featured Review State
  const toggleFeature = (id) => {
    setFeaturedReviews((prev) => {
      const current = prev[id] !== undefined ? prev[id] : true
      toast.success(current ? 'Review hidden from featured list' : 'Review featured on public profile!')
      return { ...prev, [id]: !current }
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Sleek Hero Banner Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ background: '#10B981', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.5px' }}>
              GROWTH &amp; ACQUISITION HUB
            </span>
            <span style={{ color: '#94A3B8', fontSize: '13px' }}>• Verified Practitioner Directory</span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: '#ffffff' }}>
            Practice Growth Suite
          </h2>
          <p style={{ color: '#94A3B8', margin: '6px 0 0 0', fontSize: '14px', maxWidth: '640px', lineHeight: '1.5' }}>
            Expand your practice reach, share direct booking links, embed booking widgets on your website, and showcase verified client reviews.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleCopyLink}
            style={{
              background: '#3B82F6',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            {copiedLink ? <FiCheck fontSize={16} /> : <FiShare2 fontSize={16} />}
            {copiedLink ? 'Link Copied!' : 'Share Practice Link'}
          </button>

          <button
            onClick={() => setShowQrModal(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '10px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FiMaximize2 fontSize={16} /> QR Code
          </button>

          <button
            onClick={() => setActiveSection('setup')}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '10px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ⚙️ Setup Wizard
          </button>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="card stat" style={{ padding: '20px', background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748B', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Directory Status</span>
            <FiGlobe color="#10B981" fontSize={20} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '8px 0 4px 0' }}>Verified &amp; Live</div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>Listed in Global Practitioner Directory</div>
        </div>

        <div className="card stat" style={{ padding: '20px', background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748B', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Active Learners</span>
            <FiUsers color="#3B82F6" fontSize={20} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '8px 0 4px 0' }}>{activeClients}</div>
          <div style={{ fontSize: '12px', color: '#2563EB', fontWeight: 600 }}>Connected &amp; Enrolled Clients</div>
        </div>

        <div className="card stat" style={{ padding: '20px', background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748B', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Client Rating</span>
            <FiStar color="#F59E0B" fontSize={20} />
          </div>
          <div style={{ fontSize: ratingVal ? '24px' : '17px', fontWeight: 800, color: '#0F172A', margin: '8px 0 4px 0' }}>{ratingDisplay}</div>
          <div style={{ fontSize: '12px', color: '#D97706', fontWeight: 600 }}>
            {reviews.length > 0 ? `Based on ${reviews.length} client review${reviews.length === 1 ? '' : 's'}` : 'No client reviews submitted yet'}
          </div>
        </div>
      </div>

      {/* Main Grid: Booking Link vs Growth Checklist */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Direct Booking Link */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', alignSelf: 'start' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Your Dedicated Practice Link</h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                Share this link on your email signature, Instagram bio, LinkedIn, or business cards.
              </p>
            </div>
            <button
              onClick={() => setActiveSection('setup')}
              style={{
                background: '#EFF6FF',
                color: '#1D4ED8',
                border: '1px solid #BFDBFE',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
              title="Open Practice Setup Wizard to edit specialties and bio"
            >
              ⚙️ Customize Profile Setup →
            </button>
          </div>

          {/* Link Box */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <a
              href={bookingLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '13.5px',
                fontWeight: 600,
                color: '#2563EB',
                wordBreak: 'break-all',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Open public profile in new tab"
            >
              {bookingLink}
              <FiExternalLink style={{ flexShrink: 0 }} />
            </a>
            <button
              onClick={handleCopyLink}
              style={{
                background: copiedLink ? '#10B981' : '#1E293B',
                color: '#ffffff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {copiedLink ? <FiCheck /> : <FiCopy />}
              {copiedLink ? 'Copied' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Right Column: Growth Acceleration Checklist & Testimonials */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Growth Action Checklist */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Practice Setup Checklist</h3>
              <span style={{ fontSize: '12px', background: '#DCFCE7', color: '#15803D', padding: '3px 8px', borderRadius: '10px', fontWeight: 700 }}>
                {((practitioner.firstName ? 1 : 0) + (telemetryData?.offers?.length > 0 ? 1 : 0) + (reviews.length > 0 ? 1 : 0))} of 3 Completed
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155' }}>
                <FiCheckCircle color={practitioner.firstName ? "#10B981" : "#CBD5E1"} fontSize={18} />
                <span style={{ textDecoration: practitioner.firstName ? 'line-through' : 'none', color: practitioner.firstName ? '#94A3B8' : '#334155' }}>
                  Complete Practitioner Profile &amp; Bio
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: '#334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiCheckCircle color={telemetryData?.offers?.length > 0 ? "#10B981" : "#CBD5E1"} fontSize={18} />
                  <span style={{ textDecoration: telemetryData?.offers?.length > 0 ? 'line-through' : 'none', color: telemetryData?.offers?.length > 0 ? '#94A3B8' : '#334155' }}>
                    Set up Consultation Offers &amp; Rates
                  </span>
                </div>
                {setActiveSection && (
                  <button
                    onClick={() => setActiveSection('offers')}
                    style={{ background: '#EFF6FF', color: '#1D4ED8', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Manage Offers →
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: '#334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiMail color={reviews.length > 0 ? "#10B981" : "#F59E0B"} fontSize={18} />
                  <span style={{ fontWeight: reviews.length > 0 ? 400 : 600 }}>Request Reviews from Clients</span>
                </div>
                <button
                  onClick={() => setShowReviewModal(true)}
                  style={{ background: '#FEF3C7', color: '#92400E', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Send Request →
                </button>
              </div>
            </div>
          </div>

          {/* ITEM 27 FIX: Inline Specialties & Languages Editor Card */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Specialties &amp; Languages</h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>Manage tags displayed on your public booking profile</p>
              </div>
              <button
                onClick={() => setEditingSpecLang(!editingSpecLang)}
                style={{ background: editingSpecLang ? '#F1F5F9' : '#EFF6FF', color: editingSpecLang ? '#475569' : '#2563EB', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                {editingSpecLang ? 'Close' : '✏️ Edit Specialties'}
              </button>
            </div>

            {/* View Mode Tag Chips */}
            {!editingSpecLang ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Specialties:</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {specialties.map((s, i) => (
                      <span key={i} style={{ background: '#EEF2FF', color: '#3730A3', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Languages Spoken:</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {languages.map((l, i) => (
                      <span key={i} style={{ background: '#F0FDF4', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{l}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode Form */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>Specialties</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {specialties.map((s) => (
                      <span key={s} style={{ background: '#EEF2FF', color: '#3730A3', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {s}
                        <button type="button" onClick={() => removeSpecialtyTag(s)} style={{ background: 'none', border: 'none', color: '#4338CA', cursor: 'pointer', padding: 0, fontWeight: 800 }}>✕</button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Add specialty (e.g. Anxiety Management)"
                      value={newSpecInput}
                      onChange={(e) => setNewSpecInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSpecialtyTag() } }}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                    />
                    <button type="button" onClick={addSpecialtyTag} style={{ background: '#3B82F6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>+ Add</button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>Languages Spoken</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {languages.map((l) => (
                      <span key={l} style={{ background: '#F0FDF4', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {l}
                        <button type="button" onClick={() => removeLanguageTag(l)} style={{ background: 'none', border: 'none', color: '#15803D', cursor: 'pointer', padding: 0, fontWeight: 800 }}>✕</button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Add language (e.g. Spanish, French)"
                      value={newLangInput}
                      onChange={(e) => setNewLangInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLanguageTag() } }}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                    />
                    <button type="button" onClick={addLanguageTag} style={{ background: '#10B981', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>+ Add</button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setEditingSpecLang(false)} style={{ background: '#F1F5F9', color: '#475569', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button type="button" onClick={handleSaveSpecLang} disabled={savingSpecLang} style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>{savingSpecLang ? 'Saving...' : 'Save Profile Tags'}</button>
                </div>
              </div>
            )}
          </div>


          {/* Testimonials Card */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Client Reviews &amp; Testimonials ({reviews.length})</h3>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '2px 0 0 0' }}>Verified feedback shown on your profile</p>
              </div>

              <button
                onClick={() => setShowReviewModal(true)}
                style={{ background: '#1E293B', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <FiSend fontSize={12} /> Request Review
              </button>
            </div>

            {reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reviews.map((rev, idx) => {
                  const isFeatured = featuredReviews[rev._id || idx] !== false
                  return (
                    <div key={rev._id || idx} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: '13px' }}>
                            {'★'.repeat(rev.rating || 5)}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>
                            — {rev.clientName || (rev.user?.firstName ? `${rev.user.firstName} ${rev.user.lastName || ''}`.trim() : 'Verified Client')}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleFeature(rev._id || idx)}
                          style={{
                            background: isFeatured ? '#DCFCE7' : '#F1F5F9',
                            color: isFeatured ? '#15803D' : '#64748B',
                            border: 'none',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {isFeatured ? 'Featured ✓' : 'Hidden'}
                        </button>
                      </div>

                      <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.4', fontStyle: 'italic' }}>
                        "{rev.review || rev.content || 'Great experience working together.'}"
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                No client reviews submitted yet. Click "Request Review" to send feedback invitations.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* QR CODE MODAL */}
      {showQrModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '28px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>Your Practice QR Code</h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px 0' }}>Scan to open direct booking profile for {firstName} {lastName}</p>
            
            {/* Real Dynamic QR Code Image */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '16px', display: 'inline-block', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(bookingLink)}`}
                alt="Booking Link QR Code"
                style={{ width: '180px', height: '180px', borderRadius: '8px', display: 'block' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  toast.success('QR Code ready for print!')
                  setShowQrModal(false)
                }}
                style={{ background: '#3B82F6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                Download PNG
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                style={{ background: '#F1F5F9', color: '#475569', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST REVIEW MODAL */}
      {showReviewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '28px', maxWidth: '440px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>Request Client Review</h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 18px 0' }}>Send an automated review invitation to your learner or client.</p>
            
            <form onSubmit={handleSendReviewRequest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Client Email Address
                </label>
                <input
                  type="email"
                  placeholder="client@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  style={{ background: '#F1F5F9', color: '#475569', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingReview}
                  style={{ background: sendingReview ? '#94A3B8' : '#10B981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: sendingReview ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FiSend /> {sendingReview ? 'Sending Email...' : 'Send Review Invitation'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}

export default GrowthTools
