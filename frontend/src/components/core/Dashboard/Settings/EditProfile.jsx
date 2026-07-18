import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { updateProfile } from "../../../../services/operations/SettingsAPI"

const genders = ["Male", "Female", "Non-Binary", "Prefer not to say", "Other"]

export default function EditProfile() {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const submitProfileForm = async (data) => {
    try {
      dispatch(updateProfile(token, data))
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit(submitProfileForm)} className="flex flex-col gap-6">
      {/* Profile Information Box */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm flex flex-col gap-6 text-left">
        <h2 className="font-fraunces text-navy text-lg font-bold border-b border-slate-100 pb-3">
          Profile Information
        </h2>

        <div className="flex flex-col gap-5 lg:flex-row">
          <div className="flex flex-col gap-1.5 lg:w-[48%]">
            <label htmlFor="firstName" className="lable-style">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              placeholder="Enter first name"
              className="form-style"
              {...register("firstName", { required: true })}
              defaultValue={user?.firstName}
            />
            {errors.firstName && (
              <span className="text-[11px] text-red-500">
                Please enter your first name.
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5 lg:w-[48%]">
            <label htmlFor="lastName" className="lable-style">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              placeholder="Enter last name"
              className="form-style"
              {...register("lastName", { required: true })}
              defaultValue={user?.lastName}
            />
            {errors.lastName && (
              <span className="text-[11px] text-red-500">
                Please enter your last name.
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row">
          <div className="flex flex-col gap-1.5 lg:w-[48%]">
            <label htmlFor="dateOfBirth" className="lable-style">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              id="dateOfBirth"
              className="form-style"
              {...register("dateOfBirth", {
                required: {
                  value: true,
                  message: "Please enter your Date of Birth.",
                },
                max: {
                  value: new Date().toISOString().split("T")[0],
                  message: "Date of Birth cannot be in the future.",
                },
              })}
              defaultValue={user?.additionalDetails?.dateOfBirth}
            />
            {errors.dateOfBirth && (
              <span className="text-[11px] text-red-500">
                {errors.dateOfBirth.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5 lg:w-[48%]">
            <label htmlFor="gender" className="lable-style">
              Gender
            </label>
            <select
              name="gender"
              id="gender"
              className="form-style"
              {...register("gender", { required: true })}
              defaultValue={user?.additionalDetails?.gender}
            >
              {genders.map((ele, i) => {
                return (
                  <option key={i} value={ele}>
                    {ele}
                  </option>
                )
              })}
            </select>
            {errors.gender && (
              <span className="text-[11px] text-red-500">
                Please select your gender.
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row">
          <div className="flex flex-col gap-1.5 lg:w-[48%]">
            <label htmlFor="contactNumber" className="lable-style">
              Contact Number
            </label>
            <input
              type="tel"
              name="contactNumber"
              id="contactNumber"
              placeholder="Enter Contact Number"
              className="form-style"
              {...register("contactNumber", {
                required: {
                  value: true,
                  message: "Please enter your Contact Number.",
                },
                maxLength: { value: 12, message: "Invalid Contact Number" },
                minLength: { value: 10, message: "Invalid Contact Number" },
              })}
              defaultValue={user?.additionalDetails?.contactNumber}
            />
            {errors.contactNumber && (
              <span className="text-[11px] text-red-500">
                {errors.contactNumber.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5 lg:w-[48%]">
            <label htmlFor="about" className="lable-style">
              About / Bio
            </label>
            <input
              type="text"
              name="about"
              id="about"
              placeholder="Enter Bio Details"
              className="form-style"
              {...register("about", { required: true })}
              defaultValue={user?.additionalDetails?.about}
            />
            {errors.about && (
              <span className="text-[11px] text-red-500">
                Please enter your About bio.
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
          Save Details
        </button>
      </div>
    </form>
  )
}
