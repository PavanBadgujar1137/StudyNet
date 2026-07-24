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

const LINKS = [
  { 
    group: 'PRODUCT',      
    items: [
      { label: 'Pricing',           to: '/pricing' },
      { label: 'Find a practitioner', to: '/find-a-practitioner' },
      { label: 'Co-pilot AI',       to: '/co-pilot', badge: 'AI' },
      { label: 'Client journey',    to: '/client-journey' },
    ]
  },
  { 
    group: 'FOR PRACTITIONERS', 
    items: [
      { label: 'Start free',        to: '/start-free', badge: 'Free' },
      { label: 'For organizations', to: '/for-organizations' },
      { label: 'Talk to a human',   to: '/talk-to-human' },
      { label: 'Onboarding',        to: '/onboarding/practitioner' },
    ]
  },
  { 
    group: 'RESOURCES', 
    items: [
      { label: 'Platform Status',   to: '/start-free' },
      { label: 'Documentation',     to: '/co-pilot' },
      { label: 'Community',         to: '/find-a-practitioner' },
      { label: 'Help & Support',    to: '/talk-to-human' },
    ]
  },
  { 
    group: 'LEGAL',        
    items: [
      { label: 'Privacy policy',    to: '/pricing' },
      { label: 'Terms of service',  to: '/pricing' },
      { label: 'Data & consent',    to: '/pricing' },
      { label: 'Security',          to: '/pricing' },
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
    <footer 
      className="oh-footer relative w-full overflow-hidden font-sans mt-16"
      style={{
        backgroundColor: '#070D1B',
        background: 'linear-gradient(180deg, #09132C 0%, #030712 100%)',
        borderTop: '2px solid #2563EB',
        color: '#FFFFFF',
        display: 'block',
        position: 'relative',
        zIndex: 50
      }}
      role="contentinfo"
    >
      {/* Top Gradient Accent Line */}
      <div 
        className="absolute top-0 left-0 right-0 h-[3px] z-10"
        style={{
          background: 'linear-gradient(90deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%)'
        }}
      />

      {/* Background Glow Effect */}
      <div 
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none blur-3xl opacity-25"
        style={{ background: 'radial-gradient(circle, #2563EB 0%, rgba(37,99,235,0) 70%)' }}
      />
      <div 
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full pointer-events-none blur-3xl opacity-25"
        style={{ background: 'radial-gradient(circle, #3B82F6 0%, rgba(59,130,246,0) 70%)' }}
      />

      {/* Main Container */}
      <div className="relative z-10 max-w-[1340px] mx-auto px-6 sm:px-8 pt-16 pb-12">
        
        {/* Main Grid: Brand & Links */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-blue-900/50">
          
          {/* Brand Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Link to="/" className="inline-flex items-center group w-fit" aria-label="OpenHand home">
              <OHLogo variant="full-color" size={38} />
            </Link>

            <h4 className="text-2xl font-black tracking-tight" style={{ color: '#FFFFFF' }}>
              Your Growth, <span style={{ color: '#60A5FA' }}>Our Guidance.</span>
            </h4>

            <p className="text-sm font-medium leading-relaxed max-w-md" style={{ color: '#E2E8F0' }}>
              The next-generation platform connecting clients with qualified practitioners — powered by intelligent co-pilot tools.
            </p>

            {/* Platform Status Indicator Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border w-fit mt-1" style={{ backgroundColor: '#0F172A', borderColor: '#3B82F6' }}>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10B981] animate-pulse" />
              <span className="text-xs font-semibold" style={{ color: '#FFFFFF' }}>
                <strong style={{ color: '#FFFFFF' }}>1,200+</strong> Practitioners Active on <span className="font-bold" style={{ color: '#60A5FA' }}>openhand.live</span>
              </span>
            </div>

            {/* Initiative Tag */}
            <div className="flex items-center text-xs font-medium gap-1.5 mt-1" style={{ color: '#CBD5E1' }}>
              <FiGlobe style={{ color: '#60A5FA' }} />
              <span>A Magnificent U initiative, built by <strong className="font-bold" style={{ color: '#60A5FA' }}>Zweibel AI</strong>.</span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-2">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-base hover:-translate-y-1 transition-all duration-200 shadow-md"
                  style={{ backgroundColor: '#0F172A', border: '1px solid #3B82F6', color: '#60A5FA' }}
                  aria-label={label}
                  title={label}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Grid (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {LINKS.map((group) => (
              <div key={group.group} className="flex flex-col gap-4">
                <div>
                  <h5 className="text-sm font-extrabold tracking-wider font-mono uppercase" style={{ color: '#60A5FA' }}>
                    {group.group}
                  </h5>
                  <div className="w-8 h-[3px] rounded-full mt-2" style={{ backgroundColor: '#2563EB' }} />
                </div>

                <ul className="flex flex-col gap-3">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <Link 
                        to={item.to} 
                        className="inline-flex items-center gap-2 text-sm font-semibold hover:translate-x-1 transition-all duration-200"
                        style={{ color: '#FFFFFF' }}
                      >
                        <span className="hover:text-blue-400">{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{
                            backgroundColor: item.badge === 'AI' ? '#3B82F6' : '#10B981',
                            color: '#FFFFFF'
                          }}>
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

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs font-semibold" style={{ color: '#E2E8F0' }}>
          <div className="flex flex-wrap items-center gap-2 text-center sm:text-left">
            <span>© {new Date().getFullYear()} <strong className="font-bold" style={{ color: '#FFFFFF' }}>OpenHand</strong> · All rights reserved.</span>
            <span className="hidden sm:inline text-blue-500">•</span>
            <span className="inline-flex items-center gap-1.5">
              Crafted with <FiHeart className="text-red-500 animate-pulse" /> by <strong style={{ color: '#60A5FA' }}>Zweibel AI</strong>
            </span>
          </div>

          <div>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold hover:-translate-y-0.5 transition-all duration-200 shadow-md"
              style={{ backgroundColor: '#0F172A', borderColor: '#3B82F6', color: '#FFFFFF' }}
              aria-label="Back to top"
              type="button"
            >
              <span>Back to top</span>
              <FiArrowUp className="text-sm" style={{ color: '#60A5FA' }} />
            </button>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default OHFooter
