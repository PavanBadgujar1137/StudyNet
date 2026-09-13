import React from 'react'
import { useSelector } from 'react-redux'
import logoIcon from '../assets/Logo/Logo-Icon.png'
import LoginForm from '../components/core/Auth/LoginForm'

function Login() {
  const { loading } = useSelector((state) => state.auth)

  return (
    <div className="dynamic-login-page">
      {/* Ambient Background Grid & Soft Glow Blobs */}
      <div className="login-bg-grid" />
      <div className="login-glow-blob login-glow-blob--1" />
      <div className="login-glow-blob login-glow-blob--2" />

      {loading ? (
        <div className="auth-spinner-wrap">
          <div className="auth-spinner" />
        </div>
      ) : (
        <main className="login-main-container">
          <div className="login-card-wrapper">
            {/* Header Hero Section */}
            <div className="login-hero">
              <div className="login-icon-badge">
                <img src={logoIcon} alt="OpenHand Logo" className="login-logo-img" />
              </div>

              <div className="login-headline">
                <h1 className="login-title">Welcome Back to OpenHand</h1>
                <p className="login-sub">
                  Sign in to access your integrative care space, daily check-ins, and practitioner sessions.
                </p>
              </div>
            </div>

            {/* Login Form Body */}
            <div className="login-form-container">
              <LoginForm />
            </div>
          </div>
        </main>
      )}
    </div>
  )
}

export default Login
