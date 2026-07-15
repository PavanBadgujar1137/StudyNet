const Razorpay = require("razorpay")

// Fallback if .env does not load (keep in sync with server/.env)
const RAZORPAY_KEY = "rzp_test_TDhFSRuAl18Gcb"
const RAZORPAY_SECRET = "C9toYuVwZMb25GLyeuXQcKhs"

let instance = null

const getRazorpayKeys = () => {
  const key_id = process.env.RAZORPAY_KEY || RAZORPAY_KEY
  const key_secret = process.env.RAZORPAY_SECRET || RAZORPAY_SECRET

  const invalid =
    !key_id ||
    !key_secret ||
    key_secret.includes("PASTE_YOUR") ||
    key_secret.includes("yahan")

  if (invalid) {
    throw new Error(
      "Razorpay SECRET missing. Add RAZORPAY_KEY and RAZORPAY_SECRET in server/.env"
    )
  }

  return { key_id, key_secret }
}

const getRazorpayInstance = () => {
  if (!instance) {
    const { key_id, key_secret } = getRazorpayKeys()
    instance = new Razorpay({ key_id, key_secret })
  }
  return instance
}

module.exports = { getRazorpayInstance, getRazorpayKeys }
