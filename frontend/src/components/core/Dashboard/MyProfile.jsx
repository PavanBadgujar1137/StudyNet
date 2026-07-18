import { RiEditBoxLine } from "react-icons/ri"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { formattedDate } from "../../../utils/dateFormatter"

export default function MyProfile() {
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-navy font-fraunces">
        My Profile
      </h1>

      {/* Greeting Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-royal-blue to-indigo-600 p-6 sm:p-8 shadow-sm overflow-hidden text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 z-10 text-center sm:text-left">
          {user?.image ? (
            <img
              src={user.image}
              alt={`profile-${user?.firstName}`}
              className="aspect-square w-20 h-20 rounded-full object-cover border-4 border-white/20 shadow-sm"
            />
          ) : (
            <div className="aspect-square w-20 h-20 rounded-full bg-white/10 border-4 border-white/20 shadow-md flex items-center justify-center font-bold text-2xl uppercase font-fraunces">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
          )}
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-white bg-white/15 border border-white/20 px-3 py-1 rounded-full shadow-sm">
              {user?.accountType} Account
            </span>
            <h2 className="font-fraunces text-2xl sm:text-3xl font-bold mt-1">
              Hello, {user?.firstName} {user?.lastName}!
            </h2>
            <p className="text-white/85 text-xs sm:text-sm font-medium">
              Manage your personal details, secure login credentials, and catalog preferences.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard/settings")}
          className="rounded-full bg-white hover:bg-slate-50 text-royal-blue font-bold px-5 py-2.5 text-xs transition-all duration-200 shadow-sm flex items-center gap-1.5 hover:scale-95 shrink-0 z-10"
        >
          <RiEditBoxLine className="text-sm" /> Edit Profile
        </button>
      </div>

      {/* 2-Column Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* About Box */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex w-full items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-fraunces text-navy text-lg font-bold">About</h3>
              <button
                onClick={() => navigate("/dashboard/settings")}
                className="text-royal-blue hover:text-royal-blue/80 transition-colors p-1"
                title="Edit About"
              >
                <RiEditBoxLine className="text-lg" />
              </button>
            </div>
            
            <p
              className={`${
                user?.additionalDetails?.about
                  ? "text-slate-700"
                  : "text-slate-400 italic"
              } text-xs sm:text-sm font-medium leading-relaxed mt-4`}
            >
              {user?.additionalDetails?.about ?? "Tell your story, practice philosophy, or client focus here..."}
            </p>
          </div>

          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-6 pt-3 border-t border-slate-100">
            Account status: Active
          </div>
        </div>

        {/* Personal Details Box */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex w-full items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-fraunces text-navy text-lg font-bold">Personal Information</h3>
            <button
              onClick={() => navigate("/dashboard/settings")}
              className="text-royal-blue hover:text-royal-blue/80 transition-colors p-1"
              title="Edit Personal Information"
            >
              <RiEditBoxLine className="text-lg" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 mt-5">
            {/* First Column */}
            <div className="flex flex-col gap-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">First Name</p>
                <p className="text-sm font-semibold text-navy mt-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">
                  {user?.firstName}
                </p>
              </div>
              
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address</p>
                <p className="text-sm font-semibold text-navy mt-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 select-all overflow-hidden text-ellipsis">
                  {user?.email}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gender</p>
                <p className="text-sm font-semibold text-navy mt-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">
                  {user?.additionalDetails?.gender ?? "Not specified"}
                </p>
              </div>
            </div>

            {/* Second Column */}
            <div className="flex flex-col gap-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Last Name</p>
                <p className="text-sm font-semibold text-navy mt-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">
                  {user?.lastName}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Phone Number</p>
                <p className="text-sm font-semibold text-navy mt-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 select-all">
                  {user?.additionalDetails?.contactNumber ?? "Not added yet"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date Of Birth</p>
                <p className="text-sm font-semibold text-navy mt-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">
                  {formattedDate(user?.additionalDetails?.dateOfBirth) ?? "Not added yet"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
