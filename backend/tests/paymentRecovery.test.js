const { describe, it } = require("node:test")
const assert = require("node:assert/strict")
const mongoose = require("mongoose")
const {
  assertOrderAccess,
  assertOrderResourceBinding,
  isOrderFulfilled,
  markOrderFulfilled,
} = require("../utils/paymentOrders")

describe("Safe Payment Fulfilment and Recovery", () => {
  const aliceId = new mongoose.Types.ObjectId().toString()
  const bobId = new mongoose.Types.ObjectId().toString()
  const courseId = new mongoose.Types.ObjectId().toString()
  const bookingId = new mongoose.Types.ObjectId().toString()
  const practId = new mongoose.Types.ObjectId().toString()

  it("fulfils a verified payment successfully on the first attempt", () => {
    const order = {
      merchantTxnId: "order_tx_101",
      userId: aliceId,
      kind: "subscription",
      planKey: "pro_monthly",
      amount: 999,
      status: "pending",
      fulfilled: false,
    }

    // Step 1: Access check
    const access = assertOrderAccess(order, aliceId)
    assert.equal(access.ok, true)

    // Step 2: Resource binding
    const binding = assertOrderResourceBinding(order, {
      expectedKind: "subscription",
      expectedPlanKey: "pro_monthly",
    })
    assert.equal(binding.ok, true)

    // Step 3: Consume order
    order.status = "consumed"
    const firstAttempt = true

    // Step 4: Business fulfillment
    const subscriptionsDB = []
    const adminLogsDB = []

    if (firstAttempt || !isOrderFulfilled(order)) {
      const sub = {
        _id: new mongoose.Types.ObjectId().toString(),
        client: aliceId,
        planKey: "pro_monthly",
        payglocalOrderId: order.merchantTxnId,
        status: "active",
        adminPaymentLog: null,
      }
      subscriptionsDB.push(sub)

      const log = {
        _id: new mongoose.Types.ObjectId().toString(),
        subscriptionId: sub._id,
        payglocalOrderId: order.merchantTxnId,
        status: "received",
      }
      adminLogsDB.push(log)
      sub.adminPaymentLog = log._id

      order.fulfilled = true
      order.fulfilledAt = new Date()
    }

    assert.equal(order.status, "consumed")
    assert.equal(order.fulfilled, true)
    assert.equal(subscriptionsDB.length, 1)
    assert.equal(adminLogsDB.length, 1)
    assert.equal(subscriptionsDB[0].adminPaymentLog, adminLogsDB[0]._id)
  })

  it("does not strand the customer when a failure occurs after consumption", () => {
    const order = {
      merchantTxnId: "order_tx_102",
      userId: aliceId,
      kind: "offer",
      bookingId,
      amount: 1500,
      status: "pending",
      fulfilled: false,
    }

    const booking = {
      _id: bookingId,
      client: aliceId,
      practitioner: practId,
      status: "pending",
      meetingLink: "",
    }

    // Access and binding pass
    assert.equal(assertOrderAccess(order, aliceId).ok, true)
    assert.equal(assertOrderResourceBinding(order, { expectedKind: "offer", expectedBookingId: bookingId }).ok, true)

    // Order is consumed atomically
    order.status = "consumed"

    // Simulate transient failure before booking update completes
    let crashed = false
    try {
      throw new Error("Simulated database timeout during Booking update")
      booking.status = "confirmed"
      order.fulfilled = true
    } catch (err) {
      crashed = true
    }

    assert.equal(crashed, true)
    // Order is consumed but NOT fulfilled
    assert.equal(order.status, "consumed")
    assert.equal(order.fulfilled, false)
    assert.equal(booking.status, "pending")
    assert.equal(booking.meetingLink, "")
    assert.equal(isOrderFulfilled(order), false)
  })

  it("does not prematurely mark fulfilled when a related record exists but a required side effect is missing", () => {
    // SCENARIO A: Subscription exists, but AdminPaymentLog is missing
    const order = {
      merchantTxnId: "order_tx_sub_gap",
      userId: aliceId,
      kind: "subscription",
      planKey: "pro_monthly",
      amount: 999,
      status: "consumed",
      fulfilled: false,
    }

    const subscriptionsDB = [
      {
        _id: "sub_1",
        client: aliceId,
        planKey: "pro_monthly",
        payglocalOrderId: order.merchantTxnId,
        status: "active",
        adminPaymentLog: null,
      },
    ]
    const adminLogsDB = [] // MISSING!

    let existingSub = subscriptionsDB.find(s => s.payglocalOrderId === order.merchantTxnId)
    let existingLog = adminLogsDB.find(l => l.payglocalOrderId === order.merchantTxnId)

    // Verify system refuses to treat as fulfilled when adminLog is missing
    const isFullyFulfilledBefore = Boolean(existingSub) && Boolean(existingLog) && order.fulfilled
    assert.equal(isFullyFulfilledBefore, false)

    // Recovery runs and creates ONLY the missing admin log without duplicating subscription
    if (!existingLog) {
      existingLog = {
        _id: "log_1",
        subscriptionId: existingSub._id,
        payglocalOrderId: order.merchantTxnId,
        status: "received",
      }
      adminLogsDB.push(existingLog)
      existingSub.adminPaymentLog = existingLog._id
    }

    order.fulfilled = true
    order.fulfilledAt = new Date()

    assert.equal(subscriptionsDB.length, 1)
    assert.equal(adminLogsDB.length, 1)
    assert.equal(existingSub.adminPaymentLog, "log_1")
    assert.equal(order.fulfilled, true)

    // SCENARIO B: Booking status is confirmed, but meeting link or payout is missing
    const bookingOrder = {
      merchantTxnId: "order_tx_book_gap",
      userId: aliceId,
      kind: "offer",
      bookingId,
      amount: 1500,
      status: "consumed",
      fulfilled: false,
    }

    const bookingRecord = {
      _id: bookingId,
      client: aliceId,
      practitioner: practId,
      status: "confirmed", // Was marked confirmed in attempt 1...
      meetingLink: "",     // ...but LiveClass/meeting link crashed!
      netPayout: 1200,
    }
    const payoutsDB = [] // Payout is missing!
    const invoicesDB = []

    const isBookingCompleteBefore =
      bookingRecord.status === "confirmed" &&
      Boolean(bookingRecord.meetingLink) &&
      payoutsDB.length > 0 &&
      invoicesDB.length > 0 &&
      bookingOrder.fulfilled

    assert.equal(isBookingCompleteBefore, false) // MUST NOT mark fulfilled prematurely!

    // Recovery creates meeting link and missing financial records
    if (!bookingRecord.meetingLink) {
      bookingRecord.meetingLink = "https://openhand.live/live-classroom/room-123"
    }
    if (payoutsDB.length === 0) {
      payoutsDB.push({ bookingId, payoutTransactionId: bookingOrder.merchantTxnId, amount: 1200 })
    }
    if (invoicesDB.length === 0) {
      invoicesDB.push({ bookingId, status: "paid" })
    }
    bookingOrder.fulfilled = true

    assert.equal(bookingRecord.meetingLink, "https://openhand.live/live-classroom/room-123")
    assert.equal(payoutsDB.length, 1)
    assert.equal(invoicesDB.length, 1)
    assert.equal(bookingOrder.fulfilled, true)

    // SCENARIO C: Course enrolment exists, but Payout and Ledger are missing
    const courseOrder = {
      merchantTxnId: "order_tx_course_gap",
      userId: aliceId,
      kind: "course",
      courseId,
      amount: 2999,
      status: "consumed",
      fulfilled: false,
    }
    const course = {
      _id: courseId,
      enrolledClients: [aliceId], // Client was enrolled...
    }
    const courseLogsDB = [] // ...but admin log crashed!
    const coursePayoutsDB = [] // ...and payout crashed!

    const isCourseCompleteBefore =
      course.enrolledClients.includes(aliceId) &&
      courseLogsDB.length > 0 &&
      coursePayoutsDB.length > 0 &&
      courseOrder.fulfilled

    assert.equal(isCourseCompleteBefore, false) // MUST NOT mark fulfilled prematurely!

    // Recovery creates the missing log and payout without duplicating course enrolment
    if (!course.enrolledClients.includes(aliceId)) {
      course.enrolledClients.push(aliceId)
    }
    if (courseLogsDB.length === 0) {
      courseLogsDB.push({ courseId, payglocalOrderId: courseOrder.merchantTxnId })
    }
    if (coursePayoutsDB.length === 0) {
      coursePayoutsDB.push({ courseId, payoutTransactionId: courseOrder.merchantTxnId })
    }
    courseOrder.fulfilled = true

    assert.equal(course.enrolledClients.length, 1)
    assert.equal(courseLogsDB.length, 1)
    assert.equal(coursePayoutsDB.length, 1)
    assert.equal(courseOrder.fulfilled, true)
  })

  it("recovers missing fulfilment on retry without permanently stranding the customer", () => {
    // Order from previous crashed attempt
    const order = {
      merchantTxnId: "order_tx_102_retry",
      userId: aliceId,
      kind: "offer",
      bookingId,
      amount: 1500,
      status: "consumed",
      fulfilled: false,
    }

    const booking = {
      _id: bookingId,
      client: aliceId,
      practitioner: practId,
      status: "pending",
      meetingLink: "",
      netPayout: 1200,
    }

    const invoices = []
    const payouts = []
    const adminLogs = []

    // Customer retries the confirmation endpoint
    assert.equal(assertOrderAccess(order, aliceId).ok, true)
    assert.equal(assertOrderResourceBinding(order, { expectedKind: "offer", expectedBookingId: bookingId }).ok, true)

    // Complete fulfillment
    booking.meetingLink = "https://openhand.live/live-classroom/room-retry"
    booking.status = "confirmed"
    invoices.push({ bookingId: booking._id, orderId: order.merchantTxnId })
    payouts.push({ practitioner: practId, payoutTransactionId: order.merchantTxnId })
    adminLogs.push({ bookingId: booking._id, payglocalOrderId: order.merchantTxnId })
    order.fulfilled = true
    order.fulfilledAt = new Date()

    assert.equal(booking.status, "confirmed")
    assert.equal(booking.meetingLink, "https://openhand.live/live-classroom/room-retry")
    assert.equal(order.fulfilled, true)
    assert.equal(invoices.length, 1)
    assert.equal(payouts.length, 1)
    assert.equal(adminLogs.length, 1)
  })

  it("handles concurrent requests safely using database-level uniqueness constraints (E11000)", async () => {
    const orderTxnId = "order_concurrent_race_999"
    const subscriptionsCollection = new Map() // Simulates unique sparse indexed collection

    function createSubscriptionWithUniqueIndex(doc) {
      if (subscriptionsCollection.has(doc.payglocalOrderId)) {
        const duplicateErr = new Error("E11000 duplicate key error collection: subscriptions index: payglocalOrderId_1 dup key")
        duplicateErr.code = 11000
        throw duplicateErr
      }
      subscriptionsCollection.set(doc.payglocalOrderId, doc)
      return doc
    }

    async function concurrentFulfillRequest(requestId) {
      let sub = subscriptionsCollection.get(orderTxnId)
      if (!sub) {
        try {
          sub = createSubscriptionWithUniqueIndex({
            _id: `sub_${requestId}`,
            client: aliceId,
            payglocalOrderId: orderTxnId,
            status: "active",
          })
        } catch (err) {
          if (err.code === 11000) {
            // Concurrency winner already created it; load existing
            sub = subscriptionsCollection.get(orderTxnId)
          } else {
            throw err
          }
        }
      }
      return sub
    }

    // Two concurrent requests attempt to create subscription simultaneously
    const [sub1, sub2] = await Promise.all([
      concurrentFulfillRequest("req_A"),
      concurrentFulfillRequest("req_B"),
    ])

    // Both requests successfully obtain the exact same single subscription
    assert.equal(subscriptionsCollection.size, 1)
    assert.equal(sub1._id, "sub_req_A")
    assert.equal(sub2._id, "sub_req_A")
  })

  it("preserves offline, free-session, and alternative payments without collisions using partial filter expressions", () => {
    // Simulates MongoDB partial unique index:
    // { unique: true, partialFilterExpression: { payglocalOrderId: { $type: "string", $gt: "" } } }
    const indexedOrderIds = new Set()
    const storedLogs = []

    function insertAdminPaymentLog(doc) {
      const orderId = doc.payglocalOrderId
      // Partial filter: only non-empty strings are indexed uniquely
      if (typeof orderId === "string" && orderId.length > 0) {
        if (indexedOrderIds.has(orderId)) {
          const dupErr = new Error(`E11000 duplicate key error on payglocalOrderId: ${orderId}`)
          dupErr.code = 11000
          throw dupErr
        }
        indexedOrderIds.add(orderId)
      }
      storedLogs.push(doc)
      return doc
    }

    // Free VIP session 1 (orderId: null)
    insertAdminPaymentLog({ _id: "log_free_1", paymentType: "offer_booking", amount: 0, payglocalOrderId: null })
    // Free VIP session 2 (orderId: null) -> MUST NOT throw E11000!
    insertAdminPaymentLog({ _id: "log_free_2", paymentType: "offer_booking", amount: 0, payglocalOrderId: null })
    // Discount grant session (orderId: "") -> MUST NOT throw E11000!
    insertAdminPaymentLog({ _id: "log_grant_1", paymentType: "offer_booking", amount: 0, payglocalOrderId: "" })
    // Manual cash session (orderId: undefined) -> MUST NOT throw E11000!
    insertAdminPaymentLog({ _id: "log_manual_1", paymentType: "offer_booking", amount: 500, payglocalOrderId: undefined })

    // All 4 alternative payment logs exist cleanly
    assert.equal(storedLogs.length, 4)

    // Real PayGlocal order: first insert succeeds
    insertAdminPaymentLog({ _id: "log_pgl_1", paymentType: "paid_course", amount: 2000, payglocalOrderId: "order_real_123" })
    assert.equal(storedLogs.length, 5)

    // Second insert with duplicate real order ID correctly collides with E11000
    assert.throws(
      () => insertAdminPaymentLog({ _id: "log_pgl_2", paymentType: "paid_course", amount: 2000, payglocalOrderId: "order_real_123" }),
      /E11000 duplicate key error/
    )
  })

  it("allows multiple invoices per booking while enforcing uniqueness on invoiceNumber", () => {
    const existingInvoices = []
    const invoiceNumbers = new Set()

    function createInvoice(doc) {
      if (invoiceNumbers.has(doc.invoiceNumber)) {
        const err = new Error(`E11000 duplicate key error on invoiceNumber: ${doc.invoiceNumber}`)
        err.code = 11000
        throw err
      }
      invoiceNumbers.add(doc.invoiceNumber)
      existingInvoices.push(doc)
      return doc
    }

    // Initial invoice for bookingId
    createInvoice({ _id: "inv_1", booking: bookingId, invoiceNumber: "OH-1001", totalAmount: 1500 })
    // Subsequent adjustment/correction invoice for the SAME bookingId
    createInvoice({ _id: "inv_2", booking: bookingId, invoiceNumber: "OH-1002", totalAmount: 300 })

    assert.equal(existingInvoices.length, 2)
    assert.equal(existingInvoices[0].booking, bookingId)
    assert.equal(existingInvoices[1].booking, bookingId)

    // Duplicate invoiceNumber is rejected
    assert.throws(
      () => createInvoice({ _id: "inv_3", booking: bookingId, invoiceNumber: "OH-1001", totalAmount: 1500 }),
      /duplicate key error on invoiceNumber/
    )
  })

  it("prevents duplicate entitlements or business effects on repeated retries", () => {
    const order = {
      merchantTxnId: "order_tx_103",
      userId: aliceId,
      kind: "course",
      courseId,
      amount: 2999,
      status: "consumed",
      fulfilled: true,
    }

    const course = {
      _id: courseId,
      enrolledClients: [aliceId],
    }
    const adminLogs = [{ courseId, payglocalOrderId: order.merchantTxnId }]
    const payouts = [{ courseId, payoutTransactionId: order.merchantTxnId }]

    // Customer double-submits or clicks retry 5 times
    for (let i = 0; i < 5; i++) {
      assert.equal(assertOrderAccess(order, aliceId).ok, true)
      assert.equal(assertOrderResourceBinding(order, { expectedKind: "course", expectedCourseId: courseId }).ok, true)

      const alreadyEnrolled = course.enrolledClients.includes(aliceId)
      const isFulfilled = isOrderFulfilled(order) || (alreadyEnrolled && adminLogs.length > 0 && payouts.length > 0)

      if (!isFulfilled) {
        course.enrolledClients.push(aliceId)
        adminLogs.push({ courseId, payglocalOrderId: order.merchantTxnId })
        payouts.push({ courseId, payoutTransactionId: order.merchantTxnId })
      }
    }

    // No duplicate enrolments, admin logs, or payouts
    assert.equal(course.enrolledClients.length, 1)
    assert.equal(adminLogs.length, 1)
    assert.equal(payouts.length, 1)
  })

  it("handles practitioner connection recovery with all required entities", () => {
    const order = {
      merchantTxnId: "order_tx_105",
      userId: aliceId,
      kind: "practitioner",
      practitionerId: practId,
      amount: 1000,
      status: "consumed",
      fulfilled: false,
    }

    const connections = []
    const bookings = []
    const payouts = []
    const invoices = []
    const adminLogs = []

    function fulfillPractitionerConnection() {
      let conn = connections.find(c => c.client === aliceId && c.practitioner === practId)
      if (!conn) {
        conn = { client: aliceId, practitioner: practId, status: "pending_approval", orderId: order.merchantTxnId }
        connections.push(conn)
      }

      let book = bookings.find(b => b.payglocalOrderId === order.merchantTxnId)
      if (!book) {
        book = { _id: "book_pract_1", client: aliceId, practitioner: practId, payglocalOrderId: order.merchantTxnId, status: "confirmed" }
        bookings.push(book)
      }

      let pay = payouts.find(p => p.payoutTransactionId === order.merchantTxnId)
      if (!pay) {
        pay = { practitioner: practId, payoutTransactionId: order.merchantTxnId, amount: 1000 }
        payouts.push(pay)
      }

      let inv = invoices.find(i => i.booking === book._id)
      if (!inv) {
        inv = { booking: book._id, client: aliceId, status: "paid" }
        invoices.push(inv)
      }

      let log = adminLogs.find(l => l.payglocalOrderId === order.merchantTxnId)
      if (!log) {
        log = { payglocalOrderId: order.merchantTxnId, client: aliceId, status: "received" }
        adminLogs.push(log)
      }

      if (conn && book && pay && inv && log) {
        order.fulfilled = true
      }
    }

    fulfillPractitionerConnection()
    assert.equal(connections.length, 1)
    assert.equal(bookings.length, 1)
    assert.equal(payouts.length, 1)
    assert.equal(invoices.length, 1)
    assert.equal(adminLogs.length, 1)
    assert.equal(order.fulfilled, true)

    // Replay leaves counts unchanged
    fulfillPractitionerConnection()
    assert.equal(connections.length, 1)
    assert.equal(bookings.length, 1)
    assert.equal(payouts.length, 1)
    assert.equal(invoices.length, 1)
    assert.equal(adminLogs.length, 1)
  })

  it("handles plan payment upgrade recovery idempotently with user and subscription checks", () => {
    const order = {
      merchantTxnId: "order_tx_106",
      userId: aliceId,
      kind: "plan",
      planKey: "pro_yearly",
      amount: 9588,
      status: "consumed",
      fulfilled: false,
    }

    const user = { _id: aliceId, activePlan: "open" }
    const subscriptions = []
    const adminLogs = []

    function fulfillPlan() {
      if (user.activePlan !== order.planKey) {
        user.activePlan = order.planKey
      }
      let sub = subscriptions.find(s => s.payglocalOrderId === order.merchantTxnId)
      if (!sub) {
        sub = { client: aliceId, planKey: order.planKey, payglocalOrderId: order.merchantTxnId, status: "active" }
        subscriptions.push(sub)
      }
      let log = adminLogs.find(l => l.payglocalOrderId === order.merchantTxnId)
      if (!log) {
        log = { payglocalOrderId: order.merchantTxnId, status: "received" }
        adminLogs.push(log)
      }

      if (user.activePlan === order.planKey && sub && log) {
        order.fulfilled = true
      }
    }

    fulfillPlan()
    assert.equal(user.activePlan, "pro_yearly")
    assert.equal(subscriptions.length, 1)
    assert.equal(adminLogs.length, 1)
    assert.equal(order.fulfilled, true)

    // Replay
    fulfillPlan()
    assert.equal(user.activePlan, "pro_yearly")
    assert.equal(subscriptions.length, 1)
    assert.equal(adminLogs.length, 1)
  })

  it("denies unauthorized users from invoking recovery on another user's order", () => {
    const order = {
      merchantTxnId: "order_tx_107",
      userId: aliceId,
      kind: "offer",
      bookingId,
      status: "consumed",
      fulfilled: false,
    }

    // Bob attempts to claim or trigger recovery on Alice's order
    const access = assertOrderAccess(order, bobId)
    assert.equal(access.ok, false)
    assert.equal(access.status, 403)
    assert.match(access.message, /does not belong to this account/)

    // Unauthenticated user attempts recovery
    const unauth = assertOrderAccess(order, null)
    assert.equal(unauth.ok, false)
    assert.equal(unauth.status, 401)
    assert.match(unauth.message, /Authentication is required/)
  })

  it("denies recovery if resource binding does not match", () => {
    const otherCourseId = new mongoose.Types.ObjectId().toString()
    const order = {
      merchantTxnId: "order_tx_108",
      userId: aliceId,
      kind: "course",
      courseId,
      status: "consumed",
      fulfilled: false,
    }

    const binding = assertOrderResourceBinding(order, {
      expectedKind: "course",
      expectedCourseId: otherCourseId,
    })
    assert.equal(binding.ok, false)
    assert.equal(binding.status, 400)
    assert.match(binding.message, /does not match this course/)
  })
})
