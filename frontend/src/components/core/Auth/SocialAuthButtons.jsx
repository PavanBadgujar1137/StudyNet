import React, { useEffect, useCallback, useRef } from "react"
import { FcGoogle } from "react-icons/fc"
import { FaLinkedin } from "react-icons/fa"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { socialLogin } from "../../../services/operations/authAPI"

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

function SocialAuthButtons({ accountType = "Client", mode = "login" }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const initializedRef = useRef(false)

  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID
  const linkedinClientId = process.env.REACT_APP_LINKEDIN_CLIENT_ID

  const handleSocialSuccess = useCallback(
    (provider, data) => {
      const resolvedRole = data?.accountType || window.__activeAuthRole || localStorage.getItem("socialAuthAccountType") || accountType || "Client"
      dispatch(
        socialLogin(
          provider,
          {
            ...data,
            accountType: resolvedRole,
          },
          navigate
        )
      )
    },
    [dispatch, navigate, accountType]
  )

  const handleSocialSuccessRef = useRef(handleSocialSuccess)
  useEffect(() => {
    handleSocialSuccessRef.current = handleSocialSuccess
  }, [handleSocialSuccess])

  // Listen for OAuth postMessage callbacks from popup windows
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === "SOCIAL_AUTH_SUCCESS") {
        const { provider, data } = event.data
        handleSocialSuccessRef.current(provider, data)
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  // Initialize Google Identity Services (GSI) One-Tap / Prompt if available (only once globally)
  useEffect(() => {
    if (window.google?.accounts?.id && googleClientId && !window.__openhand_gsi_initialized) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          use_fedcm_for_prompt: true,
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: (response) => {
            if (response.credential) {
              const payload = decodeJwt(response.credential)
              if (payload && payload.email) {
                const targetRole = window.__activeAuthRole || localStorage.getItem("socialAuthAccountType") || sessionStorage.getItem("socialAuthAccountType") || accountType || "Client"
                dispatch(
                  socialLogin(
                    "google",
                    {
                      email: payload.email,
                      firstName: payload.given_name || payload.name || payload.email.split("@")[0],
                      lastName: payload.family_name || "",
                      image: payload.picture || "",
                      accountType: targetRole,
                      mode,
                    },
                    navigate
                  )
                )
              }
            }
          },
        })
        window.__openhand_gsi_initialized = true
        initializedRef.current = true
      } catch (err) {
        // GSI initialization warning suppressed
      }
    }
  }, [googleClientId, accountType, mode, dispatch, navigate])

  const handleGoogleSignIn = () => {
    window.__activeAuthRole = accountType
    sessionStorage.setItem("socialAuthAccountType", accountType)
    localStorage.setItem("socialAuthAccountType", accountType)
    // Directly open Google OAuth Account Chooser popup for reliable cross-origin sign-in
    openGooglePopup()
  }

  const openGooglePopup = () => {
    window.__activeAuthRole = accountType
    sessionStorage.setItem("socialAuthAccountType", accountType)
    localStorage.setItem("socialAuthAccountType", accountType)
    const redirectUri = `${window.location.origin}/social-callback`
    const stateParam = encodeURIComponent(JSON.stringify({ accountType, mode, provider: "google" }))
    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(googleClientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token%20id_token` +
      `&scope=${encodeURIComponent("openid profile email")}` +
      `&state=${stateParam}` +
      `&prompt=select_account` +
      `&nonce=${Date.now()}`

    const width = 520
    const height = 620
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      googleAuthUrl,
      "GoogleSignInWindow",
      `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
    )

    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      // Popup blocked - redirect directly to Google Account Chooser
      window.location.href = googleAuthUrl
    }
  }

  const handleLinkedInSignIn = () => {
    window.__activeAuthRole = accountType
    sessionStorage.setItem("socialAuthAccountType", accountType)
    const redirectUri = process.env.REACT_APP_LINKEDIN_REDIRECT_URI || `${window.location.origin}/social-callback`
    const stateParam = encodeURIComponent(JSON.stringify({ provider: "linkedin", accountType, mode }))
    const linkedinAuthUrl =
      `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code` +
      `&client_id=${encodeURIComponent(linkedinClientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent("openid profile email")}` +
      `&state=${stateParam}`

    const width = 520
    const height = 650
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      linkedinAuthUrl,
      "LinkedInSignInWindow",
      `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
    )

    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      window.location.href = linkedinAuthUrl
    }
  }

  return (
    <>
      <div className="auth-divider">
        <span>OR CONNECT WITH SOCIAL</span>
      </div>

      <div className="auth-social-buttons">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="auth-social-btn auth-social-btn--google"
        >
          <FcGoogle size={20} />
          <span>{mode === "signup" ? "Sign up with Google" : "Sign in with Google"}</span>
        </button>

        <button
          type="button"
          onClick={handleLinkedInSignIn}
          className="auth-social-btn auth-social-btn--linkedin"
        >
          <FaLinkedin size={20} color="#0A66C2" />
          <span>{mode === "signup" ? "Sign up with LinkedIn" : "Sign in with LinkedIn"}</span>
        </button>
      </div>
    </>
  )
}

export default SocialAuthButtons
