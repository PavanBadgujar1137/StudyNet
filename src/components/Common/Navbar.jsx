import { useEffect, useState } from "react"
import { AiOutlineClose, AiOutlineMenu, AiOutlineShoppingCart } from "react-icons/ai"
import { BsChevronDown } from "react-icons/bs"
import { useSelector } from "react-redux"
import { Link, matchPath, useLocation } from "react-router-dom"

import logo from "../../assets/Logo/onehandimagelogodark.png"
import { NavbarLinks } from "../../data/navbar-links"
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
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API)
        setSubLinks(res.data.data)
      } catch (error) {
        console.log("Could not fetch Categories.", error)
      }
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  return (
    <div className="sticky top-0 z-50 border-b border-gold-700 bg-gradient-to-r from-gold-200 via-gold-100 to-gold-200 backdrop-blur-lg shadow-lg">
      <div className="flex h-16 items-center justify-center">
        <div className="flex w-11/12 max-w-maxContent items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <img
              src={logo}
              alt="StudyNotion"
              className="object-contain"
              loading="eager"
              width={150}
              height={46}
            />
          </Link>

          {/* Navigation links */}
   <nav className="hidden md:block">
  <ul className="flex items-center gap-x-8 font-sans text-[15px] font-medium">
    {NavbarLinks.map((link, index) => (
      <li key={index}>
        {link.title === "Catalog" ? (
          <div
            className={`group relative flex cursor-pointer items-center gap-1 py-2 transition-all duration-300 ${
              matchRoute("/catalog/:catalogName")
                ? "text-black"
                : "text-ink-900 hover:text-gold-700"
            }`}
          >
            <p>{link.title}</p>

            <BsChevronDown className="text-xs transition-transform duration-300 group-hover:rotate-180" />

            {/* Dropdown */}
            <div className="invisible absolute left-1/2 top-full z-50 w-[280px] -translate-x-1/2 translate-y-3 rounded-2xl border border-gold-200 bg-white p-2 opacity-0 shadow-2xl transition-all duration-300 group-hover:visible group-hover:translate-y-4 group-hover:opacity-100">
              {loading ? (
                <p className="p-3 text-center text-sm text-ink-500">
                  Loading...
                </p>
              ) : (subLinks?.length ?? 0) > 0 ? (
                subLinks
                  ?.filter((subLink) => subLink?.courses?.length > 0)
                  ?.map((subLink, i) => (
                    <Link
                      key={i}
                      to={`/catalog/${subLink.name
                        .split(" ")
                        .join("-")
                        .toLowerCase()}`}
                      className="block rounded-xl px-4 py-3 text-sm text-ink-900 transition-all duration-200 hover:bg-gold-50 hover:text-gold-700"
                    >
                      {subLink.name}
                    </Link>
                  ))
              ) : (
                <p className="p-3 text-center text-sm text-ink-500">
                  No Courses Found
                </p>
              )}
            </div>
          </div>
        ) : (
          <Link to={link?.path}>
            <p
              className={`relative py-2 font-medium transition-all duration-300 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-gold-600 after:transition-all after:duration-300 hover:after:w-full ${
                matchRoute(link?.path)
                  ? "text-black after:w-full"
                  : "text-ink-900 hover:text-gold-700"
              }`}
            >
              {link.title}
            </p>
          </Link>
        )}
      </li>
    ))}
  </ul>
</nav>

          {/* Login / Signup / Dashboard */}
          <div className="hidden items-center gap-x-4 md:flex">
            {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
              <Link to="/dashboard/cart" className="relative">
                <AiOutlineShoppingCart className="text-2xl text-ink-900" />
                {totalItems > 0 && (
                  <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center rounded-full bg-gold-500 text-center text-xs font-bold text-ink-900">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
{token === null && (
  <Link to="/login">
    <button className="rounded-xl border border-ink-900 bg-white px-5 py-2.5 text-sm font-semibold text-ink-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink-900 hover:text-gold-100">
      Log in
    </button>
  </Link>
)}

{token === null && (
  <Link to="/signup">
    <button className="rounded-xl bg-ink-900 px-5 py-2.5 text-sm font-semibold text-gold-100 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-black">
      Sign up
    </button>
  </Link>
)}
            {token !== null && <ProfileDropdown />}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="mr-1 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <AiOutlineClose fontSize={22} className="text-ink-100" />
            ) : (
              <AiOutlineMenu fontSize={22} className="text-ink-100" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="border-t border-ink-600 bg-ink-900 px-6 py-4 md:hidden">
          <ul className="flex flex-col gap-1">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === "Catalog" ? (
                  <p className="py-2 text-ink-100">{link.title}</p>
                ) : (
                  <Link to={link?.path}>
                    <p
                      className={`py-2 ${
                        matchRoute(link?.path) ? "text-gold-500" : "text-ink-100"
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-col gap-2 border-t border-ink-600 pt-3">
            {token === null ? (
              <>
                <Link to="/login">
                  <button className="w-full rounded-lg border border-ink-600 px-4 py-2 text-sm font-medium text-ink-100">
                    Log in
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="w-full rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-ink-900">
                    Sign up
                  </button>
                </Link>
              </>
            ) : (
              <ProfileDropdown />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Navbar