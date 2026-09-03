import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  FiCheckCircle,
  FiCalendar,
  FiArrowLeft,
  FiShield
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { apiConnector } from '../../services/apiConnector'
import OHFooter from '../../components/openhand/OHFooter'

import { IntakeModal } from '../../components/openhand'
import { formatPractitionerName } from '../../utils/formatName'

export function PractitionerPublicProfile() {
  const { handle } = useParams()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connectingOfferId, setConnectingOfferId] = useState(null)

  // Stage 02 — Intake Modal State
  const [showIntakeModal, setShowIntakeModal] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState(null)

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

  // Stage 02: First trigger intake modal
  const handleBookOffer = (offer) => {
    const token = localStorage.getItem('token')
      ? JSON.parse(localStorage.getItem('token'))
      : null

    if (!token) {
      toast.error('Please log in to book a session.')
      navigate('/login')
      return
    }

    setSelectedOffer(offer)
    setShowIntakeModal(true)
  }

  // Triggered after 6-question intake is submitted
  const handleIntakeSubmitted = async (formattedAnswers) => {
    setShowIntakeModal(false)
    if (selectedOffer) {
      await proceedToPayment(selectedOffer, formattedAnswers)
    }
  }

  const proceedToPayment = async (offer, intakeAnswers) => {
    try {
      const token = localStorage.getItem('token')
        ? JSON.parse(localStorage.getItem('token'))
        : null

      setConnectingOfferId(offer._id)
      const isLoaded = await loadRazorpaySDK()
      if (!isLoaded) {
        toast.error('Razorpay Gateway failed to initialize')
        setConnectingOfferId(null)
        return
      }

      const pId = profile.user?._id || profile.user
      const orderRes = await apiConnector(
        'POST',
        '/api/v1/payment/create-practitioner-order',
        {
          practitionerId: pId,
          amount: offer.price || 2500,
          offerId: offer._id,
        },
        { Authorization: `Bearer ${token}` }
      )

      if (!orderRes?.data?.success) {
        toast.error(orderRes?.data?.message || 'Failed to initialize booking order')
        setConnectingOfferId(null)
        return
      }

      const { order, key, bookingId } = orderRes.data

      const options = {
        key: key || 'rzp_test_TDhFSRuAl18Gcb',
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'OpenHand Practitioner Booking',
        description: `Booking: ${offer.title}`,
        order_id: order.id,
        prefill: {
          name: user ? `${user.firstName} ${user.lastName}`.trim() : '',
          email: user?.email || '',
          contact: (user?.additionalDetails?.contactNumber && user.additionalDetails.contactNumber !== 'null' && user.additionalDetails.contactNumber !== 'undefined') ? String(user.additionalDetails.contactNumber).trim() : '',
        },
        theme: { color: '#2563EB' },
        handler: async (response) => {
          // Save intake answers to booking upon payment completion
          if (bookingId && intakeAnswers?.length) {
            try {
              await apiConnector(
                'POST',
                '/api/v1/practitioner/intake-answers',
                { bookingId, answers: intakeAnswers },
                { Authorization: `Bearer ${token}` }
              )
            } catch (err) {
              console.warn('Failed to attach intake answers to booking:', err)
            }
          }
          toast.success('🎉 Booking confirmed & Intake saved! Practitioner notified.')
          setConnectingOfferId(null)
        },
        modal: {
          ondismiss: () => setConnectingOfferId(null),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e) {
      toast.error('Booking failed. Please try again.')
      setConnectingOfferId(null)
    }
  }

  if (loading) {
    return (
      <div style={{ background: '#F8FAFC', minHeight: '100vh', color: '#0F172A', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '16px', fontWeight: 600 }}>
        Loading practitioner profile...
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={{ background: '#F8FAFC', minHeight: '100vh', color: '#0F172A', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '40px', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>Practitioner Profile Not Found</h1>
          <p style={{ color: '#64748B', marginBottom: '24px', fontSize: '14.5px' }}>
            The booking link <code style={{ background: '#F1F5F9', padding: '4px 8px', borderRadius: '6px', color: '#2563EB' }}>/practitioner/{handle}</code> is either unavailable or pending verification.
          </p>
          <Link
            to="/find-a-practitioner"
            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)', color: '#ffffff', padding: '12px 24px', borderRadius: '30px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)' }}
          >
            <FiArrowLeft /> Browse Practitioner Directory
          </Link>
        </div>
      </div>
    )
  }

  const user = profile.user || {}
  const practitionerName = formatPractitionerName(user, 'Practitioner')
  const offers = profile.offers || profile.userOffers || []
  const reviews = profile.reviews || []

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', color: '#0F172A', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>

      {/* Top Banner Navigation Header */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 32px', sticky: 'top', top: 0, zIndex: 10, boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <Link to="/find-a-practitioner" style={{ color: '#2563EB', textDecoration: 'none', fontSize: '14px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <FiArrowLeft /> Back to Guide Directory
          </Link>
          <span style={{ fontSize: '12.5px', background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '5px 14px', borderRadius: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiShield color="#059669" /> Verified OpenHand Guide Profile
          </span>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '36px auto 60px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

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
            alignItems: 'flex-start'
          }}
        >
          {/* Avatar Image */}
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '44px',
              fontWeight: 800,
              border: '4px solid #DBEAFE',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.25)',
              flexShrink: 0,
              overflow: 'hidden'
            }}
          >
            {user.image ? (
              <img src={user.image} alt={practitionerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span>{user.firstName?.slice(0, 1) || 'D'}</span>
            )}
          </div>

          {/* Practitioner Info & Credentials */}
          <div style={{ flex: 1, minWidth: '280px' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
                {practitionerName}
              </h1>

              <span style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '4px 12px', borderRadius: '20px', fontSize: '12.5px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <FiCheckCircle color="#059669" /> Verified Guide
              </span>
            </div>

            <p style={{ color: '#2563EB', fontSize: '16px', fontWeight: 700, margin: '0 0 14px 0', letterSpacing: '0.1px' }}>
              {profile.credentials || 'Verified Clinical Practitioner'}
            </p>

            <p style={{ color: '#475569', fontSize: '15.5px', lineHeight: '1.65', margin: '0 0 24px 0', maxWidth: '720px' }}>
              {profile.bio || 'Welcome to my official practice profile! I offer personalized 1-on-1 consultations, Circles, and structured health learning programs.'}
            </p>

            {/* Specialties & Languages Badges */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '13.5px', paddingTop: '18px', borderTop: '1px solid #F1F5F9' }}>
              <div>
                <span style={{ color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '6px', textTransform: 'uppercase', fontSize: '11.5px', letterSpacing: '0.5px' }}>
                  Specialties:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(profile.specialties && profile.specialties.length > 0 ? profile.specialties : ['Holistic Care', 'Wellness Coaching']).map((spec, i) => (
                    <span key={i} style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '5px 12px', borderRadius: '20px', fontWeight: 600 }}>
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '6px', textTransform: 'uppercase', fontSize: '11.5px', letterSpacing: '0.5px' }}>
                  Languages:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(profile.languages && profile.languages.length > 0 ? profile.languages : ['English']).map((lang, i) => (
                    <span key={i} style={{ background: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1', padding: '5px 12px', borderRadius: '20px', fontWeight: 600 }}>
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Practice Offers & Booking Section */}
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
              Book Session or Join Program
            </h2>
            <p style={{ color: '#64748B', fontSize: '14.5px', margin: '4px 0 0 0' }}>
              Select an available offer below to reserve your direct session slot with {practitionerName}.
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
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)'
              }}
            >
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '28px' }}>
                <FiCalendar color="#2563EB" />
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>
                No Active Booking Slots
              </h3>
              <p style={{ margin: '0 0 24px 0', fontSize: '14.5px', color: '#64748B', maxWidth: '480px', marginInline: 'auto', lineHeight: '1.5' }}>
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
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)'
                }}
              >
                Browse Verified Directory →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {offers.map((offer) => (
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
                    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.04)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, textTransform: 'capitalize' }}>
                        {offer.type || '1:1 Session'}
                      </span>
                      <span style={{ fontSize: '20px', fontWeight: 800, color: '#059669' }}>
                        ₹{offer.price || 2500}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 10px 0', lineHeight: '1.3' }}>
                      {offer.title}
                    </h3>

                    <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                      {offer.description || offer.details || 'Includes direct live consultation, personalized action plan, and follow-up support.'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleBookOffer(offer)}
                    disabled={connectingOfferId === offer._id}
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '14px',
                      borderRadius: '30px',
                      fontWeight: 700,
                      fontSize: '14.5px',
                      cursor: connectingOfferId === offer._id ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
                    }}
                  >
                    <FiCalendar fontSize={16} />
                    {connectingOfferId === offer._id ? 'Opening Gateway...' : `Reserve Slot — ₹${offer.price || 2500}`}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verified Client Reviews Section */}
        {reviews.length > 0 && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Verified Client Feedback ({reviews.length})
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {reviews.map((rev, i) => (
                <div key={rev._id || i} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: '14px' }}>
                      {'★'.repeat(rev.rating || 5)}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#0F172A' }}>
                      — {rev.user?.firstName ? `${rev.user.firstName} ${rev.user.lastName || ''}` : 'Verified Client'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13.5px', color: '#334155', lineHeight: '1.5' }}>
                    "{rev.review}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Pre-Session 6-Question Intake Modal (Stage 02) */}
      <IntakeModal
        open={showIntakeModal}
        onClose={() => setShowIntakeModal(false)}
        practitionerName={practitionerName}
        questions={profile.intakeQuestions || []}
        onSubmit={handleIntakeSubmitted}
      />

      <OHFooter />
    </div>
  )
}

export default PractitionerPublicProfile
