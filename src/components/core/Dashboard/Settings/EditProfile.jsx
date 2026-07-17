import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { updateProfile } from "../../../../services/operations/SettingsAPI"
import IconBtn from "../../../Common/IconBtn"

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
    // console.log("Form Data - ", data)
    try {
      dispatch(updateProfile(token, data))
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }
  return (
    <>
<form onSubmit={handleSubmit(submitProfileForm)}>

  {/* Profile Information */}
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
      Profile Information
    </h2>


    <div className="flex flex-col gap-6 lg:flex-row">

      <div className="flex flex-col gap-2 lg:w-1/2">
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
          <span className="-mt-1 text-xs text-gold-300">
            Please enter your first name.
          </span>
        )}
      </div>


      <div className="flex flex-col gap-2 lg:w-1/2">

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
          <span className="-mt-1 text-xs text-gold-300">
            Please enter your last name.
          </span>
        )}

      </div>

    </div>



    <div className="flex flex-col gap-6 lg:flex-row">

      <div className="flex flex-col gap-2 lg:w-1/2">

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
          <span className="-mt-1 text-xs text-gold-300">
            {errors.dateOfBirth.message}
          </span>
        )}

      </div>



      <div className="flex flex-col gap-2 lg:w-1/2">

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

          {genders.map((ele, i) => (
            <option key={i} value={ele}>
              {ele}
            </option>
          ))}

        </select>


        {errors.gender && (
          <span className="-mt-1 text-xs text-gold-300">
            Please select gender.
          </span>
        )}

      </div>

    </div>



    <div className="flex flex-col gap-6 lg:flex-row">


      <div className="flex flex-col gap-2 lg:w-1/2">

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
            maxLength: {
              value: 12,
              message: "Invalid Contact Number",
            },
            minLength: {
              value: 10,
              message: "Invalid Contact Number",
            },
          })}
          defaultValue={user?.additionalDetails?.contactNumber}
        />


        {errors.contactNumber && (
          <span className="-mt-1 text-xs text-gold-300">
            {errors.contactNumber.message}
          </span>
        )}

      </div>




      <div className="flex flex-col gap-2 lg:w-1/2">

        <label htmlFor="about" className="lable-style">
          About
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
          <span className="-mt-1 text-xs text-gold-300">
            Please enter your About.
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
      text="Save"
    />


  </div>


</form>
    </>
  )
}
