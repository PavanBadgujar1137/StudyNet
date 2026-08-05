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
  FiEdit3,
  FiRefreshCw,
  FiClock,
  FiAlertTriangle,
  FiLink,
  FiX
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

  // Studio Active Tab
  const [activeTab, setActiveTab] = useState('composer') // 'composer' | 'feed' | 'channels'
  
  // Real DB Posts & Accounts State
  const [posts, setPosts] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [feedFilter, setFeedFilter] = useState('all')

  // Channel Connection Inputs State (for connecting platforms)
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
    setAccounts(data || [])
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
      const objectUrl = URL.createObjectURL(file)
      setMediaPreview(objectUrl)
    }
  }

  // Handle Platform Toggle in Composer
  const togglePlatformSelect = (platId) => {
    const connectedAcc = getConnectedAccount(platId)
    if (!connectedAcc) {
      toast.error(`Please connect your ${platId.toUpperCase()} channel first under 'Connected Channels'`, {
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
      // Disconnect
      const updated = await toggleSocialAccount({ platform: platformId }, token)
      if (updated) loadAccounts()
    } else {
      // Connect
      const inputHandle = handleInputs[platformId]?.trim()
      if (!inputHandle) {
        toast.error(`Please enter your ${platformId.toUpperCase()} username or handle before connecting`)
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
    }

    const created = await createSocialPost(formData, token)
    setSubmitting(false)

    if (created) {
      setTitle('')
      setCaption('')
      setMediaUrl('')
      setMediaFile(null)
      setMediaPreview('')
      setSelectedPlatforms([])
      loadPosts()
      setActiveTab('feed')
    }
  }

  // Publish Post
  const handlePublishNow = async (postId) => {
    const updated = await publishSocialPostNow(postId, token)
    if (updated) loadPosts()
  }

  // Delete Post
  const handleDeletePost = async (postId) => {
    const success = await deleteSocialPost(postId, token)
    if (success) loadPosts()
  }

  // Filter Posts for Feed
  const filteredPosts = posts.filter((p) => {
    if (feedFilter === 'all') return true
    return p.status === feedFilter
  })

  // Real aggregate stats calculated from database records
  const totalReach = posts.reduce((acc, p) => acc + (p.metrics?.views || 0), 0)
  const totalLikes = posts.reduce((acc, p) => acc + (p.metrics?.likes || 0), 0)
  const totalShares = posts.reduce((acc, p) => acc + (p.metrics?.shares || 0), 0)
  const connectedCount = accounts.filter((a) => a.isConnected).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Studio Header Card */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ background: '#3B82F6', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.5px' }}>
              PRACTITIONER DASHBOARD
            </span>
            <span style={{ color: '#94A3B8', fontSize: '13px' }}>• Social Media Studio</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
            Social Post Studio
          </h2>
          <p style={{ color: '#94A3B8', margin: '6px 0 0 0', fontSize: '14px', maxWidth: '640px' }}>
            Compose posts, connect your real social accounts, preview live cards, and publish directly across Instagram, X, LinkedIn &amp; Facebook.
          </p>
        </div>

        {/* Studio Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.08)', padding: '6px', borderRadius: '12px', backdropFilter: 'blur(8px)' }}>
          <button
            onClick={() => setActiveTab('composer')}
            style={{
              background: activeTab === 'composer' ? '#3B82F6' : 'transparent',
              color: activeTab === 'composer' ? '#ffffff' : '#CBD5E1',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FiEdit3 fontSize={16} /> Compose Post
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            style={{
              background: activeTab === 'feed' ? '#3B82F6' : 'transparent',
              color: activeTab === 'feed' ? '#ffffff' : '#CBD5E1',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FiGrid fontSize={16} /> Posts Feed ({posts.length})
          </button>

          <button
            onClick={() => setActiveTab('channels')}
            style={{
              background: activeTab === 'channels' ? '#3B82F6' : 'transparent',
              color: activeTab === 'channels' ? '#ffffff' : '#CBD5E1',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FiShare2 fontSize={16} /> Connected Channels ({connectedCount})
          </button>
        </div>
      </div>

      {/* TAB 1: COMPOSER & PREVIEW */}
      {activeTab === 'composer' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          
          {/* Left Column: Post Composer */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Create Post</h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>Write your post content and pick target platforms</p>
              </div>
            </div>

            {/* Warning if no channels connected */}
            {connectedCount === 0 && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', color: '#991B1B', fontSize: '13px' }}>
                <FiAlertTriangle fontSize={18} style={{ flexShrink: 0 }} />
                <div>
                  <strong>No social channels connected yet.</strong>
                  <div style={{ fontSize: '12px', marginTop: '2px' }}>
                    Click on <strong>Connected Channels</strong> tab above to link your Instagram, X, LinkedIn or Facebook handle.
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitPost} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Title */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                  Post Title (Internal Reference)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Session Announcement"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Caption Textarea */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Post Caption &amp; Hashtags *
                  </label>
                  <span style={{ fontSize: '12px', color: caption.length > 280 ? '#EF4444' : '#64748B' }}>
                    {caption.length} chars
                  </span>
                </div>
                <textarea
                  rows={5}
                  placeholder="Type your post caption, details, or offer link here..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    lineHeight: '1.5',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                  required
                />
              </div>

              {/* Media Attachment */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                  Media / Image Attachment
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <label
                    style={{
                      border: '1px dashed #3B82F6',
                      background: '#EFF6FF',
                      color: '#1D4ED8',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FiImage /> Select Image File
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>

                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>or URL:</span>

                  <input
                    type="url"
                    placeholder="https://..."
                    value={mediaUrl}
                    onChange={(e) => {
                      setMediaUrl(e.target.value)
                      setMediaPreview(e.target.value)
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              {/* Connected Target Channels */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>
                  Target Connected Channels *
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'instagram', label: 'Instagram', color: '#E1306C', icon: <FiInstagram /> },
                    { id: 'twitter', label: 'X (Twitter)', color: '#000000', icon: <FiTwitter /> },
                    { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2', icon: <FiLinkedin /> },
                    { id: 'facebook', label: 'Facebook', color: '#1877F2', icon: <FiFacebook /> },
                  ].map((plat) => {
                    const isConn = !!getConnectedAccount(plat.id)
                    const isSelected = selectedPlatforms.includes(plat.id)
                    return (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => togglePlatformSelect(plat.id)}
                        style={{
                          border: isSelected
                            ? `2px solid ${plat.color}`
                            : isConn
                            ? '1px solid #CBD5E1'
                            : '1px dashed #CBD5E1',
                          background: isSelected ? `${plat.color}15` : isConn ? '#F8FAFC' : '#F1F5F9',
                          color: isSelected ? plat.color : isConn ? '#334155' : '#94A3B8',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          opacity: isConn ? 1 : 0.6
                        }}
                        title={isConn ? `Select ${plat.label}` : `${plat.label} is not connected yet`}
                      >
                        {plat.icon}
                        <span>{plat.label}</span>
                        {isSelected && <FiCheckCircle fontSize={14} />}
                        {!isConn && <span style={{ fontSize: '10px', color: '#DC2626' }}>(Not Linked)</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Status & Timing */}
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>
                  Dispatch Status &amp; Schedule
                </label>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: postStatus === 'scheduled' ? '12px' : '0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="postStatus"
                      value="published"
                      checked={postStatus === 'published'}
                      onChange={() => setPostStatus('published')}
                    />
                    <span style={{ fontWeight: 600, color: '#059669' }}>🚀 Publish Now</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="postStatus"
                      value="scheduled"
                      checked={postStatus === 'scheduled'}
                      onChange={() => setPostStatus('scheduled')}
                    />
                    <span style={{ fontWeight: 600, color: '#D97706' }}>⏰ Schedule Post</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="postStatus"
                      value="draft"
                      checked={postStatus === 'draft'}
                      onChange={() => setPostStatus('draft')}
                    />
                    <span style={{ fontWeight: 600, color: '#475569' }}>📁 Save Draft</span>
                  </label>
                </div>

                {postStatus === 'scheduled' && (
                  <div>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px'
                      }}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="oh-action-btn"
                style={{
                  background: 'linear-gradient(135deg, #1F5FE0 0%, #0047C4 100%)',
                  color: '#ffffff',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '14.5px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {submitting ? (
                  <>
                    <FiRefreshCw className="spin" /> Processing...
                  </>
                ) : postStatus === 'published' ? (
                  <>
                    <FiSend /> Broadcast &amp; Publish Post
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

          {/* Right Column: Dynamic Live Preview Card */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Real-Time Post Preview</h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>Live card rendering of your input</p>
              </div>
            </div>

            {/* Platform Selector for Preview */}
            <div style={{ display: 'flex', gap: '8px', background: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
              {['instagram', 'twitter', 'linkedin'].map((pId) => (
                <button
                  key={pId}
                  type="button"
                  onClick={() => setPreviewPlatform(pId)}
                  style={{
                    flex: 1,
                    background: previewPlatform === pId ? '#ffffff' : 'transparent',
                    color: previewPlatform === pId ? '#0F172A' : '#64748B',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    boxShadow: previewPlatform === pId ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  {pId === 'twitter' ? 'X (Twitter)' : pId}
                </button>
              ))}
            </div>

            {/* PREVIEW CONTAINER */}
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
              
              {/* Instagram Card */}
              {previewPlatform === 'instagram' && (
                <div style={{ width: '100%', maxWidth: '360px', background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1F5FE0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>
                      {user?.firstName?.slice(0, 1) || 'P'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>
                        {getConnectedAccount('instagram')?.handle || `@${defaultHandle}`}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{practitionerName}</div>
                    </div>
                  </div>

                  <div style={{ width: '100%', minHeight: '180px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {mediaPreview ? (
                      <img src={mediaPreview} alt="Post Attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#94A3B8', padding: '20px' }}>
                        <FiImage fontSize={28} />
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>No media attached</p>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '10px 14px 4px 14px', display: 'flex', gap: '14px', color: '#0F172A', fontSize: '18px' }}>
                    <span>❤️</span> <span>💬</span> <span>✈️</span>
                  </div>

                  <div style={{ padding: '4px 14px 14px 14px', fontSize: '13px', color: '#1E293B', lineHeight: '1.4', whiteSpace: 'pre-line' }}>
                    <span style={{ fontWeight: 700, marginRight: '6px' }}>{getConnectedAccount('instagram')?.handle || `@${defaultHandle}`}</span>
                    {caption || <span style={{ color: '#94A3B8', italic: 'true' }}>Type your caption to preview...</span>}
                  </div>
                </div>
              )}

              {/* X / Twitter Card */}
              {previewPlatform === 'twitter' && (
                <div style={{ width: '100%', maxWidth: '380px', background: '#ffffff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px' }}>
                      {user?.firstName?.slice(0, 1) || 'P'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>{practitionerName}</span>
                        <span style={{ color: '#64748B', fontSize: '13px' }}>
                          {getConnectedAccount('twitter')?.handle || `@${defaultHandle}`}
                        </span>
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '14px', color: '#0F172A', whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                        {caption || <span style={{ color: '#94A3B8' }}>Start typing post caption...</span>}
                      </div>

                      {mediaPreview && (
                        <div style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #CFD9DE', maxHeight: '200px' }}>
                          <img src={mediaPreview} alt="Tweet media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', color: '#536471', fontSize: '13px', maxWidth: '280px' }}>
                        <span>💬 0</span> <span>🔁 0</span> <span>❤️ 0</span> <span>📊 0</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* LinkedIn Card */}
              {previewPlatform === 'linkedin' && (
                <div style={{ width: '100%', maxWidth: '380px', background: '#ffffff', borderRadius: '8px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <div style={{ padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#0A66C2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px' }}>
                      {user?.firstName?.slice(0, 1) || 'P'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>{practitionerName}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        {getConnectedAccount('linkedin')?.handle || `@${defaultHandle}`}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '0 16px 12px 16px', fontSize: '13px', color: '#1E293B', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                    {caption || <span style={{ color: '#94A3B8' }}>Start typing post content...</span>}
                  </div>

                  {mediaPreview && (
                    <div style={{ width: '100%', height: '200px', background: '#F1F5F9', overflow: 'hidden' }}>
                      <img src={mediaPreview} alt="LinkedIn media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  <div style={{ padding: '10px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-around', color: '#64748B', fontSize: '12.5px', fontWeight: 600 }}>
                    <span>👍 Like</span> <span>💬 Comment</span> <span>🔁 Repost</span> <span>Send</span>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* TAB 2: POSTS FEED */}
      {activeTab === 'feed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Real Analytics Summary Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="card stat" style={{ padding: '20px' }}>
              <div className="lbl" style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase', fontWeight: 700 }}>Total Posts Created</div>
              <div className="val" style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>{posts.length}</div>
              <div className="dl flat" style={{ fontSize: '12px', color: '#3B82F6' }}>Database records</div>
            </div>

            <div className="card stat" style={{ padding: '20px' }}>
              <div className="lbl" style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase', fontWeight: 700 }}>Total Reach &amp; Views</div>
              <div className="val" style={{ fontSize: '24px', fontWeight: 800, color: '#059669', margin: '4px 0' }}>{totalReach.toLocaleString()}</div>
              <div className="dl flat" style={{ fontSize: '12px', color: '#10B981' }}>Live recorded views</div>
            </div>

            <div className="card stat" style={{ padding: '20px' }}>
              <div className="lbl" style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase', fontWeight: 700 }}>Engagements &amp; Shares</div>
              <div className="val" style={{ fontSize: '24px', fontWeight: 800, color: '#7E22CE', margin: '4px 0' }}>{(totalLikes + totalShares).toLocaleString()}</div>
              <div className="dl flat" style={{ fontSize: '12px', color: '#A855F7' }}>Total post interactions</div>
            </div>
          </div>

          {/* Feed Filter */}
          <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
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
                    background: feedFilter === f.id ? '#1E293B' : '#F1F5F9',
                    color: feedFilter === f.id ? '#ffffff' : '#475569',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              onClick={loadPosts}
              style={{ background: 'none', border: '1px solid #CBD5E1', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12.5px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FiRefreshCw /> Refresh Posts
            </button>
          </div>

          {/* Posts Feed Grid */}
          {loadingPosts ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Fetching your posts...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: '#64748B' }}>
              <FiShare2 fontSize={40} style={{ margin: '0 auto 12px auto', color: '#94A3B8' }} />
              <h3 style={{ margin: 0, color: '#334155' }}>No posts created yet</h3>
              <p style={{ margin: '6px 0 16px 0', fontSize: '13.5px' }}>Use the Compose Post tab to draft your first update across your social channels.</p>
              <button onClick={() => setActiveTab('composer')} className="oh-action-btn">
                Compose First Post
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {filteredPosts.map((post) => (
                <div key={post._id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span
                        style={{
                          background: post.status === 'published' ? '#DEF7EC' : post.status === 'scheduled' ? '#FEF08A' : '#E2E8F0',
                          color: post.status === 'published' ? '#03543F' : post.status === 'scheduled' ? '#854D0E' : '#334155',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}
                      >
                        {post.status}
                      </span>
                      <h4 style={{ margin: '8px 0 0 0', fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                        {post.title || 'Social Post'}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleDeletePost(post._id)}
                      style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                      title="Delete Post"
                    >
                      <FiTrash2 fontSize={16} />
                    </button>
                  </div>

                  <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.4', background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', maxHeight: '90px', overflow: 'hidden', whiteSpace: 'pre-line' }}>
                    {post.caption}
                  </div>

                  {post.mediaUrl && (
                    <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={post.mediaUrl} alt="Attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>Target Channels:</span>
                    {post.platforms?.map((p) => (
                      <span key={p} style={{ fontSize: '11px', background: '#EFF6FF', color: '#1E40AF', padding: '2px 8px', borderRadius: '10px', fontWeight: 600, textTransform: 'capitalize' }}>
                        {p}
                      </span>
                    ))}
                  </div>

                  {/* Share Intent Actions */}
                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                      Direct Share Intents:
                    </div>
                    
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {post.webShareIntents?.twitter && (
                        <a
                          href={post.webShareIntents.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ background: '#000000', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <FiTwitter /> Tweet
                        </a>
                      )}

                      {post.webShareIntents?.linkedin && (
                        <a
                          href={post.webShareIntents.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ background: '#0A66C2', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <FiLinkedin /> Share LinkedIn
                        </a>
                      )}

                      {post.webShareIntents?.facebook && (
                        <a
                          href={post.webShareIntents.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ background: '#1877F2', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <FiFacebook /> Share FB
                        </a>
                      )}
                    </div>

                    {post.status !== 'published' && (
                      <button
                        onClick={() => handlePublishNow(post._id)}
                        style={{ marginTop: '6px', background: '#10B981', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
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

      {/* TAB 3: CONNECTED CHANNELS */}
      {activeTab === 'channels' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Social Media Accounts &amp; Authorizations</h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 20px 0' }}>
              Link your actual social handles to enable multi-platform publishing.
            </p>

            {loadingAccounts ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>Loading channels...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {[
                  { id: 'instagram', name: 'Instagram', color: '#E1306C', icon: <FiInstagram fontSize={24} /> },
                  { id: 'twitter', name: 'X / Twitter', color: '#000000', icon: <FiTwitter fontSize={24} /> },
                  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', icon: <FiLinkedin fontSize={24} /> },
                  { id: 'facebook', name: 'Facebook Page', color: '#1877F2', icon: <FiFacebook fontSize={24} /> },
                ].map((channel) => {
                  const accountDoc = getConnectedAccount(channel.id)
                  const isConnected = !!accountDoc

                  return (
                    <div key={channel.id} style={{ border: isConnected ? '1px solid #10B981' : '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ color: channel.color }}>{channel.icon}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '14.5px', color: '#0F172A' }}>{channel.name}</div>
                            <div style={{ fontSize: '12px', color: isConnected ? '#059669' : '#64748B', fontWeight: isConnected ? 600 : 400 }}>
                              {isConnected ? accountDoc.handle : 'Not Connected'}
                            </div>
                          </div>
                        </div>

                        <span style={{ fontSize: '11.5px', fontWeight: 700, padding: '3px 8px', borderRadius: '10px', background: isConnected ? '#DCFCE7' : '#FEE2E2', color: isConnected ? '#15803D' : '#DC2626' }}>
                          {isConnected ? 'Active' : 'Disconnected'}
                        </span>
                      </div>

                      {/* Handle Input if Not Connected */}
                      {!isConnected && (
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                            Enter Username / Handle
                          </label>
                          <input
                            type="text"
                            placeholder={`@your_${channel.id}_username`}
                            value={handleInputs[channel.id] || ''}
                            onChange={(e) => setHandleInputs({ ...handleInputs, [channel.id]: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              fontSize: '13px'
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
                          padding: '9px 14px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        {isConnected ? (
                          <>
                            <FiX /> Disconnect {channel.name}
                          </>
                        ) : (
                          <>
                            <FiLink /> Link &amp; Connect {channel.name}
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
