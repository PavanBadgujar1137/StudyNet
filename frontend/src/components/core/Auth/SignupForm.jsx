import { useState } from "react"
import { toast } from "react-hot-toast"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { sendOtp } from "../../../services/operations/authAPI"
import { setSignupData } from "../../../slices/authSlice"
import { ACCOUNT_TYPE } from "../../../utils/constants"

import SocialAuthButtons from "./SocialAuthButtons"

function SignupForm({ fixedAccountType = null, onFormFocus = null, themeColor = "blue" }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [accountType, setAccountType] = useState(fixedAccountType || ACCOUNT_TYPE.CLIENT)

  const [formData, setFormData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailError, setEmailError] = useState("")

  const { title, firstName, lastName, email, password, confirmPassword } = formData

  const activeRole = fixedAccountType || accountType

  const handleOnChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (e.target.name === "email" && emailError) {
      setEmailError("")
    }
  }

  const handleOnSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    setEmailError("")
    dispatch(setSignupData({ ...formData, accountType: activeRole }))
    const success = await dispatch(sendOtp(formData.email, navigate))
    if (!success) {
      setEmailError("This email is already registered. Each account requires a unique email address. Please sign in or use another email to register.")
    }
  }

  const handleFocus = () => {
    if (onFormFocus) {
      onFormFocus(activeRole === ACCOUNT_TYPE.PRACTITIONER ? "practitioner" : "learner")
    }
  }

  const roles = [
    { label: "🧘 Learner", value: ACCOUNT_TYPE.CLIENT },
    { label: "🪷 Practitioner", value: ACCOUNT_TYPE.PRACTITIONER },
  ]

  return (
    <div 
      className={`auth-inner-form auth-inner-form--${themeColor}`}
      onMouseEnter={handleFocus}
      onFocusCapture={handleFocus}
    >
      {/* Email Already Registered Inline Banner Alert */}
      {emailError && (
        <div className="auth-email-error-banner" style={{
          background: "#FEF2F2",
          border: "1.5px solid #FCA5A5",
          borderRadius: "10px",
          padding: "12px 14px",
          marginBottom: "16px",
          color: "#991B1B",
          fontSize: "12.5px",
          lineHeight: "1.4",
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        }}>
          <span style={{ fontWeight: "700" }}>⚠️ Email Already Registered</span>
          <span>{emailError}</span>
          <Link to="/login" style={{ color: "#2563EB", fontWeight: "700", textDecoration: "underline", marginTop: "2px" }}>
            Already registered? Sign in to your account →
          </Link>
        </div>
      )}

      {/* Role selector if not fixed */}
      {!fixedAccountType && (
        <div className="auth-role-row">
          {roles.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => {
                setAccountType(r.value)
                if (onFormFocus) {
                  onFormFocus(r.value === ACCOUNT_TYPE.PRACTITIONER ? "practitioner" : "learner")
                }
              }}
              className={`auth-role-btn ${accountType === r.value ? "auth-role-btn--active" : ""}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleOnSubmit} className="auth-field-list">
        {/* Title & Name row */}
        <div className="auth-name-title-row">
          <div className="auth-field auth-field--title">
            <label className="auth-label">Title</label>
            <select
              name="title"
              value={title}
              onChange={handleOnChange}
              onFocus={handleFocus}
              className="auth-input"
              style={{ cursor: 'pointer' }}
            >
              <option value="">None</option>
              <option value="Dr.">Dr.</option>
              <option value="Prof.">Prof.</option>
              <option value="Mr.">Mr.</option>
              <option value="Ms.">Ms.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Mx.">Mx.</option>
            </select>
          </div>
          <div className="auth-field">
            <label className="auth-label">First Name <sup>*</sup></label>
            <input
              required
              type="text"
              name="firstName"
              value={firstName}
              onChange={handleOnChange}
              onFocus={handleFocus}
              placeholder="First"
              className="auth-input"
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Last Name <sup>*</sup></label>
            <input
              required
              type="text"
              name="lastName"
              value={lastName}
              onChange={handleOnChange}
              onFocus={handleFocus}
              placeholder="Last"
              className="auth-input"
            />
          </div>
        </div>

        {/* Email */}
        <div className="auth-field">
          <label className="auth-label">Email Address <sup>*</sup></label>
          <input
            required
            type="email"
            name="email"
            value={email}
            onChange={handleOnChange}
            onFocus={handleFocus}
            placeholder="you@example.com"
            className="auth-input"
            style={emailError ? { borderColor: "#EF4444", backgroundColor: "#FEF2F2" } : {}}
          />
          {emailError && (
            <span style={{ color: "#DC2626", fontSize: "11.5px", fontWeight: "600", marginTop: "4px", display: "block" }}>
              ⚠️ This email is already registered. Please sign in or use a different email.
            </span>
          )}
        </div>

        {/* Password row */}
        <div className="auth-name-row">
          <div className="auth-field">
            <label className="auth-label">Password <sup>*</sup></label>
            <div className="auth-input-wrap">
              <input
                required
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={handleOnChange}
                onFocus={handleFocus}
                placeholder="••••••••"
                className="auth-input"
              />
              <button type="button" className="auth-eye-btn" onClick={() => setShowPassword((p) => !p)}>
                {showPassword ? <AiOutlineEyeInvisible fontSize={18} /> : <AiOutlineEye fontSize={18} />}
              </button>
            </div>
          </div>
          <div className="auth-field">
            <label className="auth-label">Confirm Password <sup>*</sup></label>
            <div className="auth-input-wrap">
              <input
                required
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleOnChange}
                onFocus={handleFocus}
                placeholder="••••••••"
                className="auth-input"
              />
              <button type="button" className="auth-eye-btn" onClick={() => setShowConfirmPassword((p) => !p)}>
                {showConfirmPassword ? <AiOutlineEyeInvisible fontSize={18} /> : <AiOutlineEye fontSize={18} />}
              </button>
            </div>
          </div>
        </div>

        <button type="submit" className={`auth-submit-btn auth-submit-btn--${themeColor}`}>
          Create {activeRole === ACCOUNT_TYPE.PRACTITIONER ? "Practitioner" : "Learner"} Account →
        </button>
      </form>

      {!fixedAccountType && (
        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login" className="auth-switch-link">Sign in →</Link>
        </p>
      )}

      <SocialAuthButtons accountType={activeRole} mode="signup" />
    </div>
  )
}

export default SignupForm
