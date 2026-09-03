import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { FiUser, FiCalendar, FiPhone, FiInfo, FiCheck, FiCreditCard } from "react-icons/fi"
import { updateProfile } from "../../../../services/operations/SettingsAPI"
import { apiConnector } from "../../../../services/apiConnector"
import toast from "react-hot-toast"

const genders = ["Male", "Female", "Non-Binary", "Prefer not to say", "Other"]

export default function EditProfile() {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
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

  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
  const labelClass = "text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5"

  return (
    <form onSubmit={handleSubmit(submitProfileForm)} className="flex flex-col gap-6">
      {/* Profile Information Box */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm flex flex-col gap-6 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FiUser className="text-indigo-600" /> Personal Information
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Update your personal details and contact information</p>
          </div>
        </div>

        {/* Title, First & Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className={labelClass}>
              Title / Honorific
            </label>
            <select
              name="title"
              id="title"
              className={inputClass}
              {...register("title")}
              defaultValue={user?.title || ""}
            >
              <option value="">None (Default)</option>
              <option value="Dr.">Dr. (Doctor)</option>
              <option value="Prof.">Prof. (Professor)</option>
              <option value="Mr.">Mr.</option>
              <option value="Ms.">Ms.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Mx.">Mx.</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="firstName" className={labelClass}>
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              placeholder="Enter first name"
              className={inputClass}
              {...register("firstName", { required: true })}
              defaultValue={user?.firstName}
            />
            {errors.firstName && (
              <span className="text-[11px] font-semibold text-rose-500">
                Please enter your first name.
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="lastName" className={labelClass}>
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              placeholder="Enter last name"
              className={inputClass}
              {...register("lastName", { required: true })}
              defaultValue={user?.lastName}
            />
            {errors.lastName && (
              <span className="text-[11px] font-semibold text-rose-500">
                Please enter your last name.
              </span>
            )}
          </div>
        </div>

        {/* DOB & Gender */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="dateOfBirth" className={labelClass}>
              <FiCalendar className="text-indigo-500" /> Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              id="dateOfBirth"
              className={inputClass}
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
              <span className="text-[11px] font-semibold text-rose-500">
                {errors.dateOfBirth.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="gender" className={labelClass}>
              Gender
            </label>
            <select
              name="gender"
              id="gender"
              className={inputClass}
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
              <span className="text-[11px] font-semibold text-rose-500">
                Please select your gender.
              </span>
            )}
          </div>
        </div>

        {/* Contact & Bio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="contactNumber" className={labelClass}>
              <FiPhone className="text-indigo-500" /> Contact Number
            </label>
            <input
              type="tel"
              name="contactNumber"
              id="contactNumber"
              placeholder="Enter Contact Number"
              className={inputClass}
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
              <span className="text-[11px] font-semibold text-rose-500">
                {errors.contactNumber.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="about" className={labelClass}>
              <FiInfo className="text-indigo-500" /> About / Bio
            </label>
            <input
              type="text"
              name="about"
              id="about"
              placeholder="Enter Bio Details"
              className={inputClass}
              {...register("about", { required: true })}
              defaultValue={user?.additionalDetails?.about}
            />
            {errors.about && (
              <span className="text-[11px] font-semibold text-rose-500">
                Please enter your About bio.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Practitioner Bank & Payout Details Section */}
      {(user?.accountType === "Practitioner" || user?.accountType === "Instructor") && (
        <BankDetailsCard token={token} />
      )}

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
          <FiCheck style={{ fontSize: '16px' }} /> Save Personal Details
        </button>
      </div>
    </form>
  )
}

function BankDetailsCard({ token }) {
  const [bankForm, setBankForm] = useState({
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankIfscCode: "",
    upiId: "",
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadBankDetails() {
      if (!token) return
      setLoading(true)
      try {
        const res = await apiConnector("GET", "/api/v1/practitioners/bank-details", null, {
          Authorization: `Bearer ${token}`,
        })
        if (res?.data?.success && res.data.bankDetails) {
          const d = res.data.bankDetails
          setBankForm({
            bankName: d.bankName || "",
            bankAccountName: d.bankAccountName || "",
            bankAccountNumber: d.bankAccountNumber || "",
            bankIfscCode: d.bankIfscCode || "",
            upiId: d.upiId || "",
          })
        }
      } catch (e) {
        console.warn("Could not fetch bank details:", e)
      }
      setLoading(false)
    }
    loadBankDetails()
  }, [token])

  const handleSaveBankDetails = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await apiConnector("PUT", "/api/v1/practitioners/bank-details", bankForm, {
        Authorization: `Bearer ${token}`,
      })
      if (res?.data?.success) {
        toast.success("Bank & payout details saved successfully!")
      } else {
        toast.error(res?.data?.message || "Failed to save bank details")
      }
    } catch (e) {
      toast.error("Failed to save bank details")
    }
    setSaving(false)
  }

  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
  const labelClass = "text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5"

  return (
    <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30 p-6 md:p-8 shadow-sm flex flex-col gap-6 text-left">
      <div className="flex items-center justify-between border-b border-indigo-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FiCreditCard className="text-indigo-600" /> Bank & Payout Details
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Admin uses these details to disburse your monthly salary transfers</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Admin Salary Recipient
        </span>
      </div>

      {loading ? (
        <div className="text-xs text-slate-400 py-4">Loading bank details...</div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Bank Name</label>
              <input
                type="text"
                placeholder="e.g. HDFC Bank / ICICI Bank"
                className={inputClass}
                value={bankForm.bankName}
                onChange={(e) => setBankForm((f) => ({ ...f, bankName: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Account Holder Name</label>
              <input
                type="text"
                placeholder="Name as in Bank Account"
                className={inputClass}
                value={bankForm.bankAccountName}
                onChange={(e) => setBankForm((f) => ({ ...f, bankAccountName: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Account Number</label>
              <input
                type="text"
                placeholder="Enter Account Number"
                className={inputClass}
                value={bankForm.bankAccountNumber}
                onChange={(e) => setBankForm((f) => ({ ...f, bankAccountNumber: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>IFSC Code</label>
              <input
                type="text"
                placeholder="e.g. HDFC0001234"
                className={inputClass}
                style={{ textTransform: "uppercase" }}
                value={bankForm.bankIfscCode}
                onChange={(e) => setBankForm((f) => ({ ...f, bankIfscCode: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass}>UPI ID (for direct UPI payouts)</label>
            <input
              type="text"
              placeholder="e.g. yourname@upi or phone@paytm"
              className={inputClass}
              value={bankForm.upiId}
              onChange={(e) => setBankForm((f) => ({ ...f, upiId: e.target.value }))}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveBankDetails}
              disabled={saving}
              style={{
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                color: "#FFFFFF",
                padding: "10px 22px",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "13px",
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <FiCheck /> {saving ? "Saving Payout Details..." : "Save Bank & Payout Details"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


