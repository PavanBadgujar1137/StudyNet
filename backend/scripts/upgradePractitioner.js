const mongoose = require("mongoose")
const dotenv = require("dotenv")
const path = require("path")

dotenv.config({ path: path.join(__dirname, "../.env.uat") })
const url = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/studynet"

mongoose.connect(url).then(async () => {
  const User = mongoose.model("User", new mongoose.Schema({}, { strict: false }))
  const PractitionerProfile = mongoose.model("PractitionerProfile", new mongoose.Schema({}, { strict: false }))

  const user = await User.findOne({ email: "rashidkhopatkar@gmail.com" })
  if (!user) {
    console.log("User not found")
    process.exit(1)
  }

  let pProf = await PractitionerProfile.findOne({ user: user._id })
  if (!pProf) {
    pProf = await PractitionerProfile.create({
      user: user._id,
      handle: "rashid",
      bio: "OpenHand Practitioner",
      verificationStatus: "verified",
      plan: "starter",
      planCommission: 8,
      monthlyEarnings: 0
    })
    console.log("Created PractitionerProfile:", pProf._id)
  }

  const updateDoc = {
    accountType: "Practitioner",
    practitionerProfile: pProf._id
  }

  await User.updateOne(
    { _id: user._id },
    {
      $set: updateDoc,
      $unset: { learnerId: "" }
    }
  )

  console.log("Successfully upgraded user rashidkhopatkar@gmail.com to Practitioner!")
  process.exit(0)
}).catch((err) => {
  console.error("DB Error:", err)
  process.exit(1)
})
