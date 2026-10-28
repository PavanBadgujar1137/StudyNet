const { describe, it } = require("node:test")
const assert = require("node:assert/strict")
const mongoose = require("mongoose")
const {
  assertOrderAccess,
  assertOrderResourceBinding,
} = require("../utils/paymentOrders")

describe("PaymentOrder ownership and access control", () => {
  const userId1 = new mongoose.Types.ObjectId()
  const userId2 = new mongoose.Types.ObjectId()

  it("permits access when order.userId matches authenticated user", () => {
    const order = { userId: userId1, kind: "course" }
    const result = assertOrderAccess(order, userId1.toString())
    assert.equal(result.ok, true)
  })

  it("denies access when order.userId belongs to a different account", () => {
    const order = { userId: userId1, kind: "course" }
    const result = assertOrderAccess(order, userId2.toString())
    assert.equal(result.ok, false)
    assert.equal(result.status, 403)
    assert.match(result.message, /does not belong to this account/)
  })

  it("denies access when order requires authentication but user is unauthenticated", () => {
    const order = { userId: userId1, kind: "course" }
    const result = assertOrderAccess(order, null)
    assert.equal(result.ok, false)
    assert.equal(result.status, 401)
    assert.match(result.message, /Authentication is required/)
  })

  it("fails closed when order is not found", () => {
    const result = assertOrderAccess(null, userId1.toString())
    assert.equal(result.ok, false)
    assert.equal(result.status, 404)
    assert.match(result.message, /not found/)
  })
})

describe("PaymentOrder resource binding validation", () => {
  const courseId1 = new mongoose.Types.ObjectId()
  const courseId2 = new mongoose.Types.ObjectId()
  const bookingId1 = new mongoose.Types.ObjectId()
  const bookingId2 = new mongoose.Types.ObjectId()
  const practId1 = new mongoose.Types.ObjectId()
  const practId2 = new mongoose.Types.ObjectId()

  it("validates course binding before consumption", () => {
    const order = {
      kind: "course",
      courseId: courseId1,
    }

    // Matching course succeeds
    const matched = assertOrderResourceBinding(order, {
      expectedKind: "course",
      expectedCourseId: courseId1.toString(),
    })
    assert.equal(matched.ok, true)

    // Mismatched course fails closed
    const mismatched = assertOrderResourceBinding(order, {
      expectedKind: "course",
      expectedCourseId: courseId2.toString(),
    })
    assert.equal(mismatched.ok, false)
    assert.equal(mismatched.status, 400)
    assert.match(mismatched.message, /does not match this course/)

    // Order missing courseId fails closed when expected
    const missingCourse = assertOrderResourceBinding({ kind: "course" }, {
      expectedKind: "course",
      expectedCourseId: courseId1.toString(),
    })
    assert.equal(missingCourse.ok, false)
    assert.equal(missingCourse.status, 400)
    assert.match(missingCourse.message, /does not match this course/)
  })

  it("validates booking binding before consumption", () => {
    const order = {
      kind: "offer",
      bookingId: bookingId1,
    }

    // Matching booking succeeds
    const matched = assertOrderResourceBinding(order, {
      expectedKind: "offer",
      expectedBookingId: bookingId1.toString(),
    })
    assert.equal(matched.ok, true)

    // Mismatched booking fails closed
    const mismatched = assertOrderResourceBinding(order, {
      expectedKind: "offer",
      expectedBookingId: bookingId2.toString(),
    })
    assert.equal(mismatched.ok, false)
    assert.equal(mismatched.status, 400)
    assert.match(mismatched.message, /does not match this booking/)

    // Order missing bookingId fails closed when expected
    const missingBooking = assertOrderResourceBinding({ kind: "offer" }, {
      expectedKind: "offer",
      expectedBookingId: bookingId1.toString(),
    })
    assert.equal(missingBooking.ok, false)
    assert.equal(missingBooking.status, 400)
    assert.match(missingBooking.message, /does not match this booking/)
  })

  it("validates practitioner binding before consumption", () => {
    const order = {
      kind: "practitioner",
      practitionerId: practId1,
    }

    // Matching practitioner succeeds
    const matched = assertOrderResourceBinding(order, {
      expectedKind: "practitioner",
      expectedPractitionerId: practId1.toString(),
    })
    assert.equal(matched.ok, true)

    // Mismatched practitioner fails closed
    const mismatched = assertOrderResourceBinding(order, {
      expectedKind: "practitioner",
      expectedPractitionerId: practId2.toString(),
    })
    assert.equal(mismatched.ok, false)
    assert.equal(mismatched.status, 400)
    assert.match(mismatched.message, /does not match this practitioner/)

    // Order missing practitionerId fails closed when expected
    const missingPract = assertOrderResourceBinding({ kind: "practitioner" }, {
      expectedKind: "practitioner",
      expectedPractitionerId: practId1.toString(),
    })
    assert.equal(missingPract.ok, false)
    assert.equal(missingPract.status, 400)
    assert.match(missingPract.message, /does not match this practitioner/)
  })

  it("validates plan key binding before consumption", () => {
    const order = {
      kind: "plan",
      planKey: "pro_yearly",
    }

    // Matching planKey (case-insensitive) succeeds
    const matched = assertOrderResourceBinding(order, {
      expectedKind: "plan",
      expectedPlanKey: "PRO_YEARLY",
    })
    assert.equal(matched.ok, true)

    // Mismatched planKey fails closed
    const mismatched = assertOrderResourceBinding(order, {
      expectedKind: "plan",
      expectedPlanKey: "pro_monthly",
    })
    assert.equal(mismatched.ok, false)
    assert.equal(mismatched.status, 400)
    assert.match(mismatched.message, /plan mismatch/)
  })

  it("validates order kind mismatch", () => {
    const order = {
      kind: "course",
      courseId: courseId1,
    }

    const wrongKind = assertOrderResourceBinding(order, {
      expectedKind: "offer",
      expectedBookingId: bookingId1.toString(),
    })
    assert.equal(wrongKind.ok, false)
    assert.equal(wrongKind.status, 400)
    assert.match(wrongKind.message, /type mismatch/)
  })
})

describe("PaymentOrder consumption gate and retry idempotency", () => {
  it("prevents consuming the order when resource binding fails", () => {
    const orderState = {
      merchantTxnId: "pgl_test_order_123",
      kind: "course",
      courseId: "course_A",
      status: "pending",
    }

    let consumedCalled = false
    function mockConsume() {
      consumedCalled = true
      orderState.status = "consumed"
    }

    // Attempt verification with mismatched resource "course_B"
    const binding = assertOrderResourceBinding(orderState, {
      expectedKind: "course",
      expectedCourseId: "course_B",
    })

    if (binding.ok) {
      mockConsume()
    }

    // Verification failed
    assert.equal(binding.ok, false)
    // Order was NOT consumed
    assert.equal(consumedCalled, false)
    assert.equal(orderState.status, "pending")
  })

  it("consumes the order only once when resource binding matches", () => {
    const orderState = {
      merchantTxnId: "pgl_test_order_456",
      kind: "course",
      courseId: "course_A",
      status: "pending",
    }

    let consumeCount = 0
    function mockAtomicConsume(order) {
      consumeCount++
      if (order.status === "pending") {
        order.status = "consumed"
        return { first: true, order }
      }
      return { first: false, order }
    }

    // First attempt with correct resource
    const binding1 = assertOrderResourceBinding(orderState, {
      expectedKind: "course",
      expectedCourseId: "course_A",
    })
    assert.equal(binding1.ok, true)

    const res1 = mockAtomicConsume(orderState)
    assert.equal(res1.first, true)
    assert.equal(orderState.status, "consumed")

    // Second attempt (retry) with correct resource
    const binding2 = assertOrderResourceBinding(orderState, {
      expectedKind: "course",
      expectedCourseId: "course_A",
    })
    assert.equal(binding2.ok, true)

    const res2 = mockAtomicConsume(orderState)
    assert.equal(res2.first, false) // Identifies replay, prevents duplicate fulfillment
    assert.equal(consumeCount, 2)
  })
})
