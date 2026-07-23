/**
 * OpenHand — Footer
 */
import React from 'react'
import { Link } from 'react-router-dom'
import OHLogo from './OHLogo'
import { 
  FaTwitter, 
  FaLinkedin, 
  FaGithub, 
  FaYoutube, 
  FaDiscord 
} from 'react-icons/fa'
import { 
  FiArrowUp, 
  FiGlobe, 
  FiHeart 
} from 'react-icons/fi'
import './OHFooter.css'

const LINKS = [
  { 
    group: 'Product',      
    items: [
      { label: 'Pricing',           to: '/pricing' },
      { label: 'Find a practitioner', to: '/find-a-practitioner' },
      { label: 'Co-pilot AI',       to: '/co-pilot', badge: 'AI' },
      { label: 'Client journey',    to: '/client-journey' },
    ]
  },
  { 
    group: 'For practitioners', 
    items: [
      { label: 'Start free',        to: '/start-free', badge: 'Free' },
      { label: 'For organizations', to: '/for-organizations' },
      { label: 'Talk to a human',   to: '/talk-to-human' },
      { label: 'Onboarding',        to: '/onboarding' },
    ]
  },
  { 
    group: 'Resources', 
    items: [
      { label: 'Platform Status',   to: '/start-free' },
      { label: 'Documentation',     to: '/co-pilot' },
      { label: 'Community',         to: '/find-a-practitioner' },
      { label: 'Help & Support',    to: '/talk-to-human' },
    ]
  },
  { 
    group: 'Legal',        
    items: [
      { label: 'Privacy policy',    to: '/privacy' },
      { label: 'Terms of service',  to: '/terms' },
      { label: 'Data & consent',    to: '/data-consent' },
      { label: 'Security',          to: '/security' },
    ]
  },
]

const SOCIAL_LINKS = [
  { icon: FaTwitter, href: 'https://twitter.com', label: 'Twitter / X' },
  { icon: FaLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: FaGithub, href: 'https://github.com', label: 'GitHub' },
  { icon: FaYoutube, href: 'https://youtube.com', label: 'YouTube' },
  { icon: FaDiscord, href: 'https://discord.com', label: 'Discord' },
]

export function OHFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="oh-footer" role="contentinfo">
      {/* Glow ambient background elements */}
      <div className="oh-footer__glow oh-footer__glow--left" aria-hidden="true" />
      <div className="oh-footer__glow oh-footer__glow--right" aria-hidden="true" />

      {/* Accent top gradient border line */}
      <div className="oh-footer__top-accent" aria-hidden="true" />

      {/* Main Footer Container */}
      <div className="oh-wrap oh-footer__container">

        {/* ── Main Grid: Brand + Navigation Columns ── */}
        <div className="oh-footer__main-grid">

          {/* Brand Column */}
          <div className="oh-footer__brand">
            <Link to="/" className="oh-footer__logo-link" aria-label="OpenHand home">
              <OHLogo variant="full-color" size={36} className="oh-footer__logo-mark" />
            </Link>

            <h4 className="oh-footer__tagline">
              Your Growth, <span className="oh-footer__tagline-accent">Our Guidance.</span>
            </h4>

            <p className="oh-footer__sub">
              The next-generation platform connecting clients with qualified practitioners — powered by intelligent co-pilot tools.
            </p>

            {/* Platform Status Indicator Badge */}
            <div className="oh-footer__status-badge">
              <span className="oh-footer__status-dot" aria-hidden="true" />
              <span className="oh-footer__status-text">
                <strong>1,200+</strong> Practitioners Active on <span className="oh-footer__status-domain">openhand.live</span>
              </span>
            </div>

            {/* Initiative Tag */}
            <div className="oh-footer__initiative-tag">
              <FiGlobe style={{ marginRight: 6 }} />
              A Magnificent U initiative, built by <strong>Zweibel AI</strong>.
            </div>

            {/* Social Links */}
            <div className="oh-footer__socials">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="oh-footer__social-btn"
                  aria-label={label}
                  title={label}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="oh-footer__nav-grid">
            {LINKS.map((group) => (
              <div key={group.group} className="oh-footer__col">
                <h5 className="oh-footer__col-head">{group.group}</h5>
                <ul className="oh-footer__col-list">
                  {group.items.map((item) => (
                    <li key={item.label} className="oh-footer__col-item">
                      <Link to={item.to} className="oh-footer__link">
                        <span className="oh-footer__link-text">{item.label}</span>
                        {item.badge && (
                          <span className={`oh-footer__pill oh-footer__pill--${item.badge.toLowerCase()}`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* ── Bottom Bar ── */}
        <div className="oh-footer__bottom">
          <div className="oh-footer__bottom-left">
            <p className="oh-footer__copyright">
              © {new Date().getFullYear()} <strong>OpenHand</strong> · All rights reserved.
            </p>
            <span className="oh-footer__divider" aria-hidden="true">•</span>
            <span className="oh-footer__made">
              Crafted with <FiHeart className="oh-footer__heart-icon" /> by Zweibel AI
            </span>
          </div>

          <div className="oh-footer__bottom-right">
            <button
              onClick={scrollToTop}
              className="oh-footer__back-top-btn"
              aria-label="Back to top"
              type="button"
            >
              <span>Back to top</span>
              <FiArrowUp className="oh-footer__back-top-icon" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default OHFooter
