// Load env before any other app modules (always from backend/.env)
const path = require("path")
const dotenv = require("dotenv")
dotenv.config({ path: path.join(__dirname, ".env") })

const fs = require("fs")
const os = require("os")
const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const fileUpload = require("express-fileupload")

const userRoutes = require("./routes/user")
const profileRoutes = require("./routes/profile")
const courseRoutes = require("./routes/Course")
const paymentRoutes = require("./routes/Payments")
const contactUsRoute = require("./routes/Contact")
const database = require("./config/database")
const { cloudinaryConnect } = require("./config/cloudinary")

const PORT = process.env.PORT || 4000

// Windows-safe temp directory for file uploads
const tempFileDir = path.join(os.tmpdir(), "studynet-uploads")
if (!fs.existsSync(tempFileDir)) {
  fs.mkdirSync(tempFileDir, { recursive: true })
}

const app = express()

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

// Setting up routes
app.use("/api/v1/auth", userRoutes)
app.use("/api/v1/profile", profileRoutes)
app.use("/api/v1/course", courseRoutes)
app.use("/api/v1/payment", paymentRoutes)
app.use("/api/v1/reach", contactUsRoute)

// Testing the server
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running ...",
  })
})

// Listening to the server
app.listen(PORT, () => {
  console.log(`App is listening at ${PORT}`)
  if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
    console.log(
      "WARNING: RAZORPAY_KEY / RAZORPAY_SECRET missing in backend/.env — payments will fail"
    )
  }
})
