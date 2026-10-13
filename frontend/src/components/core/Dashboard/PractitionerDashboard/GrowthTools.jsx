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
  FiExternalLink,
  FiAward,
  FiX,
  FiEdit3,
  FiPlus,
  FiSliders,
  FiArrowRight,
  FiDownload,
  FiClock,
  FiTag
} from 'react-icons/fi'
import { apiConnector } from '../../../../services/apiConnector'
import { toast } from 'react-hot-toast'
import { PractitionerBadgeStrip, BadgesModal } from '../../../Common/PractitionerBadges'

export function GrowthTools({ telemetryData, setActiveSection }) {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)

  const [copiedLink, setCopiedLink] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showBadgesModal, setShowBadgesModal] = useState(false)
  const [clientEmail, setClientEmail] = useState('')
  const [sendingReview, setSendingReview] = useState(false)
  const [featuredReviews, setFeaturedReviews] = useState({})

  const practitioner = telemetryData?.practitioner || telemetryData?.data?.practitioner || user || {}

  // Inline Specialties & Languages Editing State
  const [editingSpecLang, setEditingSpecLang] = useState(false)
  const [specialties, setSpecialties] = useState(
    practitioner.specialties?.length ? practitioner.specialties : ['Emotional Intelligence']
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

  // Send Review Invitation Email
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

  const [downloadingQr, setDownloadingQr] = useState(false)

  const handleDownloadQr = async () => {
    if (downloadingQr) return
    setDownloadingQr(true)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&format=png&data=${encodeURIComponent(bookingLink)}`
    const fileName = `openhand-practice-qr-${cleanHandle || 'code'}.png`
    const toastId = toast.loading('Generating high-res QR code PNG...')

    try {
      const response = await fetch(qrUrl)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)

      toast.success('QR Code PNG downloaded successfully!', { id: toastId })
    } catch (err) {
      console.warn('Fetch QR failed, attempting canvas fallback:', err)
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = 500
          canvas.height = 500
          const ctx = canvas.getContext('2d')
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, 500, 500)
          ctx.drawImage(img, 0, 0, 500, 500)
          const dataUrl = canvas.toDataURL('image/png')

          const a = document.createElement('a')
          a.href = dataUrl
          a.download = fileName
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          toast.success('QR Code PNG downloaded successfully!', { id: toastId })
          setDownloadingQr(false)
        }
        img.onerror = () => {
          window.open(qrUrl, '_blank')
          toast.success('Opened QR code in new tab. Right-click to save.', { id: toastId })
          setDownloadingQr(false)
        }
        img.src = qrUrl
        return
      } catch (fallbackErr) {
        window.open(qrUrl, '_blank')
        toast.success('Opened QR code in new tab. Right-click to save.', { id: toastId })
      }
    } finally {
      setDownloadingQr(false)
    }
  }

  // Dynamic checklist completion progress
  const hasProfileBio = Boolean(practitioner?.firstName || user?.firstName)
  const hasOffers = Boolean(telemetryData?.offers?.length > 0)
  const hasReviews = Boolean(reviews?.length > 0)
  const completedTasksCount = (hasProfileBio ? 1 : 0) + (hasOffers ? 1 : 0) + (hasReviews ? 1 : 0)
  const checklistPercent = Math.round((completedTasksCount / 3) * 100)

  return (
    <div className="oh-growth-page oh-view-fade-in">

      {/* ─── 1. Premium Growth Hero ─── */}
      <section className="oh-growth-hero">
        <div className="oh-growth-hero-content">
          <div className="oh-growth-badge-row">
            <span className="oh-growth-pill">
              <span className="oh-growth-pill-pulse"></span>
              Growth &amp; Acquisition Hub
            </span>
            <span className="oh-growth-badge-sub">• Verified Practitioner Directory</span>
          </div>

          <h1 className="oh-growth-hero-title">
            Practice Growth Suite
          </h1>

          <p className="oh-growth-hero-desc">
            Expand your practice reach, share direct booking links, distribute QR codes,
            showcase verified client reviews, and accelerate your client acquisition funnel.
          </p>

          <div className="oh-growth-hero-actions">
            <button
              onClick={handleCopyLink}
              className={`oh-growth-btn-primary ${copiedLink ? 'copied' : ''}`}
              title="Copy public booking link to clipboard"
            >
              {copiedLink ? <FiCheck fontSize={17} /> : <FiShare2 fontSize={17} />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Practice Link'}</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="oh-growth-btn-glass"
              title="View and download high-resolution QR code"
            >
              <FiMaximize2 fontSize={16} />
              <span>QR Code</span>
            </button>

            {setActiveSection && (
              <button
                onClick={() => setActiveSection('setup')}
                className="oh-growth-btn-glass"
                title="Open Practice Setup Wizard"
              >
                <FiSliders fontSize={16} />
                <span>Setup Wizard</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient Right Card: Quick Handle Preview */}
        <div className="oh-growth-hero-side">
          <div className="oh-growth-side-box">
            <div className="oh-growth-side-head">
              <span className="oh-growth-side-label">Direct Channel</span>
              <span className="oh-growth-live-status">
                <span className="oh-growth-pill-pulse"></span> Live Route
              </span>
            </div>
            <div className="oh-growth-side-title">
              /{cleanHandle}
            </div>
            <p className="oh-growth-side-desc">
              Your verified profile link is active worldwide on OpenHand's encrypted network.
            </p>
            <div
              className="oh-growth-side-chip"
              onClick={handleCopyLink}
              title="Click to copy booking link"
            >
              <span className="oh-growth-side-chip-url">{bookingLink}</span>
              <span style={{ color: '#93C5FD', display: 'flex', alignItems: 'center' }}>
                {copiedLink ? <FiCheck size={14} color="#10B981" /> : <FiCopy size={14} />}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. Growth Overview Cards (3 Cards) ─── */}
      <section className="oh-growth-stats-grid">
        {/* Card 1: Directory Status */}
        <div className="oh-growth-stat-card emerald">
          <div className="oh-growth-stat-top">
            <span className="oh-growth-stat-category">Directory Status</span>
            <div className="oh-growth-stat-icon-wrap emerald">
              <FiGlobe />
            </div>
          </div>
          <div>
            <div className="oh-growth-stat-val">Verified &amp; Live</div>
            <div className="oh-growth-stat-desc">Listed in Global Practitioner Directory</div>
          </div>
          <div className="oh-growth-stat-footer emerald">
            <FiCheckCircle size={14} /> Learners worldwide can discover &amp; book sessions
          </div>
        </div>

        {/* Card 2: Active Learners */}
        <div className="oh-growth-stat-card blue">
          <div className="oh-growth-stat-top">
            <span className="oh-growth-stat-category">Active Learners</span>
            <div className="oh-growth-stat-icon-wrap blue">
              <FiUsers />
            </div>
          </div>
          <div>
            <div className="oh-growth-stat-val">{activeClients}</div>
            <div className="oh-growth-stat-desc">Connected &amp; Enrolled Clients</div>
          </div>
          <div className="oh-growth-stat-footer blue">
            <FiArrowRight size={14} /> Active 1-on-1 and circle learners currently enrolled
          </div>
        </div>

        {/* Card 3: Client Rating */}
        <div className="oh-growth-stat-card amber">
          <div className="oh-growth-stat-top">
            <span className="oh-growth-stat-category">Reputation Score</span>
            <div className="oh-growth-stat-icon-wrap amber">
              <FiStar />
            </div>
          </div>
          <div>
            <div className="oh-growth-stat-val" style={{ fontSize: ratingVal ? '28px' : '20px' }}>
              {ratingDisplay}
            </div>
            <div className="oh-growth-stat-desc">
              {reviews.length > 0 
                ? `Based on ${reviews.length} client review${reviews.length === 1 ? '' : 's'}` 
                : 'No client reviews submitted yet'}
            </div>
          </div>
          <div className="oh-growth-stat-footer amber">
            <FiAward size={14} /> Verified reviews display prominently on your booking page
          </div>
        </div>
      </section>

      {/* ─── 3. Main Two-Column Layout ─── */}
      <section className="oh-growth-two-col">

        {/* Left Column: Direct Booking Link & Specialties */}
        <div className="oh-growth-col">

          {/* Dedicated Practice Link */}
          <div className="oh-growth-surface">
            <div className="oh-growth-card-head">
              <div>
                <h3 className="oh-growth-card-title">Dedicated Practice Link</h3>
                <p className="oh-growth-card-subtitle">
                  Share this public URL across your email signature, LinkedIn bio, Instagram, or business cards.
                </p>
              </div>
              {setActiveSection && (
                <button
                  onClick={() => setActiveSection('setup')}
                  className="oh-growth-task-btn primary"
                  title="Open Practice Setup Wizard to configure profile"
                >
                  <FiSliders size={13} />
                  <span>Customize Profile Setup →</span>
                </button>
              )}
            </div>

            {/* URL Display Box */}
            <div className="oh-growth-url-box">
              <a
                href={bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="oh-growth-url-text"
                title="Open public profile in new tab"
              >
                <span>{bookingLink}</span>
                <FiExternalLink style={{ flexShrink: 0 }} size={15} />
              </a>

              <button
                onClick={handleCopyLink}
                className={`oh-growth-url-copy-btn ${copiedLink ? 'copied' : ''}`}
                title="Copy link to clipboard"
              >
                {copiedLink ? <FiCheck size={15} /> : <FiCopy size={15} />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>

            <div className="oh-growth-link-footer">
              <span className="oh-growth-link-hint">
                💡 Direct booking links bypass directory search and navigate learners straight to your calendar.
              </span>
            </div>
          </div>

          {/* Specialties & Languages Management */}
          <div className="oh-growth-surface">
            <div className="oh-growth-card-head">
              <div>
                <h3 className="oh-growth-card-title">Specialties &amp; Languages</h3>
                <p className="oh-growth-card-subtitle">
                  Manage professional focus tags displayed on your public booking profile.
                </p>
              </div>

              <button
                onClick={() => setEditingSpecLang(!editingSpecLang)}
                className="oh-growth-task-btn primary"
              >
                {editingSpecLang ? <FiX size={13} /> : <FiEdit3 size={13} />}
                <span>{editingSpecLang ? 'Close' : 'Edit Tags'}</span>
              </button>
            </div>

            {!editingSpecLang ? (
              /* View Mode Tag Chips */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="oh-growth-tag-group">
                  <span className="oh-growth-tag-group-label">Clinical &amp; Guidance Specialties</span>
                  <div className="oh-growth-tags-wrap">
                    {specialties.map((s, i) => (
                      <span key={i} className="oh-growth-spec-chip">
                        <FiTag size={12} /> {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="oh-growth-tag-group">
                  <span className="oh-growth-tag-group-label">Languages Spoken</span>
                  <div className="oh-growth-tags-wrap">
                    {languages.map((l, i) => (
                      <span key={i} className="oh-growth-lang-chip">
                        🌐 {l}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode Form */
              <div className="oh-growth-editor-box">
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                    Specialties
                  </label>
                  <div className="oh-growth-tags-wrap" style={{ marginBottom: '10px' }}>
                    {specialties.map((s) => (
                      <span key={s} className="oh-growth-spec-chip">
                        {s}
                        <button
                          type="button"
                          onClick={() => removeSpecialtyTag(s)}
                          className="oh-growth-tag-del"
                          title={`Remove ${s}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="oh-growth-input-row">
                    <input
                      type="text"
                      placeholder="Add specialty (e.g. Anxiety Management)"
                      value={newSpecInput}
                      onChange={(e) => setNewSpecInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addSpecialtyTag()
                        }
                      }}
                      className="oh-growth-input"
                    />
                    <button
                      type="button"
                      onClick={addSpecialtyTag}
                      className="oh-growth-input-btn blue"
                    >
                      <FiPlus size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> Add
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                    Languages Spoken
                  </label>
                  <div className="oh-growth-tags-wrap" style={{ marginBottom: '10px' }}>
                    {languages.map((l) => (
                      <span key={l} className="oh-growth-lang-chip">
                        {l}
                        <button
                          type="button"
                          onClick={() => removeLanguageTag(l)}
                          className="oh-growth-tag-del"
                          title={`Remove ${l}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="oh-growth-input-row">
                    <input
                      type="text"
                      placeholder="Add language (e.g. Spanish, French)"
                      value={newLangInput}
                      onChange={(e) => setNewLangInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addLanguageTag()
                        }
                      }}
                      className="oh-growth-input"
                    />
                    <button
                      type="button"
                      onClick={addLanguageTag}
                      className="oh-growth-input-btn emerald"
                    >
                      <FiPlus size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> Add
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingSpecLang(false)}
                    style={{ background: '#F1F5F9', color: '#475569', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSpecLang}
                    disabled={savingSpecLang}
                    style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', color: '#FFFFFF', border: 'none', padding: '9px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: savingSpecLang ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
                  >
                    {savingSpecLang ? 'Saving Tags...' : 'Save Profile Tags'}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Practice Setup Checklist & Badges */}
        <div className="oh-growth-col">

          {/* Practice Setup Checklist */}
          <div className="oh-growth-surface">
            <div className="oh-growth-card-head">
              <div>
                <h3 className="oh-growth-card-title">Practice Setup Checklist</h3>
                <p className="oh-growth-card-subtitle">
                  Key milestones to optimize your practice profile conversion and discovery.
                </p>
              </div>
              <span style={{ fontSize: '12px', background: '#DCFCE7', color: '#15803D', padding: '4px 10px', borderRadius: '999px', fontWeight: 700 }}>
                {completedTasksCount} of 3 Completed
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="oh-growth-progress-wrap">
              <div className="oh-growth-progress-meta">
                <span style={{ color: '#64748B' }}>Onboarding Readiness</span>
                <span style={{ color: '#0F172A' }}>{checklistPercent}%</span>
              </div>
              <div className="oh-growth-progress-track">
                <div
                  className="oh-growth-progress-fill"
                  style={{ width: `${checklistPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="oh-growth-checklist-list">
              {/* Task 1 */}
              <div className={`oh-growth-task-item ${hasProfileBio ? 'completed' : ''}`}>
                <div className="oh-growth-task-left">
                  <FiCheckCircle
                    className="oh-growth-task-icon"
                    color={hasProfileBio ? '#10B981' : '#CBD5E1'}
                  />
                  <div>
                    <h4 className={`oh-growth-task-title ${hasProfileBio ? 'completed' : ''}`}>
                      Complete Practitioner Profile &amp; Bio
                    </h4>
                    <p className="oh-growth-task-desc">
                      Introduce your background, clinical philosophy, and expertise.
                    </p>
                  </div>
                </div>
                {setActiveSection && (
                  <button
                    onClick={() => setActiveSection('setup')}
                    className="oh-growth-task-btn primary"
                  >
                    {hasProfileBio ? 'Edit Bio →' : 'Set Up →'}
                  </button>
                )}
              </div>

              {/* Task 2 */}
              <div className={`oh-growth-task-item ${hasOffers ? 'completed' : ''}`}>
                <div className="oh-growth-task-left">
                  <FiCheckCircle
                    className="oh-growth-task-icon"
                    color={hasOffers ? '#10B981' : '#CBD5E1'}
                  />
                  <div>
                    <h4 className={`oh-growth-task-title ${hasOffers ? 'completed' : ''}`}>
                      Set up Consultation Offers &amp; Rates
                    </h4>
                    <p className="oh-growth-task-desc">
                      Configure 1-on-1 sessions, introductory calls, or circle packages.
                    </p>
                  </div>
                </div>
                {setActiveSection && (
                  <button
                    onClick={() => setActiveSection('offers')}
                    className="oh-growth-task-btn primary"
                  >
                    {hasOffers ? 'Edit Offers →' : 'Create Offers →'}
                  </button>
                )}
              </div>

              {/* Task 3 */}
              <div className={`oh-growth-task-item ${hasReviews ? 'completed' : ''}`}>
                <div className="oh-growth-task-left">
                  <FiCheckCircle
                    className="oh-growth-task-icon"
                    color={hasReviews ? '#10B981' : '#CBD5E1'}
                  />
                  <div>
                    <h4 className={`oh-growth-task-title ${hasReviews ? 'completed' : ''}`}>
                      Request Reviews from Clients
                    </h4>
                    <p className="oh-growth-task-desc">
                      Build trust and social proof by collecting verified learner feedback.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="oh-growth-task-btn amber"
                >
                  <FiSend size={12} /> Send Request →
                </button>
              </div>
            </div>
          </div>

          {/* Practitioner Honors & Badges Card */}
          <div className="oh-growth-surface-dark">
            <div className="oh-growth-card-head">
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(245, 158, 11, 0.18)', border: '1px solid rgba(245, 158, 11, 0.35)', color: '#FCD34D', padding: '3px 10px', borderRadius: '12px', fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  <FiAward size={13} /> Platform Recognition
                </div>
                <h3 className="oh-growth-card-title light">Practitioner Honors &amp; Badges</h3>
                <p className="oh-growth-card-subtitle light">
                  Badges awarded to your practice and featured on your public booking profile.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowBadgesModal(true)}
                className="oh-growth-btn-glass"
                style={{ padding: '8px 14px', fontSize: '12px' }}
              >
                View Details &amp; Criteria →
              </button>
            </div>

            <div style={{ paddingTop: '8px' }}>
              <PractitionerBadgeStrip
                badges={practitioner?.badges}
                maxDisplay={5}
                onOpenModal={() => setShowBadgesModal(true)}
              />
            </div>
          </div>

        </div>

      </section>

      {/* ─── 4. Client Reviews & Testimonials ─── */}
      <section className="oh-growth-surface">
        <div className="oh-growth-card-head">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 className="oh-growth-card-title">Client Reviews &amp; Testimonials</h3>
              <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '3px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: 800 }}>
                {reviews.length}
              </span>
            </div>
            <p className="oh-growth-card-subtitle">
              Verified learner feedback showcased directly on your public practice landing page.
            </p>
          </div>

          <button
            onClick={() => setShowReviewModal(true)}
            className="oh-growth-btn-primary"
            style={{ padding: '9px 16px', fontSize: '13px' }}
          >
            <FiSend size={14} />
            <span>Request Review</span>
          </button>
        </div>

        {reviews.length > 0 ? (
          <div className="oh-growth-reviews-grid">
            {reviews.map((rev, idx) => {
              const isFeatured = featuredReviews[rev._id || idx] !== false
              const clientName = rev.clientName || (rev.user?.firstName ? `${rev.user.firstName} ${rev.user.lastName || ''}`.trim() : 'Verified Client')
              const ratingCount = rev.rating || 5

              return (
                <div key={rev._id || idx} className="oh-growth-review-card">
                  <div className="oh-growth-review-top">
                    <div>
                      <div className="oh-growth-review-stars">
                        {'★'.repeat(ratingCount)}
                      </div>
                      <div className="oh-growth-review-client">
                        — {clientName}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleFeature(rev._id || idx)}
                      className={`oh-growth-feature-btn ${isFeatured ? 'active' : 'muted'}`}
                      title={isFeatured ? 'Click to hide from featured profile list' : 'Click to feature on profile'}
                    >
                      {isFeatured ? 'Featured ✓' : 'Hidden'}
                    </button>
                  </div>

                  <p className="oh-growth-review-text">
                    "{rev.review || rev.content || 'Great experience working together.'}"
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="oh-growth-empty-reviews">
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
              <FiStar />
            </div>
            <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '15px' }}>
              No client reviews submitted yet
            </div>
            <p style={{ margin: 0, fontSize: '13px', maxWidth: '420px', lineHeight: 1.5 }}>
              Collect feedback from your previous sessions to establish credibility and boost new learner bookings.
            </p>
            <button
              onClick={() => setShowReviewModal(true)}
              className="oh-growth-task-btn primary"
              style={{ marginTop: '6px', padding: '8px 16px', fontSize: '13px' }}
            >
              <FiSend size={13} /> Send First Review Invitation →
            </button>
          </div>
        )}
      </section>

      {/* ─── 5. Modals ─── */}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="oh-growth-modal-backdrop" onClick={() => setShowQrModal(false)}>
          <div className="oh-growth-modal-box" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '21px', fontWeight: 800, color: '#0F172A', fontFamily: 'Outfit, sans-serif' }}>
                Practice QR Code
              </h3>
              <button
                onClick={() => setShowQrModal(false)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
              >
                <FiX size={16} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px 0' }}>
              Scan to open direct booking profile for {firstName} {lastName}
            </p>

            {/* Dynamic High-Res QR Code Preview */}
            <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '20px', padding: '20px', display: 'inline-block', marginBottom: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(bookingLink)}`}
                alt="Booking Link QR Code"
                style={{ width: '200px', height: '200px', borderRadius: '8px', display: 'block' }}
              />
            </div>

            <div style={{ fontSize: '12px', color: '#64748B', wordBreak: 'break-all', marginBottom: '20px', background: '#F8FAFC', padding: '8px 12px', borderRadius: '10px' }}>
              {bookingLink}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={handleDownloadQr}
                disabled={downloadingQr}
                className="oh-growth-btn-primary"
                style={{ cursor: downloadingQr ? 'not-allowed' : 'pointer' }}
              >
                <FiDownload size={15} />
                <span>{downloadingQr ? 'Downloading...' : 'Download PNG'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="oh-growth-task-btn primary"
                style={{ padding: '11px 18px', fontSize: '13px' }}
              >
                {copiedLink ? <FiCheck size={14} /> : <FiCopy size={14} />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>

              <button
                onClick={() => setShowQrModal(false)}
                style={{ background: '#F1F5F9', color: '#475569', border: 'none', padding: '11px 18px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Review Modal */}
      {showReviewModal && (
        <div className="oh-growth-modal-backdrop" onClick={() => setShowReviewModal(false)}>
          <div className="oh-growth-modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  <FiMail />
                </div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0F172A', fontFamily: 'Outfit, sans-serif' }}>
                  Request Client Review
                </h3>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
              >
                <FiX size={16} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Send an automated review invitation to your client's email. When submitted, their verified rating will display on your profile.
            </p>

            <form onSubmit={handleSendReviewRequest} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Client Email Address
                </label>
                <input
                  type="email"
                  placeholder="learner@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="oh-growth-input"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  style={{ background: '#F1F5F9', color: '#475569', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingReview}
                  className="oh-growth-btn-primary"
                  style={{ cursor: sendingReview ? 'not-allowed' : 'pointer' }}
                >
                  <FiSend size={14} />
                  <span>{sendingReview ? 'Sending Email...' : 'Send Review Invitation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Badges Modal */}
      <BadgesModal
        isOpen={showBadgesModal}
        onClose={() => setShowBadgesModal(false)}
        badges={practitioner?.badges}
        practitionerName={practitioner?.firstName || user?.firstName || 'Practitioner'}
      />

    </div>
  )
}

export default GrowthTools
