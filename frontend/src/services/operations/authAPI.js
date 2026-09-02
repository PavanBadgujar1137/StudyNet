import { toast } from "react-hot-toast"

import { setLoading, setToken } from "../../slices/authSlice"
import { setUser } from "../../slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { endpoints } from "../apis"
import { getInitialsAvatar } from "../../utils/getInitialsAvatar"

const {
  SENDOTP_API,
  SIGNUP_API,
  LOGIN_API,
  SOCIAL_LOGIN_API,
  RESETPASSTOKEN_API,
  RESETPASSWORD_API,
} = endpoints

export function socialLogin(provider, socialData, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading(`Connecting to ${provider === "google" ? "Google" : "LinkedIn"}...`)
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", SOCIAL_LOGIN_API, {
        provider,
        ...socialData,
      })

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Social authentication failed")
      }

      toast.success(response.data.message || "Authentication Successful", { id: toastId })
      const token = response.data.token
      const user = response.data.user

      dispatch(setToken(token))
      const userImage = (user?.image && !user.image.includes("dicebear"))
        ? user.image
        : getInitialsAvatar(user?.firstName, user?.lastName)

      const fullUser = { ...user, image: userImage }
      dispatch(setUser(fullUser))

      localStorage.setItem("token", JSON.stringify(token))
      localStorage.setItem("user", JSON.stringify(fullUser))

      if (user?.accountType === "Admin") {
        navigate("/admin")
      } else {
        navigate("/dashboard")
      }
    } catch (error) {
      console.error("SOCIAL_LOGIN_API ERROR............", error)
      const errorMsg = error?.response?.data?.message || error?.message || "Social Login Failed"
      toast.error(errorMsg, { id: toastId })
    } finally {
      dispatch(setLoading(false))
    }
  }
}

export function sendOtp(email, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Sending OTP...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", SENDOTP_API, {
        email,
        checkUserPresent: true,
      })
      console.log("SENDOTP API RESPONSE............", response)

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || response?.data?.error || "Could not send OTP")
      }

      toast.success(response.data.message || "OTP Sent Successfully", { id: toastId })
      if (navigate) navigate("/verify-email")
      return true
    } catch (error) {
      console.log("SENDOTP API ERROR............", error)
      const serverMessage = error?.response?.data?.message || error?.response?.data?.error
      const errorMsg =
        serverMessage ||
        (error?.message && !error.message.includes("AxiosError") && !error.message.includes("status code")
          ? error.message
          : "This email is already registered. Please sign in or use another email to register.")
      toast.error(errorMsg, { id: toastId, duration: 6000 })
      return false
    } finally {
      dispatch(setLoading(false))
    }
  }
}

export function signUp(
  accountType,
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  otp,
  navigate
) {
  return async (dispatch) => {
    const toastId = toast.loading("Registering account...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", SIGNUP_API, {
        accountType,
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        otp,
      })

      console.log("SIGNUP API RESPONSE............", response)

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Signup Failed")
      }
      toast.success("Registration Successful", { id: toastId })

      const user = response.data.user
      const token = response.data.token

      if (token && user) {
        dispatch(setToken(token))
        const userImage = user.image
          ? user.image
          : `https://api.dicebear.com/5.x/initials/svg?seed=${user.firstName} ${user.lastName}`
        dispatch(setUser({ ...user, image: userImage }))

        localStorage.setItem("token", JSON.stringify(token))
        localStorage.setItem("user", JSON.stringify({ ...user, image: userImage }))

        navigate("/dashboard")
      } else {
        navigate("/login")
      }
    } catch (error) {
      console.log("SIGNUP API ERROR............", error)
      const errorMsg = error?.response?.data?.message || error?.message || "Signup Failed"
      toast.error(errorMsg, { id: toastId })
      navigate("/signup")
    } finally {
      dispatch(setLoading(false))
    }
  }
}

export function login(email, password, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Logging in...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", LOGIN_API, {
        email,
        password,
      })

      console.log("LOGIN API RESPONSE............", response)

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Login Failed")
      }

      toast.success("Login Successful", { id: toastId })
      dispatch(setToken(response.data.token))
      const userImage = (response.data?.user?.image && !response.data.user.image.includes("dicebear"))
        ? response.data.user.image
        : getInitialsAvatar(response.data?.user?.firstName, response.data?.user?.lastName)
      dispatch(setUser({ ...response.data.user, image: userImage }))
      if (response.data?.user?.accountType === "Admin") {
        navigate("/admin")
      } else {
        navigate("/dashboard")
      }
    } catch (error) {
      console.log("LOGIN API ERROR............", error)
      const errorMsg = error?.response?.data?.message || error?.message || "Login Failed"
      toast.error(errorMsg, { id: toastId })
    } finally {
      dispatch(setLoading(false))
    }
  }
}

export function getPasswordResetToken(email, setEmailSent) {
  return async (dispatch) => {
    const toastId = toast.loading("Sending reset link...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", RESETPASSTOKEN_API, {
        email,
      })

      console.log("RESETPASSTOKEN RESPONSE............", response)

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Failed to send reset link")
      }

      toast.success("Reset Email Sent", { id: toastId })
      if (setEmailSent) setEmailSent(true)
    } catch (error) {
      console.log("RESETPASSTOKEN ERROR............", error)
      const errorMsg = error?.response?.data?.message || error?.message || "Failed To Send Reset Email"
      toast.error(errorMsg, { id: toastId })
    } finally {
      dispatch(setLoading(false))
    }
  }
}

export function resetPassword(password, confirmPassword, token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Resetting password...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", RESETPASSWORD_API, {
        password,
        confirmPassword,
        token,
      })

      console.log("RESETPASSWORD RESPONSE............", response)

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Password reset failed")
      }

      toast.success("Password Reset Successfully", { id: toastId })
      if (navigate) navigate("/login")
    } catch (error) {
      console.log("RESETPASSWORD ERROR............", error)
      const errorMsg = error?.response?.data?.message || error?.message || "Failed To Reset Password"
      toast.error(errorMsg, { id: toastId })
    } finally {
      dispatch(setLoading(false))
    }
  }
}

export function logout(navigate, showToast = true) {
  return (dispatch) => {
    dispatch(setToken(null))
    dispatch(setUser(null))
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    if (showToast) {
      toast.success("Logged Out")
    }
    if (navigate) navigate("/")
  }
}
