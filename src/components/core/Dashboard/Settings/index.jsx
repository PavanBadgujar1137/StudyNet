import ChangeProfilePicture from "./ChangeProfilePicture"
import DeleteAccount from "./DeleteAccount"
import EditProfile from "./EditProfile"
import UpdatePassword from "./UpdatePassword"

export default function Settings() {
  return (
    <div className="space-y-10">

      <h1 className="text-3xl font-semibold text-ink-50">
        Edit Profile
      </h1>


      {/* Change Profile Picture */}
      <div
        className="
          rounded-2xl
          border
          border-ink-600
          bg-ink-800
          p-6
          shadow-lg
        "
      >
        <ChangeProfilePicture />
      </div>


      {/* Profile */}
      <div
        className="
          rounded-2xl
          border
          border-ink-600
          bg-ink-800
          p-6
          shadow-lg
        "
      >
        <EditProfile />
      </div>


      {/* Password */}
      <div
        className="
          rounded-2xl
          border
          border-ink-600
          bg-ink-800
          p-6
          shadow-lg
        "
      >
        <UpdatePassword />
      </div>


      {/* Delete Account */}
      <div
        className="
          rounded-2xl
          border
          border-red-900
          bg-ink-800
          p-6
          shadow-lg
        "
      >
        <DeleteAccount />
      </div>


    </div>
  )
}