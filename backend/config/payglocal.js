const crypto = require("crypto")
const fs = require("fs")
const path = require("path")
const { generateJWEAndJWS, generateJWS } = require("payglocal-js-client")
const {
  evaluateGatewayVerification,
  isTrustedPayGlocalStatusUrl,
} = require("../utils/paymentSecurity")

/**
 * PayGlocal Payment Gateway Integration Module
 * "The international payment gateway India builds on"
 *
 * Implements:
 * 1. PayCollect (Live Hosted Checkout flow) initiation using official PayGlocal SDK
 * 2. JWE encryption (RSA-OAEP-256 + A128CBC-HS256) & JWS signature (RS256)
 * 3. Real-time Hosted Checkout redirect to PayGlocal's official payment window
 * 4. Payment status verification using PayGlocal's status endpoint & x-gl-token
 */

const isUnsetSecret = (value) => {
  const v = String(value || "").trim()
  if (!v) return true
  const lower = v.toLowerCase()
  return (
    lower.includes("add_your_") ||
    lower.startsWith("your_") ||
    lower.includes("_here")
  )
}

const realSecret = (value) => (isUnsetSecret(value) ? "" : String(value).trim())

const resolveKey = (envVal, envPath, defaultFileName) => {
  let val = realSecret(envVal)
  if (val && !val.includes("-----BEGIN")) {
    try {
      const resolved = path.isAbsolute(val) ? val : path.resolve(process.cwd(), val)
      if (fs.existsSync(resolved)) {
        return fs.readFileSync(resolved, "utf8").trim()
      }
    } catch (_) {}
  }
  if (val) return val

  const customPath = realSecret(envPath)
  if (customPath) {
    try {
      const resolved = path.isAbsolute(customPath) ? customPath : path.resolve(process.cwd(), customPath)
      if (fs.existsSync(resolved)) {
        return fs.readFileSync(resolved, "utf8").trim()
      }
    } catch (_) {}
  }

  // Check default keys folder in backend/config/keys
  try {
    const defaultPath = path.join(__dirname, "keys", defaultFileName)
    if (fs.existsSync(defaultPath)) {
      return fs.readFileSync(defaultPath, "utf8").trim()
    }
  } catch (_) {}

  return ""
}

const getPayGlocalConfig = () => {
  const isProd =
    process.env.PAYGLOCAL_ENV === "production" ||
    process.env.APP_ENV === "production"

  const merchantId = realSecret(process.env.PAYGLOCAL_MERCHANT_ID) || "ptplpairkraf8500"
  const privateKeyId =
    realSecret(process.env.PAYGLOCAL_PRIVATE_KEY_ID || process.env.PAYGLOCAL_KEY_ID) ||
    "kId-A717KvtJZAnHnXyq"
  const publicKeyId =
    realSecret(process.env.PAYGLOCAL_PUBLIC_KEY_ID) ||
    "8cc91c8d-8030-4660-a9c7-33de886fb495"

  const apiKey = realSecret(
    process.env.PAYGLOCAL_API_KEY || process.env.PAYGLOCAL_SECRET_KEY
  )
  const publicKey = resolveKey(
    process.env.PAYGLOCAL_PUBLIC_KEY,
    process.env.PAYGLOCAL_PUBLIC_KEY_PATH,
    "payglocal_public_key.pem"
  )
  const privateKey = resolveKey(
    process.env.PAYGLOCAL_PRIVATE_KEY,
    process.env.PAYGLOCAL_PRIVATE_KEY_PATH,
    "payglocal_private_key.pem"
  )

  const env = (process.env.PAYGLOCAL_ENV || "").toLowerCase() === "uat" ? "uat" : "production"
  const baseUrl =
    process.env.PAYGLOCAL_BASE_URL ||
    (env === "uat"
      ? "https://api.uat.payglocal.in"
      : "https://api.prod.payglocal.in")

  const backendUrl =
    process.env.BACKEND_URL ||
    (isProd ? "https://api.openhand.live" : "http://localhost:4000")
  const callbackUrl =
    process.env.PAYGLOCAL_CALLBACK_URL && !process.env.PAYGLOCAL_CALLBACK_URL.includes("/practice")
      ? process.env.PAYGLOCAL_CALLBACK_URL
      : `${backendUrl}/api/v1/payments/payglocal/callback`

  return {
    merchantId,
    privateKeyId,
    publicKeyId,
    keyId: privateKeyId,
    apiKey,
    publicKey,
    privateKey,
    env,
    baseUrl,
    callbackUrl,
    isConfigured: Boolean(merchantId && publicKey && privateKey && publicKeyId && privateKeyId),
  }
}

/**
 * Initiate a payment via PayGlocal PayCollect (Live Hosted Checkout Flow).
 *
 * @param {Object} params
 * @param {string} params.merchantTxnId - Unique merchant transaction ID
 * @param {number} params.amount - Payable amount in main currency units (e.g. 9588 INR)
 * @param {string} [params.currency="INR"] - Currency code (INR, USD, EUR, etc.)
 * @param {Object} [params.customer] - Customer data (name, email, phone)
 * @param {Object} [params.notes] - Custom metadata
 * @param {string} [params.callbackUrl] - Return URL after checkout
 * @returns {Promise<Object>} PayGlocal initiation response
 */
const createPayCollectOrder = async ({
  merchantTxnId,
  amount,
  currency = "INR",
  customer = {},
  notes = {},
  callbackUrl,
}) => {
  const config = getPayGlocalConfig()
  const txnId =
    merchantTxnId ||
    `pgl_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  const numAmount = Number(amount) || 0

  let rawPhone = String(customer.phoneNumber || customer.contactNumber || "9999999999").trim()
  let callingCode = "+91"
  if (rawPhone.startsWith("+")) {
    const parts = rawPhone.split(/\s+/)
    if (parts.length > 1) {
      callingCode = parts[0]
      rawPhone = parts.slice(1).join("")
    }
  }
  let cleanDigits = rawPhone.replace(/\D/g, "")
  if (cleanDigits.length > 10 && cleanDigits.startsWith("91")) {
    cleanDigits = cleanDigits.substring(2)
  }
  const finalPhone = cleanDigits.length >= 7 ? cleanDigits : "9999999999"

  const payload = {
    merchantTxnId: txnId,
    captureTxn: true,
    paymentData: {
      totalAmount: numAmount.toFixed(2),
      txnCurrency: currency.toUpperCase(),
      billingData: {
        firstName: customer.firstName || "OpenHand",
        lastName: customer.lastName || "Member",
        addressStreet1: "OpenHand Practitioner Center",
        addressCity: "Mumbai",
        addressState: "Maharashtra",
        addressPostalCode: "400001",
        addressCountry: "IND",
        emailId: customer.email || "user@openhand.live",
        callingCode: callingCode || "+91",
        phoneNumber: finalPhone,
      },
    },
    merchantCallbackURL: callbackUrl || config.callbackUrl,
    clientData: notes,
  }

  // Official PayGlocal SDK JWE encryption + JWS signing
  try {
    const tokens = await generateJWEAndJWS({
      payload,
      publicKey: config.publicKey,
      privateKey: config.privateKey,
      merchantId: config.merchantId,
      publicKeyId: config.publicKeyId,
      privateKeyId: config.privateKeyId,
    })

    const response = await fetch(`${config.baseUrl}/gl/v1/payments/initiate/paycollect`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "Accept": "application/json",
        "x-gl-token-external": tokens.jwsToken,
        "x-gl-merchantId": config.merchantId,
      },
      body: tokens.jweToken,
    })

    const rawText = await response.text()
    let data = null
    try {
      data = JSON.parse(rawText)
    } catch (_) {}

    if (response.ok && data) {
      const liveRedirect =
        data.data?.redirectUrl ||
        data.redirectUrl ||
        (data.gid ? `https://paycollect.payglocal.in/${data.gid}` : null)

      return {
        success: true,
        gid: data.gid || data.data?.gid || `gl_${Date.now()}`,
        merchantTxnId: txnId,
        amount: numAmount,
        currency,
        redirectUrl: liveRedirect,
        statusUrl: data.data?.statusUrl,
        raw: data,
        keyId: config.keyId,
        merchantId: config.merchantId,
        isLiveGateway: true,
      }
    } else {
      console.error("PayGlocal API initiation error response:", response.status, rawText)
      const errorMsg =
        data?.message ||
        data?.errors?.detailedMessage ||
        data?.errors?.[0]?.message ||
        `PayGlocal payment initiation failed (HTTP ${response.status})`
      throw new Error(errorMsg)
    }
  } catch (err) {
    console.error("PayGlocal PayCollect Error:", err.message)
    throw err
  }
}

/**
 * Verify PayGlocal payment status and signature.
 *
 * @param {Object} params
 * @param {string} params.gid - PayGlocal ID
 * @param {string} params.merchantTxnId - Merchant Transaction ID
 * @param {string} [params.token] - x-gl-token from callback / status
 * @param {string} [params.signature] - Payment signature
 * @param {string} [params.statusUrl] - Status URL provided by PayGlocal
 * @returns {Promise<Object>} Verification status
 */
const parseGatewayPayload = (data, fallback) => {
  const st = data?.status || data?.data?.status
  const amount =
    data?.data?.Amount ||
    data?.data?.totalAmount ||
    data?.paymentData?.totalAmount ||
    data?.data?.paymentData?.totalAmount
  const currency =
    data?.data?.Currency ||
    data?.data?.txnCurrency ||
    data?.paymentData?.txnCurrency ||
    data?.data?.paymentData?.txnCurrency
  return {
    status: st,
    gid: data?.gid || data?.data?.gid || fallback.targetId,
    merchantTxnId: data?.data?.merchantTxnId || fallback.merchantTxnId,
    amount,
    currency,
    raw: data,
  }
}

const verifyPayGlocalPayment = async ({
  gid,
  merchantTxnId,
  token,
  signature,
  orderId,
  paymentId,
  statusUrl,
  expectedAmount,
  expectedCurrency = "INR",
}) => {
  const config = getPayGlocalConfig()
  const targetId = gid || paymentId || merchantTxnId || orderId

  if (!targetId) {
    return {
      success: false,
      message: "Missing PayGlocal transaction identification",
    }
  }

  const failClosed = (message, extra = {}) => ({
    success: false,
    message,
    gid: extra.gid || targetId,
    merchantTxnId: extra.merchantTxnId || merchantTxnId || orderId,
    status: extra.status || "UNVERIFIED",
    amount: extra.amount,
    currency: extra.currency,
    raw: extra.raw,
  })

  const acceptIfFinal = (parsed) => {
    const decision = evaluateGatewayVerification({
      status: parsed.status,
      amount: parsed.amount,
      currency: parsed.currency,
      expectedAmount,
      expectedCurrency,
    })
    if (!decision.ok) {
      return failClosed(decision.message, parsed)
    }
    return {
      success: true,
      status: parsed.status,
      gid: parsed.gid,
      merchantTxnId: parsed.merchantTxnId,
      amount: parsed.amount,
      currency: parsed.currency || expectedCurrency,
      raw: parsed.raw,
      verifiedAt: new Date(),
    }
  }

  if (statusUrl && isTrustedPayGlocalStatusUrl(statusUrl, config.baseUrl)) {
    try {
      const res = await fetch(statusUrl)
      if (res.ok) {
        const data = await res.json()
        return acceptIfFinal(parseGatewayPayload(data, { targetId, merchantTxnId: merchantTxnId || orderId }))
      }
    } catch (e) {
      console.warn("PayGlocal direct statusUrl fetch warning:", e.message)
    }
  }

  if (token) {
    try {
      const tokenUrl = `${config.baseUrl}/gl/v1/payments/${encodeURIComponent(targetId)}/status?x-gl-token=${encodeURIComponent(token)}`
      const res = await fetch(tokenUrl)
      if (res.ok) {
        const data = await res.json()
        return acceptIfFinal(parseGatewayPayload(data, { targetId, merchantTxnId: merchantTxnId || orderId }))
      }
    } catch (e) {
      console.warn("PayGlocal token status check warning:", e.message)
    }
  }

  void signature
  return failClosed("PayGlocal payment could not be verified with the gateway")
}

module.exports = {
  getPayGlocalConfig,
  createPayCollectOrder,
  verifyPayGlocalPayment,
}
