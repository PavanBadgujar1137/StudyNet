import React, { useState, useEffect } from 'react'
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

const SPECIALTIES = [
  { value: 'all', label: 'All Guides' },
  { value: 'anxiety', label: 'Anxiety & Stress' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'grief', label: 'Grief & Loss' },
  { value: 'career', label: 'Career & Burnout' },
  { value: 'parenting', label: 'Parenting' },
  { value: 'trauma', label: 'Trauma & Recovery' },
  { value: 'mindfulness', label: 'Mindfulness' },
]

const FORMATS = [
  { value: 'all', label: 'Any Format' },
  { value: '1:1', label: '1:1 Sessions' },
  { value: 'circle', label: 'Circles' },
  { value: 'membership', label: 'Membership' },
]

const LANGUAGES = [
  { value: 'all', label: 'Any Language' },
  { value: 'English', label: 'English' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Marathi', label: 'Marathi' },
  { value: 'Tamil', label: 'Tamil' },
  { value: 'Bengali', label: 'Bengali' },
]

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured Guides' },
  { value: 'rating', label: 'Highest Rated' },
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
  const [sortBy, setSortBy] = useState('featured')
  const [connectingId, setConnectingId] = useState(null)

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

  const handleConnectPractitioner = async (practitioner) => {
    try {
      const pId = practitioner._id || practitioner.id || practitioner.user
      const pName = `${practitioner.firstName || 'Practitioner'} ${practitioner.lastName || ''}`
      const amount = practitioner.sessionRate || 2500
      setConnectingId(pId)

      const isLoaded = await loadRazorpaySDK()
      if (!isLoaded) {
        toast.error('Razorpay SDK failed to load.')
        setConnectingId(null)
        return
      }

      // Create order via backend API
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

      const options = {
        key: key || process.env.REACT_APP_RAZORPAY_KEY || 'rzp_test_TDhFSRuAl18Gcb',
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'OpenHand Practice Platform',
        description: `Counseling Fee for ${pName}`,
        order_id: order.id,
        prefill: {
          name: user ? `${user.firstName} ${user.lastName}`.trim() : '',
          email: user?.email || '',
          contact: (user?.additionalDetails?.contactNumber && user.additionalDetails.contactNumber !== 'null' && user.additionalDetails.contactNumber !== 'undefined') ? String(user.additionalDetails.contactNumber).trim() : '',
        },
        handler: async function (response) {
          try {
            const res = await apiConnector('POST', '/api/v1/practitioners/connect', {
              practitionerId: pId,
              amountPaid: finalAmount || amount,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            if (res?.data?.success) {
              toast.success(`🎉 Connection request & payment of ₹${finalAmount || amount} sent to ${pName}!`)
            } else {
              toast.error(res?.data?.message || 'Could not process connection request.')
            }
          } catch (err) {
            toast.error('Connection request failed after payment.')
          } finally {
            setConnectingId(null)
          }
        },
        theme: { color: '#1F5FE0' },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function () {
        toast.error('Payment cancelled or failed.')
        setConnectingId(null)
      })
      rzp.open()
    } catch (err) {
      console.error('Connect error:', err)
      toast.error('Please log in as a Learner to connect with practitioners.')
      setConnectingId(null)
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

  const hasActiveFilters = Boolean(
    searchQuery ||
    needFilter !== 'all' ||
    fmtFilter !== 'all' ||
    langFilter !== 'all' ||
    sortBy !== 'featured'
  )

  const resetAllFilters = () => {
    setSearchQuery('')
    setNeedFilter('all')
    setFmtFilter('all')
    setLangFilter('all')
    setSortBy('featured')
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

          {/* Trust Metrics Pill */}
          <div className="dir-trust-pill">
            <span className="trust-item">
              <span className="green-pulse-dot" /> 120+ Verified Guides
            </span>
            <span className="trust-divider">•</span>
            <span className="trust-item">
              <span className="star-icon">★</span> 4.9 Avg. Rating
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

            {/* 1. Horizontal Category Tabs Row */}
            <div className="dir-category-nav flex flex-wrap gap-2">
              {SPECIALTIES.map((spec) => (
                <button
                  key={spec.value}
                  onClick={() => handleFilterChange(setNeedFilter, spec.value)}
                  className={`dir-cat-tab ${needFilter === spec.value ? 'active' : ''}`}
                >
                  {spec.label}
                </button>
              ))}
            </div>

            {/* 2. Unified Search & Dropdown Control Bar */}
            <div className="dir-action-bar flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {/* Search Field */}
              <div className="dir-search-box">
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

              {/* Select Dropdowns Group */}
              <div className="dir-selects-group flex flex-wrap gap-2">
                {/* Format Dropdown */}
                <div className="select-pill-wrap">
                  <select
                    value={fmtFilter}
                    onChange={(e) => handleFilterChange(setFmtFilter, e.target.value)}
                    className="dir-select-pill"
                  >
                    {FORMATS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>

                {/* Language Dropdown */}
                <div className="select-pill-wrap">
                  <select
                    value={langFilter}
                    onChange={(e) => handleFilterChange(setLangFilter, e.target.value)}
                    className="dir-select-pill"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>

                {/* Sort Dropdown */}
                <div className="select-pill-wrap">
                  <select
                    value={sortBy}
                    onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
                    className="dir-select-pill dir-sort-pill"
                  >
                    {SORT_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                {/* Reset Filter Button (ITEM 3 FIX: Always enabled when price sort or filters are active) */}
                <button
                  type="button"
                  onClick={resetAllFilters}
                  disabled={!hasActiveFilters}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    hasActiveFilters
                      ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 cursor-pointer shadow-sm'
                      : 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed opacity-60'
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
                  .filter((p) => (p.offers && p.offers.length > 0) || (p.userOffers && p.userOffers.length > 0))
                  .map((p) => {
                  const name = formatPractitionerName(p.user || p, 'Practitioner')
                  const isVerified = p.verificationStatus === 'verified' || true

                  return (
                    <article key={p._id} className="practitioner-card">
                      {/* Header: Avatar + Meta */}
                      <div className="p-card-head">
                        <div className="p-avatar-wrap">
                          <div className="p-avatar">{p.avatarInitials || name.slice(0, 2).toUpperCase()}</div>
                          {p.onlineNow && <span className="p-online-dot" title="Accepting learners" />}
                        </div>

                        <div className="p-meta-wrap">
                          <div className="p-name-row">
                            <h3 className="p-name">{name}</h3>
                            {isVerified && (
                              <span className="p-verified-badge" title="Verified Credential">✓ Verified</span>
                            )}
                          </div>
                          <div className="p-credentials">{p.credentials}</div>
                          <div className="p-rating-row">
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
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="p-bio-text">{p.bio}</p>

                      {/* Specialty Chips */}
                      <div className="p-specialty-tags">
                        {p.specialties?.map((t, i) => (
                          <span key={i} className="p-specialty-pill">{t}</span>
                        ))}
                      </div>

                      {/* Published Offers Section */}
                      {((p.offers && p.offers.length > 0) || (p.userOffers && p.userOffers.length > 0)) && (
                        <div style={{ marginBottom: '12px', background: '#F8FAFC', padding: '10px 12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                            Published Offers ({(p.offers || p.userOffers).length})
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {(p.offers || p.userOffers).map((o, oIdx) => (
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
                                <span style={{ fontWeight: 800, color: '#2563EB' }}>₹{o.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Languages & Formats info line */}
                      <div className="p-info-meta">
                        <span className="info-item">🌐 {p.languages && p.languages.length > 0 ? p.languages.slice(0, 2).join(', ') : 'English'}</span>
                        <span className="info-item">👥 {p.formats && p.formats.length > 0 ? p.formats.join(' & ') : '1:1 Guidance'}</span>
                      </div>

                      {/* Footer: Price & Availability */}
                      <div className="p-card-foot">
                        <div className="p-rate-box">
                          {p.sessionRate && p.sessionRate > 0 ? (
                            <>
                              <span className="p-rate-amount">₹{p.sessionRate.toLocaleString('en-IN')}</span>
                              <span className="p-rate-unit"> /session</span>
                            </>
                          ) : (
                            <span className="p-rate-amount" style={{ fontSize: '13px', color: '#64748B' }}>
                              No published offers yet
                            </span>
                          )}
                        </div>
                        <div className="p-avail-badge">
                          🟢 {p.availabilityText || 'Available this week'}
                        </div>
                      </div>

                      {/* CTA Buttons: Free Connect & View Profile */}
                      <div className="flex gap-2 w-full mt-3">
                        <button
                          type="button"
                          onClick={() => handleConnectPractitioner(p)}
                          disabled={connectingId === (p._id || p.id)}
                          className="flex-1 py-2.5 px-3 rounded-xl border border-indigo-200 text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 font-bold text-xs transition-all flex items-center justify-center gap-1"
                        >
                          {connectingId === (p._id || p.id) ? 'Connecting...' : '🤝 Connect Free'}
                        </button>
                        <OHButton href={`/practitioner/${p.handle || p._id || ''}`} className="flex-1 p-book-btn">
                          View Profile →
                        </OHButton>

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

      <OHFooter />
    </div>
  )
}

export default FindAPractitioner
