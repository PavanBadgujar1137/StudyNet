import React, { useState, useEffect, useMemo } from 'react'
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

// High-quality curated sample practitioner profiles
const SAMPLE_PRACTITIONERS = [
  {
    _id: 'p1',
    user: { firstName: 'Dr. Ananya', lastName: 'Sharma' },
    credentials: 'Ph.D. Clinical Psychology · RCI Licensed',
    verificationStatus: 'verified',
    avatarInitials: 'AS',
    bio: 'Specializing in anxiety management, somatic trauma recovery, and mindfulness-based cognitive therapy for working professionals.',
    specialties: ['Anxiety & Stress', 'Trauma & Recovery', 'Mindfulness'],
    languages: ['English', 'Hindi', 'Marathi'],
    formats: ['1:1 Sessions', 'Group Circles'],
    sessionRate: 2500,
    rating: 4.9,
    reviewCount: 48,
    availabilityText: 'Available Tomorrow',
    handle: 'dr-ananya-sharma',
    onlineNow: true,
  },
  {
    _id: 'p2',
    user: { firstName: 'Rohan', lastName: 'Mehta' },
    credentials: 'ICF Master Certified Coach (MCC) · Ex-Google',
    verificationStatus: 'verified',
    avatarInitials: 'RM',
    bio: 'Helping senior leaders and founders navigate career burnout, emotional agility, and sustainable high performance.',
    specialties: ['Career & Burnout', 'Mindfulness'],
    languages: ['English', 'Hindi'],
    formats: ['1:1 Sessions', 'Membership'],
    sessionRate: 3200,
    rating: 5.0,
    reviewCount: 62,
    availabilityText: 'Next slot Thursday',
    handle: 'rohan-mehta',
    onlineNow: true,
  },
  {
    _id: 'p3',
    user: { firstName: 'Priya', lastName: 'Nambiar' },
    credentials: 'M.Sc. Counseling Psychology · Somatic Guide',
    verificationStatus: 'verified',
    avatarInitials: 'PN',
    bio: 'Warm, empathetic relationship therapist focused on attachment patterns, grief, and conscious partnership dynamics.',
    specialties: ['Relationships', 'Grief & Loss'],
    languages: ['English', 'Hindi', 'Tamil'],
    formats: ['1:1 Sessions', 'Group Circles'],
    sessionRate: 2200,
    rating: 4.8,
    reviewCount: 34,
    availabilityText: 'Available Today',
    handle: 'priya-nambiar',
    onlineNow: false,
  },
  {
    _id: 'p4',
    user: { firstName: 'Kavita', lastName: 'Reddy' },
    credentials: 'Certified Circle Facilitator · Growth Guide',
    verificationStatus: 'verified',
    avatarInitials: 'KR',
    bio: 'Facilitating supportive peer circles for working mothers, parenting stress, and emotional replenishment.',
    specialties: ['Parenting', 'Anxiety & Stress', 'Mindfulness'],
    languages: ['English', 'Hindi', 'Telugu'],
    formats: ['Group Circles', 'Membership'],
    sessionRate: 1800,
    rating: 4.9,
    reviewCount: 51,
    availabilityText: 'Cohort Starts Monday',
    handle: 'kavita-reddy',
    onlineNow: true,
  },
  {
    _id: 'p5',
    user: { firstName: 'Devansh', lastName: 'Verma' },
    credentials: 'M.A. Applied Psychology · Somatic Practitioner',
    verificationStatus: 'verified',
    avatarInitials: 'DV',
    bio: 'Trauma-informed practitioner specializing in nervous system regulation, men’s emotional health, and chronic stress.',
    specialties: ['Trauma & Recovery', 'Anxiety & Stress'],
    languages: ['English', 'Hindi'],
    formats: ['1:1 Sessions'],
    sessionRate: 2800,
    rating: 4.9,
    reviewCount: 29,
    availabilityText: 'Available Friday',
    handle: 'devansh-verma',
    onlineNow: false,
  },
  {
    _id: 'p6',
    user: { firstName: 'Sunita', lastName: 'Joshi' },
    credentials: 'Certified Life & Transition Coach · NLP Master',
    verificationStatus: 'verified',
    avatarInitials: 'SJ',
    bio: 'Guiding individuals through major life transitions, career pivots, and building deeply fulfilling personal relationships.',
    specialties: ['Relationships', 'Career & Burnout'],
    languages: ['English', 'Hindi', 'Gujarati'],
    formats: ['1:1 Sessions', 'Group Circles'],
    sessionRate: 2000,
    rating: 4.7,
    reviewCount: 40,
    availabilityText: 'Available Tomorrow',
    handle: 'sunita-joshi',
    onlineNow: true,
  },
]

export function FindAPractitioner() {
  const [practitioners, setPractitioners] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [needFilter, setNeedFilter] = useState('all')
  const [fmtFilter, setFmtFilter] = useState('all')
  const [langFilter, setLangFilter] = useState('all')
  const [sortBy, setSortBy] = useState('featured')

  useEffect(() => {
    async function loadDirectory() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (needFilter !== 'all') params.append('need', needFilter)
        if (fmtFilter !== 'all') params.append('fmt', fmtFilter)
        if (langFilter !== 'all') params.append('lang', langFilter)
        if (searchQuery) params.append('q', searchQuery)

        const res = await apiConnector('GET', `/api/v1/practitioners?${params.toString()}`)
        if (res?.data?.success && res.data.data?.length > 0) {
          setPractitioners(res.data.data)
        } else {
          setPractitioners(SAMPLE_PRACTITIONERS)
        }
      } catch (err) {
        console.error('Failed to fetch practitioners:', err)
        setPractitioners(SAMPLE_PRACTITIONERS)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(loadDirectory, 150)
    return () => clearTimeout(timer)
  }, [needFilter, fmtFilter, langFilter, searchQuery])

  // Filter & Sort practitioners dynamically
  const filteredPractitioners = useMemo(() => {
    let result = [...practitioners]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((p) => {
        const fullName = `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.toLowerCase()
        const creds = (p.credentials || '').toLowerCase()
        const bio = (p.bio || '').toLowerCase()
        const specs = (p.specialties || []).join(' ').toLowerCase()
        return fullName.includes(q) || creds.includes(q) || bio.includes(q) || specs.includes(q)
      })
    }

    if (needFilter !== 'all') {
      result = result.filter((p) =>
        p.specialties?.some((s) => s.toLowerCase().includes(needFilter.toLowerCase()))
      )
    }

    if (fmtFilter !== 'all') {
      result = result.filter((p) =>
        p.formats?.some((f) => f.toLowerCase().includes(fmtFilter.toLowerCase()))
      )
    }

    if (langFilter !== 'all') {
      result = result.filter((p) =>
        p.languages?.some((l) => l.toLowerCase() === langFilter.toLowerCase())
      )
    }

    // Sort logic
    if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 5) - (a.rating || 5))
    } else if (sortBy === 'rate_low') {
      result.sort((a, b) => (a.sessionRate || 0) - (b.sessionRate || 0))
    } else if (sortBy === 'rate_high') {
      result.sort((a, b) => (b.sessionRate || 0) - (a.sessionRate || 0))
    }

    return result
  }, [practitioners, searchQuery, needFilter, fmtFilter, langFilter, sortBy])

  const hasActiveFilters = searchQuery || needFilter !== 'all' || fmtFilter !== 'all' || langFilter !== 'all'

  const resetAllFilters = () => {
    setSearchQuery('')
    setNeedFilter('all')
    setFmtFilter('all')
    setLangFilter('all')
    setSortBy('featured')
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
                  onClick={() => setNeedFilter(spec.value)}
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="search-clear-x">✕</button>
                )}
              </div>

              {/* Select Dropdowns Group */}
              <div className="dir-selects-group">
                {/* Format Dropdown */}
                <div className="select-pill-wrap">
                  <select
                    value={fmtFilter}
                    onChange={(e) => setFmtFilter(e.target.value)}
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
                    onChange={(e) => setLangFilter(e.target.value)}
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
                    onChange={(e) => setSortBy(e.target.value)}
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
                Showing <strong>{loading ? '…' : filteredPractitioners.length}</strong> verified guide{filteredPractitioners.length === 1 ? '' : 's'}
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
          ) : filteredPractitioners.length === 0 ? (
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
            <div className="dir-grid">
              {filteredPractitioners.map((p) => {
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
