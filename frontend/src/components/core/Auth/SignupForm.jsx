import { useState } from "react"
import { toast } from "react-hot-toast"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { sendOtp } from "../../../services/operations/authAPI"
import { setSignupData } from "../../../slices/authSlice"
import { ACCOUNT_TYPE } from "../../../utils/constants"

import SocialAuthButtons from "./SocialAuthButtons"

function SignupForm() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [accountType, setAccountType] = useState(ACCOUNT_TYPE.CLIENT)

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

  const { title, firstName, lastName, email, password, confirmPassword } = formData

  const handleOnChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleOnSubmit = (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    dispatch(setSignupData({ ...formData, accountType }))
    dispatch(sendOtp(formData.email, navigate))
  }

  const roles = [
    { label: "🧘 Learner", value: ACCOUNT_TYPE.CLIENT },
    { label: "🪷 Practitioner", value: ACCOUNT_TYPE.PRACTITIONER },
  ]

  return (
    <div className="auth-inner-form">
      {/* Role selector */}
      <div className="auth-role-row">
        {roles.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setAccountType(r.value)}
            className={`auth-role-btn ${accountType === r.value ? "auth-role-btn--active" : ""}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleOnSubmit} className="auth-field-list">
        {/* Title & Name row */}
        <div className="auth-name-title-row">
          <div className="auth-field">
            <label className="auth-label">Title</label>
            <select
              name="title"
              value={title}
              onChange={handleOnChange}
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
            placeholder="you@example.com"
            className="auth-input"
          />
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
                placeholder="••••••••"
                className="auth-input"
              />
              <button type="button" className="auth-eye-btn" onClick={() => setShowConfirmPassword((p) => !p)}>
                {showConfirmPassword ? <AiOutlineEyeInvisible fontSize={18} /> : <AiOutlineEye fontSize={18} />}
              </button>
            </div>
          </div>
        </div>

        <button type="submit" className="auth-submit-btn">
          Create Free Account →
        </button>
      </form>

      <p className="auth-switch">
        Already have an account?{" "}
        <Link to="/login" className="auth-switch-link">Sign in →</Link>
      </p>

      <SocialAuthButtons accountType={accountType} mode="signup" />
    </div>
  )
}

export default SignupForm
