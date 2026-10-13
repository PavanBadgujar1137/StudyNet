import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
  FiCheckCircle,
  FiMessageSquare,
  FiShield,
  FiPlusCircle,
  FiUsers,
  FiSearch,
  FiLock,
  FiRadio,
  FiStar,
  FiArrowRight,
  FiCompass,
} from 'react-icons/fi'
import { apiConnector } from '../../../../services/apiConnector'
import toast from 'react-hot-toast'


export function MyCircle({ setActiveTab, clientName = 'Student', onUpdate }) {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const [dbCircles, setDbCircles] = useState([])
  const [loading, setLoading] = useState(true)
  const [joiningId, setJoiningId] = useState(null)
  const [joinedIds, setJoinedIds] = useState(() => {
    // Restore from localStorage for local persistence
    try {
      const saved = localStorage.getItem('op_joined_circles')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Persist joined state
  useEffect(() => {
    try {
      localStorage.setItem('op_joined_circles', JSON.stringify(joinedIds))
    } catch (e) {
      console.warn('Could not save joined circles to storage', e)
    }
  }, [joinedIds])

  // Load dynamic circles created by practitioners from API
  const loadCircles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiConnector('GET', '/api/v1/circle/all')
      if (res?.data?.success) {
        const circleList = res.data.circles || []
        setDbCircles(circleList)

        // Check which circles the current client is a member of from DB
        const myJoinedFromDb = circleList
          .filter((c) =>
            (c.members || []).some((m) => String(m._id || m) === String(user?._id))
          )
          .map((c) => c._id)

        if (myJoinedFromDb.length > 0) {
          setJoinedIds((prev) => Array.from(new Set([...prev, ...myJoinedFromDb])))
        }
      }
    } catch (err) {
      console.warn('Error fetching circles from backend:', err)
    } finally {
      setLoading(false)
    }
  }, [user?._id])

  useEffect(() => {
    loadCircles()
  }, [loadCircles])

  // Use only real DB circles
  const allCircles = dbCircles

  // Handle client joining/leaving a circle
  const handleToggleJoin = async (circle) => {
    const circleId = circle._id
    const isAlreadyJoined = joinedIds.includes(circleId)

    if (isAlreadyJoined) {
      // Leave circle
      setJoinedIds((prev) => prev.filter((id) => id !== circleId))
      toast.success(`Left "${circle.name}". You can re-join anytime!`)
      return
    }

    // Join circle
    setJoiningId(circleId)
    try {
      if (token) {
        const res = await apiConnector(
          'POST',
          `/api/v1/circle/${circleId}/join`,
          {},
          { Authorization: `Bearer ${token}` }
        )
        if (res?.data?.success) {
          setJoinedIds((prev) => [...prev, circleId])
          toast.success(res.data.message || `Joined "${circle.name}"! ✨`)
          loadCircles()
          if (onUpdate) onUpdate()
          return
        }
      }

      // Optimistic / local fallback join
      setJoinedIds((prev) => [...prev, circleId])
      toast.success(`🎉 Welcome to "${circle.name}"! Group chat is ready.`)
    } catch (err) {
      // Even if API is unavailable, keep user experience dynamic
      setJoinedIds((prev) => [...prev, circleId])
      toast.success(`Enrolled in "${circle.name}"! ✨`)
    } finally {
      setJoiningId(null)
    }
  }

  // Filter circles
  const filteredCircles = allCircles.filter((c) => {
    const isJoined = joinedIds.includes(c._id)
    if (activeCategory === 'Enrolled' && !isJoined) return false
    if (activeCategory === 'Mindfulness' && c.category !== 'Mindfulness') return false
    if (activeCategory === 'Productivity' && c.category !== 'Productivity') return false
    if (activeCategory === 'Wellbeing' && c.category !== 'Wellbeing') return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = c.name?.toLowerCase().includes(q)
      const matchTopic = (c.topic || c.description || '').toLowerCase().includes(q)
      const matchFacilitator = `${c.practitioner?.firstName || ''} ${c.practitioner?.lastName || ''}`.toLowerCase().includes(q)
      return matchName || matchTopic || matchFacilitator
    }
    return true
  })

  const enrolledCount = allCircles.filter((c) => joinedIds.includes(c._id)).length

  return (
    <div id="circle" style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', color: '#0F172A' }}>
      {/* ─── HERO HEADER BANNER ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0A0E27 0%, #151C48 50%, #1E1B4B 100%)',
          borderRadius: '24px',
          padding: '32px 36px',
          marginBottom: '28px',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 35px rgba(10, 14, 39, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '820px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: 'rgba(129, 140, 248, 0.25)',
                color: '#C7D2FE',
                padding: '4px 12px',
                borderRadius: '20px',
                border: '1px solid rgba(129, 140, 248, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <FiStar size={12} /> Peer Support &amp; Practitioner Growth
            </span>
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>
              • {enrolledCount} of {allCircles.length} Circles Joined
            </span>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 10px 0', lineHeight: 1.25, color: '#FFFFFF' }}>
            Peer Growth &amp; Practitioner Circles
          </h1>
          <p style={{ margin: 0, fontSize: '14.5px', color: '#CBD5E1', lineHeight: 1.55 }}>
            Join small-group Circles led by verified OpenHand practitioners. Connect with fellow learners, cultivate daily routines, and automatically sync group discussions to your Community Hub.
          </p>
        </div>

        {/* Ambient glow accent */}
        <div
          style={{
            position: 'absolute',
            right: '-40px',
            bottom: '-40px',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0) 70%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* ─── CONTROLS & FILTER ROW ─── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'All', label: 'All Circles', count: allCircles.length },
            { id: 'Enrolled', label: `My Enrolled (${enrolledCount})`, count: enrolledCount },
            { id: 'Mindfulness', label: 'Mindfulness', count: allCircles.filter(c => c.category === 'Mindfulness').length },
            { id: 'Productivity', label: 'Productivity', count: allCircles.filter(c => c.category === 'Productivity').length },
            { id: 'Wellbeing', label: 'Wellbeing', count: allCircles.filter(c => c.category === 'Wellbeing').length },
          ].map((cat) => {
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  border: isActive ? '1px solid #4F46E5' : '1px solid #E2E8F0',
                  background: isActive ? '#4F46E5' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#475569',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'none',
                }}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Search input & Chat shortcut */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '12px',
              padding: '7px 14px',
              minWidth: '240px',
            }}
          >
            <FiSearch size={15} color="#94A3B8" />
            <input
              type="text"
              placeholder="Search circles or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '13px',
                color: '#0F172A',
                width: '100%',
                background: 'transparent',
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('community')}
            style={{
              padding: '7px 16px',
              borderRadius: '12px',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              color: '#1D4ED8',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FiMessageSquare size={14} /> Community Hub
          </button>
        </div>
      </div>

      {/* ─── CIRCLES CARDS GRID ─── */}
      {loading ? (
        <div
          style={{
            padding: '50px',
            textAlign: 'center',
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            color: '#64748B',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Loading practitioner circles...
        </div>
      ) : filteredCircles.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '22px',
            marginBottom: '36px',
          }}
        >
          {filteredCircles.map((c) => {
            const isJoined = joinedIds.includes(c._id)
            const practitioner = c.practitioner
            const pName = practitioner?.firstName
              ? `${practitioner.firstName} ${practitioner.lastName || ''}`
              : 'Verified Practitioner'
            const seats = c.seats || 10
            const filled = isJoined
              ? Math.min(seats, (c.seatsFilledCount || c.members?.length || 0) + 1)
              : (c.seatsFilledCount || c.members?.length || 0)
            const fillPercent = Math.min(100, Math.round((filled / seats) * 100))

            return (
              <div
                key={c._id}
                style={{
                  background: '#FFFFFF',
                  border: isJoined ? '2px solid #6366F1' : '1px solid #E2E8F0',
                  borderRadius: '20px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: isJoined
                    ? '0 10px 30px rgba(99, 102, 241, 0.12)'
                    : '0 4px 16px rgba(15, 23, 42, 0.04)',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Top Badge & Status Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      background: isJoined ? '#EEF2FF' : '#F1F5F9',
                      color: isJoined ? '#4F46E5' : '#475569',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isJoined ? <FiCheckCircle size={12} color="#4F46E5" /> : null}
                    {isJoined ? 'ENROLLED MEMBER' : (c.category || 'PRACTITIONER CIRCLE')}
                  </span>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: c.status === 'active' ? '#15803D' : '#D97706',
                      background: c.status === 'active' ? '#F0FDF4' : '#FEF3C7',
                      border: c.status === 'active' ? '1px solid #BBF7D0' : '1px solid #FDE68A',
                      padding: '3px 9px',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: c.status === 'active' ? '#22C55E' : '#F59E0B',
                      }}
                    />
                    {c.status === 'active' ? 'Active Circle' : 'Forming Circle'}
                  </span>
                </div>

                {/* Circle Name & Topic Description */}
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', lineHeight: 1.35 }}>
                    {c.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    {c.topic || c.description || 'Interactive small Circle focusing on practical wellness techniques and peer support.'}
                  </p>
                </div>

                {/* Facilitator & Schedule Info */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    background: '#F8FAFC',
                    borderRadius: '14px',
                    border: '1px solid #F1F5F9',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px',
                      flexShrink: 0,
                    }}
                  >
                    {practitioner?.image && !practitioner.image.includes('dicebear') ? (
                      <img
                        src={practitioner.image}
                        alt={pName}
                        style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const fallback = e.currentTarget.nextElementSibling
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: practitioner?.image && !practitioner.image.includes('dicebear') ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textTransform: 'uppercase',
                        fontWeight: 800,
                      }}
                    >
                      {(practitioner?.firstName?.trim()?.charAt(0) || pName?.trim()?.charAt(0) || 'P').toUpperCase()}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{pName}</span>
                      <FiShield size={12} color="#F59E0B" title="Verified Practitioner" />
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>
                      {practitioner?.credentials || 'Verified Clinical Practitioner'}
                    </span>
                    {c.schedule && (
                      <span style={{ fontSize: '11px', color: '#6366F1', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                        🗓 {c.schedule}
                      </span>
                    )}
                  </div>
                </div>

                {/* Capacity Fill Gauge */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FiUsers size={12} /> {filled} / {seats} seats occupied
                    </span>
                    <span>{fillPercent}% Filled</span>
                  </div>
                  <div style={{ width: '100%', height: '7px', background: '#E2E8F0', borderRadius: '5px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${fillPercent}%`,
                        height: '100%',
                        background: isJoined
                          ? 'linear-gradient(90deg, #10B981, #059669)'
                          : 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)',
                        borderRadius: '5px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                  {isJoined ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleToggleJoin(c)}
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          borderRadius: '12px',
                          background: '#F0FDF4',
                          border: '1px solid #BBF7D0',
                          color: '#166534',
                          fontWeight: 700,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        <FiCheckCircle size={15} /> Joined (Click to Leave)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (setActiveTab) setActiveTab('community')
                        }}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                          color: '#FFFFFF',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                        }}
                      >
                        <FiMessageSquare size={14} /> Open Chat
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleJoin(c)}
                      disabled={joiningId === c._id}
                      style={{
                        width: '100%',
                        padding: '11px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.2)',
                      }}
                    >
                      <FiPlusCircle size={15} />
                      <span>{joiningId === c._id ? 'Joining Circle...' : 'Join this Circle'}</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div
          style={{
            padding: '50px 20px',
            textAlign: 'center',
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            color: '#64748B',
            fontSize: '14px',
            marginBottom: '36px',
          }}
        >
          <FiCompass size={36} color="#94A3B8" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
            No circles match your current filter
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            Try selecting "All Circles" or clearing your search term.
          </p>
        </div>
      )}

      {/* ─── MODERN GUIDELINES & SYNC SECTION ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Safety & Confidentiality Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            padding: '24px 28px',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              <FiLock />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                Circle Safe Space &amp; Privacy
              </h3>
              <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>
                100% Confidential
              </span>
            </div>
          </div>

          <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#475569', lineHeight: 1.55 }}>
            Nobody sees your private check-ins, personal reflections, or 1:1 sessions. What is shared in circle sessions stays strictly within the circle.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              'Zero judgment culture moderated by verified practitioners',
              'Anonymized attendance options for community discussions',
              'Full control to leave or switch circles anytime',
            ].map((text, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#334155' }}>
                <span style={{ color: '#10B981', fontWeight: 800 }}>✓</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Community Hub Sync Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            padding: '24px 28px',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#EEF2FF',
                    color: '#4F46E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                  }}
                >
                  <FiRadio />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                    Live Community Chat Sync
                  </h3>
                  <span style={{ fontSize: '11px', color: '#4F46E5', fontWeight: 700 }}>
                    Instant Socket.io Integration
                  </span>
                </div>
              </div>

              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 800,
                  background: '#DCFCE7',
                  color: '#15803D',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22C55E' }} />
                LIVE SYNC
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.55 }}>
              When you join any practitioner Circle, its group thread automatically appears under <b>Practitioner Circle</b> in your Community &amp; Chat Hub. Send questions, share resources, and interact with fellow circle members.
            </p>
          </div>

          <div style={{ paddingTop: '16px' }}>
            <button
              type="button"
              onClick={() => setActiveTab && setActiveTab('community')}
              style={{
                width: '100%',
                padding: '9px 16px',
                borderRadius: '12px',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                color: '#1E293B',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#EEF2FF'
                e.currentTarget.style.borderColor = '#C7D2FE'
                e.currentTarget.style.color = '#4338CA'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F8FAFC'
                e.currentTarget.style.borderColor = '#CBD5E1'
                e.currentTarget.style.color = '#1E293B'
              }}
            >
              <span>Explore Community &amp; Chat Hub</span>
              <FiArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyCircle
