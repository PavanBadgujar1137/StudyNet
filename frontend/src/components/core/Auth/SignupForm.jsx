import { useState } from "react"
import { toast } from "react-hot-toast"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { sendOtp } from "../../../services/operations/authAPI"
import { setSignupData } from "../../../slices/authSlice"
import { ACCOUNT_TYPE } from "../../../utils/constants"

function SignupForm() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [accountType, setAccountType] = useState(ACCOUNT_TYPE.CLIENT)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { firstName, lastName, email, password, confirmPassword } = formData

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
    setFormData({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" })
  }

  const roles = [
    { label: "🌱 Client", value: ACCOUNT_TYPE.CLIENT },
    { label: "🧘 Practitioner", value: ACCOUNT_TYPE.PRACTITIONER },
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
        {/* Name row */}
        <div className="auth-name-row">
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

        {/* Practitioner Bank / Payout details for Admin Salary Transfers (Optional) */}
        {accountType === ACCOUNT_TYPE.PRACTITIONER && (
          <div style={{ background: "#F8FAFC", border: "1.5px dashed #CBD5E1", borderRadius: "12px", padding: "14px", marginTop: "4px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#1E293B", marginBottom: "2px" }}>
              💳 Payout & Bank Details (for Admin Salary Transfers)
            </div>
            <div style={{ fontSize: "11px", color: "#64748B", marginBottom: "10px" }}>
              Admin uses these details to send your monthly salary payouts (can also be updated later in Settings).
            </div>
            <div className="auth-name-row" style={{ marginBottom: "8px" }}>
              <div className="auth-field">
                <label className="auth-label">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName || ""}
                  onChange={handleOnChange}
                  placeholder="e.g. HDFC Bank"
                  className="auth-input"
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Account Holder Name</label>
                <input
                  type="text"
                  name="bankAccountName"
                  value={formData.bankAccountName || ""}
                  onChange={handleOnChange}
                  placeholder="Name as per Bank"
                  className="auth-input"
                />
              </div>
            </div>
            <div className="auth-name-row" style={{ marginBottom: "8px" }}>
              <div className="auth-field">
                <label className="auth-label">Account Number</label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber || ""}
                  onChange={handleOnChange}
                  placeholder="A/C Number"
                  className="auth-input"
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">IFSC Code</label>
                <input
                  type="text"
                  name="bankIfscCode"
                  value={formData.bankIfscCode || ""}
                  onChange={handleOnChange}
                  placeholder="e.g. HDFC0001234"
                  className="auth-input"
                  style={{ textTransform: "uppercase" }}
                />
              </div>
            </div>
            <div className="auth-field">
              <label className="auth-label">UPI ID (Optional)</label>
              <input
                type="text"
                name="upiId"
                value={formData.upiId || ""}
                onChange={handleOnChange}
                placeholder="e.g. name@upi"
                className="auth-input"
              />
            </div>
          </div>
        )}

        <button type="submit" className="auth-submit-btn">
          Create Free Account →
        </button>
      </form>
    </div>
  )
}

export default SignupForm
