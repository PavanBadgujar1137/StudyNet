import React, { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { socialLogin } from "../services/operations/authAPI"
import { apiConnector } from "../services/apiConnector"

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

function SocialCallback() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isCalendar, setIsCalendar] = useState(false)
  const [isSocialStudio, setIsSocialStudio] = useState(false)

  useEffect(() => {
    // 1. Check URL hash (Google Implicit / Token flow)
    const hash = window.location.hash
    const hashParams = new URLSearchParams(hash.replace(/^#/, '?'))
    const idToken = hashParams.get('id_token')
    const hashState = hashParams.get('state')

    // 2. Check query params
    const searchParams = new URLSearchParams(window.location.search)
    const code = searchParams.get('code')
    const queryState = searchParams.get('state')
    const authError = searchParams.get('error')

    const rawState = hashState || queryState

    // Decode state (may be JSON-encoded or base64 JSON)
    let parsedState = null
    if (rawState) {
      try {
        parsedState = JSON.parse(decodeURIComponent(rawState))
      } catch (e) {
        try {
          parsedState = JSON.parse(atob(rawState))
        } catch (e2) {}
      }
    }

    // ─── GOOGLE CALENDAR OAUTH FLOW ──────────────────────────────────────────
    const isCalendarFlow = Boolean(
      parsedState?.isCalendar ||
      parsedState?.type === "google_calendar" ||
      (typeof rawState === "string" && (rawState.includes("isCalendar") || rawState.includes("google_calendar")))
    )

    if (isCalendarFlow) {
      setIsCalendar(true)
      const targetPath = parsedState?.returnTo || "/practice"

      if (authError) {
        if (window.opener) {
          window.opener.postMessage({ type: "CALENDAR_AUTH_ERROR", error: authError }, "*")
          window.close()
          return
        }
        navigate(`${targetPath}?calendar_error=${encodeURIComponent(authError)}`)
        return
      }

      if (code) {
        const redirectUri = parsedState?.redirectUri || `${window.location.origin}/social-callback`
        let token = null
        try {
          const storedToken = localStorage.getItem("token")
          token = storedToken ? (storedToken.startsWith('"') ? JSON.parse(storedToken) : storedToken) : null
        } catch (e) {}

        apiConnector(
          "POST",
          "/api/v1/calendar/auth/callback",
          {
            code,
            state: rawState,
            redirectUri,
          },
          token ? { Authorization: `Bearer ${token}` } : {}
        )
          .then(() => {
            if (window.opener) {
              window.opener.postMessage({ type: "CALENDAR_AUTH_SUCCESS" }, "*")
              window.close()
            } else {
              navigate(`${targetPath}?calendar_connected=true`)
            }
          })
          .catch((err) => {
            console.error("Calendar OAuth token exchange failed:", err)
            if (window.opener) {
              window.opener.postMessage({ type: "CALENDAR_AUTH_ERROR", error: "token_exchange_failed" }, "*")
              window.close()
            } else {
              navigate(`${targetPath}?calendar_error=token_exchange_failed`)
            }
          })
        return
      }
    }

    // ─── SOCIAL STUDIO (LINKEDIN) CHANNEL OAUTH FLOW ────────────────────────
    const isSocialStudioFlow = Boolean(
      parsedState?.isSocialStudio ||
      (typeof rawState === "string" && rawState.includes("isSocialStudio"))
    )

    if (isSocialStudioFlow) {
      setIsSocialStudio(true)
      const targetPath = parsedState?.returnTo || "/practice?tab=channels"

      if (authError) {
        if (window.opener) {
          window.opener.postMessage({ type: "SOCIAL_STUDIO_AUTH_ERROR", error: authError }, "*")
          window.close()
          return
        }
        const sep = targetPath.includes("?") ? "&" : "?"
        navigate(`${targetPath}${sep}linkedin_error=${encodeURIComponent(authError)}`)
        return
      }

      if (code) {
        const redirectUri = parsedState?.redirectUri || process.env.REACT_APP_LINKEDIN_REDIRECT_URI || `${window.location.origin}/social-callback`
        let token = null
        try {
          const storedToken = localStorage.getItem("token")
          token = storedToken ? (storedToken.startsWith('"') ? JSON.parse(storedToken) : storedToken) : null
        } catch (e) {}

        apiConnector(
          "POST",
          "/api/v1/social-posts/oauth/linkedin/callback",
          {
            code,
            state: rawState,
            redirectUri,
          },
          token ? { Authorization: `Bearer ${token}` } : {}
        )
          .then(() => {
            if (window.opener) {
              window.opener.postMessage({ type: "SOCIAL_STUDIO_AUTH_SUCCESS", platform: "linkedin" }, "*")
              window.close()
            } else {
              const sep = targetPath.includes("?") ? "&" : "?"
              navigate(`${targetPath}${sep}social_connected=linkedin`)
            }
          })
          .catch((err) => {
            console.error("LinkedIn OAuth token exchange failed:", err)
            const errMsg = err?.response?.data?.message || err?.message || "token_exchange_failed"
            if (window.opener) {
              window.opener.postMessage({ type: "SOCIAL_STUDIO_AUTH_ERROR", error: errMsg }, "*")
              window.close()
            } else {
              const sep = targetPath.includes("?") ? "&" : "?"
              navigate(`${targetPath}${sep}linkedin_error=${encodeURIComponent(errMsg)}`)
            }
          })
        return
      }
    }

    // ─── SOCIAL SIGN-IN FLOW ────────────────────────────────────────────────
    // Extract accountType from state, localStorage, or sessionStorage
    let savedAccountType = undefined
    if (parsedState?.accountType) {
      savedAccountType = parsedState.accountType
    } else if (rawState) {
      if (rawState.includes("Practitioner")) savedAccountType = "Practitioner"
      else if (rawState.includes("Learner") || rawState.includes("Client")) savedAccountType = "Client"
    }
    if (!savedAccountType) {
      savedAccountType = localStorage.getItem("socialAuthAccountType") || sessionStorage.getItem("socialAuthAccountType") || undefined
    }

    if (idToken) {
      const payload = decodeJwt(idToken)
      if (payload && payload.email) {
        const authData = {
          email: payload.email,
          firstName: payload.given_name || payload.name || payload.email.split('@')[0],
          lastName: payload.family_name || '',
          image: payload.picture || '',
          accountType: savedAccountType,
        }

        if (window.opener) {
          window.opener.postMessage({ type: 'SOCIAL_AUTH_SUCCESS', provider: 'google', data: authData }, '*')
          window.close()
          return
        }

        dispatch(socialLogin('google', authData, navigate))
        return
      }
    }

    if (code) {
      // For OAuth Code flow
      const provider = rawState?.includes('linkedin') ? 'linkedin' : 'google'
      const redirectUri = process.env.REACT_APP_LINKEDIN_REDIRECT_URI || `${window.location.origin}/social-callback`
      const authData = {
        code,
        email: searchParams.get('email') || undefined,
        redirectUri,
        accountType: savedAccountType,
      }

      if (window.opener) {
        window.opener.postMessage({ type: 'SOCIAL_AUTH_SUCCESS', provider, data: authData }, '*')
        window.close()
        return
      }

      dispatch(socialLogin(provider, authData, navigate))
      return
    }

    // Fallback if no params found
    setTimeout(() => {
      if (window.opener) {
        window.close()
      } else {
        navigate('/login')
      }
    }, 1500)
  }, [dispatch, navigate])

  const searchParams = new URLSearchParams(window.location.search)
  const isLinkedIn = window.location.search.includes('linkedin') || (searchParams.get('state') && searchParams.get('state').includes('linkedin'))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0F172A', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ width: 48, height: 48, border: `4px solid ${isLinkedIn ? '#0A66C2' : '#3B82F6'}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 16 }} />
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>
        {isCalendar
          ? 'Connecting Google Calendar...'
          : isSocialStudio
          ? 'Connecting LinkedIn Channel...'
          : `Authenticating with ${isLinkedIn ? 'LinkedIn' : 'Google'}...`}
      </h2>
      <p style={{ color: '#94A3B8', fontSize: 14 }}>
        {isCalendar
          ? 'Syncing your schedule and updating practice availability...'
          : isSocialStudio
          ? 'Authorizing your LinkedIn profile for Social Post Studio...'
          : 'Completing secure sign in and redirecting to your workspace...'}
      </p>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default SocialCallback
