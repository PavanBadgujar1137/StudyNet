import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  FiVideo,
  FiPlay,
  FiDownload,
  FiFileText,
  FiHeadphones,
  FiClock,
  FiSearch,
  FiStar,
  FiX,
  FiCheckCircle,
  FiCalendar,
  FiInbox,
} from 'react-icons/fi'
import { apiConnector } from '../../../../services/apiConnector'
import { formatPractitionerName } from '../../../../utils/formatName'
import { formatClassTitle } from '../../../../utils/formatTitle'
import toast from 'react-hot-toast'

export function SessionsResources({ practitionerName = 'your instructor', dashboardData }) {
  const navigate = useNavigate()
  const { token } = useSelector((s) => s.auth)
  const [selectedNotes, setSelectedNotes] = useState(null)
  const [activeTabFilter, setActiveTabFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [downloadedIds, setDownloadedIds] = useState([])

  // Recordings fetched from API
  const [recordings, setRecordings] = useState([])
  const [loadingRecordings, setLoadingRecordings] = useState(false)

  // Resources fetched from API
  const [resources, setResources] = useState([])
  const [loadingResources, setLoadingResources] = useState(false)

  const upcomingClasses = dashboardData?.upcomingClasses || []
  const activePractitioner = dashboardData?.activePractitioner || dashboardData?.practitioner
  const instructorTitle = formatPractitionerName(activePractitioner || practitionerName, 'your instructor')

  // Fetch past recordings from backend
  useEffect(() => {
    setLoadingRecordings(true)
    apiConnector('GET', '/api/v1/sessions/recordings', null,
      token ? { Authorization: `Bearer ${token}` } : {}
    )
      .then((res) => { if (res?.data?.success) setRecordings(res.data.recordings || []) })
      .catch(() => {})
      .finally(() => setLoadingRecordings(false))
  }, [token])

  // Fetch study resources from backend
  useEffect(() => {
    setLoadingResources(true)
    apiConnector('GET', '/api/v1/sessions/resources', null,
      token ? { Authorization: `Bearer ${token}` } : {}
    )
      .then((res) => { if (res?.data?.success) setResources(res.data.resources || []) })
      .catch(() => {})
      .finally(() => setLoadingResources(false))
  }, [token])

  const handleDownload = (resource) => {
    setDownloadedIds((prev) => [...prev, resource.id || resource._id])
    toast.success(`Downloading "${resource.title}"...`)
  }

  const filteredResources = resources.filter((res) => {
    if (activeTabFilter === 'Guides' && res.category !== 'Guides') return false
    if (activeTabFilter === 'Worksheets' && res.category !== 'Worksheets') return false
    if (activeTabFilter === 'Audio' && res.category !== 'Audio Walkthroughs') return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        res.title?.toLowerCase().includes(q) ||
        res.description?.toLowerCase().includes(q) ||
        (res.author || res.authorName || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div id="sessions" style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', color: '#0F172A' }}>
      {/* ─── HERO HEADER BANNER ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0A0E27 0%, #172052 50%, #1E1B4B 100%)',
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
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: 'rgba(99, 102, 241, 0.25)',
                color: '#C7D2FE',
                padding: '4px 12px',
                borderRadius: '20px',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <FiStar size={12} /> Sessions &amp; Resources Hub
            </span>
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>
              • {upcomingClasses.length} Live Classes Scheduled
            </span>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 10px 0', lineHeight: 1.25, color: '#FFFFFF' }}>
            Live Sessions &amp; Learning Resources
          </h1>
          <p style={{ margin: 0, fontSize: '14.5px', color: '#CBD5E1', lineHeight: 1.55 }}>
            Your upcoming interactive live classes, masterclass video replays, and curated course study resources shared by {instructorTitle}.
          </p>
        </div>

        {/* Ambient glow accent */}
        <div
          style={{
            position: 'absolute',
            right: '-50px',
            bottom: '-50px',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, rgba(124, 58, 237, 0) 70%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* ─── SECTION 1: COMING UP (LIVE CLASSES) ─── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          padding: '28px',
          marginBottom: '28px',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
              Upcoming Live Classes &amp; Masterclasses
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
              Click to join video rooms directly. No external downloads required.
            </p>
          </div>

          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              background: '#EFF6FF',
              color: '#1D4ED8',
              padding: '4px 12px',
              borderRadius: '20px',
              border: '1px solid #BFDBFE',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563EB' }} />
            {upcomingClasses.length} Scheduled
          </span>
        </div>

        {upcomingClasses.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
            <FiCalendar size={32} color="#CBD5E1" style={{ marginBottom: 12 }} />
            <p style={{ margin: 0, color: '#94A3B8', fontSize: 14, fontWeight: 600 }}>No upcoming live classes scheduled yet.</p>
            <p style={{ margin: '4px 0 0', color: '#CBD5E1', fontSize: 12 }}>Your practitioner will schedule classes here soon.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {upcomingClasses.map((cls, idx) => {
            const startDate = new Date(cls.scheduledStart)
            const dayNum = isNaN(startDate.getDate()) ? 15 + idx : startDate.getDate()
            const monthStr = isNaN(startDate.getDate())
              ? 'OCT'
              : startDate.toLocaleString('default', { month: 'short' }).toUpperCase()
            const timeStr = isNaN(startDate.getDate())
              ? '6:00 PM'
              : startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            const instName = cls.instructor?.firstName
              ? `Dr. ${cls.instructor.firstName} ${cls.instructor.lastName || ''}`
              : instructorTitle

            return (
              <div
                key={cls._id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  padding: '16px 20px',
                  background: '#F8FAFC',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  flexWrap: 'wrap',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Date Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    minWidth: '220px',
                    flex: '1 1 240px',
                  }}
                >
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                      border: '1px solid #C7D2FE',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <b style={{ fontSize: '18px', fontWeight: 800, color: '#4338CA', lineHeight: 1 }}>{dayNum}</b>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#6366F1', marginTop: '2px', letterSpacing: '0.04em' }}>
                      {monthStr}
                    </span>
                  </div>

                  <div>
                    <b style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', display: 'block', lineHeight: 1.3 }}>
                      {formatClassTitle(cls.title)}
                    </b>
                    <span style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                      <FiClock size={12} /> {timeStr} ({cls.duration || '50 mins'}) • Facilitator: {instName}
                    </span>
                  </div>
                </div>

                {/* Topic / Details */}
                <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
                  <span style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4, display: 'block' }}>
                    {cls.topic || 'Interactive session with Q&A and guided exercises.'}
                  </span>
                </div>

                {/* Join CTA */}
                <div style={{ flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (cls._id) {
                        navigate(`/live/${cls._id}`)
                      } else {
                        toast.success(`Entering Live Room: "${cls.title}" 🎥`)
                      }
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '9px 18px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    <FiVideo size={15} />
                    <span>Join Live Class</span>
                  </button>
                </div>
              </div>
            )
          })}
          </div>
        )}
      </div>

      {/* ─── SECTION 2: PAST RECORDINGS & MASTERCLASSES ─── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          padding: '28px',
          marginBottom: '28px',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
              Past Sessions &amp; Masterclass Recordings
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
              On-demand video replays and clinical notes from previous live workshops.
            </p>
          </div>

          <span style={{ fontSize: '12px', color: '#64748B' }}>
            {recordings.length} Available Replays
          </span>
        </div>

        {loadingRecordings ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>Loading recordings...</div>
        ) : recordings.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
            <FiInbox size={32} color="#CBD5E1" style={{ marginBottom: 12 }} />
            <p style={{ margin: 0, color: '#94A3B8', fontSize: 14, fontWeight: 600 }}>No session recordings available yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
            {recordings.map((rec) => (
            <div
              key={rec.id}
              style={{
                background: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#6366F1', background: '#EEF2FF', padding: '3px 8px', borderRadius: '6px' }}>
                    {rec.date}
                  </span>
                  <span style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FiClock size={12} /> {rec.duration}
                  </span>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', lineHeight: 1.35 }}>
                  {rec.title}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '10px' }}>
                  Speaker: {rec.instructor}
                </span>

                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    padding: '8px 12px',
                    fontSize: '11.5px',
                    color: '#475569',
                    lineHeight: 1.45,
                  }}
                >
                  <b>Notes:</b> {rec.notes}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => toast.success(`Starting replay: "${rec.title}"`)}
                  style={{
                    flex: 1,
                    padding: '8px 14px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <FiPlay size={13} /> Watch Replay
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedNotes(rec.notes)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Full Notes
                </button>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* ─── SECTION 3: COURSE STUDY MATERIALS & RESOURCES ─── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          padding: '28px',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
              Study Materials, Guides &amp; Audio Walkthroughs
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
              Evidence-based templates, guided audio, and exercises to enrich your daily practice.
            </p>
          </div>

          {/* Filter Pills & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {['All', 'Guides', 'Worksheets', 'Audio'].map((tab) => {
              const isActive = activeTabFilter === tab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTabFilter(tab)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: isActive ? 800 : 600,
                    cursor: 'pointer',
                    border: isActive ? '1px solid #4F46E5' : '1px solid #E2E8F0',
                    background: isActive ? '#4F46E5' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#475569',
                  }}
                >
                  {tab}
                </button>
              )
            })}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                padding: '6px 12px',
              }}
            >
              <FiSearch size={13} color="#94A3B8" />
              <input
                type="text"
                placeholder="Filter resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '12px', color: '#0F172A', width: '130px' }}
              />
            </div>
          </div>
        </div>

        {loadingResources ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>Loading resources...</div>
        ) : filteredResources.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
            <FiInbox size={32} color="#CBD5E1" style={{ marginBottom: 12 }} />
            <p style={{ margin: 0, color: '#94A3B8', fontSize: 14, fontWeight: 600 }}>{resources.length === 0 ? 'No study resources available yet.' : 'No resources match your filter.'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
            {filteredResources.map((res) => {
            const isDownloaded = downloadedIds.includes(res.id)
            return (
              <div
                key={res.id}
                style={{
                  background: '#F8FAFC',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        background: res.type === 'audio' ? '#F3E8FF' : '#E0F2FE',
                        color: res.type === 'audio' ? '#7C3AED' : '#0369A1',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {res.type === 'audio' ? <FiHeadphones size={11} /> : <FiFileText size={11} />}
                      {res.category}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>{res.size}</span>
                  </div>

                  <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0', lineHeight: 1.35 }}>
                    {res.title}
                  </h3>
                  <span style={{ fontSize: '11.5px', color: '#64748B', display: 'block', marginBottom: '6px' }}>
                    By {res.author}
                  </span>
                  <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.45, margin: 0 }}>
                    {res.description}
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => handleDownload(res)}
                    style={{
                      width: '100%',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      background: isDownloaded ? '#ECFDF5' : '#FFFFFF',
                      border: isDownloaded ? '1px solid #A7F3D0' : '1px solid #CBD5E1',
                      color: isDownloaded ? '#047857' : '#1E293B',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    {isDownloaded ? <FiCheckCircle size={14} color="#10B981" /> : <FiDownload size={14} />}
                    <span>{isDownloaded ? 'Downloaded (Click to Re-download)' : `Download Resource (${res.size})`}</span>
                  </button>
                </div>
              </div>
            )
          })}
          </div>
        )}
      </div>

      {/* Notes Modal */}
      {selectedNotes && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 14, 39, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedNotes(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '28px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>Session Insights &amp; Clinical Notes</h3>
              <button
                type="button"
                onClick={() => setSelectedNotes(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <FiX size={20} />
              </button>
            </div>
            <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
              {selectedNotes}
            </p>
            <button
              type="button"
              onClick={() => setSelectedNotes(null)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '12px',
                background: '#4F46E5',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Close Notes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SessionsResources
