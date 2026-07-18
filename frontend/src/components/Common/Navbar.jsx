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
    <div
      className="sticky top-4 z-[1000] mx-auto flex h-16 w-[95%] max-w-maxContent items-center justify-between border border-line/65 bg-white/80 backdrop-blur-md rounded-full px-6 md:px-8 shadow-[0_8px_32px_rgba(13,27,61,0.04)] transition-all duration-300"
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group transition-transform duration-300 hover:scale-105">
        <img src={logoIcon} alt="OpenHand Logo" className="h-8 md:h-9 w-auto object-contain" />
        <span className="font-fraunces text-xl md:text-2xl font-bold tracking-tight text-navy leading-none">
          Open<span className="text-royal-blue">Hand</span>
        </span>
      </Link>

      {/* Navigation links */}
      <nav className="hidden md:block">
        <ul className="flex gap-x-8 text-richblack-25 font-medium">
          {NavbarLinks.map((link, index) => (
            <li key={index}>
              {link.title === "Catalog" ? (
                <>
                  <div
                    className={`group relative flex cursor-pointer items-center gap-1.5 py-2 ${
                      matchRoute("/catalog/:catalogName")
                        ? "text-royal-blue"
                        : "text-richblack-5 hover:text-royal-blue"
                    } transition-colors duration-200`}
                  >
                    <p>{link.title}</p>
                    <BsChevronDown className="text-xs transition-transform duration-200 group-hover:rotate-180" />
                    
                    {/* Catalog Dropdown with slide and scale transition */}
                    <div className="invisible absolute left-1/2 top-[100%] z-[1000] flex w-[220px] -translate-x-1/2 flex-col rounded-2xl bg-white border border-line/80 p-4 text-richblack-900 shadow-xl opacity-0 scale-95 origin-top transition-all duration-300 ease-out group-hover:visible group-hover:opacity-100 group-hover:scale-100">
                      <div className="absolute left-1/2 top-0 -z-10 h-4 w-4 translate-x-[-50%] translate-y-[-50%] rotate-45 select-none rounded-sm border-t border-l border-line/80 bg-white"></div>
                      {loading ? (
                        <p className="text-center py-4 text-sm text-richblack-400">Loading...</p>
                      ) : subLinks?.length ? (
                        <div className="flex flex-col gap-1">
                          {subLinks
                            .filter(
                              (subLink) => (subLink?.courses?.length ?? 0) > 0
                            )
                            .map((subLink, i) => (
                              <Link
                                to={`/catalog/${subLink.name
                                  .split(" ")
                                  .join("-")
                                  .toLowerCase()}`}
                                className="rounded-xl py-3 pl-4 text-sm text-richblack-800 hover:bg-royal-blue/5 hover:text-royal-blue transition-colors duration-200 font-medium"
                                key={i}
                              >
                                {subLink.name}
                              </Link>
                            ))}
                        </div>
                      ) : (
                        <p className="text-center py-4 text-sm text-richblack-400">No Courses Found</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <Link to={link?.path} className="relative py-2 block group">
                  <p
                    className={`${
                      matchRoute(link?.path)
                        ? "text-royal-blue font-semibold"
                        : "text-richblack-5 hover:text-royal-blue"
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
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Login / Signup / Dashboard */}
      <div className="hidden items-center gap-x-4 md:flex">
        {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
          <Link to="/dashboard/cart" className="relative p-2 rounded-full hover:bg-richblack-700/50 transition-colors">
            <AiOutlineShoppingCart className="text-2xl text-richblack-5 hover:text-royal-blue transition-colors" />
            {totalItems > 0 && (
              <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-royal-blue text-center text-xs font-bold text-white shadow-sm">
                {totalItems}
              </span>
            )}
          </Link>
        )}
        {token === null && (
          <Link to="/login">
            <button className="rounded-full border border-line bg-white px-5 py-2 text-sm font-semibold text-navy hover:bg-paper hover:border-navy/35 transition-all duration-200 hover:scale-95">
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
      <button className="mr-4 p-2 rounded-full hover:bg-richblack-700/50 md:hidden transition-colors">
        <AiOutlineMenu fontSize={24} fill="#0D1B3D" />
      </button>
    </div>
  )
}

export default Navbar
