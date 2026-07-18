import ChangeProfilePicture from "./ChangeProfilePicture"
import DeleteAccount from "./DeleteAccount"
import EditProfile from "./EditProfile"
import UpdatePassword from "./UpdatePassword"

export default function Settings() {
  return (
    <div className="flex flex-col gap-6 text-left">
      <h1 className="text-3xl font-bold text-navy font-fraunces">
        Edit Profile & Settings
      </h1>
      
      {/* Change Profile Picture */}
      <ChangeProfilePicture />
      
      {/* Profile */}
      <EditProfile />
      
      {/* Password */}
      <UpdatePassword />
      
      {/* Delete Account */}
      <DeleteAccount />
    </div>
  )
}
