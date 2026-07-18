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
      <div className="my-8 flex flex-row gap-5 rounded-2xl border border-red-200 bg-red-50/40 p-6 md:p-8 text-left">
        <div className="flex aspect-square h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 shrink-0 shadow-sm">
          <FiTrash2 className="text-xl" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold text-red-800 font-fraunces">
            Delete Account
          </h3>
          <div className="text-sm text-slate-600 leading-relaxed max-w-xl">
            <p className="font-semibold text-red-700/90">Would you like to delete your account?</p>
            <p className="mt-1">
              This account may contain enrolled spaces or active learning sessions. Deleting your account is
              permanent and will remove all the content associated with it.
            </p>
          </div>
          <button
            type="button"
            className="w-fit cursor-pointer text-sm font-bold text-red-600 hover:text-red-700 hover:underline transition-colors mt-1 text-left"
            onClick={handleDeleteAccount}
          >
            I want to delete my account.
          </button>
        </div>
      </div>
    </>
  )
}
