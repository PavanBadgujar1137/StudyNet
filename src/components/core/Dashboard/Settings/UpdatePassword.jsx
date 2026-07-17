import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { changePassword } from "../../../../services/operations/SettingsAPI"
import IconBtn from "../../../Common/IconBtn"

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
    // console.log("password Data - ", data)
    try {
      await changePassword(token, data)
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  return (
    <>
    <form onSubmit={handleSubmit(submitPasswordForm)}>

  <div
    className="
      my-10
      flex
      flex-col
      gap-y-8
      rounded-2xl
      border
      border-ink-600
      bg-ink-800
      p-8
      shadow-lg
    "
  >

    <h2 className="text-xl font-semibold text-ink-50">
      Password
    </h2>


    <div className="flex flex-col gap-6 lg:flex-row">


      {/* Current Password */}
      <div className="relative flex flex-col gap-2 lg:w-1/2">

        <label
          htmlFor="oldPassword"
          className="lable-style"
        >
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
          className="
            absolute
            right-4
            top-[40px]
            z-[10]
            cursor-pointer
            rounded-full
            p-1
            transition-all
            hover:bg-ink-700
          "
        >
          {showOldPassword ? (
            <AiOutlineEyeInvisible
              fontSize={24}
              fill="#9AA0A6"
            />
          ) : (
            <AiOutlineEye
              fontSize={24}
              fill="#9AA0A6"
            />
          )}
        </span>


        {errors.oldPassword && (
          <span className="-mt-1 text-xs text-gold-300">
            Please enter your Current Password.
          </span>
        )}

      </div>




      {/* New Password */}
      <div className="relative flex flex-col gap-2 lg:w-1/2">

        <label
          htmlFor="newPassword"
          className="lable-style"
        >
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
          className="
            absolute
            right-4
            top-[40px]
            z-[10]
            cursor-pointer
            rounded-full
            p-1
            transition-all
            hover:bg-ink-700
          "
        >
          {showNewPassword ? (
            <AiOutlineEyeInvisible
              fontSize={24}
              fill="#9AA0A6"
            />
          ) : (
            <AiOutlineEye
              fontSize={24}
              fill="#9AA0A6"
            />
          )}
        </span>


        {errors.newPassword && (
          <span className="-mt-1 text-xs text-gold-300">
            Please enter your New Password.
          </span>
        )}

      </div>


    </div>


  </div>



  {/* Buttons */}
  <div className="flex justify-end gap-4">


    <button
      onClick={() => {
        navigate("/dashboard/my-profile")
      }}
      className="
        cursor-pointer
        rounded-xl
        border
        border-ink-600
        bg-ink-700
        px-6
        py-2.5
        font-medium
        text-ink-100
        transition-all
        hover:bg-ink-600
        hover:text-gold-400
      "
    >
      Cancel
    </button>


    <IconBtn
      type="submit"
      text="Update"
    />


  </div>


</form>
    </>
  )
}
