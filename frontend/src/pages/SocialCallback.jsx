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
    const params = new URLSearchParams(hash.replace(/^#/, '?'))
    const idToken = params.get('id_token')

    // 2. Check query params
    const searchParams = new URLSearchParams(window.location.search)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (idToken) {
      const payload = decodeJwt(idToken)
      if (payload && payload.email) {
        const authData = {
          email: payload.email,
          firstName: payload.given_name || payload.name || payload.email.split('@')[0],
          lastName: payload.family_name || '',
          image: payload.picture || '',
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
      const provider = state?.includes('linkedin') ? 'linkedin' : 'google'
      const authData = {
        code,
        email: searchParams.get('email') || undefined,
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0F172A', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ width: 48, height: 48, border: '4px solid #3B82F6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 16 }} />
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Authenticating with Google...</h2>
      <p style={{ color: '#94A3B8', fontSize: 14 }}>Completing secure sign in and redirecting to your workspace...</p>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default SocialCallback
