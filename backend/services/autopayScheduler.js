const cron = require("node-cron")
const { processEligibleAutopays } = require("./autopayService")

let isAutopayRunning = false

async function runAutopayScan() {
  if (isAutopayRunning) {
    console.log("[AutopayScheduler] Previous scan still in progress, skipping tick.")
    return
  }
  isAutopayRunning = true
  try {
    await processEligibleAutopays()
  } catch (err) {
    console.error("[AutopayScheduler] Unhandled error during autopay scan:", err.message)
  } finally {
    isAutopayRunning = false
  }
}

/**
 * Initializes the recurring 72-Hour Autopay Payout Cron Job.
 * Runs every 10 minutes to scan for mature 72-hour escrow windows.
 */
function startAutopayScheduler() {
  console.log("[AutopayScheduler] 🚀 Starting 72-Hour Automated Payout Scheduler (Every 10 mins)...")

  // Every 10 minutes: */10 * * * *
  const job = cron.schedule("*/10 * * * *", () => {
    runAutopayScan()
  })

  // Trigger an initial check 10 seconds after server startup
  setTimeout(() => {
    console.log("[AutopayScheduler] ⚡ Running initial post-boot 72-hour autopay check...")
    runAutopayScan()
  }, 10000)

  return job
}

module.exports = {
  startAutopayScheduler,
  runAutopayScan,
}
