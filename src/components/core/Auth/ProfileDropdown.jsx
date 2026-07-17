import { useRef, useState } from "react"
import { AiOutlineCaretDown } from "react-icons/ai"
import { VscDashboard, VscSignOut } from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"

import useOnClickOutside from "../../../hooks/useOnClickOutside"
import { logout } from "../../../services/operations/authAPI"

export default function ProfileDropdown() {
  const { user } = useSelector((state) => state.profile)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useOnClickOutside(ref, () => setOpen(false))

  if (!user) return null

  return (
    <button className="relative" onClick={() => setOpen(true)}>
      <div className="flex items-center gap-x-1">
        <img
          src={user?.image}
          alt={`profile-${user?.firstName}`}
          className="aspect-square w-[30px] rounded-full object-cover"
        />
        <AiOutlineCaretDown className="text-sm text-ink-900" />
      </div>
      {open && (
<div
  onClick={(e) => e.stopPropagation()}
  className="
    absolute
    top-[118%]
    right-0
    z-[1000]
    divide-y
    divide-ink-600
    overflow-hidden
    rounded-xl
    border
    border-ink-600
    bg-ink-800
    shadow-xl
  "
  ref={ref}
>

  <Link to="/dashboard/my-profile" onClick={() => setOpen(false)}>
    <div
      className="
        flex
        w-full
        items-center
        gap-x-2
        px-4
        py-3
        text-sm
        text-ink-100
        transition-all
        hover:bg-ink-700
        hover:text-gold-400
      "
    >
      <VscDashboard className="text-lg" />
      Dashboard
    </div>
  </Link>


  <div
    onClick={() => {
      dispatch(logout(navigate))
      setOpen(false)
    }}
    className="
      flex
      w-full
      cursor-pointer
      items-center
      gap-x-2
      px-4
      py-3
      text-sm
      text-ink-100
      transition-all
      hover:bg-ink-700
      hover:text-gold-400
    "
  >
    <VscSignOut className="text-lg" />
    Logout
  </div>

</div>
      )}
    </button>
  )
}
