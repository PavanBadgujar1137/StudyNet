import { useEffect, useState } from "react"
import { AiOutlineMenu, AiOutlineShoppingCart } from "react-icons/ai"
import { BsChevronDown } from "react-icons/bs"
import { useSelector } from "react-redux"
import { Link, matchPath, useLocation } from "react-router-dom"

import { NavbarLinks } from "../../data/navbar-links"
import logoIcon from "../../assets/Logo/Logo-Icon.png"
import { apiConnector } from "../../services/apiConnector"
import { categories } from "../../services/apis"
import { ACCOUNT_TYPE } from "../../utils/constants"
import ProfileDropdown from "../core/Auth/ProfileDropdown"

function Navbar() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { totalItems } = useSelector((state) => state.cart)
  const location = useLocation()

  const [subLinks, setSubLinks] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API)
        setSubLinks(res?.data?.data ?? [])
      } catch (error) {
        console.log("Could not fetch Categories.", error)
        setSubLinks([])
      }
      setLoading(false)
    })()
  }, [])

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  return (
    <header className="sticky top-0 z-[1000] w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="flex h-16 w-full items-center justify-between px-6 md:px-12">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group transition-transform duration-300 hover:scale-105">
          <img src={logoIcon} alt="OpenHand Logo" className="h-8 md:h-9 w-auto object-contain" />
          <span className="font-fraunces text-xl md:text-2xl font-bold tracking-tight text-navy leading-none">
            Open<span className="text-royal-blue">Hand</span>
          </span>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:block">
          <ul className="flex gap-x-8 text-slate-600 font-medium">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                <Link to={link?.path} className="relative py-2 block group">
                  <p
                    className={`${
                      matchRoute(link?.path)
                        ? "text-royal-blue font-semibold"
                        : "text-slate-700 hover:text-royal-blue"
                    } transition-colors duration-200`}
                  >
                    {link.title}
                  </p>
                  <span 
                    className={`absolute bottom-0 left-0 h-[2px] bg-royal-blue transition-all duration-300 ${
                      matchRoute(link?.path) ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Login / Signup / Dashboard */}
        <div className="hidden items-center gap-x-4 md:flex">
          {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
            <Link to="/dashboard/cart" className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
              <AiOutlineShoppingCart className="text-2xl text-slate-700 hover:text-royal-blue transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-royal-blue text-center text-xs font-bold text-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>
          )}
          {token === null && (
            <Link to="/login">
              <button className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-navy hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 hover:scale-95">
                Log in
              </button>
            </Link>
          )}
          {token === null && (
            <Link to="/signup">
              <button className="rounded-full bg-royal-blue px-5 py-2 text-sm font-semibold text-white hover:bg-royal-blue/90 hover:shadow-md hover:shadow-blue-200/50 transition-all duration-200 hover:scale-95">
                Sign up
              </button>
            </Link>
          )}
          {token !== null && <ProfileDropdown />}
        </div>
        <button className="mr-4 p-2 rounded-full hover:bg-slate-100 md:hidden transition-colors">
          <AiOutlineMenu fontSize={24} fill="#0D1B3D" />
        </button>
      </div>
    </header>
  )
}

export default Navbar
