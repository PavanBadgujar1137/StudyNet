import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import {
  FiTag, FiGift, FiPlus, FiEdit2, FiTrash2,
  FiToggleLeft, FiToggleRight, FiSearch, FiCopy,
  FiPhone, FiMail, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi'
import { apiConnector } from '../../../../services/apiConnector'
import {
  createPractitionerCoupon,
  getMyPractitionerCoupons,
  updatePractitionerCoupon,
  toggleCouponStatus,
  deletePractitionerCoupon,
  createLearnerDiscount,
  getMyLearnerDiscounts,
  toggleLearnerDiscount,
  deleteLearnerDiscount,
  lookupLearnerById,
} from '../../../../services/operations/couponAPI'

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n || 0)

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Never'

export default function PractitionerCoupons() {
  const { token } = useSelector((s) => s.auth)
  const [activeSubTab, setActiveSubTab] = useState('coupons') // 'coupons' | 'personal'

  // Data states
  const [coupons, setCoupons] = useState([])
  const [stats, setStats] = useState({})
  const [discounts, setDiscounts] = useState([])
  const [myCourses, setMyCourses] = useState([])
  const [myOffers, setMyOffers] = useState([])
  const [learnersList, setLearnersList] = useState([])
  const [loading, setLoading] = useState(true)

  // Search & filter
  const [search, setSearch] = useState('')

  // Modals
  const [couponModal, setCouponModal] = useState(null) // null | { isEdit: boolean, data: {} }
  const [personalModal, setPersonalModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form states for Practitioner Coupon
  const [cCode, setCCode] = useState('')
  const [cName, setCName] = useState('')
  const [cDesc, setCDesc] = useState('')
  const [cDiscount, setCDiscount] = useState('20')
  const [cAppTo, setCAppTo] = useState('both')
  const [cSelectedCourses, setCSelectedCourses] = useState([])
  const [cSelectedOffers, setCSelectedOffers] = useState([])
  const [cStartDate, setCStartDate] = useState(new Date().toISOString().split('T')[0])
  const [cExpiryDate, setCExpiryDate] = useState('')
  const [cUsageLimit, setCUsageLimit] = useState('')
  const [cPerUserLimit, setCPerUserLimit] = useState('1')

  // Form states for Personal Discount
  const [pLearnerId, setPLearnerId] = useState('')
  const [lookupLearnerData, setLookupLearnerData] = useState(null)
  const [lookupLearnerLoading, setLookupLearnerLoading] = useState(false)
  const [lookupLearnerError, setLookupLearnerError] = useState('')

  const [pProductType, setPProductType] = useState('all')
  const [pCourseId, setPCourseId] = useState('')
  const [pOfferId, setPOfferId] = useState('')
  const [pIsFree, setPIsFree] = useState(true)
  const [pDiscountPct, setPDiscountPct] = useState('100')
  const [pExpiryDate, setPExpiryDate] = useState('')
  const [pUsageLimit, setPUsageLimit] = useState('1')
  const [pNotes, setPNotes] = useState('')

  const handleLookupLearner = async (idToLookup) => {
    const val = String(idToLookup !== undefined ? idToLookup : pLearnerId).trim()
    if (!val) {
      setLookupLearnerData(null)
      setLookupLearnerError('')
      return
    }
    setLookupLearnerLoading(true)
    setLookupLearnerError('')
    const res = await lookupLearnerById(val, token)
    setLookupLearnerLoading(false)
    if (res?.success && res?.learner) {
      setLookupLearnerData(res.learner)
      setPLearnerId(res.learner.learnerId || res.learner._id)
      setLookupLearnerError('')
    } else {
      setLookupLearnerData(null)
      setLookupLearnerError(res?.message || 'No learner found with that ID or email.')
    }
  }

  // ─── Submit Personal Learner Discount ───────────────────────────────────────
  const handleSubmitPersonalDiscount = async (e) => {
    e.preventDefault()
    const targetId = lookupLearnerData?.learnerId || lookupLearnerData?._id || pLearnerId
    if (!targetId) {
      return toast.error('Please enter and verify the target Learner ID.')
    }

    setSubmitting(true)
    const payload = {
      learnerId: targetId,
      productType: pProductType,
      courseId: pProductType === 'course' ? pCourseId : null,
      offerId: pProductType === 'session' ? pOfferId : null,
      discountPercentage: pIsFree ? 100 : Number(pDiscountPct),
      isFreeAccess: pIsFree,
      expiryDate: pExpiryDate ? new Date(pExpiryDate) : null,
      usageLimit: Number(pUsageLimit) || 1,
      notes: pNotes.trim(),
    }

    const res = await createLearnerDiscount(payload, token)
    if (res?.success) {
      setPersonalModal(false)
      loadData()
    }
    setSubmitting(false)
  }

  // ─── Fetch Practitioner Data ────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [cpnRes, discRes, crsRes, offRes, clientsRes] = await Promise.all([
        getMyPractitionerCoupons(token),
        getMyLearnerDiscounts(token),
        apiConnector('GET', '/api/v1/courses', null, { Authorization: `Bearer ${token}` }).catch(() => null),
        apiConnector('GET', '/api/v1/offers/my-offers', null, { Authorization: `Bearer ${token}` }).catch(() => null),
        apiConnector('GET', '/api/v1/practitioners/my-clients', null, { Authorization: `Bearer ${token}` }).catch(() => null),
      ])

      if (cpnRes) {
        setCoupons(cpnRes.coupons || [])
        setStats(cpnRes.stats || {})
      }
      if (discRes) {
        setDiscounts(discRes || [])
      }
      if (crsRes?.data?.success) {
        setMyCourses(crsRes.data.courses || [])
      }
      if (offRes?.data?.success) {
        setMyOffers(offRes.data.offers || [])
      }
      if (clientsRes?.data?.success) {
        setLearnersList(clientsRes.data.clients || [])
      }
    } catch (e) {
      toast.error('Failed to load coupon data')
    }
    setLoading(false)
  }, [token])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ─── Open Create Coupon Modal ───────────────────────────────────────────────
  const openCreateCouponModal = () => {
    setCCode('')
    setCName('')
    setCDesc('')
    setCDiscount('20')
    setCAppTo('both')
    setCSelectedCourses([])
    setCSelectedOffers([])
    setCStartDate(new Date().toISOString().split('T')[0])
    setCExpiryDate('')
    setCUsageLimit('')
    setCPerUserLimit('1')
    setCouponModal({ isEdit: false })
  }

  // ─── Open Edit Coupon Modal ─────────────────────────────────────────────────
  const openEditCouponModal = (c) => {
    setCCode(c.code)
    setCName(c.name)
    setCDesc(c.description || '')
    setCDiscount(String(c.discountValue))
    setCAppTo(c.applicableTo || 'both')
    setCSelectedCourses((c.applicableCourses || []).map((x) => x._id || x))
    setCSelectedOffers((c.applicableOffers || []).map((x) => x._id || x))
    setCStartDate(c.startDate ? new Date(c.startDate).toISOString().split('T')[0] : '')
    setCExpiryDate(c.expiryDate ? new Date(c.expiryDate).toISOString().split('T')[0] : '')
    setCUsageLimit(c.usageLimit ? String(c.usageLimit) : '')
    setCPerUserLimit(String(c.perUserLimit || 1))
    setCouponModal({ isEdit: true, data: c })
  }

  // ─── Submit Coupon Modal ────────────────────────────────────────────────────
  const handleSubmitCoupon = async (e) => {
    e.preventDefault()
    if (!cCode.trim() || !cName.trim() || !cDiscount) {
      return toast.error('Code, Name, and Discount percentage are required.')
    }

    setSubmitting(true)
    const payload = {
      code: cCode.trim().toUpperCase(),
      name: cName.trim(),
      description: cDesc.trim(),
      discountValue: Number(cDiscount),
      applicableTo: cAppTo,
      applicableCourses: cSelectedCourses,
      applicableOffers: cSelectedOffers,
      startDate: cStartDate ? new Date(cStartDate) : new Date(),
      expiryDate: cExpiryDate ? new Date(cExpiryDate) : null,
      usageLimit: cUsageLimit ? Number(cUsageLimit) : null,
      perUserLimit: Number(cPerUserLimit) || 1,
    }

    if (couponModal?.isEdit) {
      const res = await updatePractitionerCoupon(couponModal.data._id, payload, token)
      if (res?.success) {
        setCouponModal(null)
        loadData()
      }
    } else {
      const res = await createPractitionerCoupon(payload, token)
      if (res?.success) {
        setCouponModal(null)
        loadData()
      }
    }
    setSubmitting(false)
  }

  // ─── Toggle Status ─────────────────────────────────────────────────────────
  const handleToggleCoupon = async (id) => {
    const res = await toggleCouponStatus(id, token)
    if (res?.success) {
      setCoupons((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isActive: res.isActive } : c))
      )
    }
  }

  const handleToggleDiscount = async (id) => {
    const res = await toggleLearnerDiscount(id, token)
    if (res?.success) {
      setDiscounts((prev) =>
        prev.map((d) => (d._id === id ? { ...d, isActive: res.isActive } : d))
      )
    }
  }

  // ─── Delete Actions ────────────────────────────────────────────────────────
  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return
    const res = await deletePractitionerCoupon(id, token)
    if (res?.success) {
      setCoupons((prev) => prev.filter((c) => c._id !== id))
    }
  }

  const handleDeleteDiscount = async (id) => {
    if (!window.confirm('Remove this personalized learner discount?')) return
    const res = await deleteLearnerDiscount(id, token)
    if (res?.success) {
      setDiscounts((prev) => prev.filter((d) => d._id !== id))
    }
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.success(`Copied '${code}' to clipboard!`)
  }

  const filteredCoupons = coupons.filter(
    (c) =>
      !search ||
      c.code?.toLowerCase().includes(search.toLowerCase()) ||
      c.name?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredDiscounts = discounts.filter(
    (d) =>
      !search ||
      `${d.learner?.firstName} ${d.learner?.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      d.learner?.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: '4px 0 32px' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: 20,
          padding: '28px 32px',
          color: '#FFFFFF',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 10px 25px rgba(15, 23, 42, 0.1)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#60A5FA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}
            >
              <FiTag />
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 1,
                color: '#94A3B8',
              }}
            >
              Promotions &amp; Grants
            </span>
          </div>
          <h2 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, color: '#FFFFFF' }}>
            Coupons &amp; Discounts Studio
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: '#94A3B8', maxWidth: 600 }}>
            Create custom coupon codes for your courses &amp; sessions, or provide personalized
            scholarships / 100% free access to individual learners.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={openCreateCouponModal}
            style={{
              padding: '11px 20px',
              background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
              border: 'none',
              borderRadius: 12,
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
            }}
          >
            <FiPlus size={16} /> Create Coupon
          </button>
          <button
            onClick={() => {
              const defaultLId = learnersList[0]?.learnerId || learnersList[0]?._id || ''
              setPLearnerId(defaultLId)
              setLookupLearnerData(null)
              setLookupLearnerError('')
              if (defaultLId) {
                handleLookupLearner(defaultLId)
              }
              setPProductType('all')
              setPCourseId(myCourses[0]?._id || '')
              setPOfferId(myOffers[0]?._id || '')
              setPIsFree(true)
              setPDiscountPct('100')
              setPExpiryDate('')
              setPUsageLimit('1')
              setPNotes('')
              setPersonalModal(true)
            }}
            style={{
              padding: '11px 20px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              border: 'none',
              borderRadius: 12,
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            }}
          >
            <FiGift size={16} /> Grant Personal Discount
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            padding: '18px 22px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ color: '#64748B', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
            Active Coupons
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#1E40AF' }}>
            {stats.activeCoupons || 0} / {stats.totalCoupons || coupons.length}
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
            Available for your learners
          </div>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            padding: '18px 22px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ color: '#64748B', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
            Personal Grants
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#059669' }}>
            {discounts.filter((d) => d.isActive).length} / {discounts.length}
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
            Learner-specific offers
          </div>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            padding: '18px 22px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ color: '#64748B', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
            Total Redemptions
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#D97706' }}>
            {coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0) +
              discounts.reduce((sum, d) => sum + (d.usedCount || 0), 0)}
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
            Purchases made with discounts
          </div>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            padding: '18px 22px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ color: '#64748B', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
            Total Discount Given
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#7C3AED' }}>
            {fmt(stats.totalDiscountGiven || 0)}
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
            Learner savings generated
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation & Search Bar */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          padding: '12px 18px',
          marginBottom: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setActiveSubTab('coupons')}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: activeSubTab === 'coupons' ? 700 : 500,
              background: activeSubTab === 'coupons' ? '#EFF6FF' : 'transparent',
              color: activeSubTab === 'coupons' ? '#1D4ED8' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <FiTag /> My Coupons ({coupons.length})
          </button>
          <button
            onClick={() => setActiveSubTab('personal')}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: activeSubTab === 'personal' ? 700 : 500,
              background: activeSubTab === 'personal' ? '#ECFDF5' : 'transparent',
              color: activeSubTab === 'personal' ? '#059669' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <FiGift /> Learner Personal Grants ({discounts.length})
          </button>
        </div>

        <div style={{ position: 'relative', width: 260 }}>
          <FiSearch
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8',
            }}
          />
          <input
            type="text"
            placeholder="Search code or learner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Tab 1: Practitioner Coupons */}
      {activeSubTab === 'coupons' && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#64748B' }}>
                Loading coupons data...
              </p>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>
              <FiTag size={36} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#475569' }}>
                No practitioner coupons found
              </p>
              <button
                onClick={openCreateCouponModal}
                style={{
                  padding: '8px 18px',
                  background: '#2563EB',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                + Create Your First Coupon
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    <th style={{ padding: '14px 20px' }}>Coupon Code</th>
                    <th style={{ padding: '14px 16px' }}>Name &amp; Description</th>
                    <th style={{ padding: '14px 16px' }}>Discount</th>
                    <th style={{ padding: '14px 16px' }}>Applicable To</th>
                    <th style={{ padding: '14px 16px' }}>Validity</th>
                    <th style={{ padding: '14px 16px' }}>Usage</th>
                    <th style={{ padding: '14px 16px' }}>Status</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoupons.map((c) => (
                    <tr key={c._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 800, color: '#1D4ED8', background: '#EFF6FF', padding: '4px 8px', borderRadius: 6, letterSpacing: 0.5 }}>
                            {c.code}
                          </span>
                          <button onClick={() => copyCode(c.code)} title="Copy code" style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 2 }}>
                            <FiCopy size={13} />
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{c.name}</div>
                        {c.description && <div style={{ fontSize: 11, color: '#94A3B8', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</div>}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontWeight: 800, color: '#059669', background: '#ECFDF5', padding: '3px 8px', borderRadius: 20 }}>
                          {c.discountValue}% OFF
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textTransform: 'capitalize', color: '#475569' }}>
                        {c.applicableTo === 'both' ? 'Courses & Sessions' : c.applicableTo}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748B', fontSize: 12 }}>
                        {fmtDate(c.startDate)} → {fmtDate(c.expiryDate)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>{c.usedCount || 0}</span>
                        <span style={{ color: '#94A3B8' }}> / {c.usageLimit || '∞'}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => handleToggleCoupon(c._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 700,
                            color: c.isActive ? '#10B981' : '#94A3B8',
                          }}
                        >
                          {c.isActive ? <FiToggleRight size={22} color="#10B981" /> : <FiToggleLeft size={22} color="#94A3B8" />}
                          {c.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button onClick={() => openEditCouponModal(c)} title="Edit Coupon" style={{ padding: '6px 10px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 6, color: '#475569', cursor: 'pointer' }}>
                            <FiEdit2 size={13} />
                          </button>
                          <button onClick={() => handleDeleteCoupon(c._id)} title="Delete Coupon" style={{ padding: '6px 10px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, color: '#DC2626', cursor: 'pointer' }}>
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Learner Personal Discounts */}
      {activeSubTab === 'personal' && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#64748B' }}>
                Loading personalized grants...
              </p>
            </div>
          ) : filteredDiscounts.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>
              <FiGift size={36} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#475569' }}>
                No personalized learner grants found
              </p>
              <button
                onClick={() => {
                  const defaultLId = learnersList[0]?.learnerId || learnersList[0]?._id || ''
                  setPLearnerId(defaultLId)
                  setLookupLearnerData(null)
                  setLookupLearnerError('')
                  if (defaultLId) {
                    handleLookupLearner(defaultLId)
                  }
                  setPProductType('all')
                  setPCourseId(myCourses[0]?._id || '')
                  setPOfferId(myOffers[0]?._id || '')
                  setPIsFree(true)
                  setPDiscountPct('100')
                  setPExpiryDate('')
                  setPUsageLimit('1')
                  setPNotes('')
                  setPersonalModal(true)
                }}
                style={{
                  padding: '8px 18px',
                  background: '#10B981',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                + Grant Personalized Discount
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    <th style={{ padding: '14px 20px' }}>Target Learner</th>
                    <th style={{ padding: '14px 16px' }}>Target Product</th>
                    <th style={{ padding: '14px 16px' }}>Discount Grant</th>
                    <th style={{ padding: '14px 16px' }}>Valid Until</th>
                    <th style={{ padding: '14px 16px' }}>Used</th>
                    <th style={{ padding: '14px 16px' }}>Notes / Reason</th>
                    <th style={{ padding: '14px 16px' }}>Status</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDiscounts.map((d) => (
                    <tr key={d._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: '#0F172A' }}>
                            {d.learner?.firstName} {d.learner?.lastName}
                          </span>
                          {d.learner?.learnerId && (
                            <span
                              style={{
                                fontSize: 10,
                                background: '#EEF2FF',
                                color: '#4338CA',
                                border: '1px solid #C7D2FE',
                                padding: '1px 6px',
                                borderRadius: 4,
                                fontWeight: 700,
                                fontFamily: 'monospace',
                              }}
                            >
                              {d.learner.learnerId}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                          {d.learner?.email}
                          {(d.learner?.contactNumber || d.learner?.additionalDetails?.contactNumber) && (
                            <span> • {d.learner.contactNumber || d.learner.additionalDetails?.contactNumber}</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>
                        {d.productType === 'all'
                          ? '🌟 All Products'
                          : d.productType === 'course'
                          ? `📘 Course: ${d.course?.title || 'Specific Course'}`
                          : `🗓️ Session: ${d.offer?.title || 'Specific Session'}`}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            fontWeight: 800,
                            color: d.isFreeAccess || d.discountPercentage === 100 ? '#059669' : '#2563EB',
                            background: d.isFreeAccess || d.discountPercentage === 100 ? '#ECFDF5' : '#EFF6FF',
                            padding: '3px 8px',
                            borderRadius: 20,
                          }}
                        >
                          {d.isFreeAccess || d.discountPercentage === 100 ? 'FREE (100% OFF)' : `${d.discountPercentage}% OFF`}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748B', fontSize: 12 }}>
                        {fmtDate(d.expiryDate)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>{d.usedCount || 0}</span>
                        <span style={{ color: '#94A3B8' }}> / {d.usageLimit || 1}</span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748B', fontSize: 12 }}>
                        {d.notes || '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => handleToggleDiscount(d._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 700,
                            color: d.isActive ? '#10B981' : '#94A3B8',
                          }}
                        >
                          {d.isActive ? <FiToggleRight size={22} color="#10B981" /> : <FiToggleLeft size={22} color="#94A3B8" />}
                          {d.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteDiscount(d._id)}
                          title="Revoke Grant"
                          style={{
                            padding: '6px 10px',
                            background: '#FEF2F2',
                            border: '1px solid #FECACA',
                            borderRadius: 6,
                            color: '#DC2626',
                            cursor: 'pointer',
                          }}
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── CREATE / EDIT PRACTITIONER COUPON MODAL ─────────────────────────── */}
      {couponModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              padding: 28,
              width: 520,
              maxWidth: '95vw',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
              {couponModal.isEdit ? 'Edit Practitioner Coupon' : 'Create New Practitioner Coupon'}
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748B' }}>
              Create a promotional code for your own courses and sessions.
            </p>

            <form onSubmit={handleSubmitCoupon} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PYTHON20"
                    value={cCode}
                    onChange={(e) => setCCode(e.target.value.toUpperCase())}
                    disabled={couponModal.isEdit}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      outline: 'none',
                      background: couponModal.isEdit ? '#F1F5F9' : '#fff',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Discount Percentage *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    placeholder="e.g. 20"
                    value={cDiscount}
                    onChange={(e) => setCDiscount(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Coupon Name / Campaign *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Early Bird Spring Discount"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Applicable To *
                </label>
                <select
                  value={cAppTo}
                  onChange={(e) => setCAppTo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="both">Both Courses &amp; Sessions</option>
                  <option value="courses">Courses Only</option>
                  <option value="sessions">Sessions Only</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={cStartDate}
                    onChange={(e) => setCStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={cExpiryDate}
                    onChange={(e) => setCExpiryDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Max Usage Limit (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50 (empty = unlimited)"
                    value={cUsageLimit}
                    onChange={(e) => setCUsageLimit(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Per-Learner Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cPerUserLimit}
                    onChange={(e) => setCPerUserLimit(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setCouponModal(null)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    background: '#F1F5F9',
                    border: 'none',
                    borderRadius: 10,
                    color: '#64748B',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '11px',
                    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                    border: 'none',
                    borderRadius: 10,
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? 'Saving...' : couponModal.isEdit ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── CREATE PERSONAL LEARNER DISCOUNT MODAL ──────────────────────────── */}
      {personalModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              padding: 28,
              width: 500,
              maxWidth: '95vw',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
              Grant Personalized Learner Discount / Free Access
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748B' }}>
              Directly grant a private discount or 100% free course/session to a specific learner.
            </p>

            <form onSubmit={handleSubmitPersonalDiscount} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                  <span>Target Learner (Enter Learner ID) *</span>
                  {learnersList.length > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#6366F1' }}>
                      Or pick from active learners
                    </span>
                  )}
                </label>

                {/* Learner ID Input with Verify Button */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <FiTag style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                      type="text"
                      required
                      placeholder="Enter Learner ID (e.g. LRN-102938) or Email..."
                      value={pLearnerId}
                      onChange={(e) => {
                        setPLearnerId(e.target.value)
                        setLookupLearnerData(null)
                        setLookupLearnerError('')
                      }}
                      onBlur={() => {
                        if (pLearnerId.trim() && !lookupLearnerData) {
                          handleLookupLearner(pLearnerId.trim())
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        borderRadius: 10,
                        border: lookupLearnerData ? '2px solid #10B981' : lookupLearnerError ? '2px solid #EF4444' : '1px solid #CBD5E1',
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: 'monospace',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: lookupLearnerData ? '#F0FDF4' : '#FFF',
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    disabled={lookupLearnerLoading || !pLearnerId.trim()}
                    onClick={() => handleLookupLearner(pLearnerId.trim())}
                    style={{
                      padding: '10px 16px',
                      background: '#4F46E5',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: pLearnerId.trim() ? 'pointer' : 'not-allowed',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      opacity: pLearnerId.trim() ? 1 : 0.6,
                      flexShrink: 0,
                    }}
                  >
                    {lookupLearnerLoading ? 'Verifying...' : <><FiSearch size={13} /> Verify ID</>}
                  </button>
                </div>

                {/* Quick Select Dropdown from Connected Learners */}
                {learnersList.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <select
                      onChange={(e) => {
                        const selVal = e.target.value
                        if (!selVal) return
                        const selLearner = learnersList.find((l) => l._id === selVal || l.learnerId === selVal)
                        const idToUse = selLearner?.learnerId || selLearner?._id || selVal
                        setPLearnerId(idToUse)
                        handleLookupLearner(idToUse)
                      }}
                      value={lookupLearnerData?.learnerId || lookupLearnerData?._id || pLearnerId || ""}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        borderRadius: 8,
                        border: '1px dashed #CBD5E1',
                        fontSize: 12,
                        color: '#64748B',
                        outline: 'none',
                        background: '#F8FAFC',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="">-- Or pick from your active learners --</option>
                      {learnersList.map((l) => (
                        <option key={l._id} value={l.learnerId || l._id}>
                          {l.firstName} {l.lastName} ({l.learnerId ? `ID: ${l.learnerId}` : l.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* COMPLETE LEARNER INFORMATION PREVIEW CARD */}
                {lookupLearnerData && (
                  <div
                    style={{
                      marginTop: 10,
                      background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
                      border: '1.5px solid #86EFAC',
                      borderRadius: 12,
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)',
                    }}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 16,
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '2px solid #FFF',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                      }}
                    >
                      {lookupLearnerData.image ? (
                        <img
                          src={lookupLearnerData.image}
                          alt={lookupLearnerData.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        `${lookupLearnerData.firstName?.[0] || 'L'}${lookupLearnerData.lastName?.[0] || ''}`.toUpperCase()
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: 14, color: '#0F172A' }}>
                          {lookupLearnerData.name}
                        </span>
                        <span
                          style={{
                            background: '#DCFCE7',
                            color: '#15803D',
                            border: '1px solid #86EFAC',
                            padding: '1px 6px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 800,
                            fontFamily: 'monospace',
                          }}
                        >
                          {lookupLearnerData.learnerId}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#059669', fontWeight: 700 }}>
                          <FiCheckCircle size={12} /> Verified
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4, fontSize: 12, color: '#475569' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FiMail size={12} style={{ color: '#4F46E5', flexShrink: 0 }} />
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {lookupLearnerData.email}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FiPhone size={12} style={{ color: '#10B981', flexShrink: 0 }} />
                          <span>{lookupLearnerData.contactNumber || 'Phone not provided'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Banner if not found */}
                {lookupLearnerError && (
                  <div
                    style={{
                      marginTop: 8,
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#B91C1C',
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <FiAlertCircle size={14} style={{ flexShrink: 0 }} />
                    <span>{lookupLearnerError}</span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Applicable Product *
                </label>
                <select
                  value={pProductType}
                  onChange={(e) => setPProductType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="all">🌟 All of My Products (Courses &amp; Sessions)</option>
                  <option value="course">📘 Specific Course</option>
                  <option value="session">🗓️ Specific Session</option>
                </select>
              </div>

              {pProductType === 'course' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Select Course
                  </label>
                  <select
                    value={pCourseId}
                    onChange={(e) => setPCourseId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    {myCourses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title} (₹{c.price})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {pProductType === 'session' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Select Session / Offer
                  </label>
                  <select
                    value={pOfferId}
                    onChange={(e) => setPOfferId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    {myOffers.map((o) => (
                      <option key={o._id} value={o._id}>
                        {o.title} ({o.type}) — ₹{o.price}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Free or Discount percentage toggle */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: pIsFree ? 0 : 10 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', cursor: 'pointer' }}>
                    Grant 100% FREE Access (₹0)
                  </label>
                  <input
                    type="checkbox"
                    checked={pIsFree}
                    onChange={(e) => {
                      setPIsFree(e.target.checked)
                      if (e.target.checked) setPDiscountPct('100')
                    }}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                </div>

                {!pIsFree && (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Custom Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      required
                      placeholder="e.g. 30"
                      value={pDiscountPct}
                      onChange={(e) => setPDiscountPct(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #CBD5E1',
                        fontSize: 13,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={pExpiryDate}
                    onChange={(e) => setPExpiryDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Redemption Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={pUsageLimit}
                    onChange={(e) => setPUsageLimit(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Personal Note / Reason (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Merit scholarship grant / Special guest"
                  value={pNotes}
                  onChange={(e) => setPNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setPersonalModal(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    background: '#F1F5F9',
                    border: 'none',
                    borderRadius: 10,
                    color: '#64748B',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '11px',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    border: 'none',
                    borderRadius: 10,
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? 'Granting...' : 'Grant Discount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
