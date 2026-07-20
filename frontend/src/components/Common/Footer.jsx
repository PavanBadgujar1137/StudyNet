import React, { useState } from "react";
import { Link } from "react-router-dom";
import logoIcon from "../../assets/Logo/Logo-Icon.png";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaArrowRight, FaCheck } from "react-icons/fa";

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

  return (
    <footer className="bg-white/80 border border-line/65 rounded-[32px] md:rounded-[48px] text-navy shadow-[0_8px_32px_rgba(13,27,61,0.03)] mx-auto w-[95%] mb-8 p-8 md:p-12 mt-16 backdrop-blur-md relative overflow-hidden">
      {/* Decorative subtle gradient glows */}
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-violet/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-royal-blue/5 blur-[80px] pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row justify-between gap-12 relative z-10">
        {/* Left column: Brand, tagline, and Newsletter */}
        <div className="flex flex-col gap-6 max-w-sm">
          <Link to="/" className="flex items-center gap-2 group w-fit transition-transform duration-300 hover:scale-105">
            <img src={logoIcon} alt="OpenHand Logo" className="h-8 md:h-9 w-auto object-contain" />
            <span className="text-xl md:text-2xl font-bold tracking-tight text-navy leading-none">
              Open<span className="text-royal-blue">Hand</span>
            </span>
          </Link>

          <p className="text-sm text-ink-soft leading-relaxed -mt-1.5">
            The next-generation online learning and practice platform. High-definition video streaming, interactive quizzes, progress tracking, and automated completion certificates.
          </p>

          {/* Dynamic Newsletter Subscription Box */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-royal-blue">Stay Updated on OpenHand</h4>
            {subscribed ? (
              <div className="flex items-center gap-2 text-royal-blue text-sm font-semibold py-2 animate-float">
                <FaCheck />
                Thank you for subscribing to OpenHand!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center bg-paper border border-line/80 rounded-full p-1 focus-within:border-royal-blue focus-within:ring-2 focus-within:ring-royal-blue/15 transition-all duration-300">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-transparent text-sm text-navy placeholder:text-ink-soft/40 focus:outline-none pl-4 pr-2 py-2 flex-grow min-w-0"
                  required
                />
                <button
                  type="submit"
                  className="bg-royal-blue hover:bg-royal-blue/90 text-white rounded-full p-2.5 flex items-center justify-center transition-all duration-200 hover:scale-95 shadow-md shadow-blue-500/10"
                >
                  <FaArrowRight className="text-xs" />
                </button>
              </form>
            )}

            {/* Social Media Links */}
            <div className="flex items-center gap-3 mt-2 text-ink-soft">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-paper flex items-center justify-center hover:bg-royal-blue hover:text-white transition-all duration-200">
                <FaFacebook className="text-xs" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-paper flex items-center justify-center hover:bg-royal-blue hover:text-white transition-all duration-200">
                <FaTwitter className="text-xs" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-paper flex items-center justify-center hover:bg-royal-blue hover:text-white transition-all duration-200">
                <FaInstagram className="text-xs" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-paper flex items-center justify-center hover:bg-royal-blue hover:text-white transition-all duration-200">
                <FaLinkedin className="text-xs" />
              </a>
            </div>
          </div>
        </div>

        {/* Right column: Navigation Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-16">
          <div>
            <h3 className="font-semibold text-navy text-xs uppercase tracking-widest mb-5">Platform</h3>
            <ul className="flex flex-col gap-3 text-sm text-ink-soft">
              <li><Link to="/catalog/web-development" className="hover:text-royal-blue hover:translate-x-1.5 transition-all duration-200 inline-block">Web Development</Link></li>
              <li><Link to="/catalog/data-science" className="hover:text-royal-blue hover:translate-x-1.5 transition-all duration-200 inline-block">Data Science</Link></li>
              <li><Link to="/catalog/ui-ux-design" className="hover:text-royal-blue hover:translate-x-1.5 transition-all duration-200 inline-block">UI/UX Design</Link></li>
              <li><Link to="/about" className="hover:text-royal-blue hover:translate-x-1.5 transition-all duration-200 inline-block">About OpenHand</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-navy text-xs uppercase tracking-widest mb-5">Resources</h3>
            <ul className="flex flex-col gap-3 text-sm text-ink-soft">
              <li><a href="/" className="hover:text-royal-blue hover:translate-x-1.5 transition-all duration-200 inline-block">Course Catalog</a></li>
              <li><a href="/" className="hover:text-royal-blue hover:translate-x-1.5 transition-all duration-200 inline-block">Student Forum</a></li>
              <li><a href="/" className="hover:text-royal-blue hover:translate-x-1.5 transition-all duration-200 inline-block">Help Center</a></li>
              <li><a href="/" className="hover:text-royal-blue hover:translate-x-1.5 transition-all duration-200 inline-block">Certificates</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-navy text-xs uppercase tracking-widest mb-5">Legal</h3>
            <ul className="flex flex-col gap-3 text-sm text-ink-soft">
              <li><Link to="/privacy-policy" className="hover:text-royal-blue hover:translate-x-1.5 transition-all duration-200 inline-block">Privacy Policy</Link></li>
              <li><Link to="/cookie-policy" className="hover:text-royal-blue hover:translate-x-1.5 transition-all duration-200 inline-block">Cookie Policy</Link></li>
              <li><Link to="/terms" className="hover:text-royal-blue hover:translate-x-1.5 transition-all duration-200 inline-block">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line/60 py-6 mt-12 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-ink-soft/70 gap-4">
          <p>© 2026 OpenHand. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Empowering students &amp; instructors worldwide · <span className="text-ink-soft hover:text-royal-blue transition-colors cursor-pointer">openhand.live</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
