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

const userRoutes = require("./routes/user")
const profileRoutes = require("./routes/profile")
const paymentRoutes = require("./routes/Payments")
const contactUsRoute = require("./routes/Contact")
const liveClassRoutes = require("./routes/liveClass")
const recordedLectureRoutes = require("./routes/recordedLecture")
const noteRoutes = require("./routes/notes")
const database = require("./config/database")
const { cloudinaryConnect } = require("./config/cloudinary")

const PORT = process.env.PORT || 4000

// Windows-safe temp directory for file uploads
const tempFileDir = path.join(os.tmpdir(), "openhand-uploads")
if (!fs.existsSync(tempFileDir)) {
  fs.mkdirSync(tempFileDir, { recursive: true })
}

const app = express()
const server = http.createServer(app)

// Connecting to database
database.connect()

// Middlewares
app.use(express.json())
app.use(cookieParser())
// CORS configuration supporting credentials and dynamic origins
const allowedOrigins = [
  "https://openhand.live",
  "https://www.openhand.live",
  "http://openhand.live",
  "http://www.openhand.live",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
]

if (process.env.ALLOWED_ORIGINS) {
  const envOrigins = process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  allowedOrigins.push(...envOrigins)
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true)

    const isAllowed =
      allowedOrigins.includes(origin) ||
      /^https?:\/\/(.+\.)?openhand\.live$/.test(origin) ||
      /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
      /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)

    if (isAllowed) {
      return callback(null, true)
    }

    // Dynamic fallback to reflect origin for any valid domain
    return callback(null, true)
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Access-Control-Allow-Headers",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
    "x-auth-token",
  ],
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.options("*", cors(corsOptions))
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir,
  })
)

// Connecting to Cloudinary
cloudinaryConnect()

const practitionerRoutes = require("./routes/practitioner")
const offerRoutes = require("./routes/offer")
const checkinRoutes = require("./routes/checkin")
const reflectionRoutes = require("./routes/reflection")
const consentRoutes = require("./routes/consent")
const circleRoutes = require("./routes/circle")
const auraRoutes = require("./routes/aura")
const copilotRoutes = require("./routes/copilot")
const plansRoutes = require("./routes/plans")
const orgRoutes = require("./routes/org")
const adminRoutes = require("./routes/admin")
const courseRoutes = require("./routes/course")
const socialPostRoutes = require("./routes/socialPost")

const chatRoutes = require("./routes/chat")

app.use("/api/v1/auth", userRoutes)
app.use("/api/v1/profile", profileRoutes)
app.use("/api/v1/payment", paymentRoutes)
app.use("/api/v1/payments", paymentRoutes)
app.use("/api/v1/reach", contactUsRoute)
app.use("/api/v1/live", liveClassRoutes)
app.use("/api/v1/lecture", recordedLectureRoutes)
app.use("/api/v1/note", noteRoutes)
app.use("/api/v1/chat", chatRoutes)

// OpenHand Core API Routes
app.use("/api/v1/practitioners", practitionerRoutes)
app.use("/api/v1/offers", offerRoutes)
app.use("/api/v1/checkins", checkinRoutes)
app.use("/api/v1/reflections", reflectionRoutes)
app.use("/api/v1/consent", consentRoutes)
app.use("/api/v1/circles", circleRoutes)
app.use("/api/v1/circle", circleRoutes)
app.use("/api/v1/aura", auraRoutes)
app.use("/api/v1/copilot", copilotRoutes)
app.use("/api/v1/plans", plansRoutes)
app.use("/api/v1/org", orgRoutes)
app.use("/api/v1/admin", adminRoutes)
app.use("/api/v1/courses", courseRoutes)
app.use("/api/v1/social-posts", socialPostRoutes)

// Testing the server
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running ...",
  })
})

server.listen(PORT, () => {
  console.log(`App is listening at ${PORT}`)
  if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
    console.log(
      "WARNING: RAZORPAY_KEY / RAZORPAY_SECRET missing in backend/.env — payments will fail"
    )
  }
})
