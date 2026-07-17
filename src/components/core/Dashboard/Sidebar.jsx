import { useState } from "react"
import { VscSignOut } from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { sidebarLinks } from "../../../data/dashboard-links"
import { logout } from "../../../services/operations/authAPI"
import ConfirmationModal from "../../Common/ConfirmationModal"
import SidebarLink from "./SidebarLink"

export default function Sidebar() {
  const { user, loading: profileLoading } = useSelector(
    (state) => state.profile
  )
  const { loading: authLoading } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  // to keep track of confirmation modal
  const [confirmationModal, setConfirmationModal] = useState(null)

  if (profileLoading || authLoading) {
    return (
      <div className="grid h-[calc(100vh-3.5rem)] min-w-[220px] items-center border-r-[1px] border-r-richblack-700 bg-richblack-800">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <>
  <div
  className="
    flex
    h-[calc(100vh-3.5rem)]
    min-w-[240px]
    flex-col
    border-r
    border-ink-600
    bg-ink-900
    py-8
  "
>

  {/* Main Links */}
  <div className="flex flex-col gap-y-2">

    {sidebarLinks.map((link) => {
      if (link.type && user?.accountType !== link.type) return null

      return (
        <SidebarLink
          key={link.id}
          link={link}
          iconName={link.icon}
        />
      )
    })}

  </div>


  {/* Divider */}
  <div
    className="
      mx-auto
      my-6
      h-px
      w-10/12
      bg-ink-600
    "
  />


  {/* Bottom Actions */}
  <div className="flex flex-col gap-y-2">

    <SidebarLink
      link={{
        name: "Settings",
        path: "/dashboard/settings",
      }}
      iconName="VscSettingsGear"
    />


    <button
      onClick={() =>
        setConfirmationModal({
          text1: "Are you sure?",
          text2: "You will be logged out of your account.",
          btn1Text: "Logout",
          btn2Text: "Cancel",
          btn1Handler: () => dispatch(logout(navigate)),
          btn2Handler: () => setConfirmationModal(null),
        })
      }
      className="
        mx-3
        rounded-xl
        px-5
        py-3
        text-sm
        font-medium
        text-ink-200
        transition-all
        hover:bg-ink-800
        hover:text-gold-400
      "
    >

      <div className="flex items-center gap-x-3">

        <VscSignOut className="text-lg" />

        <span>
          Logout
        </span>

      </div>

    </button>


  </div>

</div>
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}
