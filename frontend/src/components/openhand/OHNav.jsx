/**
 * OpenHand — Navbar Component
 * Sticky, backdrop-blur, gradient brand mark.
 * Reads auth state from Redux to show role-appropriate links.
 */
import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import OHLogo from './OHLogo'
import OHButton from './OHButton'
import { logout } from '../../services/operations/authAPI'

const PUBLIC_LINKS = [
  { label: 'Home',                to: '/' },
  { label: 'For organizations',   to: '/for-organizations' },
  { label: 'Find a practitioner', to: '/find-a-practitioner' },
  { label: 'Talk to human',       to: '/talk-to-human' },
  { label: 'Client journey',      to: '/client-journey' },
  { label: 'Start free',          to: '/start-free' },
  { label: 'Co-pilot',            to: '/co-pilot' },
  { label: 'Pricing',             to: '/pricing' },
]

const CLIENT_LINKS = [
  { label: 'My journey', to: '/app/journey' },
  { label: 'Check-in',   to: '/app/checkin' },
  { label: 'My circle',  to: '/app/circle' },
  { label: 'Sessions',   to: '/app/sessions' },
  { label: 'Reflections',to: '/app/reflections' },
]

const PRACTITIONER_LINKS = [
  { label: 'Dashboard', to: '/practice/dashboard' },
  { label: 'My offers', to: '/practice/offers' },
  { label: 'Clients',   to: '/practice/clients' },
  { label: 'Circles',   to: '/practice/circles' },
  { label: 'Payouts',   to: '/practice/payouts' },
]

export function OHNav({ dark = false }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { token, user } = useSelector((s) => s.auth)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Detect scroll for shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  const role = user?.accountType
  const links = role === 'Practitioner' ? PRACTITIONER_LINKS
              : role === 'Client'       ? CLIENT_LINKS
              : PUBLIC_LINKS

  const handleLogout = () => {
    dispatch(logout(navigate))
  }

  return (
    <nav
      className={[
        'oh-nav',
        dark ? 'oh-nav--dark' : '',
        scrolled ? 'oh-nav--scrolled' : '',
      ].filter(Boolean).join(' ')}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="oh-nav__inner oh-wrap">
        {/* Logo */}
        <Link to="/" className="oh-nav__brand" aria-label="OpenHand home">
          <OHLogo variant={dark ? 'white-on-navy' : 'full-color'} size={32} />
        </Link>

        {/* Desktop links */}
        <ul className="oh-nav__links">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className={[
                  'oh-nav__link',
                  pathname.startsWith(l.to) ? 'oh-nav__link--active' : '',
                ].filter(Boolean).join(' ')}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right CTA */}
        <div className="oh-nav__cta">
          {token ? (
            <div className="oh-nav__user">
              <span className="oh-nav__avatar" title={user?.firstName}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
              <button className="oh-nav__logout" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="oh-nav__link oh-nav__link--login">Log in</Link>
              <OHButton href="/start-free" size="sm">
                Start free
              </OHButton>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`oh-nav__burger ${menuOpen ? 'oh-nav__burger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="oh-nav__drawer" role="menu">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="oh-nav__drawer-link"
              role="menuitem"
            >
              {l.label}
            </Link>
          ))}
          <div className="oh-nav__drawer-cta">
            {token ? (
              <button className="oh-btn oh-btn--ghost oh-btn--full" onClick={handleLogout}>
                Sign out
              </button>
            ) : (
              <>
                <Link to="/login" className="oh-btn oh-btn--ghost oh-btn--full">Log in</Link>
                <OHButton href="/start-free" fullWidth>Start free</OHButton>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default OHNav
