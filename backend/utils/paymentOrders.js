const PaymentOrder = require("../models/PaymentOrder")
const { idsEqual } = require("./paymentSecurity")

async function recordPaymentOrder(fields) {
  return PaymentOrder.create(fields)
}

async function findPaymentOrder({ merchantTxnId, gid }) {
  if (merchantTxnId) {
    const byTxn = await PaymentOrder.findOne({ merchantTxnId })
    if (byTxn) return byTxn
  }
  if (gid) {
    return PaymentOrder.findOne({ gid })
  }
  return null
}

function assertOrderAccess(order, userId) {
  if (!order) {
    return { ok: false, status: 404, message: "Trusted payment order was not found" }
  }
  if (order.userId && userId && !idsEqual(order.userId, userId)) {
    return { ok: false, status: 403, message: "Payment order does not belong to this account" }
  }
  if (order.userId && !userId) {
    return { ok: false, status: 401, message: "Authentication is required to complete this payment" }
  }
  return { ok: true }
}

function assertOrderResourceBinding(order, bindings = {}) {
  if (!order) {
    return { ok: false, status: 404, message: "Trusted payment order was not found" }
  }
  const {
    expectedKind,
    expectedCourseId,
    expectedBookingId,
    expectedPractitionerId,
    expectedPlanKey,
  } = bindings

  if (expectedKind && order.kind !== expectedKind) {
    return { ok: false, status: 400, message: "Payment order type mismatch" }
  }
  if (expectedCourseId != null) {
    if (!order.courseId || !idsEqual(order.courseId, expectedCourseId)) {
      return { ok: false, status: 400, message: "Payment order does not match this course" }
    }
  }
  if (expectedBookingId != null) {
    if (!order.bookingId || !idsEqual(order.bookingId, expectedBookingId)) {
      return { ok: false, status: 400, message: "Payment order does not match this booking" }
    }
  }
  if (expectedPractitionerId != null) {
    if (!order.practitionerId || !idsEqual(order.practitionerId, expectedPractitionerId)) {
      return { ok: false, status: 400, message: "Payment order does not match this practitioner" }
    }
  }
  if (expectedPlanKey != null) {
    if (!order.planKey || String(order.planKey).toLowerCase() !== String(expectedPlanKey).toLowerCase()) {
      return { ok: false, status: 400, message: "Payment order plan mismatch" }
    }
  }
  return { ok: true }
}

async function consumePaymentOrder(merchantTxnId) {
  const first = await PaymentOrder.findOneAndUpdate(
    { merchantTxnId, status: "pending" },
    { $set: { status: "consumed", processedAt: new Date() } },
    { new: true }
  )
  if (first) return { first: true, order: first }

  const existing = await PaymentOrder.findOne({ merchantTxnId })
  if (existing && existing.status === "consumed") {
    return { first: false, order: existing }
  }
  return { first: false, order: existing || null }
}

async function markOrderFulfilled(merchantTxnId, details = {}) {
  if (!merchantTxnId) return null
  return PaymentOrder.findOneAndUpdate(
    { merchantTxnId },
    {
      $set: {
        fulfilled: true,
        fulfilledAt: new Date(),
        fulfillmentDetails: details || {},
      },
    },
    { new: true }
  )
}

function isOrderFulfilled(order) {
  return Boolean(order && order.fulfilled === true)
}

module.exports = {
  recordPaymentOrder,
  findPaymentOrder,
  assertOrderAccess,
  assertOrderResourceBinding,
  consumePaymentOrder,
  markOrderFulfilled,
  isOrderFulfilled,
}
