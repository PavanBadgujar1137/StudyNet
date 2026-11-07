const crypto = require("crypto")

const PUBLIC_SIGNUP_ACCOUNT_TYPES = Object.freeze([
  "Learner",
  "Client",
  "Student",
  "Practitioner",
  "Instructor",
])

const PRIVILEGED_ACCOUNT_TYPES = Object.freeze(["Admin", "OrgAdmin"])

const DEFAULT_PUBLIC_ACCOUNT_TYPE = "Learner"

function timingSafeEqualString(a, b) {
  const left = Buffer.from(String(a || ""), "utf8")
  const right = Buffer.from(String(b || ""), "utf8")
  if (left.length === 0 || right.length === 0 || left.length !== right.length) {
    return false
  }
  return crypto.timingSafeEqual(left, right)
}

function resolvePublicSignupAccountType(accountType) {
  const requested = String(accountType || "").trim()
  if (!requested) {
    return { ok: true, accountType: DEFAULT_PUBLIC_ACCOUNT_TYPE }
  }
  if (PRIVILEGED_ACCOUNT_TYPES.includes(requested)) {
    return { ok: false, message: "Invalid account type" }
  }
  if (!PUBLIC_SIGNUP_ACCOUNT_TYPES.includes(requested)) {
    return { ok: false, message: "Invalid account type" }
  }
  return { ok: true, accountType: requested }
}

function extractAdminBootstrapSecret(req) {
  const header =
    req?.headers?.["x-admin-bootstrap-secret"] ||
    req?.header?.("x-admin-bootstrap-secret")
  const bodySecret = req?.body?.bootstrapSecret
  return header || bodySecret || ""
}

function isAdminBootstrapAuthorized(providedSecret) {
  const expected = process.env.ADMIN_BOOTSTRAP_SECRET
  if (!expected || String(expected).trim().length < 16) {
    return false
  }
  return timingSafeEqualString(providedSecret, expected)
}

function isPrivilegedAccountType(accountType) {
  return PRIVILEGED_ACCOUNT_TYPES.includes(String(accountType || "").trim())
}

module.exports = {
  PUBLIC_SIGNUP_ACCOUNT_TYPES,
  PRIVILEGED_ACCOUNT_TYPES,
  DEFAULT_PUBLIC_ACCOUNT_TYPE,
  resolvePublicSignupAccountType,
  extractAdminBootstrapSecret,
  isAdminBootstrapAuthorized,
  isPrivilegedAccountType,
  timingSafeEqualString,
}
