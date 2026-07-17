import { RiEditBoxLine } from "react-icons/ri"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { formattedDate } from "../../../utils/dateFormatter"
import IconBtn from "../../Common/IconBtn"

export default function MyProfile() {
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()

  return (
    <>
      <h1 className="mb-10 text-3xl font-semibold text-ink-50">
        My Profile
      </h1>

      {/* Profile Card */}
      <div className="flex items-center justify-between rounded-2xl border border-ink-600 bg-ink-800 p-8 shadow-lg">

        <div className="flex items-center gap-x-5">

          <img
            src={user?.image}
            alt={`profile-${user?.firstName}`}
            className="
              aspect-square
              w-[85px]
              rounded-full
              border-2
              border-gold-500
              object-cover
            "
          />

          <div className="space-y-2">

            <p className="text-xl font-semibold text-ink-50">
              {user?.firstName + " " + user?.lastName}
            </p>

            <p className="text-sm text-ink-200">
              {user?.email}
            </p>

          </div>

        </div>


        <IconBtn
          text="Edit"
          onclick={() => {
            navigate("/dashboard/settings")
          }}
        >
          <RiEditBoxLine />
        </IconBtn>

      </div>


      {/* About Section */}
      <div className="my-8 flex flex-col gap-y-6 rounded-2xl border border-ink-600 bg-ink-800 p-8 shadow-lg">

        <div className="flex w-full items-center justify-between">

          <p className="text-xl font-semibold text-ink-50">
            About
          </p>

          <IconBtn
            text="Edit"
            onclick={() => {
              navigate("/dashboard/settings")
            }}
          >
            <RiEditBoxLine />
          </IconBtn>

        </div>


        <p
          className={`text-sm leading-6 ${
            user?.additionalDetails?.about
              ? "text-ink-100"
              : "text-ink-300"
          }`}
        >
          {user?.additionalDetails?.about ??
            "Write Something About Yourself"}
        </p>

      </div>



      {/* Personal Details */}
      <div className="my-8 flex flex-col gap-y-8 rounded-2xl border border-ink-600 bg-ink-800 p-8 shadow-lg">

        <div className="flex w-full items-center justify-between">

          <p className="text-xl font-semibold text-ink-50">
            Personal Details
          </p>

          <IconBtn
            text="Edit"
            onclick={() => {
              navigate("/dashboard/settings")
            }}
          >
            <RiEditBoxLine />
          </IconBtn>

        </div>



        <div className="grid max-w-[700px] grid-cols-1 gap-8 md:grid-cols-2">


          {/* Left Side */}
          <div className="flex flex-col gap-y-6">


            <div>
              <p className="mb-2 text-sm text-ink-300">
                First Name
              </p>

              <p className="text-sm font-medium text-ink-50">
                {user?.firstName}
              </p>
            </div>



            <div>
              <p className="mb-2 text-sm text-ink-300">
                Email
              </p>

              <p className="text-sm font-medium text-ink-50">
                {user?.email}
              </p>
            </div>



            <div>
              <p className="mb-2 text-sm text-ink-300">
                Gender
              </p>

              <p className="text-sm font-medium text-ink-50">
                {user?.additionalDetails?.gender ??
                  "Add Gender"}
              </p>
            </div>


          </div>



          {/* Right Side */}
          <div className="flex flex-col gap-y-6">


            <div>
              <p className="mb-2 text-sm text-ink-300">
                Last Name
              </p>

              <p className="text-sm font-medium text-ink-50">
                {user?.lastName}
              </p>
            </div>



            <div>
              <p className="mb-2 text-sm text-ink-300">
                Phone Number
              </p>

              <p className="text-sm font-medium text-ink-50">
                {user?.additionalDetails?.contactNumber ??
                  "Add Contact Number"}
              </p>
            </div>



            <div>
              <p className="mb-2 text-sm text-ink-300">
                Date Of Birth
              </p>

              <p className="text-sm font-medium text-ink-50">
                {formattedDate(
                  user?.additionalDetails?.dateOfBirth
                ) ?? "Add Date Of Birth"}
              </p>
            </div>


          </div>


        </div>


      </div>

    </>
  )
}