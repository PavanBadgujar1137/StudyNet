import React, { useState, useEffect } from 'react'
import {
  OHNav,
  OHFooter,
  OHButton,
  OHEyebrow,
  OHChip,
  OHCardSkeleton,
  OHEmptyState,
} from '../../components/openhand'
import { apiConnector } from '../../services/apiConnector'
import './FindAPractitioner.css'

const NEEDS = [
  { value: 'all', label: 'Everything' },
  { value: 'anxiety', label: 'Anxiety & stress' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'grief', label: 'Grief & loss' },
  { value: 'career', label: 'Career & burnout' },
  { value: 'parenting', label: 'Parenting' },
  { value: 'trauma', label: 'Trauma' },
]

const FORMATS = [
  { value: 'all', label: 'Any' },
  { value: '1:1', label: '1:1 sessions' },
  { value: 'circle', label: 'Circles' },
  { value: 'membership', label: 'Membership' },
]

const LANGUAGES = [
  { value: 'all', label: 'Any' },
  { value: 'English', label: 'English' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Marathi', label: 'Marathi' },
  { value: 'Tamil', label: 'Tamil' },
  { value: 'Bengali', label: 'Bengali' },
]

export function FindAPractitioner() {
  const [practitioners, setPractitioners] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [needFilter, setNeedFilter] = useState('all')
  const [fmtFilter, setFmtFilter] = useState('all')
  const [langFilter, setLangFilter] = useState('all')

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
        if (res?.data?.success) {
          setPractitioners(res.data.data)
        }
      } catch (err) {
        console.error('Failed to fetch practitioners:', err)
      } finally {
        setLoading(false)
      }
    }
    const timer = setTimeout(loadDirectory, 200)
    return () => clearTimeout(timer)
  }, [needFilter, fmtFilter, langFilter, searchQuery])

  return (
    <div className="oh-dir-page">

      {/* Hero */}
      <header className="oh-dir-hero">
        <div className="oh-wrap">
          <OHEyebrow>Directory</OHEyebrow>
          <h1>
            Find someone who <span className="oh-grad-text">actually fits.</span>
          </h1>
          <p className="sub">
            Every practitioner here is verified, works on OpenHand, and shows their real availability. No agency in the middle, no matching algorithm deciding for you.
          </p>
        </div>
      </header>

      {/* Directory Content */}
      <section className="oh-sec">
        <div className="oh-wrap">
          {/* Sticky Filters Bar */}
          <div className="dir-filters-card">
            <div className="filter-row">
              <input
                type="text"
                className="dir-search-input"
                placeholder="Search by name, speciality, or what you're going through…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-row">
              <span className="filter-label">Working on</span>
              <div className="chips-row">
                {NEEDS.map((n) => (
                  <OHChip
                    key={n.value}
                    label={n.label}
                    active={needFilter === n.value}
                    onClick={() => setNeedFilter(n.value)}
                  />
                ))}
              </div>
            </div>

            <div className="filter-row">
              <span className="filter-label">Format</span>
              <div className="chips-row">
                {FORMATS.map((f) => (
                  <OHChip
                    key={f.value}
                    label={f.label}
                    active={fmtFilter === f.value}
                    onClick={() => setFmtFilter(f.value)}
                  />
                ))}
              </div>
            </div>

            <div className="filter-row">
              <span className="filter-label">Language</span>
              <div className="chips-row">
                {LANGUAGES.map((l) => (
                  <OHChip
                    key={l.value}
                    label={l.label}
                    active={langFilter === l.value}
                    onClick={() => setLangFilter(l.value)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <p className="dir-count">
            <strong>{loading ? '…' : practitioners.length}</strong> practitioners available
          </p>

          {/* Practitioner Cards Grid */}
          {loading ? (
            <div className="dir-grid">
              <OHCardSkeleton />
              <OHCardSkeleton />
              <OHCardSkeleton />
            </div>
          ) : practitioners.length === 0 ? (
            <OHEmptyState
              type="no-results"
              title="No one matches all of that yet"
              body="Try removing a filter — or tell us what you were looking for and we'll find someone."
            />
          ) : (
            <div className="dir-grid">
              {practitioners.map((p) => {
                const name = `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim() || 'Practitioner'
                return (
                  <article key={p._id} className="practitioner-card">
                    <div className="p-top">
                      <div className="p-avatar">{p.avatarInitials || name.slice(0, 2).toUpperCase()}</div>
                      <div className="p-meta">
                        <h3>{name}</h3>
                        <div className="p-cred">{p.credentials}</div>
                        {p.verificationStatus === 'verified' && (
                          <span className="p-verify">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                              <path d="M20 6 9 17l-5-5"/>
                            </svg>
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="p-bio">{p.bio}</p>

                    <div className="p-tags">
                      {p.specialties?.map((t, i) => (
                        <span key={i} className="p-tag">{t}</span>
                      ))}
                    </div>

                    <div className="p-foot">
                      <div className="p-rate">
                        ₹{p.sessionRate?.toLocaleString('en-IN') || '2,500'} <small>/session</small>
                      </div>
                      <div className="p-avail">
                        <span className="avail-dot" />
                        {p.availabilityText || 'Next slot soon'}
                      </div>
                    </div>

                    <OHButton href={`/practice/handle/${p.handle || ''}`} fullWidth style={{ marginTop: 14 }}>
                      View profile &amp; book
                    </OHButton>
                  </article>
                )
              })}
            </div>
          )}

          {/* Join CTA */}
          <div className="dir-join-card">
            <h2>Every client who finds you here costs you nothing to acquire.</h2>
            <p>
              The directory is the reason practitioners stay. You keep your own clients, and we send you the ones who searched for exactly what you do — including corporate circles we've already sold and filled.
            </p>
            <div className="cta-row">
              <OHButton href="/start-free">List your practice free</OHButton>
              <OHButton href="/talk-to-human" variant="ghost">Ask how listing works →</OHButton>
            </div>
          </div>

          {/* Mandatory Disclaimer Note from source file */}
          <p className="placeholder-note">
            Practitioners shown are illustrative examples for design purposes — replace with real, consented profiles before this page goes live. Verification badges must reflect an actual credential check.
          </p>
        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default FindAPractitioner
