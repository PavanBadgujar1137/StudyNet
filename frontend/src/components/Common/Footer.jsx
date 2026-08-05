import React, { useState } from "react";
import { Link } from "react-router-dom";
import logoIcon from "../../assets/Logo/Logo-Icon.png";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FiArrowRight, FiCheck, FiMail, FiHeart } from "react-icons/fi";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const navLinks = {
    Platform: [
      { label: "Home", to: "/" },
      { label: "For Organizations", to: "/for-organizations" },
      { label: "Find a Practitioner", to: "/find-a-practitioner" },
      { label: "Practitioner Journey", to: "/practitioner-journey" },
      { label: "Pricing", to: "/pricing" },
      { label: "Contact Us", to: "/contact-us" },
      { label: "AURA AI", to: "/aura" },
    ],
    Resources: [
      { label: "Platform Status", to: "/platform-status" },
      { label: "Documentation", to: "/documentation" },
      { label: "Community", to: "/community" },
      { label: "Help & Support", to: "/help-support" },
      // { label: "Start Free", to: "/start-free" },
    ],
    Legal: [
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Terms of Service", to: "/terms-of-service" },
      { label: "Data & Consent", to: "/data-consent" },
      { label: "Security", to: "/security" },
    ],
  };

  const socials = [
    { Icon: FaFacebook, href: "https://facebook.com", label: "Facebook" },
    { Icon: FaTwitter, href: "https://twitter.com", label: "Twitter" },
    { Icon: FaInstagram, href: "https://www.instagram.com/openhand.live?igsh=MWNqMDhxeHFiMXZmdA%3D%3D&utm_source=qr", label: "Instagram" },
    { Icon: FaLinkedin, href: "https://www.linkedin.com/showcase/openhandai/", label: "LinkedIn" },
  ];

  return (
    <footer className="oh-footer">
      {/* Top decorative line */}
      <div className="oh-footer__topline" />

      {/* Blobs */}
      <div className="oh-footer__blob oh-footer__blob--1" />
      <div className="oh-footer__blob oh-footer__blob--2" />

      <div className="oh-footer__inner">
        {/* ── Brand Column ── */}
        <div className="oh-footer__brand">
          {/* Logo */}
          <Link to="/" className="oh-footer__logo">
            <img src={logoIcon} alt="OpenHand" className="oh-footer__logo-img" />
            <span className="oh-footer__wordmark">
              Open<span className="oh-footer__wordmark-accent">Hand</span>
            </span>
          </Link>

          <p className="oh-footer__tagline">
            The next-generation platform connecting clients with qualified
            growth practitioners — built for wellbeing, real outcomes, and human connection.
          </p>

          {/* Live badge */}
          <div className="oh-footer__live">
            <span className="oh-footer__live-dot" />
            <span>1,200+ practitioners live on openhand.live</span>
          </div>

          {/* Newsletter */}
          <div className="oh-footer__newsletter">
            <p className="oh-footer__newsletter-label">
              <FiMail style={{ marginRight: 6 }} />
              Stay updated on OpenHand
            </p>
            {subscribed ? (
              <div className="oh-footer__newsletter-success">
                <FiCheck />
                <span>You're subscribed — thank you!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="oh-footer__newsletter-form">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="oh-footer__newsletter-input"
                  required
                />
                <button type="submit" className="oh-footer__newsletter-btn" aria-label="Subscribe">
                  <FiArrowRight />
                </button>
              </form>
            )}
          </div>

          {/* Socials */}
          <div className="oh-footer__socials">
            {socials.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="oh-footer__social-btn"
                aria-label={label}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* ── Nav Columns ── */}
        <div className="oh-footer__nav-grid">
          {Object.entries(navLinks).map(([section, links]) => (
            <div key={section} className="oh-footer__nav-col">
              <h3 className="oh-footer__nav-heading">{section}</h3>
              <ul className="oh-footer__nav-list">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="oh-footer__nav-link">
                      {label}
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
        <p className="oh-footer__copy">
          © 2026 OpenHand. All rights reserved.
        </p>
        <p className="oh-footer__made">
          Made with <FiHeart className="oh-footer__heart" /> for practitioners & clients worldwide
        </p>
        <p className="oh-footer__domain">openhand.live</p>
      </div>
    </footer>
  );
};

export default Footer;
