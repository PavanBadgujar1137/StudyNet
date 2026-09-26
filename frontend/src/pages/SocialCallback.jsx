import React, { useEffect } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { socialLogin } from "../services/operations/authAPI"

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

    const rawState = hashState || queryState

    // Extract accountType from state, localStorage, or sessionStorage
    let savedAccountType = undefined
    if (rawState) {
      try {
        const parsedState = JSON.parse(decodeURIComponent(rawState))
        if (parsedState?.accountType) savedAccountType = parsedState.accountType
      } catch (e) {
        if (rawState.includes("Practitioner")) savedAccountType = "Practitioner"
        else if (rawState.includes("Learner") || rawState.includes("Client")) savedAccountType = "Client"
      }
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
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Authenticating with {isLinkedIn ? 'LinkedIn' : 'Google'}...</h2>
      <p style={{ color: '#94A3B8', fontSize: 14 }}>Completing secure sign in and redirecting to your workspace...</p>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default SocialCallback
