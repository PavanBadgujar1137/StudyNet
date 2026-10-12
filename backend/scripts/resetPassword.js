// Temporary script to reset a user's password directly in the database
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const path = require("path")
const fs = require("fs")
const dotenv = require("dotenv")

// Load env
const envPath = path.join(__dirname, "../.env.uat")
if (fs.existsSync(envPath)) dotenv.config({ path: envPath })
else dotenv.config({ path: path.join(__dirname, "../.env") })

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/studynet"
const TARGET_EMAIL = "rashidkhopatkar@gmail.com"
const NEW_PASSWORD = "123"

async function resetPassword() {
  try {
    await mongoose.connect(MONGODB_URL)
    console.log("DB connected")

    const hashed = await bcrypt.hash(NEW_PASSWORD, 10)
    const result = await mongoose.connection.db
      .collection("users")
      .updateOne({ email: TARGET_EMAIL }, { $set: { password: hashed } })

    if (result.modifiedCount === 1) {
      console.log(`✅ Password reset successfully for: ${TARGET_EMAIL}`)
      console.log(`   New password: ${NEW_PASSWORD}`)
    } else {
      console.log(`⚠️  No user found with email: ${TARGET_EMAIL}`)
    }
  } catch (err) {
    console.error("Error:", err.message)
  } finally {
    await mongoose.disconnect()
    console.log("DB disconnected")
  }
}

resetPassword()
