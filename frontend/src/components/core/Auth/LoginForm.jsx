import { useState } from "react"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { login } from "../../../services/operations/authAPI"

import SocialAuthButtons from "./SocialAuthButtons"

function LoginForm() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const { email, password } = formData

  const handleOnChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleOnSubmit = (e) => {
    e.preventDefault()
    dispatch(login(email, password, navigate))
  }

  return (
    <div className="auth-inner-form">
      <SocialAuthButtons mode="login" />

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
              ? <AiOutlineEyeInvisible fontSize={20} />
              : <AiOutlineEye fontSize={20} />}
          </button>
        </div>
        <Link to="/forgot-password" className="auth-forgot">
          Forgot password?
        </Link>
      </div>

      <button type="submit" className="auth-submit-btn">
        Sign In to OpenHand
      </button>
    </form>
  </div>
)
}

export default LoginForm
