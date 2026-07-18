import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { changePassword } from "../../../../services/operations/SettingsAPI"

export default function UpdatePassword() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const submitPasswordForm = async (data) => {
    try {
      await changePassword(token, data)
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit(submitPasswordForm)} className="flex flex-col gap-6">
      {/* Password Update Box */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm flex flex-col gap-6 text-left">
        <h2 className="font-fraunces text-navy text-lg font-bold border-b border-slate-100 pb-3">
          Security Settings
        </h2>

        <div className="flex flex-col gap-5 lg:flex-row">
          <div className="relative flex flex-col gap-1.5 lg:w-[48%]">
            <label htmlFor="oldPassword" className="lable-style">
              Current Password
            </label>
            <input
              type={showOldPassword ? "text" : "password"}
              name="oldPassword"
              id="oldPassword"
              placeholder="Enter Current Password"
              className="form-style"
              {...register("oldPassword", { required: true })}
            />
            <span
              onClick={() => setShowOldPassword((prev) => !prev)}
              className="absolute right-3 top-[38px] z-[10] cursor-pointer"
            >
              {showOldPassword ? (
                <AiOutlineEyeInvisible fontSize={20} fill="#64748B" />
              ) : (
                <AiOutlineEye fontSize={20} fill="#64748B" />
              )}
            </span>
            {errors.oldPassword && (
              <span className="text-[11px] text-red-500">
                Please enter your Current Password.
              </span>
            )}
          </div>

          <div className="relative flex flex-col gap-1.5 lg:w-[48%]">
            <label htmlFor="newPassword" className="lable-style">
              New Password
            </label>
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              id="newPassword"
              placeholder="Enter New Password"
              className="form-style"
              {...register("newPassword", { required: true })}
            />
            <span
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-3 top-[38px] z-[10] cursor-pointer"
            >
              {showNewPassword ? (
                <AiOutlineEyeInvisible fontSize={20} fill="#64748B" />
              ) : (
                <AiOutlineEye fontSize={20} fill="#64748B" />
              )}
            </span>
            {errors.newPassword && (
              <span className="text-[11px] text-red-500">
                Please enter your New Password.
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-2">
        <button
          type="button"
          onClick={() => {
            navigate("/dashboard/my-profile")
          }}
          className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-2.5 text-xs transition-all hover:scale-95"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-full bg-royal-blue hover:bg-royal-blue/90 text-white font-bold px-6 py-2.5 text-xs transition-all hover:scale-95 shadow-sm"
        >
          Update Password
        </button>
      </div>
    </form>
  )
}
