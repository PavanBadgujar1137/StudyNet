import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import {
  FiBookOpen, FiPlay, FiLock, FiCheck, FiClock, FiVideo,
  FiSearch, FiX, FiChevronLeft,
  FiRefreshCw, FiArrowRight, FiShield
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { apiConnector } from '../../../../services/apiConnector'
import { OHPricingModal } from '../../../openhand'

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

// ─── Video Player Modal ────────────────────────────────────────────────────────
function VideoPlayer({ video, onClose, onNext, hasNext }) {
  const videoRef = useRef()

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 14 }}>
          <FiChevronLeft /> Back to Course
        </button>
        <div style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 15 }}>{video.title}</div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', cursor: 'pointer' }}>
          <FiX />
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <video
          ref={videoRef}
          src={video.videoUrl}
          controls
          autoPlay
          style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12, boxShadow: '0 0 80px rgba(0,0,0,0.8)' }}
        />
      </div>
      <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: '#64748B', fontSize: 13 }}>{video.description}</div>
        {hasNext && (
          <button onClick={onNext} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
            Next Video <FiArrowRight />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Course Detail View ────────────────────────────────────────────────────────
function CourseDetailView({ course, hasAccess, onBack, subscription }) {
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

      {/* Access Gate */}
      {!hasAccess ? (
        <div style={{ background: 'linear-gradient(135deg, #EFF6FF, #F5F3FF)', border: '1px solid #BFDBFE', borderRadius: 16, padding: '32px', textAlign: 'center' }}>
          <FiShield size={40} color="#3B82F6" style={{ marginBottom: 12 }} />
          <h3 style={{ margin: '0 0 8px', color: '#1E293B' }}>Subscription Required</h3>
          <p style={{ margin: '0 0 20px', color: '#64748B' }}>
            {course.requiredPlan
              ? `This course requires a ${course.requiredPlan === 'beginner' ? 'Beginner Plan (₹51/mo)' : course.requiredPlan === 'advance' ? 'Advance Plan (₹151/mo)' : course.requiredPlan === 'champion' ? 'Champion Plan (₹1,500/mo)' : `${course.requiredPlan} Plan`} or above.`
              : 'Subscribe to access all courses from our practitioners.'}
          </p>
          <a href="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', borderRadius: 10, color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            View Plans & Subscribe <FiArrowRight />
          </a>
        </div>
      ) : (
        /* Video List */
        <div>
          <h3 style={{ margin: '0 0 14px', color: '#1E293B', fontSize: 16, fontWeight: 700 }}>
            Course Videos ({videos.length})
          </h3>
          {loadingVideos ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#94A3B8' }}><FiRefreshCw style={{ animation: 'spin 1s linear infinite' }} /> Loading videos...</div>
          ) : videos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#94A3B8' }}>No videos added to this course yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {videos.map((video, idx) => (
                <div key={video._id} onClick={() => { setPlayingVideo(video); setPlayingIndex(idx) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F0F9FF'; e.currentTarget.style.borderColor = '#3B82F6' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E2E8F0' }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                    <FiPlay size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#1E293B', fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {idx + 1}. {video.title}
                    </div>
                    {video.description && <div style={{ color: '#64748B', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.description}</div>}
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: 12, flexShrink: 0 }}>{formatDuration(video.durationSeconds)}</div>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', flexShrink: 0 }}>
                    <FiPlay size={14} />
                  </div>
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
function CourseCard({ course, hasAccess, subscription, onClick, onBuyPaid }) {
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
              <FiCheck size={10} /> Unlocked
            </span>
          ) : isPaidCourse ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: 'linear-gradient(135deg, #D97706, #B45309)', color: '#fff', fontSize: 11, fontWeight: 700 }}>
              ₹{course.price} • Paid
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: 'rgba(15,23,42,0.85)', color: '#fff', fontSize: 11, fontWeight: 600 }}>
              <FiLock size={10} /> Free Plan Course
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
              style={{ width: '100%', padding: '8px 12px', background: hasAccess ? '#F0FDF4' : '#EFF6FF', border: `1px solid ${hasAccess ? '#BBF7D0' : '#BFDBFE'}`, borderRadius: 8, color: hasAccess ? '#166534' : '#1D4ED8', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              {hasAccess ? 'Watch Videos' : 'Unlock Course'} <FiArrowRight size={12} />
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
  const [subscription, setSubscription] = useState(null)
  const [subInfo, setSubInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [accessMap, setAccessMap] = useState({})
  const [showPricingModal, setShowPricingModal] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [coursesRes, subRes] = await Promise.all([
        apiConnector('GET', '/api/v1/courses').catch(() => null),
        token ? apiConnector('GET', '/api/v1/payments/subscription/mine', null, { Authorization: `Bearer ${token}` }).catch(() => null) : Promise.resolve(null),
      ])

      const courseList = coursesRes?.data?.success ? (coursesRes.data.courses || []) : []
      setCourses(courseList)

      const sData = subRes?.data || {}
      const sub = sData.subscription || null
      setSubscription(sub)
      setSubInfo(sData)

      // Access Rules:
      // Free courses (price = 0) accessible if trial active OR subscription active
      // Paid courses (price > 0) accessible if user enrolled or creator
      const map = {}
      const userId = user?._id || user?.id

      courseList.forEach(c => {
        const isEnrolled = (c.enrolledClients || []).map(String).includes(String(userId))
        const isCreator = String(c.practitioner?._id || c.practitioner) === String(userId)

        if (isCreator || isEnrolled) {
          map[c._id] = true
        } else if (c.price > 0 && !c.isFree) {
          map[c._id] = false
        } else {
          // Free course: available during trial or active subscription
          const hasAccess = sData.hasActiveSubscription || sData.isTrialActive
          map[c._id] = hasAccess
        }
      })
      setAccessMap(map)
    } catch (e) {}
    setLoading(false)

  }, [token, user])

  useEffect(() => { loadData() }, [loadData])

  const filtered = courses.filter(c =>
    !search ||
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase()) ||
    `${c.practitioner?.firstName} ${c.practitioner?.lastName}`.toLowerCase().includes(search.toLowerCase())
  )

  const loadRazorpaySDK = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleBuyPaidCourse = async (course) => {
    if (!token) return toast.error('Please login to purchase course.')
    const toastId = toast.loading(`Preparing Razorpay order for ${course.title}...`)
    try {
      const isLoaded = await loadRazorpaySDK()
      if (!isLoaded) {
        toast.error('Failed to load Razorpay SDK', { id: toastId })
        return
      }

      const res = await apiConnector('POST', '/api/v1/payments/buy-course', { courseId: course._id }, { Authorization: `Bearer ${token}` })
      if (!res?.data?.success) {
        toast.error(res?.data?.message || 'Failed to create course order', { id: toastId })
        return
      }

      const { order, key, courseTitle, practitionerName } = res.data
      toast.dismiss(toastId)

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: `Course: ${courseTitle}`,
        description: `By ${practitionerName}`,
        order_id: order.id,
        prefill: {
          name: user ? `${user.firstName} ${user.lastName}`.trim() : '',
          email: user?.email || '',
          contact: (user?.additionalDetails?.contactNumber && user.additionalDetails.contactNumber !== 'null' && user.additionalDetails.contactNumber !== 'undefined') ? String(user.additionalDetails.contactNumber).trim() : '',
        },
        theme: { color: '#1F5FE0' },
        handler: async (response) => {
          const vToast = toast.loading('Verifying Razorpay payment...')
          try {
            const vRes = await apiConnector('POST', '/api/v1/payments/verify-course-payment', {
              courseId: course._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }, { Authorization: `Bearer ${token}` })

            if (vRes?.data?.success) {
              toast.success(`🎉 ${courseTitle} Unlocked!`, { id: vToast })
              loadData()
            } else {
              toast.error(vRes?.data?.message || 'Verification failed', { id: vToast })
            }
          } catch (e) {
            toast.error('Payment verification failed', { id: vToast })
          }
        }
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e) {
      toast.error('Failed to initiate course payment', { id: toastId })
    }
  }

  if (selectedCourse) {
    return (
      <CourseDetailView
        course={selectedCourse}
        hasAccess={accessMap[selectedCourse._id]}
        subscription={subscription}
        onBack={() => setSelectedCourse(null)}
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
          <p style={{ margin: 0, color: '#64748B', fontSize: 14 }}>Video courses from your practitioners — subscribe to unlock free courses or buy paid courses</p>
        </div>
        {subInfo?.hasActiveSubscription ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#DCFCE7', borderRadius: 20, border: '1px solid #BBF7D0' }}>
            <FiCheck size={14} color="#166534" />
            <span style={{ color: '#166534', fontWeight: 600, fontSize: 13 }}>
              {subscription?.planName || subscription?.planKey} — Active
            </span>
          </div>
        ) : subInfo?.isTrialActive ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#F3E8FF', borderRadius: 20, border: '1px solid #E9D5FF' }}>
            <span style={{ color: '#7E22CE', fontWeight: 700, fontSize: 13 }}>
              ⚡ 7-Day Free Trial Active ({subInfo.trialDaysRemaining} days remaining)
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#FEE2E2', borderRadius: 20, border: '1px solid #FCA5A5' }}>
            <span style={{ color: '#DC2626', fontWeight: 700, fontSize: 13 }}>
              ⚠️ Free Trial Expired — Subscribe to Unlock Free Courses
            </span>
          </div>
        )}
      </div>

      {/* Subscription / Trial Banner */}
      {!subInfo?.hasActiveSubscription && (
        <div style={{
          background: subInfo?.isTrialActive ? 'linear-gradient(135deg, #F3E8FF, #EFF6FF)' : 'linear-gradient(135deg, #FEF2F2, #FFF7ED)',
          border: `1px solid ${subInfo?.isTrialActive ? '#C084FC' : '#FCA5A5'}`,
          borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiShield size={22} color={subInfo?.isTrialActive ? '#8B5CF6' : '#EF4444'} />
            <div>
              <div style={{ color: '#1E293B', fontWeight: 700, fontSize: 14 }}>
                {subInfo?.isTrialActive
                  ? `Your 7-Day Free Trial is Active (${subInfo.trialDaysRemaining} days remaining)`
                  : 'Your 7-Day Free Trial has Expired!'}
              </div>
              <div style={{ color: '#64748B', fontSize: 12 }}>
                {subInfo?.isTrialActive
                  ? 'Enjoy full free practitioner courses during your trial. Subscribe anytime to keep uninterrupted access.'
                  : 'Subscribe to a Learner Plan (Beginner ₹51, Advance ₹151, Champion ₹1,500) to unlock all practitioner free courses.'}
              </div>
            </div>
          </div>
          <button onClick={() => setShowPricingModal(true)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px',
            background: subInfo?.isTrialActive ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' : 'linear-gradient(135deg, #EF4444, #DC2626)',
            borderRadius: 8, color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer'
          }}>
            {subInfo?.isTrialActive ? 'Upgrade Plan' : 'Subscribe Now'} <FiArrowRight size={13} />
          </button>
        </div>
      )}

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
              subscription={subscription}
              onClick={() => setSelectedCourse(course)}
              onBuyPaid={handleBuyPaidCourse}
            />
          ))}
        </div>
      )}

      {/* Pricing Modal Overlay */}
      <OHPricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        defaultRole="learner"
      />
    </div>
  )
}
