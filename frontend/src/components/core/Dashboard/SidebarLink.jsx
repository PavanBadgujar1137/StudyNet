import * as Icons from "react-icons/vsc"
import { useDispatch } from "react-redux"
import { NavLink, matchPath, useLocation } from "react-router-dom"

import { resetCourseState } from "../../../slices/courseSlice"

export default function SidebarLink({ link, iconName }) {
  const Icon = Icons[iconName]
  const location = useLocation()
  const dispatch = useDispatch()

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  return (
    <NavLink
      to={link.path}
      onClick={() => dispatch(resetCourseState())}
      className={`relative px-8 py-3 text-sm font-semibold ${
        matchRoute(link.path)
          ? "bg-royal-blue/10 text-royal-blue"
          : "bg-opacity-0 text-slate-600 hover:bg-slate-50 hover:text-navy"
      } transition-all duration-200 block`}
    >
      <span
        className={`absolute left-0 top-0 h-full w-[0.25rem] bg-royal-blue transition-all duration-200 ${
          matchRoute(link.path) ? "opacity-100" : "opacity-0"
        }`}
      ></span>
      <div className="flex items-center gap-x-2.5">
        <Icon className="text-lg" />
        <span>{link.name}</span>
      </div>
    </NavLink>
  )
}
