import { FiTrash2 } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { deleteProfile } from "../../../../services/operations/SettingsAPI"

export default function DeleteAccount() {
  const { token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  async function handleDeleteAccount() {
    try {
      dispatch(deleteProfile(token, navigate))
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  return (
    <>
<div
  className="
    my-10
    flex
    flex-col
    gap-5
    rounded-2xl
    border
    border-red-900
    bg-red-950/40
    p-8
    shadow-lg
    lg:flex-row
  "
>

  {/* Icon */}
  <div
    className="
      flex
      h-14
      w-14
      shrink-0
      items-center
      justify-center
      rounded-full
      bg-red-900/60
      border
      border-red-800
    "
  >
    <FiTrash2 className="text-3xl text-red-300" />
  </div>



  <div className="flex flex-col gap-y-3">

    <h2 className="text-xl font-semibold text-ink-50">
      Delete Account
    </h2>


    <div className="max-w-[650px] space-y-2 text-sm leading-6 text-red-200">

      <p>
        Would you like to delete your account?
      </p>

      <p>
        This account may contain paid courses. Deleting your account is
        permanent and will remove all content associated with it.
      </p>

    </div>



    <button
      type="button"
      className="
        mt-2
        w-fit
        cursor-pointer
        text-sm
        font-medium
        text-red-300
        transition-all
        hover:text-red-200
        hover:underline
      "
      onClick={handleDeleteAccount}
    >
      I want to delete my account.
    </button>


  </div>


</div>
    </>
  )
}
