import { useState } from "react"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { login } from "../../../services/operations/authAPI"

import SocialAuthButtons from "./SocialAuthButtons"

function LoginForm({ themeColor = "blue", onFormFocus = null, roleTitle = null }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const { email, password } = formData

  // Map display roleTitle → actual accountType string expected in DB
  const expectedAccountType = roleTitle === "Practitioner" ? "Practitioner" : (roleTitle === "Learner" ? "Learner" : null)

  const handleOnChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleOnSubmit = (e) => {
    e.preventDefault()
    dispatch(login(email, password, navigate, expectedAccountType))
  }

  const handleFocus = () => {
    if (expectedAccountType) {
      window.__activeAuthRole = expectedAccountType
      sessionStorage.setItem("socialAuthAccountType", expectedAccountType)
    }
    if (onFormFocus) {
      onFormFocus()
    }
  }

  return (
    <div
      className={`auth-inner-form auth-inner-form--${themeColor}`}
      onMouseEnter={handleFocus}
      onFocusCapture={handleFocus}
    >
      <form onSubmit={handleOnSubmit} className="auth-field-list">
        <div className="auth-field">
          <label className="auth-label">
            Email Address <sup>*</sup>
          </label>
          <input
            required
            type="email"
            name="email"
            value={email}
            onChange={handleOnChange}
            onFocus={handleFocus}
            placeholder="you@example.com"
            className="auth-input"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">
            Password <sup>*</sup>
          </label>
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
            <button
              type="button"
              className="auth-eye-btn"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword
                ? <AiOutlineEyeInvisible fontSize={18} />
                : <AiOutlineEye fontSize={18} />}
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
            <Link
              to="/forgot-password"
              className="auth-forgot"
              style={{
                fontSize: "12px",
                color: themeColor === "violet" ? "#7C3AED" : "#0284C7",
                fontWeight: "600",
              }}
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <button type="submit" className={`auth-submit-btn auth-submit-btn--${themeColor}`}>
          Sign In as {roleTitle || "OpenHand User"} →
        </button>
      </form>

      <p className="auth-switch">
        Don't have an account?{" "}
        <Link to="/signup" className="auth-switch-link">Create free account →</Link>
      </p>

      <SocialAuthButtons
        accountType={expectedAccountType || "Client"}
        mode="login"
      />
    </div>
  )
}

export default LoginForm
