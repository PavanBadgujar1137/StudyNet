const FINAL_SUCCESS_STATUSES = new Set([
  "COMPLETED",
  "SUCCESS",
  "SENT_FOR_CAPTURE",
  "CAPTURED",
  "AUTHORIZED",
])

const NON_SUCCESS_STATUSES = new Set([
  "INPROGRESS",
  "IN_PROGRESS",
  "PENDING",
  "INITIATED",
  "CREATED",
  "FAILED",
  "CANCELLED",
  "CANCELED",
  "DECLINED",
  "EXPIRED",
  "ERROR",
])

function normalizeStatus(status) {
  return String(status || "").trim().toUpperCase()
}

function isFinalSuccessStatus(status) {
  const normalized = normalizeStatus(status)
  if (!normalized || NON_SUCCESS_STATUSES.has(normalized)) return false
  return FINAL_SUCCESS_STATUSES.has(normalized)
}

function amountsMatch(expected, actual) {
  if (expected == null || actual == null || actual === "") return false
  const left = Number(expected)
  const right = Number(actual)
  if (!Number.isFinite(left) || !Number.isFinite(right)) return false
  return Math.abs(left - right) < 0.05
}

function currenciesMatch(expected, actual) {
  const left = String(expected || "").trim().toUpperCase() || "INR"
  if (actual == null || String(actual).trim() === "") {
    return false
  }
  const right = String(actual).trim().toUpperCase()
  return left === right
}

function isTrustedPayGlocalStatusUrl(url, baseUrl) {
  if (!url || typeof url !== "string") return false
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "https:") return false
    const host = parsed.hostname.toLowerCase()
    if (host === "api.prod.payglocal.in" || host === "api.uat.payglocal.in") return true
    if (host.endsWith(".payglocal.in")) return true
    if (baseUrl) {
      const baseHost = new URL(baseUrl).hostname.toLowerCase()
      if (host === baseHost) return true
    }
    return false
  } catch (_) {
    return false
  }
}

function allowedFrontendOrigins() {
  const origins = new Set()
  const add = (value) => {
    if (!value) return
    try {
      origins.add(new URL(String(value)).origin)
    } catch (_) {}
  }
  add(process.env.FRONTEND_URL || "http://localhost:3000")
  add("https://openhand.live")
  add("https://www.openhand.live")
  add("http://localhost:3000")
  add("http://localhost:5173")
  if (process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS.split(",").forEach((item) => add(item.trim()))
  }
  return origins
}

function sanitizePaymentReturnUrl(returnUrl) {
  const fallbackPath = "/app/practitioners"
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000"
  if (!returnUrl || typeof returnUrl !== "string") {
    return { href: `${frontendUrl}${fallbackPath}`, path: fallbackPath }
  }
  const trimmed = returnUrl.trim()
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("\\")) {
    const path = trimmed.split("#")[0]
    return { href: `${frontendUrl}${path}`, path }
  }
  try {
    const parsed = new URL(trimmed)
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { href: `${frontendUrl}${fallbackPath}`, path: fallbackPath }
    }
    if (!allowedFrontendOrigins().has(parsed.origin)) {
      return { href: `${frontendUrl}${fallbackPath}`, path: fallbackPath }
    }
    return { href: parsed.toString(), path: parsed.pathname + parsed.search }
  } catch (_) {
    return { href: `${frontendUrl}${fallbackPath}`, path: fallbackPath }
  }
}

function evaluateGatewayVerification({ status, amount, currency, expectedAmount, expectedCurrency }) {
  if (!isFinalSuccessStatus(status)) {
    return {
      ok: false,
      message: "Payment is not in a verified final success state",
    }
  }
  if (expectedAmount != null && amount != null && amount !== "" && !amountsMatch(expectedAmount, amount)) {
    return {
      ok: false,
      message: "Gateway amount does not match the trusted order amount",
    }
  }
  if (!currenciesMatch(expectedCurrency, currency)) {
    return {
      ok: false,
      message: "Gateway currency does not match the trusted order currency",
    }
  }
  return { ok: true }
}

function idsEqual(left, right) {
  if (left == null || right == null) return false
  return String(left) === String(right)
}

module.exports = {
  FINAL_SUCCESS_STATUSES,
  isFinalSuccessStatus,
  amountsMatch,
  currenciesMatch,
  isTrustedPayGlocalStatusUrl,
  sanitizePaymentReturnUrl,
  evaluateGatewayVerification,
  idsEqual,
  allowedFrontendOrigins,
}
