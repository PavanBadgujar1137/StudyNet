# StudyNet (OpenHand Practice & Education Platform) 🚀

**StudyNet** (also operating as **OpenHand Practice Platform**) is a modern, enterprise-ready educational LMS and practice-space management platform. Built using the **MERN Stack** (MongoDB, Express.js, React 18, Node.js), it pairs real-time Socket.io communication, an AI Co-Pilot engine (Aura), Cloudinary media delivery, and Razorpay financial infrastructure into a unified experience for students, practitioners, organizations, and platform administrators.

---

## 🌟 Key Highlights & Ecosystem

- 🎓 **Client & Student Portal (`/app`)**: Interactive workspace featuring course streaming, progress tracking, mood/wellbeing check-ins, automated completion certificates, and live classroom participation.
- 🩺 **Practitioner Workspace (`/practice`)**: Comprehensive multi-tab suite for instructors and practitioners to build space courses, schedule live classrooms, monitor client telemetry, track revenue payouts, and manage onboarding.
- 🏢 **Organization Admin Portal (`/org`)**: Corporate workspace for bulk license allocations, cohort management, team progress analytics, and custom client journeys.
- 🛡️ **System Admin Panel (`/admin`)**: Central administration hub for user access controls, workspace approval queues, system-wide transaction logging, and operational health metrics.
- 🤖 **Aura AI Co-Pilot (`/co-pilot`, `/aura`)**: AI-assisted reflection prompts, session note drafting, personalized client guidance, and progress insights.
- 📹 **Real-Time Live Classroom (`/live/:classId`)**: Socket.io powered virtual classrooms with live video/audio streaming capabilities, chat messaging, whiteboard collaboration, and real-time attendance telemetry.

---

## 🗺️ System Architecture & Folder Structure

```
StudyNet/
├── backend/
│   ├── config/             # MongoDB Mongoose connection & Cloudinary setup
│   ├── controllers/        # Route handlers (Auth, Course, Payment, Profile, Admin, LiveClass, CoPilot...)
│   ├── mail/               # HTML email templates (OTP, Payment confirmation, Booking updates)
│   ├── middleware/         # Auth guards & Role middleware (isStudent, isPractitioner, isOrgAdmin, isAdmin)
│   ├── models/             # Mongoose Schemas (User, Course, LiveClass, CheckIn, Booking, CoPilot, Payout...)
│   ├── routes/             # Express API router definitions (20+ feature route modules)
│   ├── utils/              # Media uploader, time converters, mail transporter
│   ├── index.js            # Node Express & Socket.io server startup entrypoint
│   └── .env                # Server configuration & environment credentials
│
├── frontend/
│   ├── public/             # Static public assets, manifest.json & index.html
│   ├── src/
│   │   ├── assets/         # Design tokens, custom logos, dynamic SVGs, and styles
│   │   ├── components/     # Component Architecture
│   │   │   ├── Common/     # Shared components (Navbar, Footer, ConfirmationModal, RatingStars...)
│   │   │   └── core/       # Domain components (Auth, Catalog, Dashboard, ViewCourse, Admin...)
│   │   ├── pages/          # Application Router Pages
│   │   │   ├── admin/      # System Administration dashboard screens
│   │   │   ├── app/        # Authenticated Client App tabs
│   │   │   ├── footer/     # Documentation, Security, Privacy, Terms, Platform Status
│   │   │   ├── marketing/  # Marketing Sitemap (Home, Pricing, Organizations, Aura Co-Pilot...)
│   │   │   ├── org/        # Organization Portal dashboard
│   │   │   └── practice/   # Practitioner App & Workspace sections
│   │   ├── services/       # Axios API client, endpoints registry & Redux async thunks
│   │   ├── slices/         # Redux Toolkit state slices (auth, profile, course, viewCourse...)
│   │   ├── App.jsx         # React Router v6 layout routing & role guard tree
│   │   └── index.js        # React Client DOM rendering entrypoint
│   └── package.json        # Frontend NPM configuration & dependencies
│
└── deploy/                 # Deployment configurations and environment manifests
```

---

## 💻 Application Modules & Features

### 1. Marketing & Public Sitemap
- **Home (`/`)**: Dynamic landing experience featuring client telemetry widgets, interactive mood check-in demos, and testimonial sliders.
- **Pricing (`/pricing`)**: Tiered plan matrix detailing Client, Practitioner, and Enterprise subscription offerings.
- **For Organizations (`/for-organizations`)**: Enterprise solutions page with custom team cohort solutions and security compliance highlights.
- **Find a Practitioner (`/find-a-practitioner`)**: Practitioner directory search with filters for specialty, availability, and rating scores.
- **Aura AI Co-Pilot (`/co-pilot`, `/aura`)**: Showcase of AI-driven guidance, reflection prompts, and automated clinical drafting.
- **Client Journey (`/client-journey`)**: Interactive roadmap demonstrating end-to-end client engagement and outcome tracking.
- **Start Free (`/start-free`) & Talk to Human (`/talk-to-human`)**: Conversion funnels and direct support scheduler.

---

### 2. User Authentication & Authorization
- **Multi-Role Registration**: Sign up as a **Client / Student**, **Practitioner / Instructor**, or **Organization Admin**.
- **OTP Email Verification**: Automated 6-digit one-time password verification sent via Nodemailer.
- **JWT Session Security**: Secure token issuance stored client-side with automatic profile hydration.
- **Role-Based Guards**: Protected routes (`ClientRoute`, `PractitionerRoute`, `OrgAdminRoute`, `AdminRoute`, `PrivateRoute`) enforcing granular privilege checks.
- **Password Recovery**: Token-based email workflow for resetting forgotten passwords.

---

### 3. Client Portal (`/app/*`)
- **App Dashboard**: Personal dashboard showing active enrolled courses, upcoming live sessions, and daily recommendations.
- **Interactive Check-In (`/app/check-in`)**: Daily mood logging (Peaceful, Challenged, Energetic) with reflection journaling.
- **Course & Space Streamer (`/app/courses`)**: Multi-section video streaming player with chapter navigation and "Mark as Completed" tracking.
- **Automated Certificate Generation**: Generates downloadable PDF/DOM completion certificates featuring student name, course title, and verified timestamp upon course completion.
- **Cart & Razorpay Checkout**: Shopping cart management with support for promotional coupons and Razorpay payment gateway integration.

---

### 4. Practitioner Workspace (`/practice/*`)
- **Analytics & Revenue Dashboard**: Real-time performance stats (Total Spaces, Enrolled Clients, Gross Earnings) with toggleable **Doughnut**, **Pie**, and **Bar** charts via Chart.js / Recharts.
- **Space & Course Builder**:
  - *Step 1*: General metadata (Title, Description, Category, Tags, Thumbnail upload to Cloudinary).
  - *Step 2*: Section & Subsection Curriculum Builder (Video lecture uploads, duration calculators, notes).
  - *Step 3*: Publishing Controls (Draft vs. Public space toggles).
- **Live Classroom Management**: Schedule, initiate, and manage real-time virtual rooms.
- **Client Telemetry**: Review client check-in histories, progress milestones, and session notes.
- **Payout & Financials**: Request earnings withdrawal and track payout status logs.

---

### 5. Real-Time Live Classroom (`/live/:classId`)
- Integrated virtual learning environment powered by Socket.io:
  - Real-time video/audio streaming state coordination.
  - In-session group & private chat messaging.
  - Interactive whiteboard tools and poll launch widgets.
  - Attendance telemetry and automatic session duration logging.

---

### 6. Admin Panel (`/admin/*`)
- **Overview Dashboard**: High-level platform statistics (Total Users, Active Courses, Platform Revenue, Transaction Volume).
- **User Management**: Search, view, edit roles, or deactivate platform user accounts.
- **Workspace Approvals**: Review pending course/space publishing requests from practitioners.
- **System Logs & Audit**: Monitor consent logs, payout executions, and administrative payment audits.

---

## 🛠️ API Endpoint Matrix

| Base Module | Endpoint | Method | Guard / Access | Description |
| :--- | :--- | :---: | :---: | :--- |
| **Auth** | `/api/v1/auth/sendotp` | `POST` | *Public* | Generates and emails verification OTP |
| | `/api/v1/auth/signup` | `POST` | *Public* | Registers new client/practitioner account |
| | `/api/v1/auth/login` | `POST` | *Public* | Authenticates user & issues JWT token |
| | `/api/v1/auth/reset-password-token` | `POST` | *Public* | Sends password reset link to email |
| | `/api/v1/auth/reset-password` | `POST` | *Public* | Resets user password using reset token |
| **Profile** | `/api/v1/profile/getUserDetails` | `GET` | `auth` | Fetches active user profile & account metadata |
| | `/api/v1/profile/getEnrolledCourses` | `GET` | `auth`, `isStudent` | Lists student courses with progress metrics |
| | `/api/v1/profile/instructorDashboard` | `GET` | `auth`, `isPractitioner` | Aggregates practitioner telemetry & earnings |
| | `/api/v1/profile/updateDisplayPicture` | `PUT` | `auth` | Uploads and updates profile avatar on Cloudinary |
| **Course** | `/api/v1/course/createCourse` | `POST` | `auth`, `isPractitioner` | Initializes new course/space draft |
| | `/api/v1/course/addSection` | `POST` | `auth`, `isPractitioner` | Appends curriculum sections |
| | `/api/v1/course/addSubSection` | `POST` | `auth`, `isPractitioner` | Uploads video lecture subsection |
| | `/api/v1/course/getFullCourseDetails` | `POST` | `auth` | Fetches full course payload for playback viewer |
| | `/api/v1/course/showAllCourses` | `GET` | *Public* | Fetches catalog of published courses |
| **Live Class** | `/api/v1/liveClass/create` | `POST` | `auth`, `isPractitioner` | Schedules a new live video classroom |
| | `/api/v1/liveClass/session/:id` | `GET` | `auth` | Fetches classroom configuration & token |
| **Payment** | `/api/v1/payment/capturePayment` | `POST` | `auth`, `isStudent` | Initiates Razorpay payment order |
| | `/api/v1/payment/verifyPayment` | `POST` | `auth`, `isStudent` | Verifies Razorpay signature & grants enrollment |
| **Check-In** | `/api/v1/checkin` | `POST` | `auth` | Records client mood check-in & reflection entry |
| **Co-Pilot** | `/api/v1/copilot/suggestions` | `GET` | `auth` | Fetches AI Co-Pilot recommendations & prompts |
| **Admin** | `/api/v1/admin/users` | `GET` | `auth`, `isAdmin` | Lists system-wide user directory |
| | `/api/v1/admin/analytics` | `GET` | `auth`, `isAdmin` | Returns global platform performance telemetry |
| **Contact** | `/api/v1/reach/contact` | `POST` | *Public* | Submits support ticket / contact message |

---

## 🚀 Installation & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI
- **NPM** or **Yarn** package manager

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend/` root directory:
   ```env
   PORT=4000
   MONGODB_URL=mongodb://127.0.0.1:27017/StudyDB
   JWT_SECRET=your_jwt_secret_key_here

   # Cloudinary Media Configuration
   CLOUD_NAME=your_cloudinary_cloud_name
   API_KEY=your_cloudinary_api_key
   API_SECRET=your_cloudinary_api_secret
   FOLDER_NAME=StudyNet

   # Nodemailer SMTP Configuration
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USER=your_email@gmail.com
   MAIL_PASS=your_gmail_app_password

   # Razorpay Payment Gateway Credentials
   RAZORPAY_KEY=your_razorpay_key_id
   RAZORPAY_SECRET=your_razorpay_key_secret
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:4000` with WebSocket support enabled.*

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development client:
   ```bash
   npm run dev
   # or
   npm start
   ```

4. Access the web application in your browser at `http://localhost:3000`.

---

## 🔒 Tech Stack Summary

- **Frontend**: React 18, Redux Toolkit, React Router v6, Tailwind CSS, Recharts / Chart.js, Socket.io Client, DnD Kit, Swiper.js, React Hot Toast.
- **Backend**: Node.js, Express.js, Socket.io, Mongoose (MongoDB ORM), JWT (JSON Web Tokens), Bcrypt.js, Nodemailer.
- **Storage & Cloud**: Cloudinary (Video & Image Hosting), MongoDB Atlas / Local MongoDB.
- **Payments**: Razorpay Node SDK.

---

## 📄 License & Maintainers

Maintained as part of the **StudyNet / OpenHand** suite. Distributed under the ISC License.
./frontend
   ```
2. Install dependency files:
   ```bash
   npm install
   ```
3. Boot up the React web application:
   ```bash
   npm run start
   ```
4. Open the application locally: `http://localhost:3000`
