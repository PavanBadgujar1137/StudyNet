import React, { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { FiUser, FiCalendar, FiPhone, FiInfo, FiCheck, FiCreditCard, FiChevronDown, FiSearch, FiLock, FiCopy, FiTag, FiShare2 } from "react-icons/fi"
import { updateProfile } from "../../../../services/operations/SettingsAPI"
import { apiConnector } from "../../../../services/apiConnector"
import { countryCodes, worldCountries } from "../../../../data/countryCodes"
import { getUserDetails } from "../../../../services/operations/profileAPI"
import toast from "react-hot-toast"

const genders = ["Male", "Female", "Non-Binary", "Prefer not to say", "Other"]

export default function EditProfile() {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [copiedId, setCopiedId] = useState(false)

  const isLearner = user?.accountType === "Learner" || user?.accountType === "Client" || user?.accountType === "Student"
  const fullName = `${user?.firstName || 'User'} ${user?.lastName || ''}`.trim()

  const handleCopyLearnerId = () => {
    if (!user?.learnerId) {
      toast.error("Learner ID is syncing, please wait...")
      if (token) dispatch(getUserDetails(token))
      return
    }
    navigator.clipboard.writeText(user.learnerId)
    setCopiedId(true)
    toast.success(`Learner ID ${user.learnerId} copied to clipboard!`)
    setTimeout(() => setCopiedId(false), 2500)
  }

  const handleShareWithPractitioner = () => {
    if (!user?.learnerId) {
      toast.error("Learner ID is syncing, please wait...")
      if (token) dispatch(getUserDetails(token))
      return
    }
    const message = `Hello! My OpenHand Learner ID is ${user.learnerId} (${fullName}). Please use this ID to find my profile and apply my personalized discount or scholarship.`
    navigator.clipboard.writeText(message)
    toast.success("Share message copied! You can paste this to your Practitioner.", { duration: 4000 })
  }

  const parseInitialPhone = (contactStr) => {
    if (!contactStr) return { code: "+91", number: "" }
    const trimmed = String(contactStr).trim()
    // Sort descending by code length so +382 is matched before +38, or +1242 before +1
    const sortedCodes = [...countryCodes].sort((a, b) => b.code.length - a.code.length)
    const matched = sortedCodes.find((c) => trimmed.startsWith(c.code))
    if (matched) {
      const restDigits = trimmed.slice(matched.code.length).replace(/\D/g, "")
      const maxDigits = matched.maxDigits || matched.digits || 15
      return { code: matched.code, number: restDigits.slice(0, maxDigits) }
    }
    if (trimmed.startsWith("+")) {
      const parts = trimmed.split(" ")
      const codePart = parts[0]
      const restDigits = parts.slice(1).join("").replace(/\D/g, "")
      const knownCode = countryCodes.find((c) => c.code === codePart)
      const maxDigits = knownCode ? (knownCode.maxDigits || knownCode.digits || 15) : 15
      return { code: knownCode ? codePart : "+91", number: restDigits.slice(0, maxDigits) }
    }
    const digitsOnly = trimmed.replace(/\D/g, "").slice(0, 10)
    return { code: "+91", number: digitsOnly }
  }

  const dropdownRef = useRef(null)
  const initialPhoneData = parseInitialPhone(user?.additionalDetails?.contactNumber)
  const [countryCode, setCountryCode] = useState(initialPhoneData.code)
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneData.number)
  const [phoneError, setPhoneError] = useState("")
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCountryDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (user?.additionalDetails?.contactNumber) {
      const parsed = parseInitialPhone(user.additionalDetails.contactNumber)
      setCountryCode(parsed.code)
      setPhoneNumber(parsed.number)
    }
  }, [user])

  const activeCountryObj = countryCodes.find((c) => c.code === countryCode) || countryCodes[0]

  const filteredCountryCodes = countryCodes.filter((item) => {
    const q = countrySearch.toLowerCase().trim()
    if (!q) return true
    return (
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      (item.country && item.country.toLowerCase().includes(q))
    )
  })

  const handlePhoneChange = (e) => {
    const rawVal = e.target.value
    const digitsOnly = rawVal.replace(/\D/g, "")
    const maxDigits = activeCountryObj.maxDigits || activeCountryObj.digits || 15
    const minDigits = activeCountryObj.minDigits || (activeCountryObj.digits ? Math.max(activeCountryObj.digits - 2, 6) : 6)
    const truncated = digitsOnly.slice(0, maxDigits)
    setPhoneNumber(truncated)

    if (truncated.length === 0) {
      setPhoneError("Please enter your Contact Number.")
    } else if (truncated.length < minDigits) {
      setPhoneError(`Contact number for ${activeCountryObj.name || activeCountryObj.country} must be at least ${minDigits} digits.`)
    } else {
      setPhoneError("")
    }
  }

  const handleCountryCodeChange = (newCode) => {
    setCountryCode(newCode)
    const newCountryObj = countryCodes.find((c) => c.code === newCode) || countryCodes[0]
    const maxDigits = newCountryObj.maxDigits || newCountryObj.digits || 15
    const minDigits = newCountryObj.minDigits || (newCountryObj.digits ? Math.max(newCountryObj.digits - 2, 6) : 6)
    const truncated = phoneNumber.slice(0, maxDigits)
    setPhoneNumber(truncated)

    if (truncated.length === 0) {
      setPhoneError("Please enter your Contact Number.")
    } else if (truncated.length < minDigits) {
      setPhoneError(`Contact number for ${newCountryObj.name || newCountryObj.country} must be at least ${minDigits} digits.`)
    } else {
      setPhoneError("")
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const submitProfileForm = async (data) => {
    if (!phoneNumber) {
      setPhoneError("Please enter your Contact Number.")
      toast.error("Please enter your Contact Number.")
      return
    }
    if (phoneNumber.length < activeCountryObj.digits) {
      setPhoneError(`Contact number for ${activeCountryObj.name || activeCountryObj.country} must be exactly ${activeCountryObj.digits} digits.`)
      toast.error(`Phone number must be exactly ${activeCountryObj.digits} digits for ${activeCountryObj.name || activeCountryObj.country}`)
      return
    }

    setPhoneError("")
    data.contactNumber = `${countryCode} ${phoneNumber}`

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

        {/* Unique Learner ID (Immutable & Always Visible for Learners) */}
        {isLearner && (
          <div
            style={{
              borderRadius: "18px",
              border: "1.5px solid #A7F3D0",
              background: "linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)",
              padding: "18px 22px",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              boxShadow: "0 2px 8px rgba(16, 185, 129, 0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", maxWidth: "600px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "#059669",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  flexShrink: 0,
                  boxShadow: "0 4px 10px rgba(5, 150, 105, 0.25)",
                }}
              >
                <FiTag style={{ color: "#FFFFFF", fontSize: "20px" }} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#065F46", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Unique Learner ID
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#047857",
                      background: "#D1FAE5",
                      border: "1px solid #A7F3D0",
                      padding: "2px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    <FiLock style={{ fontSize: "10px", color: "#047857" }} /> Permanent
                  </span>
                </div>
                <div style={{ fontSize: "22px", fontWeight: 900, color: "#0F172A", fontFamily: "monospace", marginTop: "2px", letterSpacing: "-0.5px" }}>
                  {user?.learnerId || "Syncing ID..."}
                </div>
                <p style={{ fontSize: "12.5px", color: "#475569", margin: "3px 0 0", lineHeight: "1.45" }}>
                  Give this Unique ID to your Practitioner so they can verify your details (Name, Email, Phone, Photo) and apply your personal discounts or scholarships.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
              <button
                type="button"
                onClick={handleCopyLearnerId}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
                  padding: "10px 18px",
                  borderRadius: "12px",
                  background: copiedId ? "#10B981" : "#059669",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "13px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
                  transition: "all 0.15s ease",
                }}
                title="Copy Learner ID"
              >
                {copiedId ? (
                  <>
                    <FiCheck style={{ fontSize: "15px", color: "#FFFFFF" }} /> Copied!
                  </>
                ) : (
                  <>
                    <FiCopy style={{ fontSize: "15px", color: "#FFFFFF" }} /> Copy ID
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleShareWithPractitioner}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
                  padding: "10px 18px",
                  borderRadius: "12px",
                  border: "1.5px solid #A7F3D0",
                  background: "#FFFFFF",
                  color: "#065F46",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                  transition: "all 0.15s ease",
                }}
                title="Copy friendly message to send to your Practitioner"
              >
                <FiShare2 style={{ fontSize: "15px", color: "#059669" }} /> Share
              </button>
            </div>
          </div>
        )}

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
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50/60 focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
              
              {/* Custom Searchable Country Code Selector Trigger */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsCountryDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 py-3 pl-3.5 pr-2.5 text-xs md:text-sm font-bold text-slate-800 border-r border-slate-200/80 hover:bg-slate-100/70 transition-colors cursor-pointer shrink-0"
                >
                  <span className="text-base leading-none">{activeCountryObj.flag || "🌐"}</span>
                  <span>{activeCountryObj.code}</span>
                  <span className="max-w-[75px] md:max-w-[95px] truncate text-slate-600 font-semibold">{activeCountryObj.name}</span>
                  <FiChevronDown className={`text-slate-400 transition-transform duration-200 ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Popover Dropdown Menu (Opens Downwards below trigger) */}
                {isCountryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 md:w-84 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
                    
                    {/* Search Input Box Inside Dropdown */}
                    <div className="p-2.5 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2">
                      <FiSearch className="text-slate-400 ml-1 shrink-0" size={14} />
                      <input
                        type="text"
                        autoFocus
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder="Search Montenegro, India, +382, +1..."
                        className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none"
                      />
                      {countrySearch && (
                        <button
                          type="button"
                          onClick={() => setCountrySearch("")}
                          className="text-[10px] font-bold text-slate-400 hover:text-slate-600 px-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Scrollable Country Options List */}
                    <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
                      {filteredCountryCodes.length > 0 ? (
                        filteredCountryCodes.map((item, idx) => {
                          const isSelected = item.code === countryCode
                          return (
                            <button
                              key={`${item.code}-${item.name}-${idx}`}
                              type="button"
                              onClick={() => {
                                handleCountryCodeChange(item.code)
                                setIsCountryDropdownOpen(false)
                                setCountrySearch("")
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                                isSelected
                                  ? "bg-indigo-50 text-indigo-700 font-bold"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <span className="text-sm shrink-0">{item.flag || "🌐"}</span>
                              <span className="font-bold text-slate-900 w-12 shrink-0 text-xs">{item.code}</span>
                              <span className="text-slate-800 font-semibold truncate">{item.name}</span>
                            </button>
                          )
                        })
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-400 font-medium">
                          No matching country found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Phone Input Field */}
              <input
                type="tel"
                name="contactNumber"
                id="contactNumber"
                value={phoneNumber}
                maxLength={activeCountryObj.maxDigits || activeCountryObj.digits || 15}
                onChange={handlePhoneChange}
                placeholder="Enter contact number"
                className="w-full bg-transparent px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {/* Helper / Error Line */}
            {phoneError ? (
              <span className="text-[11px] font-semibold text-rose-500">
                {phoneError}
              </span>
            ) : (
              <span className="text-[11px] font-medium text-slate-400">
                Country Code: <b className="text-slate-600">{activeCountryObj.code} ({activeCountryObj.name})</b>
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
    payoutCountry: "India",
    payoutMethod: "bank",
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankIfscCode: "",
    bankIban: "",
    bankSwiftBic: "",
    bankCity: "",
    upiId: "",
    stripeAccountId: "",
    paypalEmail: "",
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
  const [countryFilter, setCountryFilter] = useState("")
  const bankCountryRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bankCountryRef.current && !bankCountryRef.current.contains(event.target)) {
        setIsCountryDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
            payoutCountry: d.payoutCountry || "India",
            payoutMethod: d.payoutMethod || (d.bankIban ? "bank" : d.stripeAccountId ? "stripe" : d.paypalEmail ? "paypal" : "bank"),
            bankName: d.bankName || "",
            bankAccountName: d.bankAccountName || "",
            bankAccountNumber: d.bankAccountNumber || "",
            bankIfscCode: d.bankIfscCode || "",
            bankIban: d.bankIban || "",
            bankSwiftBic: d.bankSwiftBic || "",
            bankCity: d.bankCity || "",
            upiId: d.upiId || "",
            stripeAccountId: d.stripeAccountId || "",
            paypalEmail: d.paypalEmail || "",
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

  const isIndia = bankForm.payoutCountry === "India"
  const isMontenegro = bankForm.payoutCountry === "Montenegro"
  const activeCountry = worldCountries.find((c) => c.name === bankForm.payoutCountry) || { name: bankForm.payoutCountry, flag: "🌐" }

  const filteredCountries = worldCountries.filter((c) => {
    const q = countryFilter.toLowerCase().trim()
    if (!q) return true
    return c.name.toLowerCase().includes(q) || (c.code && c.code.includes(q))
  })

  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
  const labelClass = "text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5"

  return (
    <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30 p-6 md:p-8 shadow-sm flex flex-col gap-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-indigo-100 pb-4 gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FiCreditCard className="text-indigo-600" /> Worldwide Bank &amp; Payout Details
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin uses these international credentials to disburse your monthly earnings directly to your bank or digital account
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ✓ 200+ Countries Supported
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-xs text-slate-400 py-4">Loading bank &amp; payout details...</div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* 1. Country Selection Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeCountry.flag || "🌐"}</span>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Payout Country &amp; Banking Jurisdiction</span>
                <span className="text-sm font-extrabold text-slate-900">
                  {bankForm.payoutCountry} {isMontenegro && "(Montenegro 🇲🇪 - SEPA/IBAN & Stripe Supported)"}
                </span>
              </div>
            </div>

            {/* Change Country Dropdown */}
            <div className="relative" ref={bankCountryRef}>
              <button
                type="button"
                onClick={() => setIsCountryDropdownOpen((p) => !p)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-xs hover:border-indigo-400 hover:text-indigo-600 transition cursor-pointer"
              >
                <span>{activeCountry.flag || "🌐"} Select Country ({bankForm.payoutCountry})</span>
                <FiChevronDown className={`transition-transform duration-200 ${isCountryDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isCountryDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 md:w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    <FiSearch className="text-slate-400 ml-1 shrink-0" size={14} />
                    <input
                      type="text"
                      autoFocus
                      value={countryFilter}
                      onChange={(e) => setCountryFilter(e.target.value)}
                      placeholder="Search Montenegro, India, US..."
                      className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none"
                    />
                    {countryFilter && (
                      <button type="button" onClick={() => setCountryFilter("")} className="text-xs text-slate-400 hover:text-slate-600 px-1">✕</button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
                    {filteredCountries.map((c, i) => {
                      const isSel = c.name === bankForm.payoutCountry
                      return (
                        <button
                          key={`${c.name}-${i}`}
                          type="button"
                          onClick={() => {
                            setBankForm((f) => ({ ...f, payoutCountry: c.name }))
                            setIsCountryDropdownOpen(false)
                            setCountryFilter("")
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition ${
                            isSel ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-base">{c.flag || "🌐"}</span>
                          <span className="truncate flex-1">{c.name}</span>
                          {c.code && <span className="text-[11px] text-slate-400 font-mono">{c.code}</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Direct Bank / Wire Transfer Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                🏦 Bank Account &amp; Wire Transfer Details
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {isIndia ? "Domestic NEFT / RTGS / IMPS" : "International Wire / SEPA / IBAN"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Account Holder Full Legal Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sandra Markovic / Dr. Yash Purbhe"
                  className={inputClass}
                  value={bankForm.bankAccountName}
                  onChange={(e) => setBankForm((f) => ({ ...f, bankAccountName: e.target.value }))}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Bank Name *</label>
                <input
                  type="text"
                  placeholder={isMontenegro ? "e.g. Crnogorska Komercijalna Banka / Erste Bank" : isIndia ? "e.g. HDFC Bank / ICICI Bank" : "e.g. Chase Bank / Barclays"}
                  className={inputClass}
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm((f) => ({ ...f, bankName: e.target.value }))}
                />
              </div>
            </div>

            {/* International Fields (Montenegro / Europe / Worldwide) */}
            {!isIndia ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>
                      IBAN (International Bank Account Number)
                      <span className="text-[10px] text-indigo-600 font-normal lowercase">(Montenegro: ME25...)</span>
                    </label>
                    <input
                      type="text"
                      placeholder={isMontenegro ? "e.g. ME25 5300 0000 0001 2345 67" : "e.g. GB29 NWBK 6016 1331 9268 19"}
                      style={{ textTransform: "uppercase", fontFamily: "monospace" }}
                      className={inputClass}
                      value={bankForm.bankIban}
                      onChange={(e) => setBankForm((f) => ({ ...f, bankIban: e.target.value.toUpperCase() }))}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>SWIFT / BIC Code</label>
                    <input
                      type="text"
                      placeholder={isMontenegro ? "e.g. CKBEME22 (8 or 11 characters)" : "e.g. CHASUS33"}
                      style={{ textTransform: "uppercase", fontFamily: "monospace" }}
                      className={inputClass}
                      value={bankForm.bankSwiftBic}
                      onChange={(e) => setBankForm((f) => ({ ...f, bankSwiftBic: e.target.value.toUpperCase() }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Bank City / Branch Location</label>
                    <input
                      type="text"
                      placeholder={isMontenegro ? "e.g. Podgorica, Montenegro" : "e.g. London, UK / New York, USA"}
                      className={inputClass}
                      value={bankForm.bankCity}
                      onChange={(e) => setBankForm((f) => ({ ...f, bankCity: e.target.value }))}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Account Number (Optional fallback)</label>
                    <input
                      type="text"
                      placeholder="Account number if applicable"
                      className={inputClass}
                      value={bankForm.bankAccountNumber}
                      onChange={(e) => setBankForm((f) => ({ ...f, bankAccountNumber: e.target.value }))}
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Indian Domestic Banking Fields */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Bank Account Number *</label>
                  <input
                    type="text"
                    placeholder="Enter domestic account number"
                    className={inputClass}
                    value={bankForm.bankAccountNumber}
                    onChange={(e) => setBankForm((f) => ({ ...f, bankAccountNumber: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>IFSC Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC0001234"
                    style={{ textTransform: "uppercase", fontFamily: "monospace" }}
                    className={inputClass}
                    value={bankForm.bankIfscCode}
                    onChange={(e) => setBankForm((f) => ({ ...f, bankIfscCode: e.target.value.toUpperCase() }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Global Digital Processors (Stripe, PayPal, UPI) */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                💳 Digital Processors &amp; Wallets
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {isMontenegro ? "Ideal for Montenegro & International Accounts" : "Instant direct transfer"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stripe Account ID / Email */}
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>
                  Stripe Account ID or Connected Email
                  <span className="text-[10px] text-indigo-600 font-semibold">(Direct Stripe Payout)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. acct_1N... or your Stripe login email"
                  className={inputClass}
                  value={bankForm.stripeAccountId}
                  onChange={(e) => setBankForm((f) => ({ ...f, stripeAccountId: e.target.value }))}
                />
                <span className="text-[11px] text-slate-500">
                  {isMontenegro ? "You can enter your own or brother's Stripe account identifier." : "Admin can disburse payouts directly to your Stripe account balance."}
                </span>
              </div>

              {/* PayPal / UPI */}
              {isIndia ? (
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>UPI ID (for instant direct transfers)</label>
                  <input
                    type="text"
                    placeholder="e.g. yourname@upi or mobile@paytm"
                    className={inputClass}
                    value={bankForm.upiId}
                    onChange={(e) => setBankForm((f) => ({ ...f, upiId: e.target.value }))}
                  />
                  <span className="text-[11px] text-slate-500">Fast domestic transfer via UPI</span>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>PayPal Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. payouts@paypal.me"
                    className={inputClass}
                    value={bankForm.paypalEmail}
                    onChange={(e) => setBankForm((f) => ({ ...f, paypalEmail: e.target.value }))}
                  />
                  <span className="text-[11px] text-slate-500">Alternative international digital payout method</span>
                </div>
              )}
            </div>
          </div>

          {/* Action button */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-indigo-100 gap-3">
            <span className="text-xs text-slate-500">
              🔒 Bank details are encrypted and securely stored for administrative payout verification.
            </span>
            <button
              type="button"
              onClick={handleSaveBankDetails}
              disabled={saving}
              style={{
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                color: "#FFFFFF",
                padding: "11px 26px",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "13px",
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
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



