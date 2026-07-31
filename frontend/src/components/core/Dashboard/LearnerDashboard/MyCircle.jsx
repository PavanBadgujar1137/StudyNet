import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
  FiCheckCircle,
  FiMessageSquare,
  FiShield,
  FiPlusCircle,
} from 'react-icons/fi'
import { apiConnector } from '../../../../services/apiConnector'
import toast from 'react-hot-toast'

export function MyCircle({ setActiveTab, clientName = 'Student', practitionerName = 'your instructor', dashboardData }) {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const [circles, setCircles] = useState([])
  const [loading, setLoading] = useState(true)
  const [joiningId, setJoiningId] = useState(null)
  const [joinedIds, setJoinedIds] = useState([])

  // Load dynamic circles created by practitioners
  const loadCircles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiConnector('GET', '/api/v1/circle/all')
      if (res?.data?.success) {
        const circleList = res.data.circles || []
        setCircles(circleList)

        // Check which circles the current client is a member of
        const myJoined = circleList
          .filter((c) =>
            (c.members || []).some((m) => String(m._id || m) === String(user?._id))
          )
          .map((c) => c._id)

        setJoinedIds(myJoined)
      }
    } catch (err) {
      console.error('Error fetching circles:', err)
    } finally {
      setLoading(false)
    }
  }, [user?._id])

  useEffect(() => {
    loadCircles()
  }, [loadCircles])

  // Handle client joining a circle
  const handleJoinCircle = async (circleId) => {
    if (!token) {
      toast.error('Please login to join circle cohorts')
      return
    }
    setJoiningId(circleId)
    try {
      const res = await apiConnector(
        'POST',
        `/api/v1/circle/${circleId}/join`,
        {},
        { Authorization: `Bearer ${token}` }
      )

      if (res?.data?.success) {
        toast.success(res.data.message || 'Successfully joined circle cohort!')
        setJoinedIds((prev) => [...prev, circleId])
        loadCircles()
      } else {
        toast.error(res?.data?.message || 'Could not join circle.')
      }
    } catch (err) {
      console.error('Join circle error:', err)
      toast.error('Could not join circle cohort.')
    } finally {
      setJoiningId(null)
    }
  }

  return (
    <div id="circle" style={{ width: '100%' }}>
      {/* Header */}
      <div className="hd" style={{ marginBottom: '24px' }}>
        <div className="k">My Circles &amp; Cohorts</div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
          Peer Support &amp; Practitioner Growth Circles
        </h1>
        <p style={{ color: '#64748B', fontSize: '14px' }}>
          Join small group cohorts led by verified OpenHand practitioners. Connected circle chats automatically sync to your Community Hub.
        </p>
      </div>

      {/* Dynamic Circles List Grid */}
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
          Loading active practitioner circles...
        </div>
      ) : circles.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          {circles.map((c) => {
            const isJoined = joinedIds.includes(c._id)
            const practitioner = c.practitioner
            const pName = practitioner?.firstName
              ? `${practitioner.firstName} ${practitioner.lastName || ''}`
              : 'Verified Practitioner'
            const seats = c.seats || 10
            const filled = c.seatsFilledCount || c.members?.length || 0
            const fillPercent = Math.min(100, Math.round((filled / seats) * 100))

            return (
              <div
                key={c._id}
                style={{
                  background: '#FFFFFF',
                  border: isJoined ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  position: 'relative',
                }}
              >
                {/* Top Badge Row */}
                <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      background: isJoined ? '#DBEAFE' : '#F1F5F9',
                      color: isJoined ? '#1D4ED8' : '#475569',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {isJoined ? 'ENROLLED COHORT' : 'PRACTITIONER CIRCLE'}
                  </span>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: c.status === 'active' ? '#15803D' : '#D97706',
                      background: c.status === 'active' ? '#F0FDF4' : '#FEF3C7',
                      border: c.status === 'active' ? '1px solid #BBF7D0' : '1px solid #FDE68A',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {c.status === 'active' ? 'Active Circle' : 'Forming Circle'}
                  </span>
                </div>

                {/* Circle Name & Topic */}
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                    {c.name}
                  </h2>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    {c.topic || c.description || 'Interactive small group growth cohort focusing on practical wellness techniques and peer support.'}
                  </p>
                </div>

                {/* Facilitator info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)',
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '12px',
                    }}
                  >
                    {practitioner?.image ? (
                      <img src={practitioner.image} alt={pName} style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }} />
                    ) : (
                      pName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>{pName}</span>
                      <FiShield size={12} className="text-amber-500" title="Verified Practitioner" />
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>Practitioner Facilitator</span>
                  </div>
                </div>

                {/* Capacity Fill Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>
                    <span>Capacity: {filled} / {seats} seats filled</span>
                    <span>{fillPercent}% Filled</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${fillPercent}%`, height: '100%', background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)', borderRadius: '4px' }}></div>
                  </div>
                </div>

                {/* Action Controls */}
                <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                  {isJoined ? (
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
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <FiCheckCircle size={15} /> Joined &amp; Active
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
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <FiMessageSquare size={15} /> Chat
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleJoinCircle(c._id)}
                      disabled={joiningId === c._id}
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
                      <FiPlusCircle size={15} />
                      <span>{joiningId === c._id ? 'Joining Circle...' : 'Join Circle Cohort'}</span>
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
            marginBottom: '32px',
          }}
        >
          No circles have been published yet by practitioners. Check back soon!
        </div>
      )}

      {/* Guidelines Card */}
      <div className="g2">
        <div className="card">
          <div className="sechd">
            <h3>Circle Community Guidelines</h3>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Safe space</span>
          </div>
          <p className="note" style={{ marginTop: '8px' }}>
            Nobody sees your private check-ins, your notes, or your 1:1 sessions. What is shared in circle sessions stays in the circle.
          </p>
        </div>

        <div className="card">
          <div className="sechd"><h3>Community Chat Integration</h3></div>
          <div className="feed">
            <div className="fitem">
              <b>Automatic Chat Sync</b>
              <p>When you join any practitioner circle, its cohort group thread automatically appears under Practitioner Circle in your Community &amp; Chat Hub.</p>
              <div className="t">Live Sync</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyCircle
