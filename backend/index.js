// Load env before any other app modules (always from backend/.env)
const path = require("path")
const dotenv = require("dotenv")
dotenv.config({ path: path.join(__dirname, ".env") })

const fs = require("fs")
const os = require("os")
const http = require("http")
const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const fileUpload = require("express-fileupload")
const { Server } = require("socket.io")

const userRoutes = require("./routes/user")
const profileRoutes = require("./routes/profile")
const paymentRoutes = require("./routes/Payments")
const contactUsRoute = require("./routes/Contact")
const liveClassRoutes = require("./routes/liveClass")  // Phase 2
const recordedLectureRoutes = require("./routes/recordedLecture") // Phase 3
const noteRoutes = require("./routes/notes") // Phase 3
const database = require("./config/database")
const { cloudinaryConnect } = require("./config/cloudinary")
const { initLiveRoomSocket } = require("./socket/liveRoom")  // Phase 2


const PORT = process.env.PORT || 4000

// Windows-safe temp directory for file uploads
const tempFileDir = path.join(os.tmpdir(), "openhand-uploads")
if (!fs.existsSync(tempFileDir)) {
  fs.mkdirSync(tempFileDir, { recursive: true })
}

const app = express()

// Wrap Express with http.createServer so Socket.io can share the same port
const server = http.createServer(app)

// Initialize Socket.io (Phase 2: live class rooms will use /live namespace)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

// Attach io to app so controllers can emit events if needed
app.set("io", io)

// Initialize Socket.io live room namespace (Phase 2)
initLiveRoomSocket(io)


// Connecting to database
database.connect()

// Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
)
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir,
  })
)

// Connecting to cloudinary
cloudinaryConnect()

const practitionerRoutes = require("./routes/practitioner")
const offerRoutes = require("./routes/offer")
const checkinRoutes = require("./routes/checkin")
const reflectionRoutes = require("./routes/reflection")
const consentRoutes = require("./routes/consent")
const circleRoutes = require("./routes/circle")
const copilotRoutes = require("./routes/copilot")
const plansRoutes = require("./routes/plans")
const orgRoutes = require("./routes/org")

app.use("/api/v1/auth", userRoutes)
app.use("/api/v1/profile", profileRoutes)
app.use("/api/v1/payment", paymentRoutes)
app.use("/api/v1/reach", contactUsRoute)
app.use("/api/v1/live", liveClassRoutes)       // Phase 2 — Live Classes
app.use("/api/v1/lecture", recordedLectureRoutes) // Phase 3 — Recorded Lectures
app.use("/api/v1/note", noteRoutes)            // Phase 3 — Study Materials / Notes

// OpenHand Core API Routes
app.use("/api/v1/practitioners", practitionerRoutes)
app.use("/api/v1/offers", offerRoutes)
app.use("/api/v1/checkins", checkinRoutes)
app.use("/api/v1/reflections", reflectionRoutes)
app.use("/api/v1/consent", consentRoutes)
app.use("/api/v1/circles", circleRoutes)
app.use("/api/v1/copilot", copilotRoutes)
app.use("/api/v1/plans", plansRoutes)
app.use("/api/v1/org", orgRoutes)


// Testing the server
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running ...",
  })
})

// Use server.listen (not app.listen) so Socket.io works on same port
server.listen(PORT, () => {
  console.log(`App is listening at ${PORT}`)
  if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
    console.log(
      "WARNING: RAZORPAY_KEY / RAZORPAY_SECRET missing in backend/.env — payments will fail"
    )
  }
})
