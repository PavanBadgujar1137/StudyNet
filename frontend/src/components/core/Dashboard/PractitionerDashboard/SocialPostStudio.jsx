import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
  FiShare2,
  FiImage,
  FiCalendar,
  FiSend,
  FiTrash2,
  FiCheckCircle,
  FiInstagram,
  FiTwitter,
  FiLinkedin,
  FiFacebook,
  FiGrid,
  FiRefreshCw,
  FiClock,
  FiAlertTriangle,
  FiLink,
  FiX,
  FiHash,
  FiEye,
  FiSearch,
  FiZap,
  FiSmartphone,
  FiLayers
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import {
  createSocialPost,
  fetchPractitionerPosts,
  publishSocialPostNow,
  deleteSocialPost,
  fetchSocialAccounts,
  toggleSocialAccount,
} from '../../../../services/operations/socialPostAPI'

export function SocialPostStudio() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const practitionerName = user ? `Dr. ${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Practitioner'
  const defaultHandle = user?.firstName ? `${user.firstName.toLowerCase()}_${user.lastName?.toLowerCase() || ''}` : 'practitioner'

  // Studio Mode Navigation: 'canvas' | 'calendar' | 'feed' | 'channels' | 'analytics'
  const [activeTab, setActiveTab] = useState('canvas')

  // Real DB Posts & Accounts State
  const [posts, setPosts] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  
  // Feed Filters & Search
  const [feedFilter, setFeedFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Channel Connection Inputs State
  const [handleInputs, setHandleInputs] = useState({
    instagram: '',
    twitter: '',
    linkedin: '',
    facebook: '',
  })

  // Composer Form State
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [postStatus, setPostStatus] = useState('published') // 'published' | 'scheduled' | 'draft'
  const [scheduledAt, setScheduledAt] = useState('')
  const [previewPlatform, setPreviewPlatform] = useState('instagram')
  const [submitting, setSubmitting] = useState(false)

  // Gradient Quote Card, Aspect Ratio & Manual Crop State
  const [useGradientCard, setUseGradientCard] = useState(false)
  const [cardTheme, setCardTheme] = useState('emerald') // 'emerald' | 'cyber' | 'sunset' | 'violet'
  const [imageCropMode, setImageCropMode] = useState('1/1') // '1/1' | '4/5' | '16/9'

  // Manual Crop Fine-Tuning State
  const [zoom, setZoom] = useState(100) // 100% to 250%
  const [panX, setPanX] = useState(50) // 0% to 100%
  const [panY, setPanY] = useState(50) // 0% to 100%
  const [rotation, setRotation] = useState(0) // 0, 90, 180, 270 degrees
  const [showManualCrop, setShowManualCrop] = useState(false)

  const resetManualCrop = () => {
    setZoom(100)
    setPanX(50)
    setPanY(50)
    setRotation(0)
  }

  // Dynamic Image Crop Renderer for Left Media Studio & Right iPhone Simulator
  const renderCroppedMedia = (src, altText = 'Media Preview', styleOverrides = {}) => {
    let objectFit = imageCropMode === 'contain' ? 'contain' : 'cover'
    let containerStyle = {
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      background: '#0F172A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px',
      ...styleOverrides
    }

    if (imageCropMode === '1/1') {
      containerStyle.aspectRatio = '1 / 1'
    } else if (imageCropMode === '4/5') {
      containerStyle.aspectRatio = '4 / 5'
    } else if (imageCropMode === '16/9') {
      containerStyle.aspectRatio = '16 / 9'
    } else {
      containerStyle.height = '240px'
    }

    return (
      <div style={containerStyle}>
        <img
          src={src}
          alt={altText}
          style={{
            width: '100%',
            height: '100%',
            objectFit: objectFit,
            objectPosition: `${panX}% ${panY}%`,
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transition: 'transform 0.15s ease',
            display: 'block'
          }}
        />
      </div>
    )
  }

  // Load Practitioner Data from MongoDB
  const loadPosts = useCallback(async () => {
    if (!token) return
    setLoadingPosts(true)
    const data = await fetchPractitionerPosts(token)
    setPosts(data || [])
    setLoadingPosts(false)
  }, [token])

  const loadAccounts = useCallback(async () => {
    if (!token) return
    setLoadingAccounts(true)
    const data = await fetchSocialAccounts(token)
    const activeAccs = data || []
    setAccounts(activeAccs)
    const connectedIds = activeAccs.filter((a) => a.isConnected).map((a) => a.platform)
    setSelectedPlatforms(connectedIds)
    setLoadingAccounts(false)
  }, [token])

  useEffect(() => {
    loadPosts()
    loadAccounts()
  }, [loadPosts, loadAccounts])

  // Helper to check if a platform is connected in DB
  const getConnectedAccount = (platformId) => {
    return accounts.find((a) => a.platform === platformId && a.isConnected)
  }

  // Handle File Choose
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setMediaFile(file)
      setUseGradientCard(false)
      const objectUrl = URL.createObjectURL(file)
      setMediaPreview(objectUrl)
    }
  }

  // Handle Platform Toggle in Composer
  const togglePlatformSelect = (platId) => {
    const connectedAcc = getConnectedAccount(platId)
    if (!connectedAcc) {
      toast.error(`Please connect your ${platId.toUpperCase()} channel under 'Connected Channels' first`, {
        icon: '⚠️',
      })
      return
    }

    if (selectedPlatforms.includes(platId)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platId))
    } else {
      setSelectedPlatforms([...selectedPlatforms, platId])
    }
  }

  // Connect or Disconnect Social Account
  const handleConnectChannel = async (platformId) => {
    const connectedAcc = getConnectedAccount(platformId)

    if (connectedAcc) {
      const updated = await toggleSocialAccount({ platform: platformId }, token)
      if (updated) loadAccounts()
    } else {
      const inputHandle = handleInputs[platformId]?.trim()
      if (!inputHandle) {
        toast.error(`Please enter your ${platformId.toUpperCase()} handle before connecting`)
        return
      }

      const updated = await toggleSocialAccount(
        { platform: platformId, handle: inputHandle, accountName: inputHandle },
        token
      )
      if (updated) {
        setHandleInputs((prev) => ({ ...prev, [platformId]: '' }))
        loadAccounts()
      }
    }
  }

  // Create Post Submit
  const handleSubmitPost = async (e) => {
    e.preventDefault()
    if (!caption.trim()) {
      toast.error('Please enter a post caption')
      return
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one connected social channel')
      return
    }

    setSubmitting(true)
    const formData = new FormData()
    formData.append('title', title || 'Social Post')
    formData.append('caption', caption)
    formData.append('platforms', JSON.stringify(selectedPlatforms))
    formData.append('status', postStatus)
    if (scheduledAt) formData.append('scheduledAt', scheduledAt)

    if (mediaFile) {
      formData.append('mediaFile', mediaFile)
    } else if (mediaUrl) {
      formData.append('mediaUrl', mediaUrl)
    } else if (useGradientCard) {
      // Use Unsplash styled gradient card representation
      const gradientPresetUrls = {
        emerald: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80',
        cyber: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80',
        sunset: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
        violet: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
      }
      formData.append('mediaUrl', gradientPresetUrls[cardTheme] || gradientPresetUrls.emerald)
    }

    const created = await createSocialPost(formData, token)
    setSubmitting(false)

    if (created) {
      setTitle('')
      setCaption('')
      setMediaUrl('')
      setMediaFile(null)
      setMediaPreview('')
      setUseGradientCard(false)
      loadPosts()
      setActiveTab('feed')
    }
  }

  // Publish Post Now
  const handlePublishNow = async (postId) => {
    const updated = await publishSocialPostNow(postId, token)
    if (updated) loadPosts()
  }

  // Delete Post
  const handleDeletePost = async (postId) => {
    const success = await deleteSocialPost(postId, token)
    if (success) loadPosts()
  }

  // AI Prompt Templates
  const applyAiTemplate = (templateType) => {
    let generatedTitle = ''
    let generatedCaption = ''

    if (templateType === 'health_tip') {
      generatedTitle = 'Daily Wellness Tip'
      generatedCaption = `🌿 Wellness Minute with ${practitionerName}:\n\nPrioritizing small daily habits makes a profound difference in long-term vitality. Here are 3 simple ways to restore your energy today:\n\n1️⃣ Drink a full glass of water upon waking.\n2️⃣ Take 5 deep, slow belly breaths during mid-day breaks.\n3️⃣ Step outside for 10 minutes of natural sunlight.\n\nWhich habit will you focus on today? Let us know below! 👇\n\n#HealthTips #Wellness #HolisticHealth #SelfCare #Mindfulness`
    } else if (templateType === 'testimonial') {
      generatedTitle = 'Client Breakthrough Story'
      generatedCaption = `✨ Inspiring Healing Story ✨\n\n"Working with ${practitionerName} transformed how I approach my health and daily recovery."\n\nSeeing our clients achieve pain-free movement, mental clarity, and renewed vitality is why we do what we do. Every step toward wellness is a victory worth celebrating.\n\nReady to take the first step toward your health goals? Book a consultation via our link in bio!\n\n#PatientSuccess #HealingJourney #Practitioner #HealthGoals #Wellbeing`
    } else if (templateType === 'schedule') {
      generatedTitle = 'Clinic Consultation Availability'
      generatedCaption = `📅 Appointments Open For This Week!\n\nOur clinic calendar is now open for new consultations and follow-up sessions. Whether you're looking for preventative guidance or holistic treatment, we're here to support you.\n\n👉 Tap the link in bio or visit our website to lock in your preferred session time before slots fill up!\n\n#AppointmentBooking #HealthConsultation #WellnessClinic #Practitioner`
    } else if (templateType === 'motivation') {
      generatedTitle = 'Weekly Motivation'
      generatedCaption = `💪 Your Health Is Your Greatest Investment.\n\nRemember: transformation isn't about perfection; it's about consistency. Be gentle with your progress today, nourish your body, and rest when needed.\n\nWishing you a vibrant and empowering week ahead! 🌟\n\n#Motivation #WellnessMindset #SelfLove #DailyHealth #PractitionerWisdom`
    }

    setTitle(generatedTitle)
    setCaption(generatedCaption)
  }

  // Add Hashtag helper
  const addHashtag = (tag) => {
    if (!caption.includes(tag)) {
      setCaption((prev) => (prev ? `${prev.trim()} ${tag}` : tag))
    }
  }

  // Quick Schedule Preset
  const setQuickSchedule = (hoursAhead) => {
    const targetDate = new Date(Date.now() + hoursAhead * 60 * 60 * 1000)
    const formatted = targetDate.toISOString().slice(0, 16)
    setScheduledAt(formatted)
    setPostStatus('scheduled')
    toast.success(`Scheduled for ${targetDate.toLocaleDateString()} at ${targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)
  }

  // Filter Posts for Feed
  const filteredPosts = posts.filter((p) => {
    const matchesFilter = feedFilter === 'all' || p.status === feedFilter
    const matchesSearch = searchQuery === '' || 
      (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.caption && p.caption.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  // Real aggregate stats calculated from database records
  const totalReach = posts.reduce((acc, p) => acc + (p.metrics?.views || 0), 0)
  const totalLikes = posts.reduce((acc, p) => acc + (p.metrics?.likes || 0), 0)
  const totalShares = posts.reduce((acc, p) => acc + (p.metrics?.shares || 0), 0)
  const connectedCount = accounts.filter((a) => a.isConnected).length
  const scheduledCount = posts.filter((p) => p.status === 'scheduled').length

  const platformsConfig = [
    { id: 'instagram', label: 'Instagram', color: '#E1306C', icon: <FiInstagram /> },
    { id: 'twitter', label: 'X (Twitter)', color: '#000000', icon: <FiTwitter /> },
    { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2', icon: <FiLinkedin /> },
    { id: 'facebook', label: 'Facebook', color: '#1877F2', icon: <FiFacebook /> },
  ]

  const gradientThemes = {
    emerald: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #047857 100%)',
    cyber: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #DB2777 100%)',
    sunset: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 50%, #B91C1C 100%)',
    violet: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #1D4ED8 100%)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1440px', margin: '0 auto', width: '100%', fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}>
      
      {/* 🚀 COMPACT ELEGANT STUDIO HEADER & CONTROL BAR */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '20px 24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Top Row: Title & Compact KPI Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #1F5FE0 0%, #4733C9 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 4px 12px rgba(31, 95, 224, 0.3)' }}>
              <FiShare2 />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.4px' }}>
                  Social Post Studio
                </h2>
                <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
                  PRO
                </span>
              </div>
              <p style={{ color: '#64748B', margin: '2px 0 0 0', fontSize: '13px' }}>
                Compose AI posts, preview live cards, and publish across channels.
              </p>
            </div>
          </div>

          {/* Compact Metric Badges */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '6px 14px', borderRadius: '20px', fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>
              Channels Linked: <strong style={{ color: '#2563EB', fontWeight: 800 }}>{connectedCount}/4</strong>
            </div>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '6px 14px', borderRadius: '20px', fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>
              Total Posts: <strong style={{ color: '#059669', fontWeight: 800 }}>{posts.length}</strong>
            </div>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '6px 14px', borderRadius: '20px', fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>
              Scheduled: <strong style={{ color: '#D97706', fontWeight: 800 }}>{scheduledCount}</strong>
            </div>
          </div>
        </div>

        {/* Bottom Row: Segmented Horizontal Navigation Bar */}
        <div style={{ display: 'flex', gap: '6px', background: '#F1F5F9', padding: '4px', borderRadius: '12px', overflowX: 'auto' }}>
          {[
            { id: 'canvas', label: 'Compose & Live Preview', icon: <FiSmartphone fontSize={15} /> },
            { id: 'feed', label: `Posts Feed (${posts.length})`, icon: <FiGrid fontSize={15} /> },
            { id: 'channels', label: `Channels (${connectedCount})`, icon: <FiShare2 fontSize={15} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                background: activeTab === tab.id ? '#ffffff' : 'transparent',
                color: activeTab === tab.id ? '#1E293B' : '#64748B',
                border: 'none',
                padding: '9px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                whiteSpace: 'nowrap',
                boxShadow: activeTab === tab.id ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 1: AI CREATOR & IPHONE 15 DEVICE SIMULATOR */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'canvas' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          
          {/* LEFT COLUMN: AI EDITOR & GRAPHIC STUDIO */}
          <div className="card" style={{ padding: '24px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Content Creator Studio</h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>Craft posts using AI prompts or custom graphics</p>
              </div>
            </div>

            {/* Warning if no channels linked */}
            {connectedCount === 0 && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '14px', padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: '14px', color: '#991B1B' }}>
                <FiAlertTriangle fontSize={22} style={{ flexShrink: 0, marginTop: '2px', color: '#DC2626' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '14.5px' }}>No Social Channels Linked Yet</strong>
                  <div style={{ fontSize: '13px', marginTop: '2px', color: '#7F1D1D' }}>
                    Connect your Instagram, X, LinkedIn or Facebook handle under <strong>Connected Channels</strong> tab to publish directly.
                  </div>
                </div>
              </div>
            )}

            {/* AI Generator Preset Toolset */}
            <div style={{ background: '#F8FAFC', padding: '18px 20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiZap style={{ color: '#2563EB' }} /> Quick AI Inspiration Ideas:
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {[
                  { id: 'health_tip', label: '🩺 Health Advice' },
                  { id: 'testimonial', label: '⭐ Patient Story' },
                  { id: 'schedule', label: '📅 Booking Promo' },
                  { id: 'motivation', label: '💡 Motivation' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyAiTemplate(preset.id)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #CBD5E1',
                      color: '#334155',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmitPost} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Internal Reference Title */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B', marginBottom: '8px', display: 'block' }}>
                  Post Title <span style={{ fontWeight: 400, color: '#64748B' }}>(Internal Campaign Reference)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Daily Wellness Advice & Appointment Call"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#FAFAFA'
                  }}
                />
              </div>

              {/* Post Content & Caption Textarea */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>
                    Post Caption &amp; Text *
                  </label>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: caption.length > 280 ? '#EF4444' : '#64748B' }}>
                    {caption.length} chars
                  </span>
                </div>

                <textarea
                  rows={6}
                  placeholder="Write your post caption, details, advice, or announcement here..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '14px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14.5px',
                    fontFamily: 'inherit',
                    lineHeight: '1.6',
                    outline: 'none',
                    resize: 'vertical',
                    background: '#FAFAFA'
                  }}
                  required
                />

                {/* Auto Hashtag Pill Inserter */}
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FiHash /> Insert Hashtag:
                  </span>
                  {['#Wellness', '#HealthTips', '#Practitioner', '#SelfCare', '#HolisticHealth', '#Mindfulness'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addHashtag(tag)}
                      style={{
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        color: '#1D4ED8',
                        padding: '4px 10px',
                        borderRadius: '14px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Graphic Generator vs Photo Upload Toggle */}
              <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiLayers style={{ color: '#2563EB' }} /> Media &amp; Graphic Card Studio
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setUseGradientCard(!useGradientCard)
                      if (!useGradientCard) {
                        setMediaFile(null)
                        setMediaUrl('')
                        setMediaPreview('')
                      }
                    }}
                    style={{
                      background: useGradientCard ? '#2563EB' : '#E2E8F0',
                      color: useGradientCard ? '#ffffff' : '#475569',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {useGradientCard ? '🎨 Graphic Card Mode: ON' : '📷 Image Upload Mode'}
                  </button>
                </div>

                {useGradientCard ? (
                  <div>
                    <div style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '10px' }}>
                      Select a visual theme gradient for your social quote card:
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {[
                        { id: 'emerald', name: 'Emerald', bg: gradientThemes.emerald },
                        { id: 'cyber', name: 'Cyber Indigo', bg: gradientThemes.cyber },
                        { id: 'sunset', name: 'Sunset Amber', bg: gradientThemes.sunset },
                        { id: 'violet', name: 'Royal Blue', bg: gradientThemes.violet },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setCardTheme(t.id)}
                          style={{
                            flex: 1,
                            height: '50px',
                            background: t.bg,
                            border: cardTheme === t.id ? '3px solid #0F172A' : '1px solid transparent',
                            borderRadius: '10px',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '11.5px',
                            cursor: 'pointer',
                            boxShadow: cardTheme === t.id ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
                          }}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ border: '2px dashed #CBD5E1', padding: '16px', borderRadius: '14px', background: '#ffffff', textAlign: 'center' }}>
                    {mediaPreview ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {renderCroppedMedia(mediaPreview, 'Uploaded Media Preview')}
                        
                        {/* Image Crop & Aspect Ratio Presets Toolbar */}
                        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Image Crop &amp; Aspect Ratio Preset:
                            </div>

                            <button
                              type="button"
                              onClick={() => setShowManualCrop(!showManualCrop)}
                              style={{
                                background: showManualCrop ? '#EFF6FF' : 'transparent',
                                color: showManualCrop ? '#1D4ED8' : '#64748B',
                                border: '1px solid #CBD5E1',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                fontWeight: 800,
                                cursor: 'pointer'
                              }}
                            >
                              {showManualCrop ? '▲ Hide Manual Crop' : '🔧 Manual Crop Controls'}
                            </button>
                          </div>

                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {[
                              { id: '1/1', label: '🔳 1:1 Square' },
                              { id: '4/5', label: '📱 4:5 Portrait' },
                              { id: '16/9', label: '🖼️ 16:9 Wide' },
                            ].map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => setImageCropMode(preset.id)}
                                style={{
                                  background: imageCropMode === preset.id ? '#2563EB' : '#ffffff',
                                  color: imageCropMode === preset.id ? '#ffffff' : '#334155',
                                  border: imageCropMode === preset.id ? '1px solid #1D4ED8' : '1px solid #CBD5E1',
                                  padding: '5px 10px',
                                  borderRadius: '8px',
                                  fontSize: '11.5px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  boxShadow: imageCropMode === preset.id ? '0 2px 6px rgba(37,99,235,0.3)' : 'none'
                                }}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>

                          {/* Interactive Manual Crop Panel */}
                          {showManualCrop && (
                            <div style={{ marginTop: '6px', paddingTop: '10px', borderTop: '1px border #E2E8F0', display: 'flex', flexDirection: 'column', gap: '10px', background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                              
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                                <label style={{ fontWeight: 800, color: '#334155' }}>🔍 Zoom / Scale: {zoom}%</label>
                                <input
                                  type="range"
                                  min="100"
                                  max="250"
                                  value={zoom}
                                  onChange={(e) => setZoom(Number(e.target.value))}
                                  style={{ width: '130px', cursor: 'pointer' }}
                                />
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                                <label style={{ fontWeight: 800, color: '#334155' }}>↕️ Vertical Position (Y): {panY}%</label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={panY}
                                  onChange={(e) => setPanY(Number(e.target.value))}
                                  style={{ width: '130px', cursor: 'pointer' }}
                                />
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                                <label style={{ fontWeight: 800, color: '#334155' }}>↔️ Horizontal Position (X): {panX}%</label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={panX}
                                  onChange={(e) => setPanX(Number(e.target.value))}
                                  style={{ width: '130px', cursor: 'pointer' }}
                                />
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                                    style={{ background: '#F1F5F9', color: '#1E293B', border: '1px solid #CBD5E1', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer' }}
                                  >
                                    🔄 Rotate ({rotation}°)
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={resetManualCrop}
                                  style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer' }}
                                >
                                  ↩️ Reset Crop
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Image Action Controls */}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <label
                            style={{
                              background: '#EFF6FF',
                              color: '#1D4ED8',
                              border: '1px solid #BFDBFE',
                              padding: '7px 14px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <FiImage /> Replace Photo
                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              setMediaFile(null)
                              setMediaUrl('')
                              setMediaPreview('')
                            }}
                            style={{
                              background: '#FEF2F2',
                              color: '#DC2626',
                              border: '1px solid #FECACA',
                              padding: '7px 14px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <FiTrash2 /> Remove Photo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                          <FiImage />
                        </div>
                        <div>
                          <label
                            style={{
                              background: '#2563EB',
                              color: '#ffffff',
                              padding: '8px 20px',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: 800,
                              display: 'inline-block'
                            }}
                          >
                            Browse Photo File
                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                          </label>
                        </div>
                        <div style={{ fontSize: '12px', color: '#94A3B8' }}>or enter image URL:</div>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={mediaUrl}
                          onChange={(e) => {
                            setMediaUrl(e.target.value)
                            setMediaPreview(e.target.value)
                          }}
                          style={{
                            width: '100%',
                            padding: '9px 14px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            fontSize: '13px'
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Target Social Channels Selector */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B', marginBottom: '10px', display: 'block' }}>
                  Target Connected Channels *
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {platformsConfig.map((plat) => {
                    const isConn = !!getConnectedAccount(plat.id)
                    const isSelected = isConn && selectedPlatforms.includes(plat.id)
                    return (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => togglePlatformSelect(plat.id)}
                        style={{
                          border: !isConn
                            ? '1px dashed #CBD5E1'
                            : isSelected
                            ? `2px solid ${plat.color}`
                            : '1px solid #CBD5E1',
                          background: !isConn
                            ? '#F8FAFC'
                            : isSelected
                            ? `${plat.color}15`
                            : '#FFFFFF',
                          color: !isConn
                            ? '#94A3B8'
                            : isSelected
                            ? plat.color
                            : '#334155',
                          padding: '10px 18px',
                          borderRadius: '26px',
                          fontSize: '13.5px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: isSelected ? `0 4px 12px ${plat.color}25` : 'none',
                          opacity: isConn ? 1 : 0.65
                        }}
                      >
                        {plat.icon}
                        <span>{plat.label}</span>
                        {isConn && isSelected && <FiCheckCircle fontSize={16} style={{ color: plat.color }} />}
                        {!isConn && <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>(Unlinked)</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Dispatch Timing Options */}
              <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                <label style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B', marginBottom: '12px', display: 'block' }}>
                  Dispatch Schedule &amp; Status
                </label>

                <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', marginBottom: postStatus === 'scheduled' ? '14px' : '0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}>
                    <input
                      type="radio"
                      name="postStatus"
                      value="published"
                      checked={postStatus === 'published'}
                      onChange={() => setPostStatus('published')}
                    />
                    <span style={{ color: '#059669' }}>🚀 Publish Now</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}>
                    <input
                      type="radio"
                      name="postStatus"
                      value="scheduled"
                      checked={postStatus === 'scheduled'}
                      onChange={() => setPostStatus('scheduled')}
                    />
                    <span style={{ color: '#D97706' }}>⏰ Schedule Post</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}>
                    <input
                      type="radio"
                      name="postStatus"
                      value="draft"
                      checked={postStatus === 'draft'}
                      onChange={() => setPostStatus('draft')}
                    />
                    <span style={{ color: '#475569' }}>📁 Save Draft</span>
                  </label>
                </div>

                {/* Scheduled Datetime Picker & Quick Presets */}
                {postStatus === 'scheduled' && (
                  <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 16px',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        fontSize: '14px'
                      }}
                      required
                    />

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setQuickSchedule(12)}
                        style={{ background: '#EFF6FF', color: '#1D4ED8', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        In 12 Hours
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickSchedule(24)}
                        style={{ background: '#EFF6FF', color: '#1D4ED8', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Tomorrow
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickSchedule(72)}
                        style={{ background: '#EFF6FF', color: '#1D4ED8', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        In 3 Days
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: '#ffffff',
                  padding: '16px 28px',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '16px',
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
                  transition: 'all 0.2s ease'
                }}
              >
                {submitting ? (
                  <>
                    <FiRefreshCw className="spin" /> Dispatching Content...
                  </>
                ) : postStatus === 'published' ? (
                  <>
                    <FiSend /> Broadcast Post Now
                  </>
                ) : postStatus === 'scheduled' ? (
                  <>
                    <FiCalendar /> Schedule Post
                  </>
                ) : (
                  <>
                    <FiClock /> Save Draft
                  </>
                )}
              </button>

            </form>
          </div>

          {/* RIGHT COLUMN: REALISTIC IPHONE 15 PRO DEVICE SIMULATOR */}
          <div className="card" style={{ padding: '24px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>iPhone 15 Social Simulator</h3>
                <p style={{ fontSize: '13.5px', color: '#64748B', margin: '4px 0 0 0' }}>Pixel-perfect live native app simulation</p>
              </div>

              <span style={{ background: '#DEF7EC', color: '#03543F', fontSize: '12px', fontWeight: 800, padding: '5px 12px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiEye /> Live Simulator
              </span>
            </div>

            {/* Platform Selector Bar */}
            <div style={{ width: '100%', display: 'flex', gap: '6px', background: '#F1F5F9', padding: '6px', borderRadius: '14px' }}>
              {platformsConfig.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPreviewPlatform(p.id)}
                  style={{
                    flex: 1,
                    background: previewPlatform === p.id ? '#ffffff' : 'transparent',
                    color: previewPlatform === p.id ? p.color : '#64748B',
                    border: 'none',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: previewPlatform === p.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {p.icon}
                  <span>{p.id === 'twitter' ? 'X' : p.label}</span>
                </button>
              ))}
            </div>

            {/* 📱 REALISTIC IPHONE 15 PRO DEVICE FRAME MOCKUP */}
            <div
              style={{
                width: '360px',
                minHeight: '620px',
                background: '#000000',
                borderRadius: '44px',
                padding: '12px',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4), inset 0 0 0 2px #334155',
                border: '6px solid #1E293B',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {/* iPhone Dynamic Island */}
              <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '26px', background: '#000000', borderRadius: '20px', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0F172A', border: '2px solid #1E293B' }} />
              </div>

              {/* iPhone Status Bar */}
              <div style={{ padding: '8px 20px 4px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff', fontSize: '12px', fontWeight: 800, zIndex: 9 }}>
                <span>9:41</span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '11px' }}>
                  <span>5G</span>
                  <span>📶</span>
                  <span>🔋</span>
                </div>
              </div>

              {/* iPhone Inner Screen Container */}
              <div style={{ flex: 1, background: '#ffffff', borderRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                
                {/* INSTAGRAM APP FRAME */}
                {previewPlatform === 'instagram' && (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* IG Top App Header */}
                    <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9' }}>
                      <span style={{ fontFamily: 'sans-serif', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px' }}>Instagram</span>
                      <div style={{ display: 'flex', gap: '14px', fontSize: '18px' }}>
                        <span>❤️</span> <span>💬</span>
                      </div>
                    </div>

                    {/* IG Post Header */}
                    <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(45deg, #F09433, #DC2743, #BC1888)', padding: '2px' }}>
                          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#1F5FE0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
                            {user?.firstName?.slice(0, 1) || 'P'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '13px', color: '#0F172A' }}>
                            {getConnectedAccount('instagram')?.handle || `@${defaultHandle}`}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{practitionerName}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '14px' }}>•••</span>
                    </div>

                    {/* IG Post Media Container */}
                    {useGradientCard ? (
                      <div style={{ width: '100%', height: '240px', background: gradientThemes[cardTheme], padding: '24px', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                        <FiZap fontSize={28} style={{ margin: '0 auto 10px auto' }} />
                        <div style={{ fontSize: '15px', fontWeight: 800, lineHeight: '1.4' }}>
                          "{title || 'Health & Vitality Tip'}"
                        </div>
                        <div style={{ fontSize: '12px', marginTop: '12px', opacity: 0.9 }}>
                          — {practitionerName}
                        </div>
                      </div>
                    ) : mediaPreview ? (
                      renderCroppedMedia(mediaPreview, 'Instagram Media', { borderRadius: '0px' })
                    ) : (
                      <div style={{ width: '100%', height: '240px', background: '#F1F5F9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                        <FiImage fontSize={32} />
                        <span style={{ fontSize: '12px', marginTop: '6px' }}>Upload media or pick Graphic Card</span>
                      </div>
                    )}

                    {/* IG Actions Bar */}
                    <div style={{ padding: '10px 14px 4px 14px', display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}>
                      <div style={{ display: 'flex', gap: '14px' }}>
                        <span>❤️</span> <span>💬</span> <span>✈️</span>
                      </div>
                      <span>🔖</span>
                    </div>

                    {/* IG Likes & Caption */}
                    <div style={{ padding: '4px 14px 14px 14px', fontSize: '12.5px', color: '#1E293B', lineHeight: '1.4', overflowY: 'auto' }}>
                      <div style={{ fontWeight: 800, marginBottom: '2px' }}>142 likes</div>
                      <div>
                        <span style={{ fontWeight: 800, marginRight: '6px' }}>{getConnectedAccount('instagram')?.handle || `@${defaultHandle}`}</span>
                        {caption || <span style={{ color: '#94A3B8' }}>Your caption will render here...</span>}
                      </div>
                    </div>
                  </div>
                )}

                {/* X / TWITTER APP FRAME */}
                {previewPlatform === 'twitter' && (
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#000000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px' }}>
                        {user?.firstName?.slice(0, 1) || 'P'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: '#0F172A' }}>{practitionerName}</div>
                        <div style={{ color: '#64748B', fontSize: '12.5px' }}>
                          {getConnectedAccount('twitter')?.handle || `@${defaultHandle}`}
                        </div>

                        <div style={{ marginTop: '10px', fontSize: '13.5px', color: '#0F172A', lineHeight: '1.4', whiteSpace: 'pre-line' }}>
                          {caption || <span style={{ color: '#94A3B8' }}>Post content text...</span>}
                        </div>

                        {/* Media */}
                        {useGradientCard ? (
                          <div style={{ marginTop: '10px', borderRadius: '12px', height: '180px', background: gradientThemes[cardTheme], padding: '20px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', fontWeight: 800 }}>"{title || 'Daily Advice'}"</div>
                            <div style={{ fontSize: '11px', marginTop: '8px' }}>— {practitionerName}</div>
                          </div>
                        ) : mediaPreview ? (
                          renderCroppedMedia(mediaPreview, 'Tweet Media', { borderRadius: '12px', marginTop: '10px' })
                        ) : null}

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', color: '#536471', fontSize: '12px' }}>
                          <span>💬 0</span> <span>🔁 0</span> <span>❤️ 0</span> <span>📊 0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* LINKEDIN APP FRAME */}
                {previewPlatform === 'linkedin' && (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0A66C2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px' }}>
                        {user?.firstName?.slice(0, 1) || 'P'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0F172A' }}>{practitionerName}</div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>Healthcare Practitioner • 1st</div>
                      </div>
                    </div>

                    <div style={{ padding: '0 14px 10px 14px', fontSize: '13px', color: '#1E293B', lineHeight: '1.4', whiteSpace: 'pre-line' }}>
                      {caption || <span style={{ color: '#94A3B8' }}>Post content text...</span>}
                    </div>

                    {useGradientCard ? (
                      <div style={{ width: '100%', height: '180px', background: gradientThemes[cardTheme], padding: '20px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800 }}>"{title || 'Health Tip'}"</div>
                      </div>
                    ) : mediaPreview ? (
                      renderCroppedMedia(mediaPreview, 'LinkedIn Media', { borderRadius: '0px' })
                    ) : null}

                    <div style={{ padding: '10px 14px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-around', color: '#64748B', fontSize: '12px', fontWeight: 700 }}>
                      <span>👍 Like</span> <span>💬 Comment</span> <span>🔁 Repost</span>
                    </div>
                  </div>
                )}

                {/* FACEBOOK APP FRAME */}
                {previewPlatform === 'facebook' && (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#1877F2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px' }}>
                        {user?.firstName?.slice(0, 1) || 'P'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0F172A' }}>{practitionerName}</div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>Just now • 🌐</div>
                      </div>
                    </div>

                    <div style={{ padding: '0 14px 10px 14px', fontSize: '13px', color: '#1E293B', lineHeight: '1.4', whiteSpace: 'pre-line' }}>
                      {caption || <span style={{ color: '#94A3B8' }}>Post content text...</span>}
                    </div>

                    {mediaPreview && renderCroppedMedia(mediaPreview, 'FB Media', { borderRadius: '0px' })}

                    <div style={{ padding: '10px 14px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-around', color: '#64748B', fontSize: '12px', fontWeight: 700 }}>
                      <span>👍 Like</span> <span>💬 Comment</span> <span>↪️ Share</span>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 2: POSTS FEED & CONTENT LIBRARY */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'feed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Analytics Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ padding: '24px', background: '#ffffff', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
              <div style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase', fontWeight: 800 }}>Total Posts Created</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: '6px 0 2px 0' }}>{posts.length}</div>
              <div style={{ fontSize: '13px', color: '#2563EB', fontWeight: 700 }}>MongoDB Database Records</div>
            </div>

            <div className="card" style={{ padding: '24px', background: '#ffffff', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
              <div style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase', fontWeight: 800 }}>Aggregate Views &amp; Reach</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#059669', margin: '6px 0 2px 0' }}>{totalReach.toLocaleString()}</div>
              <div style={{ fontSize: '13px', color: '#10B981', fontWeight: 700 }}>Recorded content views</div>
            </div>

            <div className="card" style={{ padding: '24px', background: '#ffffff', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
              <div style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase', fontWeight: 800 }}>Engagements &amp; Shares</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#7E22CE', margin: '6px 0 2px 0' }}>{(totalLikes + totalShares).toLocaleString()}</div>
              <div style={{ fontSize: '13px', color: '#A855F7', fontWeight: 700 }}>Likes &amp; reshares count</div>
            </div>
          </div>

          {/* Search & Status Filter */}
          <div className="card" style={{ padding: '20px 28px', background: '#ffffff', borderRadius: '20px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Posts' },
                { id: 'published', label: '🚀 Published' },
                { id: 'scheduled', label: '⏰ Scheduled' },
                { id: 'draft', label: '📁 Drafts' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFeedFilter(f.id)}
                  style={{
                    background: feedFilter === f.id ? '#0F172A' : '#F1F5F9',
                    color: feedFilter === f.id ? '#ffffff' : '#475569',
                    border: 'none',
                    padding: '9px 20px',
                    borderRadius: '24px',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, maxWidth: '420px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <FiSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 14px 9px 38px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13.5px',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                onClick={loadPosts}
                style={{ background: '#ffffff', border: '1px solid #CBD5E1', padding: '9px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '13.5px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FiRefreshCw /> Refresh
              </button>
            </div>
          </div>

          {/* Posts Grid Container */}
          {loadingPosts ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748B' }}>Loading practitioner posts...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 24px', background: '#ffffff', borderRadius: '20px', border: '1px solid #E2E8F0', color: '#64748B' }}>
              <FiShare2 fontSize={48} style={{ margin: '0 auto 16px auto', color: '#CBD5E1' }} />
              <h3 style={{ margin: 0, color: '#1E293B', fontSize: '18px' }}>No posts found</h3>
              <p style={{ margin: '8px 0 20px 0', fontSize: '14px' }}>Draft or publish your first update to reach clients across social media.</p>
              <button
                onClick={() => setActiveTab('canvas')}
                style={{ background: '#2563EB', color: '#fff', border: 'none', padding: '11px 24px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '14px' }}
              >
                Compose First Post
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
              {filteredPosts.map((post) => (
                <div
                  key={post._id}
                  className="card"
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span
                        style={{
                          background: post.status === 'published' ? '#DEF7EC' : post.status === 'scheduled' ? '#FEF08A' : '#E2E8F0',
                          color: post.status === 'published' ? '#03543F' : post.status === 'scheduled' ? '#854D0E' : '#334155',
                          padding: '4px 12px',
                          borderRadius: '14px',
                          fontSize: '11px',
                          fontWeight: 800,
                          textTransform: 'uppercase'
                        }}
                      >
                        {post.status}
                      </span>
                      <h4 style={{ margin: '10px 0 0 0', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                        {post.title || 'Social Post'}
                      </h4>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this post?')) {
                          handleDeletePost(post._id)
                        }
                      }}
                      style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      title="Delete Post"
                    >
                      <FiTrash2 fontSize={14} /> Delete
                    </button>
                  </div>

                  {/* Caption preview snippet */}
                  <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.5', background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', maxHeight: '100px', overflow: 'hidden', whiteSpace: 'pre-line' }}>
                    {post.caption}
                  </div>

                  {/* Image attachment */}
                  {post.mediaUrl && (
                    <div style={{ width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden' }}>
                      <img src={post.mediaUrl} alt="Post Media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  {/* Web Share Direct Intents */}
                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                      Direct Share Intents:
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {post.webShareIntents?.twitter && (
                        <a
                          href={post.webShareIntents.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ background: '#000000', color: '#ffffff', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <FiTwitter /> Tweet
                        </a>
                      )}

                      {post.webShareIntents?.linkedin && (
                        <a
                          href={post.webShareIntents.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ background: '#0A66C2', color: '#ffffff', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <FiLinkedin /> Share LinkedIn
                        </a>
                      )}

                      {post.webShareIntents?.facebook && (
                        <a
                          href={post.webShareIntents.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ background: '#1877F2', color: '#ffffff', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <FiFacebook /> Share FB
                        </a>
                      )}
                    </div>

                    {post.status !== 'published' && (
                      <button
                        onClick={() => handlePublishNow(post._id)}
                        style={{ marginTop: '6px', background: '#10B981', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <FiSend /> Broadcast Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 4: CONNECTED CHANNELS HUB */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'channels' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card" style={{ padding: '32px', background: '#ffffff', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Social Accounts &amp; Authorizations</h3>
            <p style={{ fontSize: '14.5px', color: '#64748B', margin: '6px 0 28px 0' }}>
              Link your practitioner handles to enable multi-platform broadcast dispatches.
            </p>

            {loadingAccounts ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading channels...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {platformsConfig.map((channel) => {
                  const accountDoc = getConnectedAccount(channel.id)
                  const isConnected = !!accountDoc

                  return (
                    <div
                      key={channel.id}
                      style={{
                        border: isConnected ? '2px solid #10B981' : '1px solid #E2E8F0',
                        borderRadius: '18px',
                        padding: '24px',
                        background: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ color: channel.color, fontSize: '30px' }}>{channel.icon}</div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '16px', color: '#0F172A' }}>{channel.label}</div>
                            <div style={{ fontSize: '13px', color: isConnected ? '#059669' : '#64748B', fontWeight: isConnected ? 700 : 500 }}>
                              {isConnected ? accountDoc.handle : 'Not Linked'}
                            </div>
                          </div>
                        </div>

                        <span style={{ fontSize: '12px', fontWeight: 800, padding: '4px 12px', borderRadius: '14px', background: isConnected ? '#DCFCE7' : '#FEE2E2', color: isConnected ? '#15803D' : '#DC2626' }}>
                          {isConnected ? 'Active' : 'Unlinked'}
                        </span>
                      </div>

                      {/* Handle Input if Not Connected */}
                      {!isConnected && (
                        <div>
                          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                            Enter Username / Handle
                          </label>
                          <input
                            type="text"
                            placeholder={`@your_${channel.id}_username`}
                            value={handleInputs[channel.id] || ''}
                            onChange={(e) => setHandleInputs({ ...handleInputs, [channel.id]: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '10px',
                              border: '1px solid #CBD5E1',
                              fontSize: '13.5px'
                            }}
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleConnectChannel(channel.id)}
                        style={{
                          background: isConnected ? '#FEF2F2' : channel.color,
                          color: isConnected ? '#991B1B' : '#ffffff',
                          border: isConnected ? '1px solid #FECACA' : 'none',
                          padding: '12px 18px',
                          borderRadius: '12px',
                          fontWeight: 800,
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        {isConnected ? (
                          <>
                            <FiX /> Disconnect {channel.label}
                          </>
                        ) : (
                          <>
                            <FiLink /> Link &amp; Connect {channel.label}
                          </>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default SocialPostStudio
