import React, { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Link, matchPath, useLocation } from "react-router-dom"
import { AiOutlineMenu } from "react-icons/ai"
import { FiX } from "react-icons/fi"

import { NavbarLinks } from "../../data/navbar-links"
import logoIcon from "../../assets/Logo/Logo-Icon.png"
import ProfileDropdown from "../core/Auth/ProfileDropdown"

export function Navbar() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const location = useLocation()

  const [scrolled, setScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  const isDashboardRoute =
    location.pathname.startsWith("/app") ||
    location.pathname.startsWith("/practice") ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/org")

  if (isDashboardRoute) {
    return null
  }

  return (
    <>
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center justify-between gap-4 md:gap-7 py-2 px-3 sm:px-4 pl-4 sm:pl-5 rounded-full border transition-all duration-300 w-max max-w-[calc(100vw-32px)] ${
          scrolled
            ? "bg-white/85 shadow-[0_14px_40px_-14px_rgba(29,33,169,0.3)] border-[#E3E6F6]/95 backdrop-blur-xl"
            : "bg-white/75 shadow-[0_1px_2px_rgba(13,24,69,0.04),0_12px_40px_-12px_rgba(29,33,169,0.18)] border-[#E3E6F6]/90 backdrop-blur-xl"
        }`}
        style={{
          fontFamily: "'Outfit', 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
        }}
      >
        {/* Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <img
            src={logoIcon}
            alt="OpenHand"
            className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <span className="font-semibold text-lg sm:text-[19px] tracking-tight text-[#0D1845] flex items-center leading-none">
            Open
            <b
              className="font-semibold"
              style={{
                background: "linear-gradient(90deg, #4423CC, #9137EF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Hand
            </b>
          </span>
        </Link>

        {/* Primary Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7" aria-label="Primary">
          {NavbarLinks.map((link, index) => {
            const isActive = matchRoute(link?.path)
            const isFindPractitioner = link?.path === "/find-a-practitioner"
            const shouldOpenNewTab = isFindPractitioner && token && user?.accountType === "Practitioner"

            return (
              <Link
                key={index}
                to={link?.path}
                target={shouldOpenNewTab ? "_blank" : "_self"}
                rel={shouldOpenNewTab ? "noopener noreferrer" : undefined}
                className="relative py-1 text-[14.5px] font-semibold transition-colors duration-200"
                style={{
                  color: isActive ? "#0D1845" : "#4A5378",
                }}
              >
                <span className="hover:text-[#0D1845] transition-colors">
                  {link.title}
                </span>
                {isActive && (
                  <span
                    className="absolute -bottom-1.5 left-0 right-0 h-[2px] rounded-full"
                    style={{
                      background: "linear-gradient(100deg, #0C6DFF 0%, #2F3BE0 45%, #5B2FE0 70%, #9137EF 100%)",
                    }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right CTA / Auth Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {token === null ? (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center justify-center px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#4A5378] hover:text-[#0D1845] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap"
                style={{
                  background: "linear-gradient(100deg, #0C6DFF 0%, #2F3BE0 45%, #5B2FE0 70%, #9137EF 100%)",
                  boxShadow: "0 10px 30px -10px rgba(47, 59, 224, 0.7)",
                }}
              >
                <span>Start Free</span>
                <span className="ml-1">→</span>
              </Link>
            </div>
          ) : (
            <ProfileDropdown />
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-full text-[#0D1845] hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <FiX size={20} /> : <AiOutlineMenu size={20} />}
          </button>
        </div>
      </header>

      {/* Layout spacer ensuring fixed floating navbar never overlaps page content */}
      <div className="h-16 md:h-20 w-full shrink-0 pointer-events-none" aria-hidden="true" />

      {/* Floating Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[998] lg:hidden transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-20 left-4 right-4 z-[999] bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 shadow-2xl lg:hidden max-w-md mx-auto animate-in fade-in zoom-in-95 duration-200">
            <nav className="flex flex-col gap-1.5 mb-4">
              {NavbarLinks.map((link, index) => {
                const isActive = matchRoute(link?.path)
                return (
                  <Link
                    key={index}
                    to={link?.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                      isActive
                        ? "bg-blue-50 text-[#0C6DFF]"
                        : "text-[#4A5378] hover:text-[#0D1845] hover:bg-slate-50"
                    }`}
                  >
                    {link.title}
                  </Link>
                )
              })}
            </nav>

            {token === null && (
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center rounded-full border border-slate-200 text-sm font-bold text-[#0D1845]"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center rounded-full text-sm font-bold text-white shadow-md"
                  style={{
                    background: "linear-gradient(100deg, #0C6DFF 0%, #2F3BE0 45%, #5B2FE0 70%, #9137EF 100%)",
                  }}
                >
                  Start Free Practice
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}

export default Navbar
