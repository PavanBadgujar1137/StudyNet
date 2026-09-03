const Razorpay = require("razorpay")

let instance = null

const getRazorpayKeys = () => {
  const key_id = process.env.RAZORPAY_KEY || "rzp_test_TDhFSRuAl18Gcb"
  const key_secret = process.env.RAZORPAY_SECRET || "dummy_secret_123456789"

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
