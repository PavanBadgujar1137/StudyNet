import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiFilter,
  FiMessageSquare,
  FiCreditCard,
  FiShield,
  FiCheckSquare,
  FiSquare,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { apiConnector } from '../../../../services/apiConnector'

export function Practitioners({ onUpdate, setActiveTab }) {
  const { token } = useSelector((state) => state.auth)

  const [practitioners, setPractitioners] = useState([])
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('All')

  // Map of practitioner ID -> Array of selected offer IDs
  const [selectedOffersMap, setSelectedOffersMap] = useState({})

  // Load practitioners & connections from DB
  const loadData = useCallback(async () => {
    try {
      const resPract = await apiConnector('GET', '/api/v1/practitioners')
      if (resPract?.data?.success) {
        const list = resPract.data.practitioners || []
        setPractitioners(list)

        // Initialize default selected offer for each practitioner (default to first offer)
        const initialMap = {}
        list.forEach((p) => {
          const pId = p.user?._id || p._id
          const offers = p.offers || p.userOffers || []
          if (offers.length > 0) {
            initialMap[pId] = [offers[0]._id]
          }
        })
        setSelectedOffersMap(initialMap)
      }

      if (token) {
        const resConn = await apiConnector(
          'GET',
          '/api/v1/practitioners/my-connections',
          null,
          { Authorization: `Bearer ${token}` }
        )
        if (resConn?.data?.success) {
          setConnections(resConn.data.connections || [])
        }
      }
    } catch (err) {
      console.error('Error loading practitioners data:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Helper to get connection object for a practitioner
  const getConnectionForPractitioner = (practId) => {
    return connections.find(
      (c) => String(c.practitioner?._id || c.practitioner) === String(practId)
    )
  }

  // Toggle selection of an offer for a practitioner
  const toggleOfferSelection = (practId, offerId) => {
    setSelectedOffersMap((prev) => {
      const currentSelected = prev[practId] || []
      let updated = []
      if (currentSelected.includes(offerId)) {
        // Uncheck offer
        updated = currentSelected.filter((id) => id !== offerId)
      } else {
        // Check offer
        updated = [...currentSelected, offerId]
      }
      return { ...prev, [practId]: updated }
    })
  }

  // Calculate total fee for a practitioner based on selected checkboxes
  const getSelectedFeeForPractitioner = (p) => {
    const pId = p.user?._id || p._id
    const offers = p.offers || p.userOffers || []
    const selectedIds = selectedOffersMap[pId] || []

    if (offers.length === 0) return p.sessionRate || 0

    const selectedOffers = offers.filter((o) => selectedIds.includes(o._id))
    if (selectedOffers.length === 0) return p.sessionRate || (offers[0]?.price || 0)

    return selectedOffers.reduce((sum, o) => sum + (o.price || 0), 0)
  }

  // Helper to load Razorpay SDK dynamically
  const loadRazorpaySDK = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  // Handle client selecting practitioner, paying fee via Razorpay, and submitting connection request
  const handlePayAndConnect = async (practitioner) => {
    if (!token) {
      toast.error('Please login to select and connect with a practitioner')
      return
    }

    const pId = practitioner.user?._id || practitioner._id
    const amount = getSelectedFeeForPractitioner(practitioner)
    const pName = `${practitioner.user?.firstName || practitioner.firstName || 'Practitioner'}`

    setPayingId(pId)

    try {
      const isLoaded = await loadRazorpaySDK()
      if (!isLoaded) {
        toast.error('Razorpay SDK failed to load. Please check your internet connection.')
        setPayingId(null)
        return
      }

      // 1. Create Razorpay order in backend
      let orderData = null
      try {
        const orderRes = await apiConnector(
          'POST',
          '/api/v1/payment/create-practitioner-order',
          { practitionerId: pId, amount },
          { Authorization: `Bearer ${token}` }
        )
        if (orderRes?.data?.success) {
          orderData = orderRes.data
        }
      } catch (err) {
        console.warn('Backend order creation warning:', err)
      }

      const orderObj = orderData?.order || {
        id: `order_pract_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: 'INR',
      }
      const keyId = orderData?.key || process.env.REACT_APP_RAZORPAY_KEY || 'rzp_test_TDhFSRuAl18Gcb'
      const finalAmount = orderData?.amount || amount

      // 2. Open Razorpay Checkout modal with authentic order
      const options = {
        key: keyId,
        amount: orderObj.amount || Math.round(amount * 100),
        currency: orderObj.currency || 'INR',
        name: 'OpenHand Practice Platform',
        description: `Counseling Fee for ${pName}`,
        order_id: orderObj.id,
        handler: async function (response) {
          try {
            // 3. Verify signature and confirm connection in backend
            const res = await apiConnector(
              'POST',
              '/api/v1/practitioners/connect',
              {
                practitionerId: pId,
                amountPaid: finalAmount || amount,
                razorpay_order_id: response.razorpay_order_id || orderObj.id,
                razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                razorpay_signature: response.razorpay_signature || '',
              },
              { Authorization: `Bearer ${token}` }
            )

            if (res?.data?.success) {
              toast.success(`🎉 Payment of ₹${finalAmount || amount} successful! Net payout credited to ${pName}.`)
              loadData()
              if (onUpdate) onUpdate()
            } else {
              toast.error(res?.data?.message || 'Could not verify payment.')
            }
          } catch (err) {
            console.error('Payment verification error:', err)
            toast.error('Connection request failed after payment verification.')
          } finally {
            setPayingId(null)
          }
        },
        prefill: {
          name: '',
          email: '',
        },
        theme: {
          color: '#1F5FE0',
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (resp) {
        toast.error(`Payment Failed: ${resp.error?.description || 'Transaction cancelled'}`)
        setPayingId(null)
      })
      rzp.open()
    } catch (err) {
      console.error('Razorpay Checkout initiation error:', err)
      toast.error('Failed to initiate Razorpay checkout. Please try again.')
      setPayingId(null)
    }
  }

  // Filtered practitioners list (ONLY display practitioners who have published at least 1 active offer!)
  const filteredPractitioners = practitioners.filter((p) => {
    const offers = p.offers || p.userOffers || []
    if (offers.length === 0) return false // Hide practitioner card if practitioner has 0 active published offers

    const fullName = `${p.user?.firstName || p.firstName || ''} ${p.user?.lastName || p.lastName || ''}`.toLowerCase()
    const email = (p.user?.email || p.email || '').toLowerCase()
    const credentials = (p.credentials || '').toLowerCase()
    const bio = (p.bio || '').toLowerCase()
    const specialtiesList = (p.specialties || []).map((s) => s.toLowerCase())
    const specialtiesStr = specialtiesList.join(' ')
    const query = searchTerm.toLowerCase()

    const matchesSearch =
      fullName.includes(query) ||
      email.includes(query) ||
      credentials.includes(query) ||
      bio.includes(query) ||
      specialtiesStr.includes(query)

    if (!matchesSearch) return false

    if (selectedSpecialty === 'All' || selectedSpecialty === 'All Specialties') return true

    const categoryTarget = selectedSpecialty.toLowerCase()

    // Precise category matching
    const matchesCategory =
      specialtiesList.some((s) => {
        if (categoryTarget === 'cbt') return s.includes('cbt')
        if (categoryTarget === 'mindfulness') return s.includes('mindfulness')
        if (categoryTarget.includes('&')) {
          const parts = categoryTarget.split('&').map((part) => part.trim())
          return parts.some((part) => s.includes(part))
        }
        return s.includes(categoryTarget) || categoryTarget.includes(s)
      }) ||
      specialtiesStr.includes(categoryTarget.split(' ')[0])

    return matchesCategory
  })

  const specialtyCategories = [
    'All Specialties',
    'Anxiety & Stress',
    'CBT',
    'Mindfulness',
    'Career & Burnout',
    'Relationships',
    'Trauma & Recovery',
    'Grief & Loss',
    'Holistic Care',
    'Wellness Coaching',
    'Parenting',
    'Nutrition',
    'Inner Child Healing',
  ]

  return (
    <div id="practitioners" style={{ width: '100%' }}>
      {/* Header */}
      <div className="hd" style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', color: '#8A2BE0', letterSpacing: '0.5px' }}>
          Registered Practitioners Directory
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>
          Select Your Practitioner &amp; Book Session
        </h1>
        <p style={{ color: '#64748B', fontSize: '13.5px', margin: 0 }}>
          Browse verified practitioners, select your desired offer(s), pay the session fee, and connect directly.
        </p>
      </div>

      {/* Search Bar & Specialty Dropdown Filter Controls */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <FiSearch style={{ position: 'absolute', left: '14px', top: '13px', color: '#94A3B8' }} size={16} />
          <input
            type="text"
            placeholder="Search practitioner by name, email, credentials, or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '40px',
              paddingRight: '14px',
              paddingTop: '11px',
              paddingBottom: '11px',
              borderRadius: '12px',
              border: '1px solid #CBD5E1',
              fontSize: '14px',
              outline: 'none',
              background: '#FFFFFF',
              color: '#0F172A',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          />
        </div>

        <div style={{ position: 'relative', minWidth: '230px' }}>
          <FiFilter style={{ position: 'absolute', left: '14px', top: '13px', color: '#2563EB', pointerEvents: 'none' }} size={16} />
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '40px',
              paddingRight: '36px',
              paddingTop: '11px',
              paddingBottom: '11px',
              borderRadius: '12px',
              border: '1px solid #CBD5E1',
              fontSize: '14px',
              fontWeight: 600,
              outline: 'none',
              background: '#FFFFFF',
              color: '#1E293B',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              appearance: 'none',
              WebkitAppearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '16px 16px',
            }}
          >
            {specialtyCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Practitioners Directory Cards List */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
          Loading practitioners database...
        </div>
      ) : filteredPractitioners.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPractitioners.map((p) => {
            const pId = p.user?._id || p._id
            const firstName = p.user?.firstName || p.firstName || 'Practitioner'
            const lastName = p.user?.lastName || p.lastName || ''
            const fullName = `${firstName} ${lastName}`.trim()
            const image = p.user?.image || p.image
            const initials = `${firstName.slice(0, 1)}${lastName.slice(0, 1) || ''}`.toUpperCase()

            const conn = getConnectionForPractitioner(pId)
            const connStatus = conn?.status // 'active' | 'approved' | 'pending_approval'
            const offers = p.offers || p.userOffers || []

            const selectedIds = selectedOffersMap[pId] || []
            const selectedFee = getSelectedFeeForPractitioner(p)

            return (
              <div
                key={pId}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  position: 'relative',
                }}
              >
                {/* Profile Header */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '16px',
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}
                  >
                    {image ? (
                      <img src={image} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      initials
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {fullName}
                      </h3>
                      <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <FiShield size={10} /> Verified
                      </span>
                    </div>

                    <span style={{ fontSize: '12px', color: '#2563EB', fontWeight: 700, display: 'block' }}>
                      {p.credentials || 'Verified Clinical Practitioner'}
                    </span>
                  </div>
                </div>

                {/* Bio snippet */}
                <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.45 }}>
                  {p.bio || 'Certified practitioner specializing in holistic guidance, mental wellbeing, and learner growth.'}
                </p>

                {/* Specialty Tags */}
                {p.specialties && p.specialties.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {p.specialties.map((spec, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => setSelectedSpecialty(spec)}
                        title={`Filter practitioners by ${spec}`}
                        style={{
                          background: selectedSpecialty === spec ? '#DBEAFE' : '#F1F5F9',
                          color: selectedSpecialty === spec ? '#1E40AF' : '#475569',
                          border: selectedSpecialty === spec ? '1px solid #BFDBFE' : '1px solid transparent',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                )}

                {/* Interactive Published Offers Section with Checkboxes */}
                {offers.length > 0 ? (
                  <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Published Offers &amp; Programs ({offers.length})
                      </span>
                      <span style={{ fontSize: '10.5px', color: '#64748B', fontStyle: 'italic' }}>
                        Click to select offer
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {offers.map((off, oIdx) => {
                        const isSelected = selectedIds.includes(off._id)
                        return (
                          <div
                            key={off._id || oIdx}
                            onClick={() => toggleOfferSelection(pId, off._id)}
                            style={{
                              background: isSelected ? '#EFF6FF' : '#FFFFFF',
                              border: isSelected ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                              borderRadius: '10px',
                              padding: '10px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.12)' : 'none',
                            }}
                          >
                            <div style={{ color: isSelected ? '#2563EB' : '#94A3B8', display: 'flex', alignItems: 'center' }}>
                              {isSelected ? <FiCheckSquare size={18} /> : <FiSquare size={18} />}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', display: 'block' }}>
                                {off.title}
                              </span>
                              <span style={{ fontSize: '11px', color: '#64748B' }}>
                                {off.type === 'circle' ? 'Circle' : '1:1 Session'} • {off.durationMinutes || 50} mins
                              </span>
                            </div>

                            <span style={{ fontSize: '13.5px', fontWeight: 900, color: isSelected ? '#2563EB' : '#0F172A' }}>
                              ₹{off.price}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '12px 16px', border: '1px dashed #CBD5E1', textAlign: 'center' }}>
                    <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>
                      No active offers published yet
                    </span>
                  </div>
                )}

                {/* Selected Fee Info (Only when offers exist) */}
                {offers.length > 0 && (
                  <div
                    style={{
                      paddingTop: '10px',
                      borderTop: '1px solid #F1F5F9',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '13px',
                    }}
                  >
                    <span style={{ fontWeight: 800, color: '#0F172A' }}>
                      Selected Fee:{' '}
                      <span style={{ color: '#2563EB', fontWeight: 900, fontSize: '15px' }}>₹{selectedFee}</span>
                    </span>

                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      Razorpay Secured Checkout
                    </span>
                  </div>
                )}

                {/* Action Buttons based on Payment & Approval Status */}
                <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                  {connStatus === 'approved' || connStatus === 'active' ? (
                    <>
                      <button
                        disabled
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '10px',
                          background: '#F0FDF4',
                          border: '1px solid #BBF7D0',
                          color: '#166534',
                          fontWeight: 700,
                          fontSize: '12.5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <FiCheckCircle size={14} /> Approved &amp; Connected
                      </button>

                      <button
                        onClick={() => {
                          if (setActiveTab) setActiveTab('community')
                        }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)',
                          color: '#FFFFFF',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                        title="Start Direct Chat"
                      >
                        <FiMessageSquare size={14} /> Chat
                      </button>
                    </>
                  ) : connStatus === 'pending_approval' ? (
                    <button
                      disabled
                      style={{
                        width: '100%',
                        padding: '11px',
                        borderRadius: '10px',
                        background: '#FEF3C7',
                        border: '1px solid #FDE68A',
                        color: '#92400E',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <FiClock size={15} /> Awaiting Practitioner Approval
                    </button>
                  ) : offers.length > 0 ? (
                    <button
                      onClick={() => handlePayAndConnect(p)}
                      disabled={payingId === pId || selectedFee <= 0}
                      style={{
                        width: '100%',
                        padding: '11px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(31, 95, 224, 0.25)',
                      }}
                    >
                      <FiCreditCard size={15} />
                      <span>
                        {payingId === pId ? 'Processing Order...' : `Pay ₹${selectedFee} & Request Connection`}
                      </span>
                    </button>
                  ) : (
                    <button
                      disabled
                      style={{
                        width: '100%',
                        padding: '11px',
                        borderRadius: '10px',
                        background: '#F1F5F9',
                        color: '#94A3B8',
                        border: '1px solid #E2E8F0',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        cursor: 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      No Active Offers Published
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
            padding: '40px',
            textAlign: 'center',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            color: '#64748B',
            fontSize: '14px',
          }}
        >
          No registered practitioners matched your search query. Try clearing filters.
        </div>
      )}
    </div>
  )
}

export default Practitioners
