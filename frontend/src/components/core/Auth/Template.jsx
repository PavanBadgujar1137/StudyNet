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
                <img src={logoIcon} alt="StudyNet Logo" className="auth-logo-img" />
                <span className="auth-wordmark">
                  Study<span className="auth-wordmark-accent">Net</span>
                </span>
              </Link>

              <p className="auth-brand-tagline">
                Next-Gen Educational &amp; Practice Space Platform
              </p>

              {/* Feature pills */}
              <div className="auth-pills">
                <span className="auth-pill">📹 HD Zoom Live Classes</span>
                <span className="auth-pill">📚 Smart Course Hub</span>
                <span className="auth-pill">📊 Telemetry &amp; Check-ins</span>
                <span className="auth-pill">👥 Peer Growth Circles</span>
              </div>

              {/* Platform Overview block */}
              <div className="auth-quote">
                <p>"Empowering instructors to build spaces and students to learn with live video streaming, daily check-ins, and automated certificates."</p>
                <span>StudyNet Platform Ecosystem</span>
              </div>

              {/* Trust row */}
              <div className="auth-trust">
                <div className="auth-trust-dot" />
                <span>Live MongoDB Database &amp; Zoom API Connected</span>
              </div>
            </div>

            {/* Platform Feature Highlight Card */}
            <div className="auth-float-card">
              <div className="auth-float-card__row">
                <div className="auth-av" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>
                  📹
                </div>
                <div>
                  <b>Zoom Live Session Hub</b>
                  <span>In-Dashboard HD Video &amp; Telemetry</span>
                </div>
                <div className="auth-float-card__badge" style={{ background: 'rgba(52,211,153,0.15)', color: '#34D399' }}>
                  🔴 LIVE
                </div>
              </div>
              <div className="auth-float-card__bar">
                <div className="auth-float-card__fill" style={{ width: "100%", background: "linear-gradient(90deg, #10B981, #2563EB)" }} />
              </div>
              <p className="auth-float-card__sub">Secure Encrypted Authentication &amp; Live Synchronization</p>
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
