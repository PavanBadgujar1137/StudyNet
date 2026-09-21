/**
 * Fix learnerId index: drop the broken non-sparse index and recreate it
 * with sparse: true so null/missing values are excluded from uniqueness checks.
 *
 * Run ONCE on local dev:    node scripts/fix-learnerId-index.js
 * Run ONCE on production:   node scripts/fix-learnerId-index.js
 *
 * Safe to run multiple times.
 */

const path = require("path")
const fs = require("fs")
const dotenv = require("dotenv")

// Load env
const appEnvName = String(process.env.APP_ENV || "uat").toLowerCase()
const isProd = appEnvName === "production" || appEnvName === "prod"
const isUat = appEnvName === "uat" || appEnvName === "development"
const envFile = isUat ? ".env.uat" : isProd ? ".env.production" : ".env"
const envPath = path.join(__dirname, "..", envFile)
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
} else {
  dotenv.config({ path: path.join(__dirname, "..", ".env") })
}
console.log(`Loaded env: ${envFile}`)

const mongoose = require("mongoose")

async function fixLearnerIdIndex() {
  const mongoUrl = process.env.MONGODB_URL
  if (!mongoUrl) {
    console.error("ERROR: MONGODB_URL not set in env")
    process.exit(1)
  }

  console.log(`Connecting to: ${mongoUrl.replace(/:[^:@]*@/, ":***@")}`)
  await mongoose.connect(mongoUrl)
  console.log("Connected!")

  const db = mongoose.connection.db
  const usersCollection = db.collection("users")

  // List existing indexes
  const indexes = await usersCollection.indexes()
  console.log("\nCurrent indexes:")
  indexes.forEach(idx => console.log(" ", JSON.stringify(idx)))

  // Find and drop any learnerId index that is NOT sparse (the broken one)
  const brokenIndex = indexes.find(
    idx => idx.key && idx.key.learnerId !== undefined && !idx.sparse
  )
  if (brokenIndex) {
    console.log(`\nDropping non-sparse learnerId index: ${brokenIndex.name}`)
    await usersCollection.dropIndex(brokenIndex.name)
    console.log("Dropped!")
  } else {
    console.log("\nNo non-sparse learnerId index found (already clean).")
  }

  // Also clear any documents where learnerId is explicitly null (fix existing bad data)
  const unsetResult = await usersCollection.updateMany(
    { learnerId: null },
    { $unset: { learnerId: "" } }
  )
  console.log(`\nCleared explicit null learnerId from ${unsetResult.modifiedCount} documents.`)

  // Ensure the correct sparse + unique index exists
  const sparseIndex = indexes.find(
    idx => idx.key && idx.key.learnerId !== undefined && idx.sparse
  )
  if (!sparseIndex) {
    console.log("\nCreating correct sparse unique index on learnerId...")
    await usersCollection.createIndex(
      { learnerId: 1 },
      { unique: true, sparse: true, name: "learnerId_1" }
    )
    console.log("Index created!")
  } else {
    console.log("\nSparse unique learnerId index already exists, skipping creation.")
  }

  // Verify
  const finalIndexes = await usersCollection.indexes()
  const learnerIdIdx = finalIndexes.find(idx => idx.key && idx.key.learnerId !== undefined)
  console.log("\nFinal learnerId index:", JSON.stringify(learnerIdIdx))
  console.log("\n✅ Done! learnerId index is now sparse + unique.")

  await mongoose.disconnect()
  process.exit(0)
}

fixLearnerIdIndex().catch(err => {
  console.error("ERROR:", err.message)
  process.exit(1)
})
