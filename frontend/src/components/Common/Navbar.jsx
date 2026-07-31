import { useState, useEffect } from "react"
import { AiOutlineMenu } from "react-icons/ai"
import { FiX } from "react-icons/fi"
import { useSelector } from "react-redux"
import { Link, matchPath, useLocation } from "react-router-dom"

import { NavbarLinks } from "../../data/navbar-links"
import logoIcon from "../../assets/Logo/Logo-Icon.png"
import ProfileDropdown from "../core/Auth/ProfileDropdown"

function Navbar() {
  const { token } = useSelector((state) => state.auth)
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  const isDashboardRoute =
    location.pathname.startsWith("/app") ||
    location.pathname.startsWith("/practice") ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/org")

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <header className={`sticky top-0 z-[1000] w-full border-b border-white/40 bg-white/80 backdrop-blur-xl shadow-sm transition-all duration-300 ${isDashboardRoute ? "hidden lg:block" : ""}`}>
      <div className="relative flex h-16 md:h-18 w-full items-center justify-between px-4 md:px-8 max-w-[1440px] mx-auto py-2">
        {/* Left Side: Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2.5 group transition-transform duration-200 hover:opacity-90">
            <img src={logoIcon} alt="OpenHand Logo" className="h-9 md:h-10 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-bold tracking-tight text-navy leading-none">
                Open<span className="bg-gradient-to-r from-royal-blue to-violet bg-clip-text text-transparent">Hand</span>
              </span>
              <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-royal-blue/70">Your Growth, Our Guidance.</span>
            </div>
          </Link>
        </div>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="hidden lg:block">
          <ul className="flex items-center gap-x-4 xl:gap-x-6 text-slate-700 font-semibold text-xs xl:text-sm whitespace-nowrap">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                <Link to={link?.path} className="relative py-2 block group min-h-[44px] flex items-center">
                  <p
                    className={`${
                      matchRoute(link?.path)
                        ? "text-royal-blue font-bold"
                        : "text-slate-700 hover:text-royal-blue"
                    } transition-colors duration-200`}
                  >
                    {link.title}
                  </p>
                  <span 
                    className={`absolute bottom-0 left-0 h-[2.5px] rounded-full bg-gradient-to-r from-royal-blue to-violet transition-all duration-300 ${
                      matchRoute(link?.path) ? "w-full shadow-sm shadow-royal-blue/50" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Side: Login, Signup & Profile Icon */}
        <div className="flex items-center gap-x-3">
          {token === null && (
            <div className="hidden sm:flex items-center gap-x-3">
              <Link to="/login">
                <button className="min-h-[44px] rounded-full border border-royal-blue/30 bg-white/80 px-5 py-2 text-sm font-bold text-navy hover:bg-royal-blue/5 hover:border-royal-blue transition-all duration-300 hover:scale-95 shadow-sm">
                  Log in
                </button>
              </Link>
              <Link to="/signup">
                <button className="min-h-[44px] btn-shimmer rounded-full bg-gradient-to-r from-royal-blue via-blue-600 to-violet px-5 py-2 text-sm font-bold text-white hover:opacity-95 hover:shadow-xl hover:shadow-royal-blue/25 transition-all duration-300 hover:scale-105 animate-neon-pulse">
                  Start Free
                </button>
              </Link>
            </div>
          )}
          {token !== null && <ProfileDropdown />}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2.5 rounded-2xl hover:bg-slate-100 lg:hidden transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-800"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <FiX fontSize={24} /> : <AiOutlineMenu fontSize={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Panel & Backdrop */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 top-[64px] bg-slate-900/50 backdrop-blur-sm z-[1040] lg:hidden transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Full-width Dropdown Container */}
          <div className="absolute top-full left-0 right-0 w-full bg-white border-b border-slate-200 shadow-2xl p-5 z-[1050] lg:hidden overflow-y-auto max-h-[calc(100vh-70px)] transition-all duration-300">
            <nav>
              <ul className="flex flex-col gap-y-1.5">
                {NavbarLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link?.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 min-h-[44px] ${
                        matchRoute(link?.path)
                          ? "bg-royal-blue/10 text-royal-blue font-bold"
                          : "text-slate-700 hover:bg-slate-50 hover:text-royal-blue"
                      }`}
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile Auth Controls */}
            {token === null && (
              <div className="pt-5 mt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <button className="w-full min-h-[44px] rounded-xl border border-royal-blue/30 bg-white py-2.5 text-center text-sm font-bold text-navy hover:bg-royal-blue/5">
                    Log in
                  </button>
                </Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <button className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-royal-blue via-blue-600 to-violet py-2.5 text-center text-sm font-bold text-white shadow-md">
                    Start Free
                  </button>
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  )
}

export default Navbar

