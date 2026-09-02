const mongoose = require("mongoose")
const dns = require("dns")
require("dotenv").config()

// Set public DNS servers (Google & Cloudflare) to reliably resolve MongoDB Atlas SRV records
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1", "1.0.0.1"])
} catch (e) {
  console.warn("Could not set custom DNS servers:", e.message)
}

const { MONGODB_URL } = process.env

exports.connect = () => {
  const mongoUrl = MONGODB_URL || "mongodb://127.0.0.1:27017/studynet"

  mongoose
    .connect(mongoUrl)
    .then(() => console.log(`DB Connection Success`))
    .catch((err) => {
      console.log(`DB Connection Failed`)
      console.error(err)
      process.exit(1)
    })
}
