const { describe, it } = require("node:test")
const assert = require("node:assert/strict")
const {
  isFinalSuccessStatus,
  toMinorUnits,
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

  it("rejects missing, null, empty, whitespace-only, non-finite, and mismatched amounts in evaluateGatewayVerification", () => {
    // Missing / null / undefined amount
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: null,
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: undefined,
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )

    // Empty / whitespace-only amount
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: "",
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: "   ",
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )

    // Invalid non-finite strings
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: "invalid-amount",
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )

    // Booleans, arrays, and objects rejected in evaluateGatewayVerification (including zero amount)
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: false,
        currency: "INR",
        expectedAmount: 0,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: true,
        currency: "INR",
        expectedAmount: 1,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: [],
        currency: "INR",
        expectedAmount: 0,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: [999],
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: {},
        currency: "INR",
        expectedAmount: 0,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: { amount: 999 },
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 0,
        currency: "INR",
        expectedAmount: false,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 0,
        currency: "INR",
        expectedAmount: [],
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 0,
        currency: "INR",
        expectedAmount: {},
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )

    // Negative amounts and negative numeric strings rejected
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: -999,
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: "-999",
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: -1,
        currency: "INR",
        expectedAmount: -1,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )

    // Hexadecimal, binary, octal, scientific notation, and sign-prefixed strings rejected
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: "0x10",
        currency: "INR",
        expectedAmount: 16,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: "0b10",
        currency: "INR",
        expectedAmount: 2,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: "0o10",
        currency: "INR",
        expectedAmount: 8,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: "1e3",
        currency: "INR",
        expectedAmount: 1000,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: "+999",
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )

    // Values with more than two decimal places (e.g. 999.004) cannot be represented in minor units and are rejected
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 999.004,
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: "999.004",
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 999,
        currency: "INR",
        expectedAmount: 999.004,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 999,
        currency: "INR",
        expectedAmount: "999.004",
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )

    // Values with tiny sub-minor fractions (e.g. 999.00000001) cannot be represented in minor units and are rejected
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 999.00000001,
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: "999.00000001",
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 999,
        currency: "INR",
        expectedAmount: 999.00000001,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 999,
        currency: "INR",
        expectedAmount: "999.00000001",
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )

    // Distinguishable sub-minor fraction (999.000000000001) rejected
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 999.000000000001,
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: "999.000000000001",
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 999,
        currency: "INR",
        expectedAmount: 999.000000000001,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 999,
        currency: "INR",
        expectedAmount: "999.000000000001",
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )

    // Large magnitude sub-minor fraction (9999999.000000002) rejected
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 9999999.000000002,
        currency: "INR",
        expectedAmount: 9999999,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: "9999999.000000002",
        currency: "INR",
        expectedAmount: 9999999,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 9999999,
        currency: "INR",
        expectedAmount: 9999999.000000002,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 9999999,
        currency: "INR",
        expectedAmount: "9999999.000000002",
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )

    // Precision boundary tests (reject genuine differences of one or more minor currency units in INR)
    // 999 vs 998.96 differs by 0.04 (4 paise) - previously accepted by < 0.05, now strictly rejected
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 998.96,
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: "998.96",
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    // 1 paisa differences (0.01) rejected
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 998.99,
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 999.01,
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )

    // Legitimate zero amounts
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 0,
        currency: "INR",
        expectedAmount: 0,
        expectedCurrency: "INR",
      }),
      { ok: true }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: "0.00",
        currency: "INR",
        expectedAmount: 0,
        expectedCurrency: "INR",
      }),
      { ok: true }
    )

    // Legitimate matching amounts (numeric and string format)
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 999,
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: "INR",
      }),
      { ok: true }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: "999.00",
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: "INR",
      }),
      { ok: true }
    )

    // Mismatched amount
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 1,
        currency: "INR",
        expectedAmount: 999,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )

    // Missing, null, or undefined expectedAmount fails closed
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 999,
        currency: "INR",
        expectedAmount: null,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
    assert.deepEqual(
      evaluateGatewayVerification({
        status: "SENT_FOR_CAPTURE",
        amount: 999,
        currency: "INR",
        expectedAmount: undefined,
        expectedCurrency: "INR",
      }),
      { ok: false, message: "Gateway amount does not match the trusted order amount" }
    )
  })

  it("validates toMinorUnits conversion and safe-integer boundaries", () => {
    assert.equal(toMinorUnits(999), 99900)
    assert.equal(toMinorUnits("999"), 99900)
    assert.equal(toMinorUnits("999.00"), 99900)
    assert.equal(toMinorUnits("999.5"), 99950)
    assert.equal(toMinorUnits(999.5), 99950)
    assert.equal(toMinorUnits(0), 0)
    assert.equal(toMinorUnits("0.00"), 0)
    assert.equal(toMinorUnits(0.07), 7)
    assert.equal(toMinorUnits(0.29), 29)
    assert.equal(toMinorUnits("0.07"), 7)
    assert.equal(toMinorUnits("0.29"), 29)
    assert.equal(toMinorUnits(9999999), 999999900)
    assert.equal(toMinorUnits("9999999"), 999999900)
    assert.equal(toMinorUnits("9999999.00"), 999999900)

    // Invalid sub-minor unit values
    assert.equal(toMinorUnits(999.004), null)
    assert.equal(toMinorUnits("999.004"), null)
    assert.equal(toMinorUnits(999.00000001), null)
    assert.equal(toMinorUnits("999.00000001"), null)
    assert.equal(toMinorUnits(999.000000000001), null)
    assert.equal(toMinorUnits("999.000000000001"), null)
    assert.equal(toMinorUnits(9999999.000000002), null)
    assert.equal(toMinorUnits("9999999.000000002"), null)

    // Non-finite, negative, or invalid types
    assert.equal(toMinorUnits(-999), null)
    assert.equal(toMinorUnits("-999"), null)
    assert.equal(toMinorUnits("0x10"), null)
    assert.equal(toMinorUnits(false), null)
    assert.equal(toMinorUnits([]), null)
    assert.equal(toMinorUnits({}), null)
    assert.equal(toMinorUnits(null), null)
    assert.equal(toMinorUnits(undefined), null)
  })

  it("validates amountsMatch unit behavior comprehensively", () => {
    // Matching numeric and string representations
    assert.equal(amountsMatch(999, 999), true)
    assert.equal(amountsMatch(999, "999"), true)
    assert.equal(amountsMatch(999, "999.00"), true)
    assert.equal(amountsMatch("999", 999.0), true)
    assert.equal(amountsMatch(999, "  999.00  "), true)

    // Mismatched
    assert.equal(amountsMatch(999, 1000), false)
    assert.equal(amountsMatch(9588, 1), false)

    // Rejection of values with more than two decimal places (cannot be represented exactly in minor units)
    assert.equal(amountsMatch(999, 999.004), false)
    assert.equal(amountsMatch(999.004, 999), false)
    assert.equal(amountsMatch(999, "999.004"), false)
    assert.equal(amountsMatch("999.004", 999), false)
    assert.equal(amountsMatch(999.004, 999.004), false)
    assert.equal(amountsMatch("999.004", "999.004"), false)
    assert.equal(amountsMatch(999, 999.001), false)
    assert.equal(amountsMatch(999, "999.001"), false)

    // Rejection of values with tiny sub-minor fractions (e.g. 999.00000001)
    assert.equal(amountsMatch(999, 999.00000001), false)
    assert.equal(amountsMatch(999.00000001, 999), false)
    assert.equal(amountsMatch(999, "999.00000001"), false)
    assert.equal(amountsMatch("999.00000001", 999), false)
    assert.equal(amountsMatch(999.00000001, 999.00000001), false)
    assert.equal(amountsMatch("999.00000001", "999.00000001"), false)
    assert.equal(amountsMatch(999, 999.0000001), false)
    assert.equal(amountsMatch(999, "999.0000001"), false)

    // Distinguishable sub-minor fraction (999.000000000001) rejected
    assert.equal(amountsMatch(999, 999.000000000001), false)
    assert.equal(amountsMatch(999.000000000001, 999), false)
    assert.equal(amountsMatch(999, "999.000000000001"), false)
    assert.equal(amountsMatch("999.000000000001", 999), false)
    assert.equal(amountsMatch(999.000000000001, 999.000000000001), false)
    assert.equal(amountsMatch("999.000000000001", "999.000000000001"), false)

    // Large magnitude sub-minor fraction (9999999.000000002) rejected
    assert.equal(amountsMatch(9999999, 9999999.000000002), false)
    assert.equal(amountsMatch(9999999.000000002, 9999999), false)
    assert.equal(amountsMatch(9999999, "9999999.000000002"), false)
    assert.equal(amountsMatch("9999999.000000002", 9999999), false)
    assert.equal(amountsMatch(9999999.000000002, 9999999.000000002), false)
    assert.equal(amountsMatch("9999999.000000002", "9999999.000000002"), false)

    // Valid large magnitude amounts match
    assert.equal(amountsMatch(9999999, 9999999), true)
    assert.equal(amountsMatch(9999999, "9999999"), true)
    assert.equal(amountsMatch(9999999, "9999999.00"), true)
    assert.equal(amountsMatch("9999999", 9999999.0), true)

    // Valid 2-decimal numbers match
    assert.equal(amountsMatch(0.07, 0.07), true)
    assert.equal(amountsMatch(0.07, "0.07"), true)
    assert.equal(amountsMatch("0.07", 0.07), true)
    assert.equal(amountsMatch(0.29, 0.29), true)
    assert.equal(amountsMatch(0.29, "0.29"), true)

    // Amounts exceeding safe integer limits are rejected
    assert.equal(amountsMatch(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER), false)
    assert.equal(amountsMatch(999, Number.MAX_SAFE_INTEGER), false)

    // Precision boundary checks: differences of 1 or more minor units (>= 0.01) must be rejected
    // 999 vs 998.96 differs by 0.04 (4 paise) - previously accepted by < 0.05, now strictly rejected
    assert.equal(amountsMatch(999, 998.96), false)
    assert.equal(amountsMatch(999, "998.96"), false)
    assert.equal(amountsMatch("998.96", 999), false)
    assert.equal(amountsMatch(998.96, 999), false)
    assert.equal(amountsMatch(999, 999.04), false)
    assert.equal(amountsMatch(999, "999.04"), false)
    assert.equal(amountsMatch(999, 998.95), false)

    // 1 minor unit (1 paisa / 1 cent = 0.01) difference must be rejected
    assert.equal(amountsMatch(999, 998.99), false)
    assert.equal(amountsMatch(999, "998.99"), false)
    assert.equal(amountsMatch(999, 999.01), false)
    assert.equal(amountsMatch(999, "999.01"), false)

    // Missing, null, undefined
    assert.equal(amountsMatch(999, null), false)
    assert.equal(amountsMatch(999, undefined), false)
    assert.equal(amountsMatch(null, 999), false)
    assert.equal(amountsMatch(undefined, 999), false)

    // Empty string and whitespace-only
    assert.equal(amountsMatch(999, ""), false)
    assert.equal(amountsMatch(999, "   "), false)
    assert.equal(amountsMatch("", 999), false)
    assert.equal(amountsMatch("   ", 999), false)

    // Non-finite / NaN
    assert.equal(amountsMatch(999, "not-a-number"), false)
    assert.equal(amountsMatch(999, NaN), false)
    assert.equal(amountsMatch(999, Infinity), false)

    // Negative amounts and negative strings rejected
    assert.equal(amountsMatch(999, -999), false)
    assert.equal(amountsMatch(-999, 999), false)
    assert.equal(amountsMatch(-999, -999), false)
    assert.equal(amountsMatch(999, "-999"), false)
    assert.equal(amountsMatch("-999", 999), false)
    assert.equal(amountsMatch("-999", "-999"), false)
    assert.equal(amountsMatch(0, "-0"), false)
    assert.equal(amountsMatch(0, "-0.00"), false)

    // Hexadecimal string formats rejected
    assert.equal(amountsMatch(16, "0x10"), false)
    assert.equal(amountsMatch("0x10", 16), false)
    assert.equal(amountsMatch("0x10", "0x10"), false)
    assert.equal(amountsMatch(16, "0X10"), false)

    // Binary and octal formats rejected
    assert.equal(amountsMatch(2, "0b10"), false)
    assert.equal(amountsMatch("0b10", 2), false)
    assert.equal(amountsMatch(8, "0o10"), false)
    assert.equal(amountsMatch("0o10", 8), false)

    // Scientific notation rejected
    assert.equal(amountsMatch(1000, "1e3"), false)
    assert.equal(amountsMatch("1e3", 1000), false)
    assert.equal(amountsMatch("1e3", "1e3"), false)
    assert.equal(amountsMatch(999, "9.99e2"), false)
    assert.equal(amountsMatch("9.99e2", 999), false)

    // Sign prefixes rejected
    assert.equal(amountsMatch(999, "+999"), false)
    assert.equal(amountsMatch("+999", 999), false)
    assert.equal(amountsMatch(0, "+0"), false)

    // Booleans rejected (including zero and one coercion cases)
    assert.equal(amountsMatch(0, false), false)
    assert.equal(amountsMatch(false, 0), false)
    assert.equal(amountsMatch(1, true), false)
    assert.equal(amountsMatch(true, 1), false)
    assert.equal(amountsMatch(999, true), false)
    assert.equal(amountsMatch(true, 999), false)
    assert.equal(amountsMatch(false, false), false)
    assert.equal(amountsMatch(true, true), false)

    // Arrays rejected (including empty array coercion to 0 and single-element array)
    assert.equal(amountsMatch(0, []), false)
    assert.equal(amountsMatch([], 0), false)
    assert.equal(amountsMatch(999, [999]), false)
    assert.equal(amountsMatch([999], 999), false)
    assert.equal(amountsMatch(999, ["999"]), false)
    assert.equal(amountsMatch(["999"], 999), false)
    assert.equal(amountsMatch([], []), false)

    // Objects rejected
    assert.equal(amountsMatch(0, {}), false)
    assert.equal(amountsMatch({}, 0), false)
    assert.equal(amountsMatch(999, { amount: 999 }), false)
    assert.equal(amountsMatch({ amount: 999 }, 999), false)
    assert.equal(amountsMatch({}, {}), false)

    // Legitimate zero amounts
    assert.equal(amountsMatch(0, 0), true)
    assert.equal(amountsMatch(0, "0"), true)
    assert.equal(amountsMatch(0, "0.00"), true)
    assert.equal(amountsMatch("0", 0), true)
    assert.equal(amountsMatch("0.00", "0"), true)
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
