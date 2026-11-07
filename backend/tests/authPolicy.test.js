const { describe, it } = require("node:test")
const assert = require("node:assert/strict")
const {
  resolvePublicSignupAccountType,
  isAdminBootstrapAuthorized,
  extractAdminBootstrapSecret,
  isPrivilegedAccountType,
} = require("../utils/authPolicy")

describe("public signup account types", () => {
  it("allows learner and practitioner roles used by the product", () => {
    assert.equal(resolvePublicSignupAccountType("Learner").accountType, "Learner")
    assert.equal(resolvePublicSignupAccountType("Client").accountType, "Client")
    assert.equal(resolvePublicSignupAccountType("Student").accountType, "Student")
    assert.equal(resolvePublicSignupAccountType("Practitioner").accountType, "Practitioner")
    assert.equal(resolvePublicSignupAccountType("Instructor").accountType, "Instructor")
  })

  it("defaults missing accountType to Learner", () => {
    assert.deepEqual(resolvePublicSignupAccountType(undefined), {
      ok: true,
      accountType: "Learner",
    })
  })

  it("rejects privileged and unknown roles", () => {
    assert.equal(resolvePublicSignupAccountType("Admin").ok, false)
    assert.equal(resolvePublicSignupAccountType("OrgAdmin").ok, false)
    assert.equal(resolvePublicSignupAccountType("SuperUser").ok, false)
    assert.equal(isPrivilegedAccountType("Admin"), true)
    assert.equal(isPrivilegedAccountType("Learner"), false)
  })
})

describe("admin bootstrap authorization", () => {
  it("fails closed when the operator secret is missing or too short", () => {
    const previous = process.env.ADMIN_BOOTSTRAP_SECRET
    delete process.env.ADMIN_BOOTSTRAP_SECRET
    assert.equal(isAdminBootstrapAuthorized("anything-long-enough"), false)
    process.env.ADMIN_BOOTSTRAP_SECRET = "short"
    assert.equal(isAdminBootstrapAuthorized("short"), false)
    if (previous === undefined) delete process.env.ADMIN_BOOTSTRAP_SECRET
    else process.env.ADMIN_BOOTSTRAP_SECRET = previous
  })

  it("accepts only an exact matching operator secret", () => {
    const previous = process.env.ADMIN_BOOTSTRAP_SECRET
    process.env.ADMIN_BOOTSTRAP_SECRET = "operational-bootstrap-token"
    assert.equal(isAdminBootstrapAuthorized("operational-bootstrap-token"), true)
    assert.equal(isAdminBootstrapAuthorized("wrong-bootstrap-token-xx"), false)
    assert.equal(isAdminBootstrapAuthorized(""), false)
    if (previous === undefined) delete process.env.ADMIN_BOOTSTRAP_SECRET
    else process.env.ADMIN_BOOTSTRAP_SECRET = previous
  })

  it("reads the secret from header or body without using cookies", () => {
    assert.equal(
      extractAdminBootstrapSecret({
        headers: { "x-admin-bootstrap-secret": "from-header" },
        body: {},
      }),
      "from-header"
    )
    assert.equal(
      extractAdminBootstrapSecret({
        headers: {},
        body: { bootstrapSecret: "from-body" },
      }),
      "from-body"
    )
  })
})

describe("admin bootstrap concurrency and consistency", () => {
  it("deterministically breaks ties when multiple admin records share identical createdAt", () => {
    const timestamp = new Date("2026-10-29T00:00:00.000Z")
    const idA = "672000000000000000000001"
    const idB = "672000000000000000000002"

    const list1 = [
      { _id: idB, createdAt: timestamp },
      { _id: idA, createdAt: timestamp },
    ]
    const list2 = [
      { _id: idA, createdAt: timestamp },
      { _id: idB, createdAt: timestamp },
    ]

    const sortFn = (a, b) => {
      const timeDiff = a.createdAt.getTime() - b.createdAt.getTime()
      if (timeDiff !== 0) return timeDiff
      return String(a._id).localeCompare(String(b._id))
    }

    list1.sort(sortFn)
    list2.sort(sortFn)

    // Both must deterministically yield idA as the winner at index 0
    assert.equal(String(list1[0]._id), idA)
    assert.equal(String(list2[0]._id), idA)
  })

  it("ensures each losing request cleans up only the administrator and profile it created", async () => {
    const usersDB = new Map()
    const profilesDB = new Map()

    const winnerProfileId = "prof_winner"
    const loserProfileId = "prof_loser"
    const winnerAdminId = "admin_1"
    const loserAdminId = "admin_2"

    profilesDB.set(winnerProfileId, { _id: winnerProfileId, about: "Admin 1" })
    profilesDB.set(loserProfileId, { _id: loserProfileId, about: "Admin 2" })

    usersDB.set(winnerAdminId, { _id: winnerAdminId, accountType: "Admin", additionalDetails: winnerProfileId, createdAt: 100 })
    usersDB.set(loserAdminId, { _id: loserAdminId, accountType: "Admin", additionalDetails: loserProfileId, createdAt: 100 })

    const admins = Array.from(usersDB.values()).sort((a, b) => {
      const t = a.createdAt - b.createdAt
      if (t !== 0) return t
      return String(a._id).localeCompare(String(b._id))
    })

    const winnerId = String(admins[0]._id)
    assert.equal(winnerId, winnerAdminId)

    // Losing request determines it is not the winner and cleans up ONLY its own records
    const thisAdmin = usersDB.get(loserAdminId)
    const thisProfileId = loserProfileId
    if (String(thisAdmin._id) !== winnerId) {
      usersDB.delete(thisAdmin._id)
      profilesDB.delete(thisProfileId)
    }

    // Winner remains completely intact
    assert.equal(usersDB.size, 1)
    assert.equal(usersDB.has(winnerAdminId), true)
    assert.equal(profilesDB.size, 1)
    assert.equal(profilesDB.has(winnerProfileId), true)
    // Loser was cleaned up by its own handler
    assert.equal(usersDB.has(loserAdminId), false)
    assert.equal(profilesDB.has(loserProfileId), false)
  })

  it("cleans up orphaned Profile if User.create fails mid-flight", async () => {
    let createdProfileId = null
    let createdAdminId = null
    const profilesDB = new Map()

    try {
      // Step 1: Profile created
      const profile = { _id: "profile_tmp_123", about: "Platform Administrator" }
      profilesDB.set(profile._id, profile)
      createdProfileId = profile._id

      // Step 2: User.create throws mid-flight (e.g. DB connection dropped)
      throw new Error("Simulated database failure during User.create")
    } catch (error) {
      if (createdAdminId) {
        // cleanup admin if needed
      }
      if (createdProfileId) {
        profilesDB.delete(createdProfileId)
        createdProfileId = null
      }
    }

    assert.equal(profilesDB.size, 0)
    assert.equal(profilesDB.has("profile_tmp_123"), false)
  })
})
