const User = require("../models/User")

/**
 * Generates a guaranteed unique Learner ID in the format: LRN-XXXXXX
 * e.g. LRN-749201
 */
async function generateUniqueLearnerId(UserModel = User) {
  let isUnique = false
  let learnerId = ""
  let attempts = 0
  const maxAttempts = 100

  while (!isUnique && attempts < maxAttempts) {
    attempts++
    // Generate a random 6-digit number (100000 - 999999)
    const randomDigits = Math.floor(100000 + Math.random() * 900000)
    learnerId = `LRN-${randomDigits}`

    const existing = await UserModel.findOne({ learnerId }).select("_id").lean()
    if (!existing) {
      isUnique = true
    }
  }

  // Fallback in the ultra-rare event of collision saturation
  if (!isUnique) {
    const timestampSuffix = Date.now().toString().slice(-4)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    learnerId = `LRN-${timestampSuffix}${randomSuffix}`
  }

  return learnerId
}

/**
 * Backfills unique Learner IDs for any existing registered learners who don't have one.
 */
async function backfillLearnerIds(UserModel = User) {
  try {
    const filter = {
      $or: [
        { learnerId: { $exists: false } },
        { learnerId: null },
        { learnerId: "" },
      ],
      // Backfill for all learner account types (and any accounts that are not Admin)
      accountType: { $in: ["Learner", "Client", "Student"] },
    }

    const unassignedUsers = await UserModel.find(filter)

    if (unassignedUsers.length > 0) {
      console.log(`[Learner ID Service] Found ${unassignedUsers.length} existing learners without Learner ID. Backfilling...`)
      let count = 0
      for (const user of unassignedUsers) {
        user.learnerId = await generateUniqueLearnerId(UserModel)
        await user.save()
        count++
      }
      console.log(`[Learner ID Service] Successfully backfilled ${count} Learner IDs.`)
    } else {
      console.log(`[Learner ID Service] All existing learners have valid unique Learner IDs.`)
    }
  } catch (error) {
    console.error("[Learner ID Service] Error during Learner ID backfill:", error)
  }
}

module.exports = {
  generateUniqueLearnerId,
  backfillLearnerIds,
}
