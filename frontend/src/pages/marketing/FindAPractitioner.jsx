import React, { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  OHFooter,
  OHButton,
  OHEyebrow,
  OHCardSkeleton,
  OHEmptyState,
} from '../../components/openhand'
import { apiConnector } from '../../services/apiConnector'
import { toast } from 'react-hot-toast'
import { formatPractitionerName } from '../../utils/formatName'
import { getOptimizedImageUrl } from '../../utils/imageOptimizer'
import { FiEye } from 'react-icons/fi'
import PayGlocalCheckoutModal from '../../components/openhand/PayGlocalCheckoutModal'


const SPECIALTIES = [
  { value: 'all', label: 'All Guides' },
  { value: 'mental health', label: 'Mental Health' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'foreign education', label: 'Foreign Education' },
  { value: 'career', label: 'Career & Burnout' },
  { value: 'startup', label: 'Startup' },
  { value: 'personality communication', label: 'Personality Communication' },
  { value: 'parenting', label: 'Parenting' },
  { value: 'trauma', label: 'Trauma & Recovery' },
  { value: 'astrology', label: 'Astrology' },
  { value: 'spiritual', label: 'Spiritual' },
  { value: 'narcissism', label: 'Narcissism' },
  { value: 'technology', label: 'Technology' },
  { value: 'marketing', label: 'Marketing' },
]

const FORMATS = [
  { value: 'all', label: 'Any Format' },
  { value: '1:1', label: '1:1 Sessions' },
  { value: 'circle', label: 'Circles' },
  { value: 'membership', label: 'Membership' },
]

const SORT_OPTIONS = [
  { value: 'views', label: '🔥 Most Viewed & Popular' },
  { value: 'featured', label: '⭐ Featured Guides' },
  { value: 'rating', label: '★ Highest Rated' },
  { value: 'rate_low', label: 'Price: Low to High' },
  { value: 'rate_high', label: 'Price: High to Low' },
]

export function FindAPractitioner() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const [practitioners, setPractitioners] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [needFilter, setNeedFilter] = useState('all')
  const [fmtFilter, setFmtFilter] = useState('all')
  const [langFilter, setLangFilter] = useState('all')
  const [sortBy, setSortBy] = useState('views')
  const [connectingId, setConnectingId] = useState(null)

  const [payglocalModalOpen, setPayglocalModalOpen] = useState(false)
  const [payglocalOrderData, setPayglocalOrderData] = useState(null)
  const [pendingPractitioner, setPendingPractitioner] = useState(null)

  const handleConnectPractitioner = async (practitioner) => {
    try {
      const pId = practitioner._id || practitioner.id || practitioner.user
      const pName = `${practitioner.firstName || 'Practitioner'} ${practitioner.lastName || ''}`
      const amount = practitioner.sessionRate || 2500
      setConnectingId(pId)

      // Create PayGlocal order via backend API
      const orderRes = await apiConnector('POST', '/api/v1/payment/create-practitioner-order', {
        practitionerId: pId,
        amount,
      }, { Authorization: token ? `Bearer ${token}` : undefined })

      if (!orderRes?.data?.success) {
        toast.error(orderRes?.data?.message || 'Please log in as a Learner to connect with practitioners.')
        setConnectingId(null)
        return
      }

      const { order, key, amount: finalAmount } = orderRes.data

      const orderData = {
        orderId: order?.id || order?.merchantTxnId || `txn_pgl_${Date.now()}`,
        gid: order?.gid || `GL_${Date.now()}`,
        amount: finalAmount || (order?.amount ? order.amount / 100 : amount),
        currency: order?.currency || 'INR',
        planName: `Counseling Fee for ${pName}`,
        keyId: key || process.env.REACT_APP_PAYGLOCAL_KEY_ID,
        merchantId: order?.merchantId || process.env.REACT_APP_PAYGLOCAL_MERCHANT_ID,
        customerData: {
          name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
          email: user?.email || '',
          phone: user?.additionalDetails?.contactNumber || user?.contactNumber || '',
        },
      }

      setPendingPractitioner({ id: pId, name: pName, amount: finalAmount || amount })
      setPayglocalOrderData(orderData)
      setPayglocalModalOpen(true)
    } catch (err) {
      console.error('PayGlocal connect error:', err)
      toast.error('Please log in as a Learner to connect with practitioners.')
    } finally {
      setConnectingId(null)
    }
  }

  const handlePayGlocalSuccess = async (response) => {
    if (!pendingPractitioner) return
    const vToast = toast.loading('Connecting and confirming with PayGlocal...')
    try {
      const res = await apiConnector('POST', '/api/v1/practitioners/connect', {
        practitionerId: pendingPractitioner.id,
        amountPaid: pendingPractitioner.amount,
        payglocal_order_id: response.payglocal_order_id || response.merchantTxnId,
        payglocal_payment_id: response.payglocal_payment_id || response.gid,
        payglocal_gid: response.payglocal_gid || response.gid,
        payglocal_signature: response.signature,
      })
      if (res?.data?.success) {
        toast.success(`🎉 Connection request & payment of ₹${pendingPractitioner.amount} sent to ${pendingPractitioner.name}!`, { id: vToast })
      } else {
        toast.error(res?.data?.message || 'Could not process connection request.', { id: vToast })
      }
    } catch (err) {
      toast.error('Connection request failed after payment.', { id: vToast })
    } finally {
      setPayglocalModalOpen(false)
      setPendingPractitioner(null)
    }
  }


  // Dynamic API Pagination state
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPractitioners: 0,
    limit: 6,
    hasPrev: false,
    hasNext: false,
  })

  // Real-time dynamic trust metrics state
  const [trustStats, setTrustStats] = useState({
    totalGuides: null,
    avgRating: null,
  })


  // Reset to page 1 whenever search filters or sort change
  const handleFilterChange = (setter, value) => {
    setter(value)
    setPage(1)
  }

  useEffect(() => {
    async function loadDirectory() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.append('page', page)
        params.append('limit', 6)
        if (needFilter !== 'all') params.append('need', needFilter)
        if (fmtFilter !== 'all') params.append('fmt', fmtFilter)
        if (langFilter !== 'all') params.append('lang', langFilter)
        if (searchQuery) params.append('q', searchQuery)
        if (sortBy) params.append('sort', sortBy)

        const res = await apiConnector('GET', `/api/v1/practitioners?${params.toString()}`)
        if (res?.data?.success && Array.isArray(res.data.data)) {
          setPractitioners(res.data.data)
          if (res.data.stats) {
            setTrustStats(res.data.stats)
          }
          if (res.data.pagination) {
            setPagination(res.data.pagination)
          } else {
            setPagination({
              currentPage: 1,
              totalPages: 1,
              totalPractitioners: res.data.data.length,
              limit: 6,
              hasPrev: false,
              hasNext: false,
            })
          }
        } else {
          setPractitioners([])
        }
      } catch (err) {
        console.error('Failed to fetch practitioners:', err)
        setPractitioners([])
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(loadDirectory, 150)
    return () => clearTimeout(timer)
  }, [needFilter, fmtFilter, langFilter, searchQuery, sortBy, page])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage)
      const sec = document.querySelector('.dir-sec')
      if (sec) sec.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleViewPractitioner = (practitioner) => {
    const pId = practitioner._id || practitioner.id || practitioner.handle
    if (pId) {
      apiConnector('POST', `/api/v1/practitioners/track-view/${pId}`).catch(() => {})
    }
  }

  const hasActiveFilters = Boolean(
    searchQuery ||
    needFilter !== 'all' ||
    fmtFilter !== 'all' ||
    langFilter !== 'all' ||
    (sortBy !== 'views' && sortBy !== 'featured')
  )

  // Dynamically compute unique available languages from registered practitioners
  const availableLanguages = useMemo(() => {
    const langSet = new Set()
    practitioners.forEach((p) => {
      if (Array.isArray(p.languages)) {
        p.languages.forEach((l) => {
          if (l && typeof l === 'string' && l.trim()) {
            langSet.add(l.trim())
          }
        })
      }
    })

    if (langSet.size === 0) {
      langSet.add('English')
      langSet.add('Hindi')
    }

    const list = [{ value: 'all', label: 'Any Language' }]
    Array.from(langSet).sort().forEach((lang) => {
      list.push({ value: lang, label: lang })
    })
    return list
  }, [practitioners])

  const resetAllFilters = () => {
    setSearchQuery('')
    setNeedFilter('all')
    setFmtFilter('all')
    setLangFilter('all')
    setSortBy('views')
    setPage(1)
  }

  return (
    <div className="oh-dir-page relative min-h-screen">


      {/* Hero Header */}
      <header className="oh-dir-hero">
        <div className="oh-wrap text-center">
          <OHEyebrow>Verified Guide Directory</OHEyebrow>
          <h1 className="dir-title">
            Find a guide who <span className="oh-grad-text">truly fits your path.</span>
          </h1>
          <p className="dir-sub">
            Every practitioner here is verified, works independently on OpenHand, and shows real availability. No middle agency, no algorithms deciding for you.
          </p>

          {/* Trust Metrics Pill (Real-Time Dynamic Stats) */}
          <div className="dir-trust-pill">
            <span className="trust-item">
              <span className="green-pulse-dot" />{" "}
              {trustStats.totalGuides !== null
                ? `${trustStats.totalGuides} Verified Guide${trustStats.totalGuides === 1 ? "" : "s"}`
                : pagination.totalPractitioners
                ? `${pagination.totalPractitioners} Verified Guide${pagination.totalPractitioners === 1 ? "" : "s"}`
                : "Verified Guides"}
            </span>
            <span className="trust-divider">•</span>
            <span className="trust-item">
              🌐 Global Practitioner
            </span>
            <span className="trust-divider">•</span>
            <span className="trust-item">
              🛡️ 100% Confidential
            </span>
          </div>
        </div>
      </header>

      {/* Directory Section */}
      <section className="oh-sec dir-sec">
        <div className="oh-wrap">

          {/* BRAND NEW SLEEK DIRECTORY CONTROL PANEL */}
          <div className="dir-modern-panel">

            {/* Unified Search & 4-Dropdown Control Bar */}
            <div className="dir-action-bar flex flex-col xl:flex-row gap-3 items-stretch xl:items-center">
              {/* Search Field */}
              <div className="dir-search-box flex-1 min-w-[240px]">
                <span className="search-icon-symbol">🔍</span>
                <input
                  type="text"
                  className="dir-search-input-field"
                  placeholder="Search by practitioner name, specialty, or keywords…"
                  value={searchQuery}
                  onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => handleFilterChange(setSearchQuery, '')} className="search-clear-x">✕</button>
                )}
              </div>

              {/* 4 Select Dropdowns Group */}
              <div className="dir-selects-group flex flex-wrap gap-2 items-center">
                {/* 1. Domain / Specialty Dropdown */}
                <div className="select-pill-wrap">
                  <select
                    value={needFilter}
                    onChange={(e) => handleFilterChange(setNeedFilter, e.target.value)}
                    className={`dir-select-pill ${needFilter !== 'all' ? 'border-[#2563EB] text-[#2563EB] bg-blue-50/60 font-bold' : ''}`}
                    aria-label="Filter by Domain"
                  >
                    {SPECIALTIES.map((spec) => (
                      <option key={spec.value} value={spec.value}>{spec.label}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Format Dropdown */}
                <div className="select-pill-wrap">
                  <select
                    value={fmtFilter}
                    onChange={(e) => handleFilterChange(setFmtFilter, e.target.value)}
                    className={`dir-select-pill ${fmtFilter !== 'all' ? 'border-[#2563EB] text-[#2563EB] bg-blue-50/60 font-bold' : ''}`}
                    aria-label="Filter by Format"
                  >
                    {FORMATS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Language Dropdown */}
                <div className="select-pill-wrap">
                  <select
                    value={langFilter}
                    onChange={(e) => handleFilterChange(setLangFilter, e.target.value)}
                    className={`dir-select-pill ${langFilter !== 'all' ? 'border-[#2563EB] text-[#2563EB] bg-blue-50/60 font-bold' : ''}`}
                    aria-label="Filter by Language"
                  >
                    {availableLanguages.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Sort Dropdown */}
                <div className="select-pill-wrap">
                  <select
                    value={sortBy}
                    onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
                    className="dir-select-pill dir-sort-pill"
                    aria-label="Sort Practitioners"
                  >
                    {SORT_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                {/* Reset Filter Button */}
                <button
                  type="button"
                  onClick={resetAllFilters}
                  disabled={!hasActiveFilters}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    hasActiveFilters
                      ? 'bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20 cursor-pointer shadow-sm'
                      : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                  }`}
                  title={hasActiveFilters ? 'Reset price and all active search filters' : 'No filters currently active'}
                >
                  ↺ Reset Filters
                </button>
              </div>
            </div>

            {/* 3. Results Count Bar */}
            <div className="dir-results-info-row">
              <span className="dir-results-count">
                Showing <strong>{loading ? '…' : practitioners.length}</strong> of <strong>{pagination.totalPractitioners || practitioners.length}</strong> verified guide{pagination.totalPractitioners === 1 ? '' : 's'} {pagination.totalPages > 1 && `(Page ${pagination.currentPage} of ${pagination.totalPages})`}
              </span>
              {hasActiveFilters && (
                <span className="dir-active-filter-tag">
                  Filters applied
                </span>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="dir-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <OHCardSkeleton />
              <OHCardSkeleton />
              <OHCardSkeleton />
            </div>
          ) : practitioners.length === 0 ? (
            <div className="dir-empty-wrap">
              <OHEmptyState
                type="no-results"
                title="No practitioner matches all of your selected filters"
                body="Try adjusting or clearing your search filters to view more available guides."
              />
              <button onClick={resetAllFilters} className="dir-empty-reset-btn">
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="dir-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {practitioners
                  .filter((p) => {
                    // Include practitioners with real published offers OR with the dummy placeholder offer
                    if (p.hasDummyOffer) return true
                    const rawOffers = p.offers || p.userOffers || []
                    const publishedOffers = rawOffers.filter((o) => !o.isDummy && (o.status === 'published' || (!o.status && o.status !== 'draft')))
                    return publishedOffers.length > 0
                  })
                  .filter((p) => {
                    if (langFilter && langFilter !== 'all') {
                      const cleanLang = langFilter.trim().toLowerCase()
                      const pLangs = Array.isArray(p.languages) ? p.languages.map((l) => String(l).trim().toLowerCase()) : []
                      return pLangs.includes(cleanLang)
                    }
                    return true
                  })
                  .map((p, idx) => {
                  const name = formatPractitionerName(p.user || p, 'Practitioner')
                  const isVerified = p.verificationStatus === 'verified' || true
                  const userImg = p.user?.image || p.image || p.avatar || null
                  const rawOffers = p.offers || p.userOffers || []
                  const realOffers = rawOffers.filter((o) => !o.isDummy && (o.status === 'published' || (!o.status && o.status !== 'draft')))
                  const isDummyOnly = p.hasDummyOffer || realOffers.length === 0
                  const publishedOffers = isDummyOnly ? rawOffers : realOffers
                  const minPrice = !isDummyOnly && realOffers.length > 0
                    ? Math.min(...realOffers.map((o) => o.price || 0))
                    : null

                  return (
                    <article key={p._id} className="practitioner-card">
                      {/* Large Square Avatar */}
                      <div className="p-avatar-large-wrap">
                        {userImg ? (
                          <img
                            src={getOptimizedImageUrl(userImg, 800)}
                            alt={name}
                            loading="lazy"
                            decoding="async"
                            className="p-avatar-large-img"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              const fallback = e.currentTarget.parentElement?.querySelector('.p-avatar-large-fallback')
                              if (fallback) fallback.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div
                          className="p-avatar-large-fallback"
                          style={{ display: userImg ? 'none' : 'flex' }}
                        >
                          {p.avatarInitials || name.slice(0, 1).toUpperCase()}
                        </div>
                      </div>

                      <div className="practitioner-card-body">
                        {/* Meta info */}
                        <div className="p-meta-wrap">
                          <div className="p-name-row">
                            <h3 className="p-name">{name}</h3>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {idx === 0 && (p.viewCount || 0) > 0 && (sortBy === 'views' || sortBy === 'featured') && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    fontSize: '10.5px',
                                    fontWeight: 800,
                                    color: '#B45309',
                                    background: '#FEF3C7',
                                    border: '1px solid #FDE68A',
                                    padding: '2px 7px',
                                    borderRadius: '6px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.3px',
                                  }}
                                  title="Top Ranked by Community Views"
                                >
                                  🔥 #1 Most Viewed
                                </span>
                              )}
                              {isVerified && (
                                <span className="p-verified-badge" title="Verified Credential">✓ Verified</span>
                              )}
                            </div>
                          </div>
                          {p.credentials && <div className="p-credentials">{p.credentials}</div>}
                          <div className="p-rating-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {p.reviewCount ? (
                                <>
                                  <span className="p-rating-star">★ {p.rating || 5.0}</span>
                                  <span className="p-rating-count">({p.reviewCount} reviews)</span>
                                </>
                              ) : (
                                <span className="p-rating-count" style={{ color: '#059669', fontWeight: 700 }}>
                                  ✨ New Verified Guide
                                </span>
                              )}
                            </div>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#4338CA',
                                background: '#EEF2FF',
                                border: '1px solid #C7D2FE',
                                padding: '2px 8px',
                                borderRadius: '9999px',
                              }}
                              title="Total Profile Views"
                            >
                              <FiEye size={12} /> {(p.viewCount || 0).toLocaleString()} {p.viewCount === 1 ? 'view' : 'views'}
                            </span>
                          </div>
                        </div>

                        {/* Bio */}
                      <p className="p-bio-text">{p.bio}</p>

                      {/* Offers Section — real or dummy placeholder */}
                      {publishedOffers.length > 0 && (
                        <div style={{ marginBottom: '12px', background: isDummyOnly ? 'linear-gradient(135deg, #F0FDF4, #ECFDF5)' : '#F8FAFC', padding: '10px 12px', borderRadius: '12px', border: isDummyOnly ? '1px solid #A7F3D0' : '1px solid #E2E8F0' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: isDummyOnly ? '#065F46' : '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                            {isDummyOnly ? '🌱 Getting Started' : `Published Offers (${publishedOffers.length})`}
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {publishedOffers.map((o, oIdx) => (
                              <div
                                key={o._id || oIdx}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  fontSize: '12px',
                                  background: '#FFFFFF',
                                  padding: '6px 10px',
                                  borderRadius: '8px',
                                  border: '1px solid #CBD5E1',
                                }}
                              >
                                <div>
                                  <span style={{ fontWeight: 700, color: '#0F172A', display: 'block' }}>{o.title}</span>
                                  <span style={{ fontSize: '10.5px', color: '#64748B' }}>{o.type === 'circle' ? 'Circle' : '1:1 Session'} • {o.durationMinutes || 50}m</span>
                                </div>
                                {o.isDummy || o.price == null ? (
                                  <span style={{ fontWeight: 800, color: '#94A3B8', fontSize: '11px' }}>Price NA</span>
                                ) : (
                                  <span style={{ fontWeight: 800, color: '#2563EB' }}>₹{o.price}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Languages & Formats info line */}
                      <div className="p-info-meta">
                        <span className="info-item">🌐 {p.languages && p.languages.length > 0 ? p.languages.join(', ') : 'English'}</span>
                        <span className="info-item">👥 {p.formats && p.formats.length > 0 ? p.formats.join(' & ') : '1:1 Guidance'}</span>
                      </div>

                      {/* Footer: Price & Availability */}
                      <div className="p-card-foot">
                        <div className="p-rate-box">
                          {isDummyOnly ? (
                            <span className="p-rate-amount" style={{ fontSize: '13px', color: '#94A3B8', fontStyle: 'italic' }}>
                              Pricing coming soon
                            </span>
                          ) : minPrice > 0 ? (
                            <>
                              <span className="p-rate-amount">₹{minPrice.toLocaleString('en-IN')}</span>
                              <span className="p-rate-unit"> /session</span>
                            </>
                          ) : (
                            <span className="p-rate-amount" style={{ fontSize: '13px', color: '#64748B' }}>
                              Contact for pricing
                            </span>
                          )}
                        </div>
                        <div className="p-avail-badge">
                          🟢 {p.availabilityText || 'Available this week'}
                        </div>
                      </div>

                      {/* CTA Buttons: Connect & Book & View Profile */}
                      <div className="flex gap-2 w-full mt-3">
                        {isDummyOnly ? (
                          <OHButton
                            href={`/practitioner/${p.handle || p._id || ''}`}
                            onClick={() => handleViewPractitioner(p)}
                            className="flex-1 p-book-btn"
                          >
                            View Profile →
                          </OHButton>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                handleViewPractitioner(p)
                                handleConnectPractitioner(p)
                              }}
                              disabled={connectingId === (p._id || p.id)}
                              className="flex-1 py-2.5 px-3 rounded-xl border border-indigo-200 text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 font-bold text-xs transition-all flex items-center justify-center gap-1"
                            >
                              {connectingId === (p._id || p.id) ? 'Connecting...' : '🤝 Connect & Book'}
                            </button>
                            <OHButton
                              href={`/practitioner/${p.handle || p._id || ''}`}
                              onClick={() => handleViewPractitioner(p)}
                              className="flex-1 p-book-btn"
                            >
                              View Profile →
                            </OHButton>
                          </>
                        )}
                      </div>
                    </div>
                    </article>
                  )
                })}
              </div>

              {/* Dynamic Pagination Bar (Previous 1 2 3 ... Next) */}
              {pagination.totalPages > 1 && (
                <div className="dir-pagination-wrap">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={!pagination.hasPrev}
                    className="dir-page-btn"
                  >
                    ← Previous
                  </button>

                  <div className="dir-page-numbers">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pNum) => (
                      <button
                        key={pNum}
                        onClick={() => handlePageChange(pNum)}
                        className={`dir-page-num ${page === pNum ? 'active' : ''}`}
                      >
                        {pNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!pagination.hasNext}
                    className="dir-page-btn"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}

          {/* Join Network CTA Banner */}
          <div className="dir-banner-card">
            <div className="banner-content">
              <span className="banner-badge">For Independent Practitioners</span>
              <h2>Every learner who finds you here costs zero acquisition fee.</h2>
              <p>
                Join India's premier network of verified guides. Keep 100% of your learner revenue, showcase your practice, and get matched with learners searching for your exact modalities.
              </p>
              <div className="banner-btn-row">
                <OHButton href="/signup" size="lg">List Your Practice Free</OHButton>
                <OHButton href="/contact-us" variant="ghost" size="lg">Learn How It Works →</OHButton>
              </div>
            </div>
          </div>

          {/* Verification Disclaimer Note */}
          <p className="dir-disclaimer-note text-center">
            All practitioners listed on OpenHand are independently verified for credentials, training, and ethical compliance.
          </p>
        </div>
      </section>

      {payglocalModalOpen && (
        <PayGlocalCheckoutModal
          isOpen={payglocalModalOpen}
          onClose={() => setPayglocalModalOpen(false)}
          orderData={payglocalOrderData}
          onSuccess={handlePayGlocalSuccess}
        />
      )}

      <OHFooter />
    </div>
  )
}


export default FindAPractitioner
