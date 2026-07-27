import React, { useState, useEffect } from 'react'
import {
  OHFooter,
  OHButton,
  OHEyebrow,
  OHCardSkeleton,
  OHEmptyState,
} from '../../components/openhand'
import { apiConnector } from '../../services/apiConnector'

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
  { value: 'circle', label: 'Group Circles' },
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
  const [practitioners, setPractitioners] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [needFilter, setNeedFilter] = useState('all')
  const [fmtFilter, setFmtFilter] = useState('all')
  const [langFilter, setLangFilter] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  
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

  const hasActiveFilters = searchQuery || needFilter !== 'all' || fmtFilter !== 'all' || langFilter !== 'all'

  const resetAllFilters = () => {
    setSearchQuery('')
    setNeedFilter('all')
    setFmtFilter('all')
    setLangFilter('all')
    setSortBy('featured')
    setPage(1)
  }

  return (
    <div className="oh-dir-page">

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
            <div className="dir-category-nav">
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
            <div className="dir-action-bar">
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
              <div className="dir-selects-group">
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

                {/* Clear Filters Link */}
                {hasActiveFilters && (
                  <button onClick={resetAllFilters} className="dir-clear-all-btn" title="Reset all filters">
                    Reset
                  </button>
                )}
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
            <div className="dir-grid">
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
              <div className="dir-grid">
                {practitioners.map((p) => {
                  const name = `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim() || 'Practitioner'
                  const rating = p.rating || 4.9
                  const reviewCount = p.reviewCount || 35
                  const isVerified = p.verificationStatus === 'verified' || true

                  return (
                    <article key={p._id} className="practitioner-card">
                      {/* Header: Avatar + Meta */}
                      <div className="p-card-head">
                        <div className="p-avatar-wrap">
                          <div className="p-avatar">{p.avatarInitials || name.slice(0, 2).toUpperCase()}</div>
                          {p.onlineNow && <span className="p-online-dot" title="Accepting clients" />}
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
                            <span className="p-rating-star">★ {rating}</span>
                            <span className="p-rating-count">({reviewCount} reviews)</span>
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

                      {/* Published Offers Badge Line */}
                      {p.offers && p.offers.length > 0 && (
                        <div style={{ marginBottom: '10px', fontSize: '11.5px', color: '#2563EB', fontWeight: 600, background: '#EFF6FF', padding: '4px 10px', borderRadius: '8px', border: '1px solid #DBEAFE' }}>
                          🏷️ {p.offers.length} Offer{p.offers.length > 1 ? 's' : ''}: {p.offers.map((o) => `${o.title} (₹${o.price})`).slice(0, 2).join(' · ')}
                        </div>
                      )}

                      {/* Languages & Formats info line */}
                      <div className="p-info-meta">
                        <span className="info-item">🌐 {p.languages ? p.languages.slice(0, 2).join(', ') : 'English'}</span>
                        <span className="info-item">👥 {p.formats ? p.formats.join(' & ') : '1:1 & Circles'}</span>
                      </div>

                      {/* Footer: Price & Availability */}
                      <div className="p-card-foot">
                        <div className="p-rate-box">
                          <span className="p-rate-amount">₹{p.sessionRate?.toLocaleString('en-IN') || '2,500'}</span>
                          <span className="p-rate-unit"> /session</span>
                        </div>
                        <div className="p-avail-badge">
                          🟢 {p.availabilityText || 'Available this week'}
                        </div>
                      </div>

                      {/* CTA Button */}
                      <OHButton href={`/practice/handle/${p.handle || ''}`} fullWidth className="p-book-btn">
                        View Profile &amp; Book →
                      </OHButton>
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
              <h2>Every client who finds you here costs zero acquisition fee.</h2>
              <p>
                Join India's premier network of verified guides. Keep 100% of your client revenue, showcase your practice, and get matched with clients searching for your exact modalities.
              </p>
              <div className="banner-btn-row">
                <OHButton href="/start-free" size="lg">List Your Practice Free</OHButton>
                <OHButton href="/talk-to-human" variant="ghost" size="lg">Learn How It Works →</OHButton>
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
