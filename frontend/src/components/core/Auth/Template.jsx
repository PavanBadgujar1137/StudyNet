import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import logoIcon from "../../../assets/Logo/Logo-Icon.png"
import LoginForm from "./LoginForm"
import SignupForm from "./SignupForm"

function Template({ title, description1, description2, formType }) {
  const { loading } = useSelector((state) => state.auth)

  return (
    <div className="auth-page-wrap">
      {/* Animated gradient background */}
      <div className="auth-bg-blob auth-bg-blob--1" />
      <div className="auth-bg-blob auth-bg-blob--2" />
      <div className="auth-bg-blob auth-bg-blob--3" />

      {loading ? (
        <div className="auth-spinner-wrap">
          <div className="auth-spinner" />
        </div>
      ) : (
        <div className="auth-container">
          {/* ── Left Panel: Brand ── */}
          <div className="auth-brand-panel">
            <div className="auth-brand-inner">
              {/* Logo + wordmark */}
              <Link to="/" className="auth-logo-link">
                <img src={logoIcon} alt="OpenHand Logo" className="auth-logo-img" />
                <span className="auth-wordmark">
                  Open<span className="auth-wordmark-accent">Hand</span>
                </span>
              </Link>

              <p className="auth-brand-tagline">
                "Your Growth, Our Guidance."
              </p>

              {/* Feature pills */}
              <div className="auth-pills">
                <span className="auth-pill">🧠 AI Co-Pilot</span>
                <span className="auth-pill">🌀 Private Circles</span>
                <span className="auth-pill">💳 Instant Payouts</span>
                <span className="auth-pill">📋 Clinical Notes</span>
              </div>

              {/* Quote block */}
              <div className="auth-quote">
                <p>"I stopped using four separate tools the week I joined OpenHand."</p>
                <span>— Dr. Meera Iyer, Growth Practitioner</span>
              </div>

              {/* Trust row */}
              <div className="auth-trust">
                <div className="auth-trust-dot" />
                <span>Trusted by 1,200+ practitioners across India</span>
              </div>
            </div>

            {/* Decorative card floating */}
            <div className="auth-float-card">
              <div className="auth-float-card__row">
                <div className="auth-av">MI</div>
                <div>
                  <b>Meera Iyer</b>
                  <span>₹1,24,500 this month</span>
                </div>
                <div className="auth-float-card__badge">▲ 18%</div>
              </div>
              <div className="auth-float-card__bar">
                <div className="auth-float-card__fill" style={{ width: "78%" }} />
              </div>
              <p className="auth-float-card__sub">Next payout clears Thursday</p>
            </div>
          </div>

          {/* ── Right Panel: Form ── */}
          <div className="auth-form-panel">
            <div className="auth-form-card">
              {/* Form header */}
              <div className="auth-form-header">
                <h1 className="auth-form-title">{title}</h1>
                <p className="auth-form-desc">
                  {description1}{" "}
                  <span className="auth-form-desc-accent">{description2}</span>
                </p>
              </div>

              {/* Toggle pills: Login / Register */}
              <div className="auth-toggle">
                <Link
                  to="/login"
                  className={`auth-toggle-btn ${formType === "login" ? "auth-toggle-btn--active" : ""}`}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className={`auth-toggle-btn ${formType === "signup" ? "auth-toggle-btn--active" : ""}`}
                >
                  Create Account
                </Link>
              </div>

              {/* The actual form */}
              <div className="auth-form-body">
                {formType === "signup" ? <SignupForm /> : <LoginForm />}
              </div>

              {/* Footer link */}
              <p className="auth-switch">
                {formType === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <Link to="/signup" className="auth-switch-link">Start free →</Link>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <Link to="/login" className="auth-switch-link">Sign in →</Link>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Template
