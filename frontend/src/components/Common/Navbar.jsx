import { AiOutlineMenu } from "react-icons/ai"
import { useSelector } from "react-redux"
import { Link, matchPath, useLocation } from "react-router-dom"

import { NavbarLinks } from "../../data/navbar-links"
import logoIcon from "../../assets/Logo/Logo-Icon.png"
import ProfileDropdown from "../core/Auth/ProfileDropdown"

function Navbar() {
  const { token } = useSelector((state) => state.auth)
  const location = useLocation()

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  return (
    <header className="sticky top-0 z-[1000] w-full border-b border-white/40 bg-white/80 backdrop-blur-xl shadow-sm transition-all duration-300">
      <div className="relative flex h-16 md:h-18 w-full items-center justify-between px-4 md:px-8 max-w-[1440px] mx-auto py-2">
        {/* Left Side: Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2.5 group transition-transform duration-200 hover:opacity-90">
            <img src={logoIcon} alt="OpenHand Logo" className="h-9 md:h-10 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-bold tracking-tight text-navy leading-none">
                Open<span className="bg-gradient-to-r from-royal-blue to-violet bg-clip-text text-transparent">Hand</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-royal-blue/70">Your Growth, Our Guidance.</span>
            </div>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:block">
          <ul className="flex items-center gap-x-4 xl:gap-x-6 text-slate-700 font-semibold text-xs xl:text-sm whitespace-nowrap">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                <Link to={link?.path} className="relative py-2 block group">
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
        <div className="flex items-center gap-x-4">
          {token === null && (
            <div className="hidden md:flex items-center gap-x-3">
              <Link to="/login">
                <button className="rounded-full border border-royal-blue/30 bg-white/80 px-5 py-2 text-sm font-bold text-navy hover:bg-royal-blue/5 hover:border-royal-blue transition-all duration-300 hover:scale-95 shadow-sm">
                  Log in
                </button>
              </Link>
              <Link to="/signup">
                <button className="btn-shimmer rounded-full bg-gradient-to-r from-royal-blue via-blue-600 to-violet px-5 py-2 text-sm font-bold text-white hover:opacity-95 hover:shadow-xl hover:shadow-royal-blue/25 transition-all duration-300 hover:scale-105 animate-neon-pulse">
                  Start Free
                </button>
              </Link>
            </div>
          )}
          {token !== null && <ProfileDropdown />}
          <button className="p-2.5 rounded-2xl hover:bg-slate-100 md:hidden transition-colors">
            <AiOutlineMenu fontSize={24} fill="#0D1B3D" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
