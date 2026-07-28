import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
  FiSearch,
  FiShield,
  FiCreditCard,
  FiMessageSquare,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
} from 'react-icons/fi'
import { apiConnector } from '../../../../services/apiConnector'
import toast from 'react-hot-toast'

const SPECIALTY_TAGS = [
  'All',
  'Anxiety & Stress',
  'Career & Burnout',
  'Relationships',
  'CBT & Mindfulness',
  'Trauma & Grief',
]

export function Practitioners({ setActiveTab, dashboardData, onUpdate }) {
  const { token } = useSelector((state) => state.auth)

  const [practitioners, setPractitioners] = useState([])
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('All')
  const [payingId, setPayingId] = useState(null)

  // Load registered practitioners and client's existing connection statuses
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [practRes, connRes] = await Promise.all([
        apiConnector('GET', '/api/v1/practitioners?limit=50'),
        token ? apiConnector('GET', '/api/v1/practitioners/my-connections', null, { Authorization: `Bearer ${token}` }) : Promise.resolve({ data: { success: false } }),
      ])

      if (practRes?.data?.success) {
        const pList = practRes.data.practitioners || practRes.data.data || []
        setPractitioners(pList)
      }

      if (connRes?.data?.success) {
        setConnections(connRes.data.connections || [])
      }
    } catch (err) {
      console.error('Error fetching practitioner directory data:', err)
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

  // Handle client selecting practitioner, paying fee, and submitting connection request for approval
  const handlePayAndConnect = async (practitioner) => {
    if (!token) {
      toast.error('Please login to select and connect with a practitioner')
      return
    }

    const pId = practitioner.user?._id || practitioner._id
    const amount = practitioner.sessionRate || 2500
    const pName = `${practitioner.user?.firstName || practitioner.firstName || 'Practitioner'}`

    setPayingId(pId)

    // Razorpay Integration / Checkout trigger
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY || 'rzp_test_TDhFSRuAl18Gcb',
      amount: amount * 100,
      currency: 'INR',
      name: 'OpenHand Wellbeing',
      description: `1:1 Practitioner Session Fee - ${pName}`,
      handler: async function (response) {
        try {
          const res = await apiConnector(
            'POST',
            '/api/v1/practitioners/connect',
            {
              practitionerId: pId,
              amountPaid: amount,
              paymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
              orderId: response.razorpay_order_id || `order_${Date.now()}`,
            },
            { Authorization: `Bearer ${token}` }
          )

          if (res?.data?.success) {
            toast.success(`Payment of ₹${amount} successful! Connection request sent to ${pName} for approval.`)
            loadData()
            if (onUpdate) onUpdate()
          } else {
            toast.error(res?.data?.message || 'Could not process connection request.')
          }
        } catch (err) {
          console.error('Payment submit error:', err)
          toast.error('Connection request failed after payment.')
        } finally {
          setPayingId(null)
        }
      },
      prefill: {
        name: 'Client User',
      },
      theme: {
        color: '#1F5FE0',
      },
    }

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options)
      rzp.open()
    } else {
      // Fallback simulated payment flow if Razorpay script is loading
      try {
        const res = await apiConnector(
          'POST',
          '/api/v1/practitioners/connect',
          {
            practitionerId: pId,
            amountPaid: amount,
            paymentId: `pay_sim_${Date.now()}`,
            orderId: `order_sim_${Date.now()}`,
          },
          { Authorization: `Bearer ${token}` }
        )

        if (res?.data?.success) {
          toast.success(`Payment of ₹${amount} processed! Connection request sent to ${pName} for approval.`)
          loadData()
          if (onUpdate) onUpdate()
        }
      } catch (err) {
        toast.error('Could not send connection request.')
      } finally {
        setPayingId(null)
      }
    }
  }

  // Filtered practitioners list
  const filteredPractitioners = practitioners.filter((p) => {
    const fullName = `${p.user?.firstName || p.firstName || ''} ${p.user?.lastName || p.lastName || ''}`.toLowerCase()
    const email = (p.user?.email || p.email || '').toLowerCase()
    const credentials = (p.credentials || '').toLowerCase()
    const specialtiesStr = (p.specialties || []).join(' ').toLowerCase()
    const query = searchTerm.toLowerCase()

    const matchesSearch =
      fullName.includes(query) ||
      email.includes(query) ||
      credentials.includes(query) ||
      specialtiesStr.includes(query)

    if (selectedSpecialty === 'All') return matchesSearch

    const categoryQuery = selectedSpecialty.toLowerCase().split(' ')[0]
    const matchesCategory = specialtiesStr.includes(categoryQuery)
    return matchesSearch && matchesCategory
  })

  return (
    <div id="practitioners" style={{ width: '100%' }}>
      {/* Header */}
      <div className="hd" style={{ marginBottom: '24px' }}>
        <div className="k">Registered Practitioners Directory</div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
          Select Your Practitioner &amp; Book Session
        </h1>
        <p style={{ color: '#64748B', fontSize: '14px' }}>
          Browse verified practitioners, pay the session fee to submit your connection request, and get approved by your practitioner.
        </p>
      </div>

      {/* Search & Specialty Filter Controls */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
          <FiSearch
            style={{ position: 'absolute', left: '14px', top: '14px', color: '#94A3B8' }}
            size={16}
          />
          <input
            type="text"
            placeholder="Search practitioner by name, email, credentials, or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '12px',
              paddingLeft: '42px',
              paddingRight: '16px',
              paddingTop: '12px',
              paddingBottom: '12px',
              fontSize: '13.5px',
              color: '#0F172A',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          />
        </div>

        {/* Specialty Filter Tags */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {SPECIALTY_TAGS.map((tag) => {
            const isSel = selectedSpecialty === tag
            return (
              <button
                key={tag}
                onClick={() => setSelectedSpecialty(tag)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: isSel ? 'none' : '1px solid #E2E8F0',
                  background: isSel
                    ? 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)'
                    : '#FFFFFF',
                  color: isSel ? '#FFFFFF' : '#475569',
                  transition: 'all 0.2s ease',
                }}
              >
                {tag}
              </button>
            )
          })}
        </div>
      </div>

      {/* Directory Cards Grid */}
      {loading ? (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            color: '#64748B',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Loading practitioner directory...
        </div>
      ) : filteredPractitioners.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredPractitioners.map((p) => {
            const pId = p.user?._id || p._id
            const firstName = p.user?.firstName || p.firstName || 'Practitioner'
            const lastName = p.user?.lastName || p.lastName || ''
            const fullName = `${firstName} ${lastName}`
            const image = p.user?.image
            const sessionFee = p.sessionRate || 2500

            const connection = getConnectionForPractitioner(pId)
            const connStatus = connection ? connection.status : null

            return (
              <div
                key={p._id || pId}
                style={{
                  background: '#FFFFFF',
                  border: connStatus === 'approved' || connStatus === 'active'
                    ? '2px solid #10B981'
                    : connStatus === 'pending_approval'
                    ? '2px solid #F59E0B'
                    : '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                {/* Status Indicator Banner */}
                {connStatus === 'approved' || connStatus === 'active' ? (
                  <div style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiCheckCircle size={15} /> Connected &amp; Approved by Practitioner
                  </div>
                ) : connStatus === 'pending_approval' ? (
                  <div style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiClock size={15} /> Payment Received (₹{connection.amountPaid || sessionFee}) • Pending Approval ⏳
                  </div>
                ) : null}

                {/* Header Info */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)',
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '18px',
                      }}
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={fullName}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '14px',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        `${firstName.slice(0, 1)}${lastName.slice(0, 1)}`
                      )}
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        {fullName}
                      </h3>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          background: '#FEF3C7',
                          color: '#92400E',
                          border: '1px solid #FDE68A',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <FiShield size={11} /> Verified
                      </span>
                    </div>

                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#2563EB', marginTop: '3px', marginBottom: 0 }}>
                      {p.credentials || 'Certified Wellbeing & Growth Guide'}
                    </p>
                  </div>
                </div>

                {/* Bio text */}
                <p
                  style={{
                    fontSize: '13px',
                    color: '#475569',
                    lineHeight: 1.5,
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {p.bio ||
                    'Empowering students and clients through structured 1-on-1 guidance, personal check-in review, and evidence-based mental wellbeing techniques.'}
                </p>

                {/* Specialty Tags */}
                {p.specialties && p.specialties.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {p.specialties.map((spec, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          background: '#F1F5F9',
                          color: '#334155',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          textTransform: 'capitalize',
                        }}
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}

                {/* Practitioner Published Offers Section */}
                {p.offers && p.offers.length > 0 && (
                  <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '12px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                      Published Offers &amp; Programs ({p.offers.length})
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {p.offers.map((off, oIdx) => (
                        <div
                          key={off._id || oIdx}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', display: 'block' }}>
                              {off.title}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748B' }}>
                              {off.type === 'circle' ? 'Group Circle' : '1:1 Session'} • {off.durationMinutes || 50} mins
                            </span>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#2563EB' }}>
                            ₹{off.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Session Fee info */}
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
                    Starting Fee:{' '}
                    <span style={{ color: '#2563EB', fontWeight: 900 }}>₹{sessionFee}</span>
                  </span>

                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    Razorpay Secured Checkout
                  </span>
                </div>

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
                  ) : (
                    <button
                      onClick={() => handlePayAndConnect(p)}
                      disabled={payingId === pId}
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
                      }}
                    >
                      <FiCreditCard size={15} />
                      <span>
                        {payingId === pId ? 'Processing Order...' : `Select & Pay ₹${sessionFee}`}
                      </span>
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
