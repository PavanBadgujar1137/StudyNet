const { describe, it } = require("node:test")
const assert = require("node:assert/strict")
const {
  isFinalSuccessStatus,
  amountsMatch,
  currenciesMatch,
  evaluateGatewayVerification,
  isTrustedPayGlocalStatusUrl,
  sanitizePaymentReturnUrl,
} = require("../utils/paymentSecurity")

describe("PayGlocal status classification", () => {
  it("treats only documented final success statuses as paid", () => {
    assert.equal(isFinalSuccessStatus("SENT_FOR_CAPTURE"), true)
    assert.equal(isFinalSuccessStatus("COMPLETED"), true)
    assert.equal(isFinalSuccessStatus("SUCCESS"), true)
    assert.equal(isFinalSuccessStatus("AUTHORIZED"), true)
  })

  it("does not treat in-progress or failed statuses as paid", () => {
    assert.equal(isFinalSuccessStatus("INPROGRESS"), false)
    assert.equal(isFinalSuccessStatus("PENDING"), false)
    assert.equal(isFinalSuccessStatus("FAILED"), false)
    assert.equal(isFinalSuccessStatus(""), false)
  })
})

describe("amount and currency binding", () => {
  it("requires gateway amounts to match the trusted order", () => {
    assert.equal(amountsMatch(999, "999.00"), true)
    assert.equal(amountsMatch(9588, 1), false)
    const mismatch = evaluateGatewayVerification({
      status: "SENT_FOR_CAPTURE",
      amount: 1,
      currency: "INR",
      expectedAmount: 9588,
      expectedCurrency: "INR",
    })
    assert.equal(mismatch.ok, false)
  })

  it("fails closed when the status is not a final success", () => {
    const result = evaluateGatewayVerification({
      status: "INPROGRESS",
      amount: 999,
      currency: "INR",
      expectedAmount: 999,
      expectedCurrency: "INR",
    })
    assert.equal(result.ok, false)
  })

  it("validates currenciesMatch unit behavior correctly", () => {
    // Matching cases
    assert.equal(currenciesMatch("INR", "INR"), true)
    assert.equal(currenciesMatch("inr", "INR"), true)
    assert.equal(currenciesMatch("INR", "inr"), true)
    assert.equal(currenciesMatch("  INR  ", " inr "), true)
    assert.equal(currenciesMatch("USD", "USD"), true)

    // Mismatched cases
    assert.equal(currenciesMatch("INR", "USD"), false)
    assert.equal(currenciesMatch("USD", "INR"), false)
    assert.equal(currenciesMatch("INR", "EUR"), false)

    // Missing actual currency when expected is configured
    assert.equal(currenciesMatch("INR", null), false)
    assert.equal(currenciesMatch("INR", undefined), false)
    assert.equal(currenciesMatch("INR", ""), false)
    assert.equal(currenciesMatch("INR", "   "), false)

    // Missing or blank expected currency safely defaults to platform INR
    assert.equal(currenciesMatch(null, "INR"), true)
    assert.equal(currenciesMatch(undefined, "INR"), true)
    assert.equal(currenciesMatch("", "INR"), true)
    assert.equal(currenciesMatch("   ", "INR"), true)

    // Missing expected currency does NOT match non-INR currencies or missing actual
    assert.equal(currenciesMatch(null, "USD"), false)
    assert.equal(currenciesMatch(undefined, "USD"), false)
    assert.equal(currenciesMatch("", "USD"), false)
    assert.equal(currenciesMatch("   ", "USD"), false)
    assert.equal(currenciesMatch(null, null), false)
    assert.equal(currenciesMatch(undefined, undefined), false)
    assert.equal(currenciesMatch("", ""), false)
    assert.equal(currenciesMatch("   ", "   "), false)
  })

  it("evaluates gateway currency correctly in evaluateGatewayVerification", () => {
    // Matching currency succeeds
    const matched = evaluateGatewayVerification({
      status: "SENT_FOR_CAPTURE",
      amount: 999,
      currency: "INR",
      expectedAmount: 999,
      expectedCurrency: "INR",
    })
    assert.equal(matched.ok, true)

    // Explicit non-INR matching currency succeeds
    const matchedUsd = evaluateGatewayVerification({
      status: "SENT_FOR_CAPTURE",
      amount: 50,
      currency: "USD",
      expectedAmount: 50,
      expectedCurrency: "USD",
    })
    assert.equal(matchedUsd.ok, true)

    // Mismatched currency fails closed
    const mismatched = evaluateGatewayVerification({
      status: "SENT_FOR_CAPTURE",
      amount: 999,
      currency: "USD",
      expectedAmount: 999,
      expectedCurrency: "INR",
    })
    assert.equal(mismatched.ok, false)
    assert.equal(mismatched.message, "Gateway currency does not match the trusted order currency")

    // Missing/empty/whitespace gateway currency fails closed when expectedCurrency is set
    for (const missingCurrency of [null, undefined, "", "   "]) {
      const missing = evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 999,
        currency: missingCurrency,
        expectedAmount: 999,
        expectedCurrency: "INR",
      })
      assert.equal(missing.ok, false)
      assert.equal(missing.message, "Gateway currency does not match the trusted order currency")
    }

    // When expectedCurrency is omitted, null, or blank, it defaults to INR
    // and correctly accepts INR actual currency
    for (const emptyExpected of [undefined, null, "", "   "]) {
      const defaultedMatch = evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 999,
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: emptyExpected,
      })
      assert.equal(defaultedMatch.ok, true)
    }

    // When expectedCurrency is omitted, null, or blank, it fails closed
    // for non-INR actual currency (cannot bypass currency validation)
    for (const emptyExpected of [undefined, null, "", "   "]) {
      const defaultedMismatch = evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 999,
        currency: "USD",
        expectedAmount: 999,
        expectedCurrency: emptyExpected,
      })
      assert.equal(defaultedMismatch.ok, false)
      assert.equal(defaultedMismatch.message, "Gateway currency does not match the trusted order currency")
    }

    // When expectedCurrency is omitted, null, or blank, missing actual currency fails closed
    for (const emptyExpected of [undefined, null, "", "   "]) {
      const defaultedMissingActual = evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 999,
        currency: null,
        expectedAmount: 999,
        expectedCurrency: emptyExpected,
      })
      assert.equal(defaultedMissingActual.ok, false)
      assert.equal(defaultedMissingActual.message, "Gateway currency does not match the trusted order currency")
    }
  })
})

describe("callback and status URL trust", () => {
  it("rejects arbitrary status URLs", () => {
    assert.equal(isTrustedPayGlocalStatusUrl("https://evil.example/status"), false)
    assert.equal(isTrustedPayGlocalStatusUrl("http://api.prod.payglocal.in/status"), false)
    assert.equal(isTrustedPayGlocalStatusUrl("https://api.prod.payglocal.in/gl/v1/payments/abc/status"), true)
  })

  it("rejects absolute return URLs that are not on the product frontend", () => {
    process.env.FRONTEND_URL = "http://localhost:3000"
    const unsafe = sanitizePaymentReturnUrl("https://attacker.example/phish")
    assert.equal(unsafe.path, "/app/practitioners")
    const relative = sanitizePaymentReturnUrl("/practice?ok=1")
    assert.equal(relative.path, "/practice?ok=1")
  })
})
