import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  FiCheckCircle,
  FiCalendar,
  FiArrowLeft,
  FiShield,
  FiEye,
  FiBookOpen,
  FiPlayCircle,
  FiClock,
  FiStar,
  FiChevronRight,
  FiCompass,
  FiGlobe,
  FiShare2,
  FiVideo,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { apiConnector } from '../../services/apiConnector'
import OHFooter from '../../components/openhand/OHFooter'
import { IntakeModal } from '../../components/openhand'
import { LearnerScheduleSelectionModal } from '../../components/openhand/LearnerScheduleSelectionModal'
import { formatPractitionerName } from '../../utils/formatName'
import { getOptimizedImageUrl } from '../../utils/imageOptimizer'
import CheckoutCouponModal from '../../components/core/Coupons/CheckoutCouponModal'


export function PractitionerPublicProfile() {
  const { handle } = useParams()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const [showIntakeModal, setShowIntakeModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [intakeAnswers, setIntakeAnswers] = useState([])
  const [checkoutProductType, setCheckoutProductType] = useState('session') // 'session' | 'course'

  // Course Details / Syllabus Modal State
  const [selectedCourse, setSelectedCourse] = useState(null)

  // Review & Rating Modal State
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [userRating, setUserRating] = useState(5)
  const [reviewContent, setReviewContent] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return 'Self-Paced'
    const mins = Math.round(seconds / 60)
    if (mins < 60) return `${mins} mins`
    const hrs = Math.floor(mins / 60)
    const remMins = mins % 60
    return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs} hrs`
  }

  const handleShareProfile = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      toast.success('🔗 Profile link copied to clipboard!')
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
      ? JSON.parse(localStorage.getItem('token'))
      : null

    if (!token) {
      toast.error('Please sign in as a learner to submit feedback.')
      navigate('/login')
      return
    }

    if (!reviewContent.trim()) {
      toast.error('Please enter your review text.')
      return
    }

    setIsSubmittingReview(true)
    const toastId = toast.loading('Submitting feedback for Admin Verification...')
    try {
      const practUserId = profile?.user?._id || profile?.user?.id || profile?.user
      const res = await apiConnector(
        'POST',
        '/api/v1/testimonials',
        {
          practitionerId: practUserId,
          rating: userRating,
          content: reviewContent,
        },
        { Authorization: `Bearer ${token}` }
      )

      if (res?.data?.success) {
        toast.success(
          res.data.message || '⭐ Submitted for Admin Verification! It will appear once approved.',
          { id: toastId, duration: 6000 }
        )
        setShowReviewModal(false)
        setReviewContent('')
      } else {
        toast.error(res?.data?.message || 'Failed to submit review', { id: toastId })
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error submitting review', { id: toastId })
    } finally {
      setIsSubmittingReview(false)
    }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const response = await apiConnector('GET', `/api/v1/practitioners/handle/${handle}`)
        if (response?.data?.success) {
          setProfile(response.data.data)
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error('Fetch practitioner by handle error:', error)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [handle])

  // Trigger intake modal for 1:1 consultation session
  const handleBookOffer = (offer) => {
    const token = localStorage.getItem('token')
      ? JSON.parse(localStorage.getItem('token'))
      : null

    if (!token) {
      toast.error('Please log in to connect with this practitioner.')
      navigate('/login')
      return
    }

    setSelectedOffer(offer)
    setCheckoutProductType('session')
    setShowIntakeModal(true)
  }

  // Triggered after 6-question intake is submitted
  const handleIntakeSubmitted = async (formattedAnswers) => {
    setIntakeAnswers(formattedAnswers)
    setShowIntakeModal(false)
    if (selectedOffer) {
      if (selectedOffer.isDummy || selectedOffer.price == null || selectedOffer.price === 0) {
        toast.success(
          `🌱 Consultation inquiry submitted! ${practitionerName} will review your notes and connect with you.`
        )
        setSelectedOffer(null)
      } else {
        setShowScheduleModal(true) // Open schedule selection next
      }
    }
  }

  const handleScheduleSelected = (scheduleDateStr) => {
    setSelectedSchedule(scheduleDateStr)
    setShowScheduleModal(false)
    setShowCouponModal(true)
  }


  // Handle Course enrollment / start
  const handleStartCourse = (course) => {
    const token = localStorage.getItem('token')
      ? JSON.parse(localStorage.getItem('token'))
      : null

    if (!token) {
      toast.error('Please log in to access this course.')
      navigate('/login')
      return
    }

    if (course.isFree || course.price === 0) {
      toast.success(`🎉 You have free access to "${course.title}"!`)
      setSelectedCourse(null)
      navigate('/dashboard/enrolled-courses')
      return
    }

    // Paid Course checkout
    setSelectedCourse(null)
    setSelectedOffer(course)
    setCheckoutProductType('course')
    setShowCouponModal(true)
  }

  if (loading) {
    return (
      <div
        style={{
          background: '#F8FAFC',
          minHeight: '100vh',
          color: '#0F172A',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '16px',
          fontWeight: 600,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid #E2E8F0',
              borderTopColor: '#2563EB',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 12px auto',
            }}
          />
          Loading practitioner profile...
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div
        style={{
          background: '#F8FAFC',
          minHeight: '100vh',
          color: '#0F172A',
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            margin: '0 auto',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
          }}
        >
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#0F172A',
              marginBottom: '12px',
            }}
          >
            Practitioner Profile Not Found
          </h1>
          <p style={{ color: '#64748B', marginBottom: '24px', fontSize: '14.5px' }}>
            The booking link{' '}
            <code
              style={{
                background: '#F1F5F9',
                padding: '4px 8px',
                borderRadius: '6px',
                color: '#2563EB',
              }}
            >
              /practitioner/{handle}
            </code>{' '}
            is either unavailable or pending verification.
          </p>
          <Link
            to="/find-a-practitioner"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '30px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
            }}
          >
            <FiArrowLeft /> Browse Practitioner Directory
          </Link>
        </div>
      </div>
    )
  }

  const user = profile.user || {}
  const practitionerName = formatPractitionerName(user, 'Practitioner')
  const offers = (profile.offers || profile.userOffers || []).filter(
    (o) => o.status === 'published' || (!o.status && o.status !== 'draft')
  )
  const courses = profile.courses || []
  const reviews = profile.reviews || []

  let storedUser = null
  try {
    storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  } catch {
    storedUser = null
  }
  const isOwner =
    storedUser &&
    (String(storedUser._id || storedUser.id) === String(user._id || user.id) ||
      storedUser.email === user.email)

  return (
    <div
      style={{
        background: '#F8FAFC',
        minHeight: '100vh',
        color: '#0F172A',
        fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
      }}
    >
      {/* Top Banner Navigation Header */}
      <div
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '16px 32px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <Link
            to="/find-a-practitioner"
            style={{
              color: '#2563EB',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FiArrowLeft /> Back to Practitioner Directory
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleShareProfile}
              style={{
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                color: '#475569',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FiShare2 /> Share Profile
            </button>

            <span
              style={{
                fontSize: '12.5px',
                background: '#ECFDF5',
                color: '#059669',
                border: '1px solid #A7F3D0',
                padding: '6px 14px',
                borderRadius: '20px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FiShield color="#059669" /> Verified OpenHand Guide
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1100px',
          margin: '32px auto 60px auto',
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '36px',
        }}
      >
        {/* Main Practitioner Hero Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '24px',
            padding: '36px',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
            display: 'flex',
            gap: '28px',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
          }}
        >
          {/* Avatar Image */}
          <div
            style={{
              width: '130px',
              height: '130px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 800,
              border: '4px solid #DBEAFE',
              boxShadow: '0 10px 25px rgba(59, 130, 246, 0.22)',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {user.image ? (
              <img
                src={getOptimizedImageUrl(user.image, 800)}
                alt={practitionerName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  imageRendering: '-webkit-optimize-contrast',
                }}
              />
            ) : (
              <span>{user.firstName?.slice(0, 1) || 'P'}</span>
            )}
          </div>

          {/* Practitioner Info & Credentials */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
                marginBottom: '8px',
              }}
            >
              <h1
                style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: 0,
                  letterSpacing: '-0.5px',
                }}
              >
                {practitionerName}
              </h1>

              <span
                style={{
                  background: '#ECFDF5',
                  color: '#059669',
                  border: '1px solid #A7F3D0',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <FiCheckCircle color="#059669" /> Verified Guide
              </span>

              <span
                style={{
                  background: '#EEF2FF',
                  color: '#4338CA',
                  border: '1px solid #C7D2FE',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                title="Total profile views"
              >
                <FiEye color="#4338CA" /> {(profile.viewCount || 0).toLocaleString()}{' '}
                {profile.viewCount === 1 ? 'view' : 'views'}
              </span>

              {profile.rating && (
                <span
                  style={{
                    background: '#FEF3C7',
                    color: '#B45309',
                    border: '1px solid #FDE68A',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <FiStar fill="#F59E0B" color="#F59E0B" fontSize={13} /> {profile.rating} Rating
                </span>
              )}

              {courses.length > 0 && (
                <span
                  style={{
                    background: '#F0FDF4',
                    color: '#15803D',
                    border: '1px solid #BBF7D0',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <FiBookOpen color="#15803D" /> {courses.length} Video{' '}
                  {courses.length === 1 ? 'Course' : 'Courses'}
                </span>
              )}
            </div>

            <p
              style={{
                color: '#2563EB',
                fontSize: '16px',
                fontWeight: 700,
                margin: '0 0 12px 0',
                letterSpacing: '0.1px',
              }}
            >
              {profile.credentials || 'Verified Clinical Practitioner'}
            </p>

            <p
              style={{
                color: '#475569',
                fontSize: '15px',
                lineHeight: '1.65',
                margin: '0 0 22px 0',
                maxWidth: '740px',
              }}
            >
              {profile.bio ||
                'Welcome to my official practice profile! I offer personalized 1-on-1 consultations, specialized somatic frameworks, and structured health learning programs.'}
            </p>

            {/* Specialties & Languages Badges */}
            <div
              style={{
                display: 'flex',
                gap: '28px',
                flexWrap: 'wrap',
                fontSize: '13.5px',
                paddingTop: '18px',
                borderTop: '1px solid #F1F5F9',
              }}
            >
              <div>
                <span
                  style={{
                    color: '#64748B',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    fontSize: '11.5px',
                    letterSpacing: '0.5px',
                  }}
                >
                  <FiCompass color="#3B82F6" /> Specialties:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(profile.specialties && profile.specialties.length > 0
                    ? profile.specialties
                    : ['Emotional Intelligence', 'Somatic Alignment']
                  ).map((spec, i) => (
                    <span
                      key={i}
                      style={{
                        background: '#EFF6FF',
                        color: '#1D4ED8',
                        border: '1px solid #BFDBFE',
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontWeight: 600,
                      }}
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span
                  style={{
                    color: '#64748B',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    fontSize: '11.5px',
                    letterSpacing: '0.5px',
                  }}
                >
                  <FiGlobe color="#64748B" /> Languages:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(profile.languages && profile.languages.length > 0
                    ? profile.languages
                    : ['English']
                  ).map((lang, i) => (
                    <span
                      key={i}
                      style={{
                        background: '#F1F5F9',
                        color: '#334155',
                        border: '1px solid #CBD5E1',
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontWeight: 600,
                      }}
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 1. Practice Offers & Session Booking Section (UP) ─── */}
        <div id="sessions-section">
          <div style={{ marginBottom: '20px' }}>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: '#0F172A',
                margin: 0,
                letterSpacing: '-0.5px',
              }}
            >
              Book Session or Join Program
            </h2>
            <p style={{ color: '#64748B', fontSize: '14.5px', margin: '4px 0 0 0' }}>
              Select an available offer below to reserve your direct consultation slot with {practitionerName}.
            </p>
          </div>

          {offers.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '24px',
                padding: '48px 24px',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  fontSize: '28px',
                }}
              >
                <FiCalendar color="#2563EB" />
              </div>
              <h3
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#0F172A',
                }}
              >
                No Active Booking Slots
              </h3>
              <p
                style={{
                  margin: '0 0 24px 0',
                  fontSize: '14.5px',
                  color: '#64748B',
                  maxWidth: '480px',
                  marginInline: 'auto',
                  lineHeight: '1.5',
                }}
              >
                This practitioner has not published active booking offers yet. Check back soon or explore other verified guides in our directory.
              </p>
              <Link
                to="/find-a-practitioner"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '30px',
                  fontWeight: 700,
                  fontSize: '14px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
                }}
              >
                Browse Verified Directory →
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px',
              }}
            >
              {offers.map((offer) => {
                const isDummyOrUnpriced = offer.isDummy || offer.price == null || offer.price === 0

                return (
                  <div
                    key={offer._id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '20px',
                      padding: '28px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '20px',
                      boxShadow: '0 10px 25px rgba(15, 23, 42, 0.04)',
                    }}
                  >
                    <div>
                      {/* Fixed Header Row: Prevents badge collision and ugly Price NA */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '10px',
                          marginBottom: '16px',
                        }}
                      >
                        <span
                          style={{
                            background: offer.isDummy ? '#F0FDF4' : '#EFF6FF',
                            color: offer.isDummy ? '#15803D' : '#1D4ED8',
                            border: offer.isDummy ? '1px solid #BBF7D0' : '1px solid #BFDBFE',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            textTransform: 'capitalize',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {offer.isDummy
                            ? '🌱 1:1 Consultation'
                            : offer.type || '1:1 Session'}
                        </span>

                        {isDummyOrUnpriced ? (
                          <span
                            style={{
                              background: '#F8FAFC',
                              color: '#64748B',
                              border: '1px solid #E2E8F0',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Custom / Upon Request
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '18px',
                              fontWeight: 800,
                              color: '#059669',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            ₹{offer.price.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: 700,
                          color: '#0F172A',
                          margin: '0 0 10px 0',
                          lineHeight: '1.3',
                        }}
                      >
                        {offer.title}
                      </h3>

                      <p
                        style={{
                          fontSize: '14px',
                          color: '#475569',
                          lineHeight: '1.5',
                          margin: 0,
                        }}
                      >
                        {offer.description ||
                          offer.details ||
                          (offer.isDummy
                            ? 'Standard 1:1 introductory consultation session. Connect directly to discuss your personalized holistic action plan.'
                            : 'Includes direct live consultation, personalized action plan, and follow-up support.')}
                      </p>
                    </div>

                    {/* Booking / Action Button */}
                    <button
                      onClick={() => handleBookOffer(offer)}
                      style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '14px',
                        borderRadius: '30px',
                        fontWeight: 700,
                        fontSize: '14.5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                      }}
                    >
                      <FiCalendar fontSize={16} />
                      {isDummyOrUnpriced
                        ? 'Request 1:1 Consultation'
                        : `Reserve Slot — ₹${offer.price.toLocaleString('en-IN')}`}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ─── 2. Practitioner Courses & Learning Programs Section (DOWN) ─── */}
        <div id="courses-section">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                }}
              >
                <FiBookOpen /> Verified Curriculum
              </div>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: 0,
                  letterSpacing: '-0.5px',
                }}
              >
                Courses &amp; Learning Programs ({courses.length})
              </h2>
              <p style={{ color: '#64748B', fontSize: '14.5px', margin: '4px 0 0 0' }}>
                Structured video courses and self-paced healing protocols authored by {practitionerName}.
              </p>
            </div>
          </div>

          {courses.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '24px',
                padding: '36px 24px',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px auto',
                  fontSize: '24px',
                }}
              >
                <FiBookOpen color="#2563EB" />
              </div>
              <h3
                style={{
                  margin: '0 0 6px 0',
                  fontSize: '19px',
                  fontWeight: 800,
                  color: '#0F172A',
                }}
              >
                No Courses Published Yet
              </h3>
              <p
                style={{
                  margin: '0 0 16px 0',
                  fontSize: '14px',
                  color: '#64748B',
                  maxWidth: '520px',
                  marginInline: 'auto',
                  lineHeight: '1.5',
                }}
              >
                {practitionerName} has not published video courses yet. Courses created and published by {practitionerName} from their practitioner dashboard will appear here in real time.
              </p>
              {isOwner && (
                <Link
                  to="/practice"
                  style={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    color: '#ffffff',
                    padding: '10px 22px',
                    borderRadius: '24px',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                    marginTop: '4px',
                  }}
                >
                  Create &amp; Publish Course in Practitioner Portal →
                </Link>
              )}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px',
              }}
            >
              {courses.map((course) => {
                const totalDurationSecs = (course.videos || []).reduce(
                  (acc, v) => acc + (v.durationSeconds || 0),
                  0
                )
                const isFreeCourse = course.isFree || !course.price || course.price === 0

                return (
                  <div
                    key={course._id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '22px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 6px 24px rgba(15, 23, 42, 0.04)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                  >
                    {/* Course Thumbnail */}
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '195px',
                        background: 'linear-gradient(135deg, #1E293B, #0F172A)',
                        overflow: 'hidden',
                      }}
                    >
                      {course.thumbnail ? (
                        <img
                          src={getOptimizedImageUrl(course.thumbnail, 800)}
                          alt={course.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            imageRendering: '-webkit-optimize-contrast',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)',
                            color: '#ffffff',
                          }}
                        >
                          <FiPlayCircle style={{ fontSize: '48px', opacity: 0.9 }} />
                        </div>
                      )}

                      {/* Video Count Pill */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          background: 'rgba(15, 23, 42, 0.85)',
                          backdropFilter: 'blur(8px)',
                          color: '#FFFFFF',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <FiVideo fontSize={13} />
                        {course.videos?.length || 0} Lessons
                      </div>

                      {/* Price Pill */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: isFreeCourse
                            ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                            : 'rgba(15, 23, 42, 0.92)',
                          color: '#FFFFFF',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 800,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                        }}
                      >
                        {isFreeCourse ? 'Free Course' : `₹${course.price.toLocaleString('en-IN')}`}
                      </div>
                    </div>

                    {/* Course Card Details */}
                    <div
                      style={{
                        padding: '22px',
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        {/* Tags */}
                        {course.tags && course.tags.length > 0 && (
                          <div
                            style={{
                              display: 'flex',
                              gap: '6px',
                              flexWrap: 'wrap',
                              marginBottom: '10px',
                            }}
                          >
                            {course.tags.slice(0, 3).map((tag, i) => (
                              <span
                                key={i}
                                style={{
                                  background: '#F1F5F9',
                                  color: '#475569',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <h3
                          style={{
                            fontSize: '17px',
                            fontWeight: 800,
                            color: '#0F172A',
                            margin: '0 0 8px 0',
                            lineHeight: 1.35,
                          }}
                        >
                          {course.title}
                        </h3>

                        <p
                          style={{
                            fontSize: '13.5px',
                            color: '#64748B',
                            lineHeight: 1.55,
                            margin: '0 0 16px 0',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {course.description ||
                            'Structured video lessons and guided therapeutic practice protocols prepared by this verified practitioner.'}
                        </p>
                      </div>

                      {/* Card Action Footer */}
                      <div
                        style={{
                          paddingTop: '16px',
                          borderTop: '1px solid #F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '12.5px',
                            color: '#64748B',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <FiClock color="#94A3B8" /> {formatDuration(totalDurationSecs)}
                        </span>

                        <button
                          onClick={() => setSelectedCourse(course)}
                          style={{
                            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '9px 18px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.22)',
                          }}
                        >
                          View Syllabus <FiChevronRight />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ─── 3. Verified Client Reviews Section ─── */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 10px 25px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 14,
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Verified Client Feedback ({reviews.length})
              </h2>
              {profile.rating && (
                <span
                  style={{
                    background: '#FEF3C7',
                    color: '#B45309',
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  ★ {profile.rating}
                </span>
              )}
            </div>

            <button
              onClick={() => setShowReviewModal(true)}
              style={{
                padding: '9px 18px',
                borderRadius: '20px',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                color: '#1E293B',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              ★ Leave Feedback / Review
            </button>
          </div>

          {reviews.length === 0 ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                background: '#F8FAFC',
                borderRadius: '16px',
                color: '#64748B',
                fontSize: '13.5px',
              }}
            >
              No reviews published yet. Be the first client to book a session and share your experience!
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
              }}
            >
              {reviews.map((rev, i) => (
                <div
                  key={rev._id || i}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '20px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '10px',
                    }}
                  >
                    <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: '14px' }}>
                      {'★'.repeat(rev.rating || 5)}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#0F172A' }}>
                      —{' '}
                      {rev.clientName ||
                        (rev.user?.firstName
                          ? `${rev.user.firstName} ${rev.user.lastName || ''}`
                          : 'Verified Client')}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13.5px', color: '#334155', lineHeight: '1.5' }}>
                    "{rev.review}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Course Syllabus & Curriculum Modal ─── */}
      {selectedCourse && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 24,
              width: '100%',
              maxWidth: 620,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header Banner */}
            <div
              style={{
                position: 'relative',
                height: 180,
                background: 'linear-gradient(135deg, #1E293B, #0F172A)',
                overflow: 'hidden',
                borderRadius: '24px 24px 0 0',
              }}
            >
              {selectedCourse.thumbnail ? (
                <img
                  src={getOptimizedImageUrl(selectedCourse.thumbnail, 800)}
                  alt={selectedCourse.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #3B82F6, #7C3AED)',
                    color: '#ffffff',
                  }}
                >
                  <FiPlayCircle style={{ fontSize: '56px', opacity: 0.9 }} />
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setSelectedCourse(null)}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: 'none',
                  color: '#ffffff',
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 18,
                }}
              >
                ✕
              </button>

              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 16,
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <FiVideo color="#38BDF8" /> {selectedCourse.videos?.length || 0} Video Lessons
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px', flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 800,
                    color: '#0F172A',
                    lineHeight: 1.3,
                  }}
                >
                  {selectedCourse.title}
                </h3>
                <span
                  style={{
                    background:
                      selectedCourse.isFree || !selectedCourse.price ? '#ECFDF5' : '#EFF6FF',
                    color:
                      selectedCourse.isFree || !selectedCourse.price ? '#059669' : '#1D4ED8',
                    border:
                      selectedCourse.isFree || !selectedCourse.price
                        ? '1px solid #A7F3D0'
                        : '1px solid #BFDBFE',
                    padding: '4px 12px',
                    borderRadius: 16,
                    fontSize: 13,
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {selectedCourse.isFree || !selectedCourse.price
                    ? 'Free Course'
                    : `₹${selectedCourse.price.toLocaleString('en-IN')}`}
                </span>
              </div>

              <p
                style={{
                  fontSize: 14,
                  color: '#475569',
                  lineHeight: 1.6,
                  margin: '0 0 20px 0',
                }}
              >
                {selectedCourse.description ||
                  'Comprehensive video training and guidance prepared directly by this verified practitioner.'}
              </p>

              {/* Course Syllabus / Lecture list */}
              <div>
                <h4
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#0F172A',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <FiBookOpen color="#2563EB" /> Curriculum &amp; Video Lessons
                </h4>

                {!selectedCourse.videos || selectedCourse.videos.length === 0 ? (
                  <div
                    style={{
                      padding: 16,
                      background: '#F8FAFC',
                      borderRadius: 12,
                      fontSize: 13,
                      color: '#64748B',
                      textAlign: 'center',
                    }}
                  >
                    Lectures curriculum will be unlocked upon enrollment.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedCourse.videos.map((vid, idx) => (
                      <div
                        key={vid._id || idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          background: '#F8FAFC',
                          borderRadius: 12,
                          border: '1px solid #F1F5F9',
                          gap: 12,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: '50%',
                              background: '#EFF6FF',
                              color: '#2563EB',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12,
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <div
                              style={{
                                fontSize: 13.5,
                                fontWeight: 700,
                                color: '#0F172A',
                                lineHeight: 1.3,
                              }}
                            >
                              {vid.title}
                            </div>
                            {vid.description && (
                              <div
                                style={{
                                  fontSize: 12,
                                  color: '#64748B',
                                  marginTop: 2,
                                  lineHeight: 1.4,
                                }}
                              >
                                {vid.description}
                              </div>
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            flexShrink: 0,
                            fontSize: 12.5,
                            color: '#64748B',
                            fontWeight: 600,
                          }}
                        >
                          <FiClock fontSize={12} color="#94A3B8" />
                          {formatDuration(vid.durationSeconds || vid.duration)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div
              style={{
                padding: '16px 28px',
                borderTop: '1px solid #E2E8F0',
                background: '#F8FAFC',
                borderRadius: '0 0 24px 24px',
                display: 'flex',
                gap: 12,
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: 14,
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => handleStartCourse(selectedCourse)}
                style={{
                  flex: 2,
                  padding: '12px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: 14,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <FiPlayCircle fontSize={17} />
                {selectedCourse.isFree || !selectedCourse.price
                  ? 'Start Learning Free'
                  : `Enroll Now — ₹${selectedCourse.price.toLocaleString('en-IN')}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Leave Feedback Modal ─── */}
      {showReviewModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 24,
              width: '100%',
              maxWidth: 480,
              padding: 28,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                Rate &amp; Review {practitionerName}
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748B',
                  fontSize: 20,
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
                fontSize: 12.5,
                color: '#1E40AF',
                lineHeight: 1.4,
              }}
            >
              ℹ️ <strong>Admin Verification Notice:</strong> All feedback and ratings are reviewed by our platform moderation team before being published live.
            </div>

            <form
              onSubmit={handleReviewSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#0F172A',
                    marginBottom: 8,
                  }}
                >
                  Your Rating
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        borderRadius: 10,
                        border: userRating >= star ? '2px solid #F59E0B' : '1px solid #CBD5E1',
                        background: userRating >= star ? '#FFFBEB' : '#FFFFFF',
                        color: userRating >= star ? '#B45309' : '#64748B',
                        fontWeight: 800,
                        fontSize: 14,
                        cursor: 'pointer',
                      }}
                    >
                      {star} ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#0F172A',
                    marginBottom: 6,
                  }}
                >
                  Your Feedback / Experience <sup>*</sup>
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Share details about your consultation, recovery, or learning experience..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 12,
                    border: '1px solid #CBD5E1',
                    fontSize: 13.5,
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: 12,
                    color: '#475569',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    border: 'none',
                    borderRadius: 12,
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16,185,129,0.25)',
                  }}
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Pre-Session 6-Question Intake Modal ─── */}
      <IntakeModal
        open={showIntakeModal}
        onClose={() => setShowIntakeModal(false)}
        practitionerName={practitionerName}
        questions={profile.intakeQuestions || []}
        onSubmit={handleIntakeSubmitted}
      />

      <LearnerScheduleSelectionModal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false)
          setSelectedOffer(null)
        }}
        practitionerId={profile?.user?._id || profile?.user?.id || profile?.user}
        offer={selectedOffer}
        onSlotSelected={handleScheduleSelected}
      />

      {/* ─── Session / Course Checkout & Coupon Modal ─── */}
      <CheckoutCouponModal
        isOpen={showCouponModal}
        onClose={() => {
          setShowCouponModal(false)
          setSelectedOffer(null)
        }}
        productType={checkoutProductType}
        product={selectedOffer}
        scheduledAt={selectedSchedule}
        intakeAnswers={intakeAnswers}
        onSuccess={() => {
          toast.success(
            checkoutProductType === 'course'
              ? '🎉 Course enrolled successfully!'
              : '🎉 Session booked successfully!'
          )
          navigate(
            checkoutProductType === 'course'
              ? '/dashboard/enrolled-courses'
              : '/dashboard/my-profile'
          )
        }}
      />

      <OHFooter />
    </div>
  )
}

export default PractitionerPublicProfile
