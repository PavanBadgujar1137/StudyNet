import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { OHFooter, OHButton, OHEyebrow, OHCard } from '../components/openhand'
import { apiConnector } from '../services/apiConnector'
import { setUser } from '../slices/profileSlice'
import toast from 'react-hot-toast'

export function PractitionerOnboarding({ embedded = false, telemetryData, onUpdate }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const storageKeyData = user?._id ? `oh_onboarding_data_${user._id}` : 'oh_onboarding_data'
  const storageKeyStep = user?._id ? `oh_onboarding_step_${user._id}` : 'oh_onboarding_step'

  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem(storageKeyStep)
    return savedStep ? parseInt(savedStep, 10) : 1
  })

  const [formData, setFormData] = useState(() => {
    const savedData = user?._id ? localStorage.getItem(storageKeyData) : null
    const existingP = telemetryData?.practitioner || {}
    const rawFirst = user?.firstName || ''
    const rawLast  = user?.lastName || ''
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
      credentials: existingP.credentials || user?.credentials || 'Holistic Practitioner',
      bio: existingP.bio || user?.bio || 'Welcome to my practice space! I offer personalized consultations and circles.',
      specialties: existingP.specialties?.length ? existingP.specialties : ['Holistic Care', 'Wellness Coaching'],
      languages: existingP.languages?.length ? existingP.languages : ['English', 'Hindi'],
      offerTitle: '',
      offerType: 'session',
      offerPrice: 2500,
      panNumber: '',
      accountNumber: '',
      ifsc: '',
    }
  })

  // Sync server handle and user ground truth whenever telemetry or user changes
  React.useEffect(() => {
    if (!user) return

    // Clear legacy un-scoped localStorage keys from previous sessions/users
    if (user._id) {
      const legacyData = localStorage.getItem('oh_onboarding_data')
      if (legacyData) {
        try {
          const parsed = JSON.parse(legacyData)
          if (parsed.handle?.toLowerCase() === 'test' || !parsed.handle) {
            localStorage.removeItem('oh_onboarding_data')
          }
        } catch (e) {
          localStorage.removeItem('oh_onboarding_data')
        }
      }
    }

    const existingP = telemetryData?.practitioner || {}
    const rawFirst = user?.firstName || ''
    const rawLast  = user?.lastName || ''
    const computedNameSlug = `${rawFirst}-${rawLast}`.toLowerCase().trim().replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    const validServerHandle = (existingP.handle && existingP.handle.toLowerCase() !== 'test')
      ? existingP.handle
      : (user?.handle && user.handle.toLowerCase() !== 'test')
      ? user.handle
      : (computedNameSlug || '')

    setFormData((prev) => {
      if (!prev.handle || prev.handle.toLowerCase() === 'test' || (validServerHandle && prev.handle !== validServerHandle)) {
        const updated = {
          ...prev,
          handle: validServerHandle || prev.handle,
          credentials: existingP.credentials || prev.credentials || 'Holistic Practitioner',
          bio: existingP.bio || prev.bio || 'Welcome to my practice space!',
          specialties: existingP.specialties?.length ? existingP.specialties : (prev.specialties || ['Holistic Care', 'Wellness Coaching']),
          languages: existingP.languages?.length ? existingP.languages : (prev.languages || ['English', 'Hindi']),
        }
        if (user._id) localStorage.setItem(storageKeyData, JSON.stringify(updated))
        return updated
      }
      return prev
    })
  }, [user, telemetryData, storageKeyData])

  const [customSpecialty, setCustomSpecialty] = useState('')
  const [customLanguage, setCustomLanguage] = useState('')

  const handleChange = (e) => {
    const updated = { ...formData, [e.target.name]: e.target.value }
    setFormData(updated)
    localStorage.setItem(storageKeyData, JSON.stringify(updated))
  }

  const toggleSpecialty = (spec) => {
    const current = formData.specialties || ['Holistic Care', 'Wellness Coaching']
    const updatedSpecs = current.includes(spec)
      ? current.filter(s => s !== spec)
      : [...current, spec]
    const updatedData = { ...formData, specialties: updatedSpecs }
    setFormData(updatedData)
    localStorage.setItem(storageKeyData, JSON.stringify(updatedData))
  }

  const handleAddCustomSpecialty = () => {
    if (!customSpecialty.trim()) return
    const tag = customSpecialty.trim()
    const current = formData.specialties || []
    if (!current.includes(tag)) {
      const updatedSpecs = [...current, tag]
      const updatedData = { ...formData, specialties: updatedSpecs }
      setFormData(updatedData)
      localStorage.setItem(storageKeyData, JSON.stringify(updatedData))
    }
    setCustomSpecialty('')
  }

  const toggleLanguage = (lang) => {
    const current = formData.languages || ['English', 'Hindi']
    const updatedLangs = current.includes(lang)
      ? current.filter(l => l !== lang)
      : [...current, lang]
    const updatedData = { ...formData, languages: updatedLangs }
    setFormData(updatedData)
    localStorage.setItem(storageKeyData, JSON.stringify(updatedData))
  }

  const handleAddCustomLanguage = () => {
    if (!customLanguage.trim()) return
    const tag = customLanguage.trim()
    const current = formData.languages || []
    if (!current.includes(tag)) {
      const updatedLangs = [...current, tag]
      const updatedData = { ...formData, languages: updatedLangs }
      setFormData(updatedData)
      localStorage.setItem(storageKeyData, JSON.stringify(updatedData))
    }
    setCustomLanguage('')
  }

  const syncProfileToBackend = async (dataToSync) => {
    if (!token) return
    try {
      const res = await apiConnector('PUT', '/api/v1/practitioners/profile', {
        handle: dataToSync.handle,
        credentials: dataToSync.credentials,
        bio: dataToSync.bio,
        specialties: dataToSync.specialties,
        languages: dataToSync.languages,
        bankAccountNumber: dataToSync.accountNumber,
        bankIfscCode: dataToSync.ifsc,
      }, { Authorization: `Bearer ${token}` })
      
      if (res?.data?.success) {
        toast.success(`Practice handle @${dataToSync.handle} saved!`)
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
      console.warn('Sync profile to backend error (non-fatal):', err)
    }
  }

  const handleNext = async (e) => {
    e?.preventDefault()
    if (step === 1 && !formData.handle) {
      toast.error("Please claim a unique handle for your practice link.")
      return
    }
    if (step === 2 && !formData.offerTitle) {
      toast.error("Please name your first offer.")
      return
    }

    // Sync profile to backend on each step
    await syncProfileToBackend(formData)

    if (step < 3) {
      const nextStep = step + 1
      setStep(nextStep)
      localStorage.setItem(storageKeyStep, nextStep.toString())
    } else {
      localStorage.removeItem(storageKeyStep)
      localStorage.removeItem(storageKeyData)
      localStorage.removeItem('oh_onboarding_step')
      localStorage.removeItem('oh_onboarding_data')
      toast.success("🎉 Practice space published! Profile & Specialties live on openhand.live.")
      if (!embedded) {
        navigate('/practice?tab=dash')
      }
    }
  }
  return (
    <div className={embedded ? "oh-embedded-onboarding w-full" : "oh-onboarding-page min-h-screen relative"}>

      <main className={embedded ? "w-full space-y-6" : "oh-wrap onboarding-content"}>
        {/* Sleek Dashboard Header for Embedded Mode */}
        {embedded ? (
          <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', borderRadius: '16px', padding: '24px 28px', color: '#fff', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ background: '#3B82F6', color: '#fff', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  PROFILE &amp; LINK BUILDER
                </span>
                <span style={{ color: '#94A3B8', fontSize: '12.5px' }}>• Public Practice Setup</span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#fff' }}>Practice Setup Wizard</h2>
              <p style={{ color: '#94A3B8', margin: '4px 0 0 0', fontSize: '13.5px' }}>
                Customize your bio, handle, specialties, languages, and consultation rates for your public booking link.
              </p>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '8px 14px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, color: '#60A5FA' }}>
              🔗 {(typeof window !== 'undefined' ? window.location.origin : 'https://openhand.live')}/practitioner/{formData.handle || 'yourname'}
            </div>
          </div>
        ) : (
          <div className="onboarding-header">
            <OHEyebrow>Practitioner Setup</OHEyebrow>
            <h1>Set up your practice space</h1>
            <p className="sub">Three quick steps to launch your space on openhand.live</p>
          </div>
        )}

        {/* 3-Step Ribbon Progress */}
        <div className="ribbon-bar" role="progressbar" aria-valuenow={step} aria-valuemin="1" aria-valuemax="3" style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '24px' }}>
          {[
            { n: 1, label: 'Claim handle & Specialties', time: '~3 mins' },
            { n: 2, label: 'Add first offer', time: '~6 mins' },
            { n: 3, label: 'Share link', time: '~1 min' },
          ].map((s) => (
            <div key={s.n} className={`ribbon-step ${step >= s.n ? 'active' : ''}`}>
              <div className="step-circle">{s.n}</div>
              <div className="step-info">
                <span className="step-label">{s.label}</span>
                <span className="step-time">{s.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Step Cards */}
        <OHCard surface="white" pad="lg" className="step-form-card">
          {step === 1 && (
            <form onSubmit={handleNext} className="step-body">
              <h2>Step 1: Claim your space handle &amp; customize profile</h2>
              <p>Your unique booking URL and credentials where learners find your profile, specialties, and book sessions.</p>

              <div className="form-group">
                <label htmlFor="handle">Your practice handle</label>
                <div className="input-handle-prefix">
                  <span>{typeof window !== 'undefined' ? window.location.host : 'openhand.live'}/practitioner/</span>
                  <input
                    id="handle"
                    name="handle"
                    type="text"
                    value={formData.handle}
                    onChange={handleChange}
                    placeholder="dr-meera"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="credentials">Credentials &amp; Professional Title</label>
                <input
                  id="credentials"
                  name="credentials"
                  type="text"
                  value={formData.credentials}
                  onChange={handleChange}
                  placeholder="e.g. M.D. Clinical Psychologist, Certified Mindfulness Coach"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">About your practice &amp; approach</label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Briefly describe your specialization, therapeutic approach, or session goals..."
                />
              </div>

              {/* Interactive Specialties Selection */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '13.5px', marginBottom: '8px', color: '#1E293B' }}>
                  Specialties &amp; Practice Focus Areas (Click to toggle)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  {[
                    'Holistic Care',
                    'Wellness Coaching',
                    'Mindfulness & Meditation',
                    'Stress Management',
                    'Cognitive Behavioral',
                    'Anxiety & Mood Care',
                    'Life Transitions',
                    'Executive Performance',
                    'Integrative Healing',
                    'Relationship Counseling'
                  ].map((spec) => {
                    const selected = (formData.specialties || ['Holistic Care', 'Wellness Coaching']).includes(spec)
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpecialty(spec)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: selected ? '1.5px solid #2563EB' : '1.5px solid #CBD5E1',
                          background: selected ? '#EFF6FF' : '#FFFFFF',
                          color: selected ? '#1D4ED8' : '#475569',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {selected ? '✓ ' : '+ '}{spec}
                      </button>
                    )
                  })}
                </div>
                {/* Custom Specialty Input */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Add custom specialty (e.g. Somatic Therapy)..."
                    value={customSpecialty}
                    onChange={(e) => setCustomSpecialty(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomSpecialty(); } }}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSpecialty}
                    style={{ padding: '8px 16px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                  >
                    Add Specialty
                  </button>
                </div>
              </div>

              {/* Interactive Languages Selection */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '13.5px', marginBottom: '8px', color: '#1E293B' }}>
                  Languages Spoken in Consultations
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  {['English', 'Hindi', 'Marathi', 'Gujarati', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Punjabi'].map((lang) => {
                    const selected = (formData.languages || ['English', 'Hindi']).includes(lang)
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: selected ? '1.5px solid #059669' : '1.5px solid #CBD5E1',
                          background: selected ? '#ECFDF5' : '#FFFFFF',
                          color: selected ? '#047857' : '#475569',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {selected ? '✓ ' : '+ '}{lang}
                      </button>
                    )
                  })}
                </div>
                {/* Custom Language Input */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Add custom language (e.g. French)..."
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomLanguage(); } }}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomLanguage}
                    style={{ padding: '8px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                  >
                    Add Language
                  </button>
                </div>
              </div>

              <div className="btn-row">
                <OHButton type="submit">Continue to Add Offer →</OHButton>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNext} className="step-body">
              <h2>Step 2: Add your consultation offer</h2>
              <p>A single 1:1 session, a circle, or a self-paced program. You can add more later.</p>

              <div className="form-group">
                <label htmlFor="offerType">Offer format</label>
                <select id="offerType" name="offerType" value={formData.offerType} onChange={handleChange}>
                  <option value="session">1:1 Session (Paid per booking)</option>
                  <option value="circle">Circle (live, practitioner-custom capacity)</option>
                  <option value="program">Program (Self-paced video modules)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="offerTitle">Offer title</label>
                <input
                  id="offerTitle"
                  name="offerTitle"
                  type="text"
                  value={formData.offerTitle}
                  onChange={handleChange}
                  placeholder="e.g. 50-Minute Consultation &amp; Assessment"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="offerPrice">Price (₹ INR)</label>
                <input
                  id="offerPrice"
                  name="offerPrice"
                  type="number"
                  value={formData.offerPrice}
                  onChange={handleChange}
                  min="0"
                  step="100"
                />
              </div>

              <div className="btn-row">
                <OHButton variant="ghost" onClick={() => setStep(1)}>← Back</OHButton>
                <OHButton type="submit">Complete Setup &amp; View Link →</OHButton>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="step-body finish-step">
              <h2>🎉 Your practice link is live!</h2>
              <p className="lead-link">
                {(typeof window !== 'undefined' ? window.location.origin : 'https://openhand.live')}/practitioner/{formData.handle || 'yourname'}
              </p>

              <p className="notice-box">
                🛡 Your profile has been submitted to the Admin verification queue. Your verified credential badge will activate as soon as verification completes!
              </p>

              <div className="btn-row">
                <OHButton onClick={() => {
                  if (embedded) {
                    if (onUpdate) onUpdate()
                    setStep(1)
                  } else {
                    navigate('/practice?tab=dash')
                  }
                }}>
                  {embedded ? "✓ Setup Saved — Review Profile" : "Go to Practitioner Dashboard →"}
                </OHButton>
              </div>
            </div>
          )}
        </OHCard>
      </main>

      {!embedded && <OHFooter />}
    </div>
  )
}

export default PractitionerOnboarding
