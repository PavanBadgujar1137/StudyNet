const Razorpay = require("razorpay")

let instance = null

const getRazorpayKeys = () => {
  const key_id = process.env.RAZORPAY_KEY
  const key_secret = process.env.RAZORPAY_SECRET

  if (!key_id || !key_secret) {
    throw new Error(
      "Razorpay credentials missing. Please define RAZORPAY_KEY and RAZORPAY_SECRET in backend/.env"
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
