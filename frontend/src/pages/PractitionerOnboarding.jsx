import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  FiCheckCircle,
  FiUser,
  FiAward,
  FiGlobe,
  FiDollarSign,
  FiArrowLeft,
  FiCheck,
  FiEdit2,
  FiExternalLink,
  FiClock,
  FiZap,
  FiTag,
  FiPlus,
  FiLayers
} from 'react-icons/fi'
import { apiConnector } from '../services/apiConnector'
import { setUser } from '../slices/profileSlice'
import OHFooter from '../components/openhand/OHFooter'
import toast from 'react-hot-toast'

const POPULAR_SPECIALTIES = [
  'Holistic Care',
  'Wellness Coaching',
  'Mindfulness & Meditation',
  'Stress Management',
  'Functional Medicine',
  'Ayurveda & Herbology',
  'Sound Healing',
  'Breathwork',
  'Somatic Therapy',
  'Nutrition & Gut Health',
  'Trauma-Informed Yoga',
  'Cognitive Behavioral',
  'Life Transitions',
  'Executive Performance',
  'Integrative Recovery',
  'Relationship Counseling'
]

const POPULAR_LANGUAGES = [
  'English',
  'Hindi',
  'Marathi',
  'Gujarati',
  'Bengali',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Punjabi',
  'Spanish',
  'French',
  'German'
]

export function PractitionerOnboarding({ embedded = false, telemetryData, onUpdate }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const storageKeyData = user?._id ? `oh_onboarding_data_${user._id}` : 'oh_onboarding_data'
  const storageKeyStep = user?._id ? `oh_onboarding_step_${user._id}` : 'oh_onboarding_step'

  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem(storageKeyStep)
    return savedStep ? Math.min(4, Math.max(1, parseInt(savedStep, 10))) : 1
  })

  const [formData, setFormData] = useState(() => {
    const savedData = user?._id ? localStorage.getItem(storageKeyData) : null
    const existingP = telemetryData?.practitioner || {}
    const rawFirst = user?.firstName || ''
    const rawLast = user?.lastName || ''
    const computedNameSlug = `${rawFirst}-${rawLast}`.toLowerCase().trim().replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    const validServerHandle = (existingP.handle && existingP.handle.toLowerCase() !== 'test')
      ? existingP.handle
      : (user?.handle && user.handle.toLowerCase() !== 'test')
      ? user.handle
      : (computedNameSlug || '')

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        if (parsed.handle && parsed.handle.toLowerCase() !== 'test') {
          return { ...parsed, handle: validServerHandle || parsed.handle }
        }
      } catch (e) {}
    }

    return {
      handle: validServerHandle,
      credentials: existingP.credentials || user?.credentials || 'Certified Holistic Practitioner',
      bio: existingP.bio || user?.bio || 'Welcome to my practice space! I offer personalized consultations, wellness circles, and tailored health guidance.',
      specialties: existingP.specialties?.length ? existingP.specialties : ['Holistic Care', 'Wellness Coaching', 'Mindfulness & Meditation'],
      languages: existingP.languages?.length ? existingP.languages : ['English', 'Hindi'],
      experienceYears: existingP.experienceYears || 5,
      sessionRate: existingP.sessionRate || 2500,
      availabilityText: existingP.availabilityText || 'Weekday evenings & Saturday morning slots available',
      formats: existingP.formats?.length ? existingP.formats : ['1:1 Consultations', 'Group Circles'],
    }
  })

  const [practitionerOffers, setPractitionerOffers] = useState([])
  const [loadingOffers, setLoadingOffers] = useState(false)
  const [customSpecialty, setCustomSpecialty] = useState('')
  const [customLanguage, setCustomLanguage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Fetch practitioner's created offers
  useEffect(() => {
    if (!token) return
    let isMounted = true
    const fetchOffers = async () => {
      setLoadingOffers(true)
      try {
        const res = await apiConnector('GET', '/api/v1/offers', null, {
          Authorization: `Bearer ${token}`
        })
        if (isMounted && res?.data?.success && Array.isArray(res.data.offers)) {
          setPractitionerOffers(res.data.offers)
        }
      } catch (err) {
        console.warn('Failed to fetch practitioner offers:', err)
      } finally {
        if (isMounted) setLoadingOffers(false)
      }
    }
    fetchOffers()
    return () => { isMounted = false }
  }, [token])

  // Sync server profile ground truth when telemetry loads
  useEffect(() => {
    if (!user) return
    const existingP = telemetryData?.practitioner || {}
    const rawFirst = user?.firstName || ''
    const rawLast = user?.lastName || ''
    const computedNameSlug = `${rawFirst}-${rawLast}`.toLowerCase().trim().replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    const validServerHandle = (existingP.handle && existingP.handle.toLowerCase() !== 'test')
      ? existingP.handle
      : (user?.handle && user.handle.toLowerCase() !== 'test')
      ? user.handle
      : (computedNameSlug || '')

    setFormData((prev) => {
      const updated = {
        ...prev,
        handle: prev.handle || validServerHandle,
        credentials: prev.credentials || existingP.credentials || user?.credentials || 'Certified Holistic Practitioner',
        bio: prev.bio || existingP.bio || user?.bio || 'Welcome to my practice space!',
        specialties: prev.specialties?.length ? prev.specialties : (existingP.specialties?.length ? existingP.specialties : ['Holistic Care', 'Wellness Coaching']),
        languages: prev.languages?.length ? prev.languages : (existingP.languages?.length ? existingP.languages : ['English', 'Hindi']),
        sessionRate: prev.sessionRate || existingP.sessionRate || 2500,
        experienceYears: prev.experienceYears || existingP.experienceYears || 5,
        availabilityText: prev.availabilityText || existingP.availabilityText || 'Weekday slots available',
        formats: prev.formats?.length ? prev.formats : (existingP.formats?.length ? existingP.formats : ['1:1 Consultations', 'Group Circles']),
      }
      if (user._id) localStorage.setItem(storageKeyData, JSON.stringify(updated))
      return updated
    })
  }, [user, telemetryData, storageKeyData])

  const handleChange = (e) => {
    const updated = { ...formData, [e.target.name]: e.target.value }
    setFormData(updated)
    localStorage.setItem(storageKeyData, JSON.stringify(updated))
  }

  const toggleSpecialty = (spec) => {
    const current = formData.specialties || []
    const updated = current.includes(spec) ? current.filter(s => s !== spec) : [...current, spec]
    const updatedData = { ...formData, specialties: updated }
    setFormData(updatedData)
    localStorage.setItem(storageKeyData, JSON.stringify(updatedData))
  }

  const handleAddCustomSpecialty = () => {
    if (!customSpecialty.trim()) return
    const tag = customSpecialty.trim()
    const current = formData.specialties || []
    if (!current.includes(tag)) {
      const updated = [...current, tag]
      const updatedData = { ...formData, specialties: updated }
      setFormData(updatedData)
      localStorage.setItem(storageKeyData, JSON.stringify(updatedData))
    }
    setCustomSpecialty('')
  }

  const toggleLanguage = (lang) => {
    const current = formData.languages || []
    const updated = current.includes(lang) ? current.filter(l => l !== lang) : [...current, lang]
    const updatedData = { ...formData, languages: updated }
    setFormData(updatedData)
    localStorage.setItem(storageKeyData, JSON.stringify(updatedData))
  }

  const handleAddCustomLanguage = () => {
    if (!customLanguage.trim()) return
    const tag = customLanguage.trim()
    const current = formData.languages || []
    if (!current.includes(tag)) {
      const updated = [...current, tag]
      const updatedData = { ...formData, languages: updated }
      setFormData(updatedData)
      localStorage.setItem(storageKeyData, JSON.stringify(updatedData))
    }
    setCustomLanguage('')
  }

  const toggleFormat = (fmt) => {
    const current = formData.formats || []
    const updated = current.includes(fmt) ? current.filter(f => f !== fmt) : [...current, fmt]
    const updatedData = { ...formData, formats: updated }
    setFormData(updatedData)
    localStorage.setItem(storageKeyData, JSON.stringify(updatedData))
  }

  const syncProfileToBackend = async (dataToSync, showSuccessToast = false) => {
    if (!token) return
    setIsSaving(true)
    try {
      const res = await apiConnector('PUT', '/api/v1/practitioners/profile', {
        handle: dataToSync.handle,
        credentials: dataToSync.credentials,
        bio: dataToSync.bio,
        specialties: dataToSync.specialties,
        languages: dataToSync.languages,
        sessionRate: Number(dataToSync.sessionRate) || 0,
        experienceYears: Number(dataToSync.experienceYears) || 0,
        availabilityText: dataToSync.availabilityText,
        formats: dataToSync.formats,
      }, { Authorization: `Bearer ${token}` })

      if (res?.data?.success) {
        if (showSuccessToast) toast.success('Profile details saved to OpenHand!')
        if (user) {
          const updatedUser = {
            ...user,
            handle: dataToSync.handle,
            credentials: dataToSync.credentials,
            bio: dataToSync.bio,
            specialties: dataToSync.specialties,
            languages: dataToSync.languages,
          }
          dispatch(setUser(updatedUser))
          localStorage.setItem('user', JSON.stringify(updatedUser))
        }
      }
      if (onUpdate) onUpdate()
    } catch (err) {
      console.warn('Sync profile error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleNextStep = async (e) => {
    if (e) e.preventDefault()

    // Step 1 Validation
    if (step === 1) {
      if (!formData.handle || !formData.handle.trim()) {
        toast.error('Please choose a public handle for your booking link.')
        return
      }
      if (!formData.credentials || !formData.credentials.trim()) {
        toast.error('Please enter your professional credentials or title.')
        return
      }
    }

    // Step 2 Validation
    if (step === 2) {
      if (!formData.specialties || formData.specialties.length === 0) {
        toast.error('Please select at least one focus specialty.')
        return
      }
      if (!formData.languages || formData.languages.length === 0) {
        toast.error('Please select at least one spoken language.')
        return
      }
    }

    // Save progress to backend automatically
    await syncProfileToBackend(formData)

    if (step < 4) {
      const next = step + 1
      setStep(next)
      localStorage.setItem(storageKeyStep, next.toString())
    } else {
      // Step 4: Final Publish Action
      await syncProfileToBackend(formData, true)
      toast.success('🎉 Practice Space Published Live! Your public profile is active.', { duration: 6000 })
      if (!embedded) {
        navigate('/practice?tab=dash')
      }
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      const prev = step - 1
      setStep(prev)
      localStorage.setItem(storageKeyStep, prev.toString())
    }
  }

  const jumpToStep = (targetStep) => {
    setStep(targetStep)
    localStorage.setItem(storageKeyStep, targetStep.toString())
  }

  const progressPercent = Math.round((step / 4) * 100)

  const stepsMetadata = [
    { n: 1, title: 'Practice Identity', desc: 'Handle, title & bio', icon: <FiUser /> },
    { n: 2, title: 'Focus & Languages', desc: 'Specialties, languages & formats', icon: <FiGlobe /> },
    { n: 3, title: 'Offers & Availability', desc: 'Your offers & consultation schedule', icon: <FiDollarSign /> },
    { n: 4, title: 'Review & Publish', desc: 'Verify and launch live profile', icon: <FiAward /> },
  ]

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://openhand.live'
  const publicLink = `${originUrl}/practitioner/${formData.handle || 'yourname'}`

  const allOffers = practitionerOffers.length > 0 ? practitionerOffers : (telemetryData?.offers || [])

  return (
    <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, padding: embedded ? '0' : '24px 16px' }}>

      {/* ─── Hero Overview Card ──────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        borderRadius: 24,
        padding: '28px 32px',
        color: '#FFFFFF',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 20,
        boxShadow: '0 15px 35px -5px rgba(15, 23, 42, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 600 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '4px 12px', borderRadius: 20, fontSize: 11.5, fontWeight: 800, color: '#93C5FD', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
            <FiZap /> STEP-BY-STEP PRACTICE WIZARD
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 900, letterSpacing: -0.5, lineHeight: 1.2, color: '#FFFFFF' }}>
            Set Up Your Practitioner Profile
          </h1>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: 14, lineHeight: 1.5 }}>
            Customize your public bio, select your clinical specialties, preview your dashboard offers, and publish your personal client booking link.
          </p>
        </div>

        {/* Live Public URL Preview Box */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          background: 'rgba(255, 255, 255, 0.07)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: 16,
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          minWidth: 260
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Live Booking URL
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: '#38BDF8', wordBreak: 'break-all' }}>
              openhand.live/practitioner/{formData.handle || '...'}
            </span>
            <a
              href={`/practitioner/${formData.handle || ''}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#FFFFFF', opacity: 0.8, textDecoration: 'none', display: 'inline-flex' }}
              title="Open preview"
            >
              <FiExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* ─── Guided Step Tracker & Progress ──────────────────────────────────── */}
      <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '20px 24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Setup Progress: <span style={{ color: '#2563EB' }}>Step {step} of 4</span>
          </span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#2563EB' }}>
            {progressPercent}% Complete
          </span>
        </div>

        {/* Animated Progress Meter */}
        <div style={{ width: '100%', height: 8, background: '#F1F5F9', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)',
            borderRadius: 10,
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
        </div>

        {/* Steps Horizontal Stepper */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12
        }}>
          {stepsMetadata.map((s) => {
            const isDone = s.n < step
            const isCurrent = s.n === step
            return (
              <button
                key={s.n}
                type="button"
                onClick={() => jumpToStep(s.n)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 14,
                  border: isCurrent ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  background: isCurrent ? '#EFF6FF' : (isDone ? '#F8FAFC' : '#FFFFFF'),
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: isCurrent ? '#2563EB' : (isDone ? '#10B981' : '#E2E8F0'),
                  color: isCurrent || isDone ? '#FFFFFF' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 800,
                  flexShrink: 0
                }}>
                  {isDone ? <FiCheck size={16} /> : s.n}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isCurrent ? '#1D4ED8' : '#0F172A', lineHeight: 1.2 }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                    {s.desc}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Main Form Step Content ────────────────────────────────────────── */}
      <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '32px 36px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <form onSubmit={handleNextStep}>

          {/* ── STEP 1: PRACTICE IDENTITY ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <div style={{ color: '#2563EB', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  STEP 1 OF 4
                </div>
                <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: '#0F172A' }}>
                  Practice Identity &amp; Professional Bio
                </h2>
                <p style={{ margin: 0, color: '#64748B', fontSize: 13.5 }}>
                  Establish how learners find and connect with you across OpenHand directory and search listings.
                </p>
              </div>

              {/* Public Booking Handle */}
              <div>
                <label style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                  Practice Handle (Booking URL) <sup style={{ color: '#EF4444' }}>*</sup>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: 12, padding: '0 14px', maxWidth: 500 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#64748B', userSelect: 'none' }}>
                    openhand.live/practitioner/
                  </span>
                  <input
                    type="text"
                    name="handle"
                    value={formData.handle}
                    onChange={(e) => {
                      const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                      handleChange({ target: { name: 'handle', value: sanitized } })
                    }}
                    placeholder="dr-firstname-lastname"
                    style={{ flex: 1, padding: '12px 8px', border: 'none', background: 'transparent', fontSize: 14, fontWeight: 700, color: '#0F172A', outline: 'none' }}
                  />
                </div>
                <span style={{ fontSize: 11.5, color: '#64748B', marginTop: 4, display: 'block' }}>
                  Lowercase letters, numbers, and hyphens only.
                </span>
              </div>

              {/* Professional Credentials / Title */}
              <div>
                <label style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                  Professional Title &amp; Credentials <sup style={{ color: '#EF4444' }}>*</sup>
                </label>
                <input
                  type="text"
                  name="credentials"
                  value={formData.credentials}
                  onChange={handleChange}
                  placeholder="e.g. Certified Integrative Nutritionist &amp; Wellness Coach"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #CBD5E1', fontSize: 14, outline: 'none' }}
                />
              </div>

              {/* Practitioner Bio */}
              <div>
                <label style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                  About Your Practice (Bio)
                </label>
                <textarea
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Describe your holistic philosophy, methodology, background, and what clients can expect from your mentorship sessions."
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #CBD5E1', fontSize: 14, outline: 'none', resize: 'vertical' }}
                />
              </div>
            </div>
          )}

          {/* ── STEP 2: FOCUS AREAS & LANGUAGES ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <div style={{ color: '#2563EB', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  STEP 2 OF 4
                </div>
                <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: '#0F172A' }}>
                  Clinical Focus Areas &amp; Spoken Languages
                </h2>
                <p style={{ margin: 0, color: '#64748B', fontSize: 13.5 }}>
                  Select the core domains and languages in which you counsel and support clients.
                </p>
              </div>

              {/* Specialties / Focus Tags */}
              <div>
                <label style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
                  Specialties &amp; Focus Areas <sup style={{ color: '#EF4444' }}>*</sup>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {POPULAR_SPECIALTIES.map((spec) => {
                    const isSelected = (formData.specialties || []).includes(spec)
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpecialty(spec)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: 20,
                          border: isSelected ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                          background: isSelected ? '#EFF6FF' : '#FFFFFF',
                          color: isSelected ? '#1D4ED8' : '#475569',
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: 12.5,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isSelected && <FiCheck size={13} />}
                        {spec}
                      </button>
                    )
                  })}
                </div>

                {/* Custom Specialty Adder */}
                <div style={{ display: 'flex', gap: 8, maxWidth: 400 }}>
                  <input
                    type="text"
                    value={customSpecialty}
                    onChange={(e) => setCustomSpecialty(e.target.value)}
                    placeholder="Add custom specialty tag..."
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSpecialty}
                    style={{ padding: '8px 16px', borderRadius: 10, background: '#2563EB', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Spoken Languages */}
              <div>
                <label style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
                  Spoken Languages <sup style={{ color: '#EF4444' }}>*</sup>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {POPULAR_LANGUAGES.map((lang) => {
                    const isSelected = (formData.languages || []).includes(lang)
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: 20,
                          border: isSelected ? '1.5px solid #10B981' : '1px solid #CBD5E1',
                          background: isSelected ? '#ECFDF5' : '#FFFFFF',
                          color: isSelected ? '#047857' : '#475569',
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: 12.5,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isSelected && <FiCheck size={13} />}
                        {lang}
                      </button>
                    )
                  })}
                </div>

                {/* Custom Language Adder */}
                <div style={{ display: 'flex', gap: 8, maxWidth: 400 }}>
                  <input
                    type="text"
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    placeholder="Add other language..."
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomLanguage}
                    style={{ padding: '8px 16px', borderRadius: 10, background: '#10B981', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Practice Formats */}
              <div>
                <label style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
                  Practice Formats Offered
                </label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {['1:1 Consultations', 'Group Circles', 'Courses & Programs', 'Long-term Mentorship'].map(fmt => {
                    const isSelected = (formData.formats || []).includes(fmt)
                    return (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => toggleFormat(fmt)}
                        style={{
                          padding: '10px 18px',
                          borderRadius: 12,
                          border: isSelected ? '2px solid #8B5CF6' : '1px solid #CBD5E1',
                          background: isSelected ? '#F5F3FF' : '#FFFFFF',
                          color: isSelected ? '#6D28D9' : '#475569',
                          fontWeight: 700,
                          fontSize: 13.5,
                          cursor: 'pointer'
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '} {fmt}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: CONSULTATION RATES, OFFERS & AVAILABILITY ── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <div style={{ color: '#2563EB', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  STEP 3 OF 4
                </div>
                <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: '#0F172A' }}>
                  Practice Offers &amp; Availability Schedule
                </h2>
                <p style={{ margin: 0, color: '#64748B', fontSize: 13.5 }}>
                  Offers created in your Practitioner Dashboard are automatically synced here and displayed on your public booking page.
                </p>
              </div>

              {/* ── Practitioner Dashboard Offers Hub ── */}
              <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 16, padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiTag size={18} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                        Your Live Practice Offers &amp; Pricing ({allOffers.length})
                      </h3>
                      <span style={{ fontSize: 12, color: '#64748B' }}>
                        Your individual consultation and circle prices are managed directly via Dashboard → Offers
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/practice/offers')}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: 10,
                      padding: '7px 14px',
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: '#2563EB',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <FiLayers size={14} /> Manage / Create Offers in Dashboard →
                  </button>
                </div>

                {loadingOffers ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748B', fontSize: 13 }}>
                    Loading your practice offers...
                  </div>
                ) : allOffers.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                    {allOffers.map((off, idx) => {
                      const isPublished = off.status === 'published' || (!off.status && off.status !== 'draft')
                      return (
                        <div
                          key={off._id || idx}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: 14,
                            padding: '14px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: 10,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <span style={{
                                fontSize: 11,
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                padding: '2px 8px',
                                borderRadius: 8,
                                background: off.type === 'circle' ? '#F3E8FF' : '#EFF6FF',
                                color: off.type === 'circle' ? '#7C3AED' : '#2563EB'
                              }}>
                                {off.type || '1:1 Session'}
                              </span>
                              <span style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: isPublished ? '#059669' : '#D97706',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: isPublished ? '#10B981' : '#F59E0B' }} />
                                {isPublished ? 'Published' : 'Draft'}
                              </span>
                            </div>
                            <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>
                              {off.title || 'Practice Offer'}
                            </h4>
                            {off.description && (
                              <p style={{ margin: 0, fontSize: 12, color: '#64748B', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {off.description}
                              </p>
                            )}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid #F1F5F9' }}>
                            <span style={{ fontSize: 15, fontWeight: 900, color: '#0F172A' }}>
                              ₹{Number(off.price || 0).toLocaleString('en-IN')}
                            </span>
                            {off.durationMinutes && (
                              <span style={{ fontSize: 11.5, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <FiClock size={12} /> {off.durationMinutes} mins
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{
                    background: '#FFFFFF',
                    border: '1.5px dashed #CBD5E1',
                    borderRadius: 14,
                    padding: '24px 20px',
                    textAlign: 'center'
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                      <FiTag size={20} />
                    </div>
                    <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                      No Practice Offers Created Yet
                    </h4>
                    <p style={{ margin: '0 0 14px', fontSize: 12.5, color: '#64748B', maxWidth: 450, marginLeft: 'auto', marginRight: 'auto' }}>
                      You can create tailored 1:1 consultation packages, group wellness circles, and multi-session programs at any time in your Practitioner Dashboard.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/practice/offers')}
                      style={{
                        background: '#2563EB',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 10,
                        padding: '8px 18px',
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <FiPlus /> Create New Offer in Dashboard
                    </button>
                  </div>
                )}
              </div>

              {/* Availability Notice */}
              <div>
                <label style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                  Availability / Consultation Schedule Notice
                </label>
                <input
                  type="text"
                  name="availabilityText"
                  value={formData.availabilityText}
                  onChange={handleChange}
                  placeholder="e.g. Weekday evenings & Saturday slots (IST)"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #CBD5E1', fontSize: 14, outline: 'none' }}
                />
                <span style={{ fontSize: 12, color: '#64748B', marginTop: 6, display: 'block' }}>
                  This notice will be displayed to learners on your booking profile alongside your offers.
                </span>
              </div>
            </div>
          )}

          {/* ── STEP 4: FINAL REVIEW & PUBLISH ── */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <div style={{ color: '#10B981', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  STEP 4 OF 4 — FINAL REVIEW
                </div>
                <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: '#0F172A' }}>
                  Review Your Practice Setup
                </h2>
                <p style={{ margin: 0, color: '#64748B', fontSize: 13.5 }}>
                  Review your practice profile summary below before publishing your live link. You can edit any section at any time.
                </p>
              </div>

              {/* Summary Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {/* Practice Info Card */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Practice Identity</span>
                      <button type="button" onClick={() => jumpToStep(1)} style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiEdit2 size={12} /> Edit
                      </button>
                    </div>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: 15, marginBottom: 2 }}>{formData.credentials}</div>
                    <div style={{ color: '#2563EB', fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>@{formData.handle}</div>
                    <p style={{ margin: 0, fontSize: 12.5, color: '#475569', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      "{formData.bio}"
                    </p>
                  </div>
                </div>

                {/* Specialties Card */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Specialties &amp; Languages</span>
                      <button type="button" onClick={() => jumpToStep(2)} style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiEdit2 size={12} /> Edit
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                      {(formData.specialties || []).slice(0, 4).map(s => (
                        <span key={s} style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                          {s}
                        </span>
                      ))}
                      {(formData.specialties || []).length > 4 && (
                        <span style={{ color: '#64748B', fontSize: 11, fontWeight: 700, alignSelf: 'center' }}>
                          +{formData.specialties.length - 4} more
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#475569' }}>
                      <strong>Languages:</strong> {(formData.languages || []).join(', ')}
                    </div>
                  </div>
                </div>

                {/* Rates & Offers Card */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Offers &amp; Schedule</span>
                      <button type="button" onClick={() => jumpToStep(3)} style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiEdit2 size={12} /> Edit
                      </button>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                      {allOffers.length} Live Offer{allOffers.length === 1 ? '' : 's'} Linked
                    </div>
                    <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.4 }}>
                      <strong>Schedule Notice:</strong> {formData.availabilityText || 'Available upon request'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ready to Publish Banner */}
              <div style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', border: '1.5px solid #A7F3D0', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <FiCheckCircle size={28} color="#059669" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: '#065F46' }}>
                    Everything Looks Complete!
                  </h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#047857' }}>
                    Click "Launch &amp; Publish Practice" below to finalize and push your profile live on <strong>{publicLink}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ─── Bottom Navigation Buttons ─── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, paddingTop: 20, borderTop: '1px solid #F1F5F9' }}>
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                style={{
                  padding: '12px 24px',
                  borderRadius: 12,
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <FiArrowLeft /> Back
              </button>
            ) : <div />}

            <button
              type="submit"
              disabled={isSaving}
              style={{
                padding: '13px 32px',
                borderRadius: 14,
                background: step === 4 ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                border: 'none',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: 14.5,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: step === 4 ? '0 4px 14px rgba(16,185,129,0.3)' : '0 4px 14px rgba(37,99,235,0.3)',
                transition: 'all 0.15s'
              }}
            >
              {isSaving ? 'Saving...' : (step === 4 ? '🎉 Launch & Publish Practice Space' : 'Save & Continue →')}
            </button>
          </div>
        </form>
      </div>

      {!embedded && <OHFooter />}
    </div>
  )
}

export default PractitionerOnboarding
