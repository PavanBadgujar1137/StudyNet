import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import {
  FiBookOpen, FiPlay, FiLock, FiCheck, FiClock, FiVideo,
  FiSearch, FiX, FiChevronLeft,
  FiRefreshCw, FiArrowRight, FiShield,
  FiFileText, FiPaperclip, FiDownload
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { apiConnector } from '../../../../services/apiConnector'
import { formatFileSize } from '../../../../utils/imageProcessing'
import { mediaUrl } from '../../../../utils/mediaUrl'
import CheckoutCouponModal from '../../Coupons/CheckoutCouponModal'

function formatDuration(secs) {
  if (!secs) return '0:00'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatTotalDuration(secs) {
  if (!secs) return '0 min'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m} min`
}

function getYouTubeEmbedUrl(url) {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = String(url).match(regExp)
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0` : null
}

// ─── Video Player Modal ────────────────────────────────────────────────────────
function VideoPlayer({ video, onClose, onNext, hasNext }) {
  const videoRef = useRef()
  const ytEmbedUrl = getYouTubeEmbedUrl(video?.videoUrl)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(5, 8, 18, 0.95)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15, 23, 42, 0.6)' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#F1F5F9', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 14px', borderRadius: 8 }}>
          <FiChevronLeft size={16} /> Back to Course
        </button>
        <div style={{ color: '#F8FAFC', fontWeight: 700, fontSize: 16, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '50%' }}>
          {video.title}
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F1F5F9', cursor: 'pointer' }}>
          <FiX size={18} />
        </button>
      </div>

      {/* Video Content Stage */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '960px', maxHeight: 'calc(100vh - 200px)', aspectRatio: '16/9', background: '#000', borderRadius: 16, overflow: 'hidden', boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.1)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {ytEmbedUrl ? (
            <iframe
              src={ytEmbedUrl}
              title={video.title}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              src={mediaUrl(video.videoUrl)}
              controls
              autoPlay
              style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
            />
          )}
        </div>
      </div>

      {/* Attached Resources Bar (if any) */}
      {video?.attachments?.length > 0 && (
        <div style={{ padding: '10px 28px', background: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiPaperclip size={14} color="#3B82F6" /> Lecture Notes &amp; Resources ({video.attachments.length}):
          </span>
          {video.attachments.map((att, idx) => (
            <a
              key={idx}
              href={mediaUrl(att.url)}
              target="_blank"
              rel="noopener noreferrer"
              download
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 8,
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                color: '#93C5FD',
                fontSize: 12,
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              <FiDownload size={13} /> {att.name || 'Download Resource'} {att.size > 0 && `(${formatFileSize(att.size)})`}
            </a>
          ))}
        </div>
      )}

      {/* Footer / Description & Actions */}
      <div style={{ padding: '16px 28px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: '#94A3B8', fontSize: 13, maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {video.description || video.title}
        </div>
        {hasNext && (
          <button onClick={onNext} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'linear-gradient(135deg, #2563EB, #4F46E5)', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>
            Next Video <FiArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Course Detail View ────────────────────────────────────────────────────────
function CourseDetailView({ course, hasAccess, onBack, onBuyPaid }) {
  const { token } = useSelector(s => s.auth)
  const [videos, setVideos] = useState([])
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [playingVideo, setPlayingVideo] = useState(null)
  const [playingIndex, setPlayingIndex] = useState(0)

  useEffect(() => {
    if (hasAccess && token) {
      setLoadingVideos(true)
      apiConnector('GET', `/api/v1/courses/${course._id}/videos`, null, { Authorization: `Bearer ${token}` })
        .then(res => { if (res?.data?.success) setVideos(res.data.videos || []) })
        .catch(() => toast.error('Failed to load videos'))
        .finally(() => setLoadingVideos(false))
    }
  }, [course._id, hasAccess, token])

  const totalDuration = videos.reduce((s, v) => s + (v.durationSeconds || 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {playingVideo && (
        <VideoPlayer
          video={playingVideo}
          onClose={() => setPlayingVideo(null)}
          onNext={() => {
            const next = videos[playingIndex + 1]
            if (next) { setPlayingIndex(i => i + 1); setPlayingVideo(next) }
          }}
          hasNext={playingIndex < videos.length - 1}
        />
      )}

      {/* Back + Header */}
      <div>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 13, padding: '0 0 12px', fontWeight: 500 }}>
          <FiChevronLeft size={16} /> All Courses
        </button>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ width: 180, height: 120, borderRadius: 12, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', overflow: 'hidden', flexShrink: 0 }}>
            {course.thumbnail
              ? <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><FiBookOpen size={36} color="#fff" /></div>
            }
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 8px', color: '#1E293B', fontSize: 20, fontWeight: 800 }}>{course.title}</h2>
            <p style={{ margin: '0 0 12px', color: '#64748B', fontSize: 14, lineHeight: 1.6 }}>{course.description}</p>
            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#94A3B8', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                By Dr. {course.practitioner?.firstName} {course.practitioner?.lastName}
              </span>
              {hasAccess && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiVideo size={12} /> {videos.length} videos</span>}
              {hasAccess && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock size={12} /> {formatTotalDuration(totalDuration)}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Access Gate for Paid Courses */}
      {!hasAccess ? (
        <div style={{ background: 'linear-gradient(135deg, #EFF6FF, #F5F3FF)', border: '1px solid #BFDBFE', borderRadius: 16, padding: '32px', textAlign: 'center' }}>
          <FiShield size={40} color="#3B82F6" style={{ marginBottom: 12 }} />
          <h3 style={{ margin: '0 0 8px', color: '#1E293B' }}>Premium Paid Course</h3>
          <p style={{ margin: '0 0 20px', color: '#64748B' }}>
            This course is priced at ₹{course.price}. Purchase this course to unlock all video modules and resources.
          </p>
          <button
            onClick={() => onBuyPaid && onBuyPaid(course)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Buy Course for ₹{course.price} <FiArrowRight />
          </button>
        </div>
      ) : (
        /* Video List */
        <div>
          <h3 style={{ margin: '0 0 14px', color: '#1E293B', fontSize: 16, fontWeight: 700 }}>
            Course Videos &amp; Study Materials ({videos.length})
          </h3>
          {loadingVideos ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#94A3B8' }}><FiRefreshCw style={{ animation: 'spin 1s linear infinite' }} /> Loading videos...</div>
          ) : videos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#94A3B8' }}>No videos added to this course yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {videos.map((video, idx) => (
                <div
                  key={video._id}
                  style={{
                    background: '#fff',
                    borderRadius: 14,
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    onClick={() => { setPlayingVideo(video); setPlayingIndex(idx) }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 18px',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0 }}>
                      <FiPlay size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#1E293B', fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {idx + 1}. {video.title}
                      </div>
                      {video.description && <div style={{ color: '#64748B', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{video.description}</div>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      {video.attachments?.length > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#EFF6FF', color: '#2563EB', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                          <FiPaperclip size={12} /> {video.attachments.length} Resource{video.attachments.length > 1 ? 's' : ''}
                        </span>
                      )}
                      <span style={{ color: '#94A3B8', fontSize: 12 }}>{formatDuration(video.durationSeconds)}</span>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                        <FiPlay size={14} />
                      </div>
                    </div>
                  </div>

                  {/* Attached Resources Panel in Curriculum Row */}
                  {video.attachments?.length > 0 && (
                    <div style={{ background: '#F8FAFC', borderTop: '1px solid #F1F5F9', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiFileText size={13} color="#3B82F6" /> Attached Notes:
                      </span>
                      {video.attachments.map((att, aIdx) => (
                        <a
                          key={aIdx}
                          href={mediaUrl(att.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 10px',
                            background: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: 6,
                            fontSize: 11.5,
                            color: '#1E293B',
                            textDecoration: 'none',
                            fontWeight: 600,
                          }}
                        >
                          <FiDownload size={12} color="#2563EB" /> {att.name || 'Resource'} {att.size > 0 && `(${formatFileSize(att.size)})`}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Course Card (Grid) ────────────────────────────────────────────────────────
function CourseCard({ course, hasAccess, onClick, onBuyPaid }) {
  const totalDuration = course.videos?.reduce((s, v) => s + (v.durationSeconds || 0), 0) || 0
  const isPaidCourse = course.price > 0 && !course.isFree

  return (
    <div
      style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      {/* Thumbnail */}
      <div onClick={onClick} style={{ height: 150, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
        {course.thumbnail
          ? <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><FiBookOpen size={36} color="#fff" /></div>
        }
        {/* Access badge */}
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          {hasAccess ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.95)', color: '#fff', fontSize: 11, fontWeight: 700 }}>
              <FiCheck size={10} /> {course.isFree || !course.price ? 'Free • Unlocked' : 'Unlocked'}
            </span>
          ) : isPaidCourse ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: 'linear-gradient(135deg, #D97706, #B45309)', color: '#fff', fontSize: 11, fontWeight: 700 }}>
              ₹{course.price} • Paid
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.95)', color: '#fff', fontSize: 11, fontWeight: 700 }}>
              <FiCheck size={10} /> 100% Free
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div onClick={onClick} style={{ cursor: 'pointer' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</h3>
            {course.description && (
              <p style={{ margin: '0 0 10px', color: '#64748B', fontSize: 12, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {course.description}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#94A3B8', fontSize: 12 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, fontWeight: 700 }}>
              {course.practitioner?.firstName?.[0]}
            </div>
            Dr. {course.practitioner?.firstName} {course.practitioner?.lastName}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#94A3B8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><FiVideo size={11} /> {course.videos?.length || 0} vids</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><FiClock size={11} /> {formatTotalDuration(totalDuration)}</span>
            </div>
            {isPaidCourse && !hasAccess && (
              <span style={{ fontSize: 13, fontWeight: 800, color: '#D97706' }}>₹{course.price}</span>
            )}
          </div>

          {isPaidCourse && !hasAccess ? (
            <button
              onClick={() => onBuyPaid(course)}
              style={{ width: '100%', padding: '8px 12px', background: 'linear-gradient(135deg, #D97706, #B45309)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              Buy Course — ₹{course.price} <FiArrowRight size={12} />
            </button>
          ) : (
            <button
              onClick={onClick}
              style={{ width: '100%', padding: '8px 12px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, color: '#166534', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              Watch Videos <FiArrowRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Courses Component ───────────────────────────────────────────────────
export default function Courses() {
  const { token } = useSelector(s => s.auth)
  const { user } = useSelector(s => s.profile)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [accessMap, setAccessMap] = useState({})

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const coursesRes = await apiConnector('GET', '/api/v1/courses').catch(() => null)
      const courseList = coursesRes?.data?.success ? (coursesRes.data.courses || []) : []
      setCourses(courseList)

      // All free courses (price = 0 or isFree) are 100% accessible to every learner
      const map = {}
      const userId = user?._id || user?.id

      courseList.forEach(c => {
        const isEnrolled = (c.enrolledClients || []).map(String).includes(String(userId))
        const isCreator = String(c.practitioner?._id || c.practitioner) === String(userId)

        if (isCreator || isEnrolled || c.isFree || !c.price || c.price === 0) {
          map[c._id] = true
        } else {
          map[c._id] = false
        }
      })
      setAccessMap(map)
    } catch (e) {}
    setLoading(false)
  }, [user])

  useEffect(() => { loadData() }, [loadData])

  const filtered = courses.filter(c =>
    !search ||
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase()) ||
    `${c.practitioner?.firstName} ${c.practitioner?.lastName}`.toLowerCase().includes(search.toLowerCase())
  )

  const [checkoutCourse, setCheckoutCourse] = useState(null)

  const handleBuyPaidCourse = (course) => {
    if (!token) return toast.error('Please login to purchase course.')
    setCheckoutCourse(course)
  }

  if (selectedCourse) {
    return (
      <CourseDetailView
        course={selectedCourse}
        hasAccess={accessMap[selectedCourse._id]}
        onBack={() => setSelectedCourse(null)}
        onBuyPaid={handleBuyPaidCourse}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: '0 0 4px', color: '#1E293B', fontSize: 22, fontWeight: 800 }}>Courses Library</h2>
          <p style={{ margin: 0, color: '#64748B', fontSize: 14 }}>Video courses from verified practitioners — 100% free access to all practitioner free courses</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#DCFCE7', borderRadius: 20, border: '1px solid #BBF7D0' }}>
          <FiCheck size={14} color="#166534" />
          <span style={{ color: '#166534', fontWeight: 700, fontSize: 13 }}>
            Free Learner Account — Unlimited Access
          </span>
        </div>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '10px 16px', maxWidth: 440 }}>
        <FiSearch color="#94A3B8" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses or practitioners..."
          style={{ background: 'none', border: 'none', outline: 'none', color: '#1E293B', fontSize: 14, width: '100%' }} />
      </div>

      {/* Course Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 48, color: '#94A3B8' }}>
          <FiRefreshCw style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} /> Loading courses...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
          <FiBookOpen size={40} color="#CBD5E1" style={{ marginBottom: 16 }} />
          <h3 style={{ margin: '0 0 8px', color: '#1E293B' }}>{search ? 'No courses found' : 'No courses published yet'}</h3>
          <p style={{ margin: 0, color: '#64748B' }}>{search ? 'Try a different search term.' : 'Practitioners are preparing courses — check back soon!'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
          {filtered.map(course => (
            <CourseCard
              key={course._id}
              course={course}
              hasAccess={accessMap[course._id]}
              onClick={() => setSelectedCourse(course)}
              onBuyPaid={handleBuyPaidCourse}
            />
          ))}
        </div>
      )}

      {/* Checkout Coupon & Discount Modal (for paid courses) */}
      <CheckoutCouponModal
        isOpen={!!checkoutCourse}
        onClose={() => setCheckoutCourse(null)}
        productType="course"
        product={checkoutCourse}
        onSuccess={() => {
          loadData()
          toast.success('Course unlocked successfully!')
        }}
      />
    </div>
  )
}
