import React, { useRef, useState } from "react"
import { AiOutlineCaretDown } from "react-icons/ai"
import { VscDashboard, VscSignOut } from "react-icons/vsc"
import { FiUser } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import useOnClickOutside from "../../../hooks/useOnClickOutside"
import { logout } from "../../../services/operations/authAPI"

export default function ProfileDropdown({ onSelectSection }) {
  const { user } = useSelector((state) => state.profile)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useOnClickOutside(ref, () => setOpen(false))

  if (!user) return null

  const firstInitial = user?.firstName?.[0] || ""
  const lastInitial = user?.lastName?.[0] || ""
  const initials = `${firstInitial}${lastInitial}`.toUpperCase() || "U"
  const hasCustomImage = user?.image && !user.image.includes("dicebear")

  const handleDashboardClick = () => {
    setOpen(false)
    if (onSelectSection) {
      onSelectSection(user?.accountType === "Practitioner" ? "dash" : "journey")
    }
    navigate(user?.accountType === "Admin" ? "/admin" : "/dashboard")
  }

  const handleProfileClick = () => {
    setOpen(false)
    if (onSelectSection) {
      onSelectSection("profile")
    }
    navigate("/dashboard?tab=profile")
  }

  const handleLogoutClick = () => {
    setOpen(false)
    dispatch(logout(navigate))
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer select-none focus:outline-none"
        aria-label="User account menu"
      >
        {hasCustomImage ? (
          <img
            src={user.image}
            alt={user?.firstName || "Profile"}
            className="aspect-square w-8 h-8 rounded-full object-cover border border-slate-200"
            onError={(e) => {
              e.currentTarget.style.display = "none"
              if (e.currentTarget.nextElementSibling) {
                e.currentTarget.nextElementSibling.style.display = "flex"
              }
            }}
          />
        ) : null}
        <div
          className="w-8 h-8 rounded-full text-white font-bold text-xs items-center justify-center shadow-xs uppercase tracking-tight shrink-0"
          style={{
            display: hasCustomImage ? "none" : "flex",
            background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
          }}
        >
          {initials}
        </div>
        <AiOutlineCaretDown
          className={`text-xs text-slate-700 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-[calc(100%+8px)] right-0 z-[1050] w-52 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-xl text-left"
          style={{
            boxShadow:
              "0 14px 35px -10px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.04)",
          }}
        >
          <button
            type="button"
            onClick={handleDashboardClick}
            className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <VscDashboard className="text-lg text-slate-500" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={handleProfileClick}
            className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <FiUser className="text-lg text-slate-500" />
            <span>Profile &amp; Settings</span>
          </button>

          <div className="my-1 border-t border-slate-100" />

          <button
            type="button"
            onClick={handleLogoutClick}
            className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
          >
            <VscSignOut className="text-lg text-slate-500" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  )
}

