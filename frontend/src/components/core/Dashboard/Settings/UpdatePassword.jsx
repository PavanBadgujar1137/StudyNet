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

  const inputClass = "oh-profile-input pr-10"
  const labelClass = "oh-profile-label"

  return (
    <form onSubmit={handleSubmit(submitPasswordForm)} className="flex flex-col gap-6">
      {/* Password Update Box */}
      <div className="oh-profile-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '20px', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiShield size={18} />
              </span>
              Security &amp; Password
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
              Keep your account safe by updating your password regularly with strong credentials
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="relative flex flex-col">
            <label htmlFor="oldPassword" className={labelClass}>
              Current Password
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                name="oldPassword"
                id="oldPassword"
                placeholder="Enter current password"
                className={inputClass}
                {...register("oldPassword", { required: true })}
              />
              <span
                onClick={() => setShowOldPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 z-[10] cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showOldPassword ? (
                  <AiOutlineEyeInvisible fontSize={18} />
                ) : (
                  <AiOutlineEye fontSize={18} />
                )}
              </span>
            </div>
            {errors.oldPassword && (
              <span className="text-[11px] font-semibold text-rose-500 mt-1">
                Please enter your Current Password.
              </span>
            )}
          </div>

          <div className="relative flex flex-col">
            <label htmlFor="newPassword" className={labelClass}>
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                id="newPassword"
                placeholder="Enter new password"
                className={inputClass}
                {...register("newPassword", { required: true })}
              />
              <span
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 z-[10] cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showNewPassword ? (
                  <AiOutlineEyeInvisible fontSize={18} />
                ) : (
                  <AiOutlineEye fontSize={18} />
                )}
              </span>
            </div>
            {errors.newPassword && (
              <span className="text-[11px] font-semibold text-rose-500 mt-1">
                Please enter your New Password.
              </span>
            )}
          </div>
        </div>

        {/* Password Security Tip Box */}
        <div
          style={{
            marginTop: "20px",
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: "14px",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "12.5px",
            color: "#475569"
          }}
        >
          <span style={{ fontSize: "16px" }}>💡</span>
          <span>
            <strong>Tip:</strong> Use a combination of uppercase letters, numbers, and symbols to maximize security across your OpenHand sessions.
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
          <button
            type="submit"
            className="oh-profile-btn-primary"
          >
            <FiCheck size={16} /> Update Password
          </button>
        </div>
      </div>
    </form>
  )
}

