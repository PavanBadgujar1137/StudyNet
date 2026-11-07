import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { FiShield, FiCheck } from "react-icons/fi"
import { useSelector } from "react-redux"
import { toast } from "react-hot-toast"

import { changePassword } from "../../../../services/operations/SettingsAPI"

export default function UpdatePassword() {
  const { token } = useSelector((state) => state.auth)

  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const submitPasswordForm = async (data) => {
    if (data.oldPassword === data.newPassword) {
      toast.error("New password cannot be the same as your current password.")
      return
    }
    try {
      await changePassword(token, data)
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 pr-10 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
  const labelClass = "text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5"

  return (
    <form onSubmit={handleSubmit(submitPasswordForm)} className="flex flex-col gap-6">
      {/* Password Update Box */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm flex flex-col gap-6 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FiShield className="text-indigo-600" /> Security &amp; Password
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage your password and secure your account credentials</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="relative flex flex-col gap-2">
            <label htmlFor="oldPassword" className={labelClass}>
              Current Password
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                name="oldPassword"
                id="oldPassword"
                placeholder="Enter Current Password"
                className={inputClass}
                {...register("oldPassword", { required: true })}
              />
              <span
                onClick={() => setShowOldPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 z-[10] cursor-pointer"
              >
                {showOldPassword ? (
                  <AiOutlineEyeInvisible fontSize={18} fill="#64748B" />
                ) : (
                  <AiOutlineEye fontSize={18} fill="#64748B" />
                )}
              </span>
            </div>
            {errors.oldPassword && (
              <span className="text-[11px] font-semibold text-rose-500">
                Please enter your Current Password.
              </span>
            )}
          </div>

          <div className="relative flex flex-col gap-2">
            <label htmlFor="newPassword" className={labelClass}>
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                id="newPassword"
                placeholder="Enter New Password"
                className={inputClass}
                {...register("newPassword", { required: true })}
              />
              <span
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 z-[10] cursor-pointer"
              >
                {showNewPassword ? (
                  <AiOutlineEyeInvisible fontSize={18} fill="#64748B" />
                ) : (
                  <AiOutlineEye fontSize={18} fill="#64748B" />
                )}
              </span>
            </div>
            {errors.newPassword && (
              <span className="text-[11px] font-semibold text-rose-500">
                Please enter your New Password.
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button
          type="submit"
          style={{
            background: 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)',
            color: '#FFFFFF',
            padding: '12px 28px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '13px',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(31, 95, 224, 0.35)',
            transition: 'all 0.15s ease'
          }}
        >
          <FiCheck style={{ fontSize: '16px' }} /> Update Password
        </button>
      </div>
    </form>
  )
}

