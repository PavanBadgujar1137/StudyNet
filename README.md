# StudyNet (OpenHand Practice Platform) 🚀

StudyNet is a premium, full-stack educational and practice-space management platform. Built using the MERN stack (MongoDB, Express.js, React, Node.js), it provides custom workspaces for instructors to publish secure courses/spaces, capture client telemetry, and process payments, alongside an interactive student portal with video streaming, progress tracking, and automated completion certificates.

---

## 🗺️ System Architecture & Folder Structure

```
StudyNet/
├── backend/
│   ├── config/             # DB (MongoDB Mongoose) & Cloudinary configurations
│   ├── controllers/        # Route handlers (Auth, Course, Payment, Profile, Category)
│   ├── mail/               # HTML email templates (OTP, Payment success confirmation)
│   ├── middleware/         # Authentication and authorization guards (Student, Instructor, Admin)
│   ├── models/             # Schema definitions (User, Course, OTP, Section, Subsection, Profile...)
│   ├── routes/             # Express API routers
│   ├── utils/              # Media uploading to Cloudinary, duration converting, and mail transport
│   ├── index.js            # Node/Express app startup entrypoint
│   └── .env                # Private environmental configurations
│
└── frontend/
    ├── public/             # Static public assets
    ├── src/
    │   ├── assets/         # CSS styles and custom image/logo assets
    │   ├── components/     # UI elements
    │   │   ├── Common/     # Shared components (Navbar, Footer, ConfirmationModal, ReviewSlider...)
    │   │   └── core/       # Features (Auth, Catalog, CourseDetails, ViewCourse, Dashboard...)
    │   ├── data/           # Sidebar menu link mappings and constants
    │   ├── pages/          # Primary Pages (Home, About, Contact, Catalog, CourseDetails, Dashboard...)
    │   ├── services/       # Network API connector and Axios requests
    │   ├── slices/         # Redux Toolkit state slices (auth, profile, course, viewCourse...)
    │   ├── App.jsx         # App router setup
    │   └── index.js        # React client entry point
    └── package.json        # Frontend NPM configurations
```

---

## 💻 Exact Application Features & Pages (Fully Implemented)

### 1. Public Pages
* **Home (`Home.jsx`):**
  - Gradient backdrop glows.
  - Interactive "Client Check-In" demo widget (select peaceful, challenged, or energetic moods and write reflections).
  - Testimonial slider displaying community ratings.
* **About (`About.jsx`):**
  - Company narrative and core vision values.
  - Statistics grid displaying active stats (5K+ Students, 10+ Awards, 50+ Courses).
* **Contact (`Contact.jsx`):**
  - Structured form (First/Last name, Email, Phone number, Message text) posting to `/reach/contact`.
* **Category Catalog (`Catalog.jsx`):**
  - Direct course slider lists filtering by active categories.
  - Showcases "Top Courses" and "Frequently Bought Together" bundles.
* **Course details (`CourseDetails.jsx`):**
  - Comprehensive metadata (syllabus curriculum accordion list, instructor profile card, average ratings, and price tags).
  - Check out controls: "Add to Cart" and "Buy Now".

---

### 2. User Authentication (`Auth/` Pages)
* **Sign Up:** Create account as a **Student** or **Instructor** with automated 6-digit OTP verification via Gmail.
* **Log In:** Login using email and password, establishing JWT tokens.
* **Forgot & Reset Password:** Send token links directly to email to set up new passwords.
* **Verify Email:** Verification viewport entering OTP code sequences.

---

### 3. Student Dashboard
* **Enrolled Courses (`EnrolledCourses.jsx`):**
  - Grid list of active space cards showing progress bars and completion percentages.
* **Cart Page (`Cart/`):**
  - Manage selected items, review total pricing, and trigger Razorpay sandboxed checkouts.
* **Course Viewer (`ViewCourse.jsx`):**
  - Left panel indexing course sections and subsections.
  - Video streaming playback player with a "Mark as Completed" button.
* **Completion Certificate (`Certificate.jsx`):**
  - Generates automated certificates featuring student names, completed courses, and metadata upon finishing all course material.

---

### 4. Redesigned Instructor Dashboard (`Instructor.jsx`)
* **Welcome Banner:**
  - Modern linear gradient card layout.
  - Displays greeting messages by name, calendar dates, and action buttons to "Create Space" or "My Spaces".
* **Glassmorphic Stats Strip:**
  - Stat trackers detailing total spaces, total enrolled clients, and total earnings.
  - Highlights monthly growth indicators (+% mock stats relative to last month).
* **Visual Performance Charts (`InstructorChart.jsx`):**
  - Supports toggling between **Doughnut**, **Pie**, and **Bar** chart models.
  - Switches metrics to visualize either **Clients Enrolled** or **Revenue (₹)**.
* **Platform Insights Panel:**
  - Dynamic telemetry detailing Average Space Price, Top Performing Space by enrollment, status splits (Drafts vs. Published), and actionable tips.
* **Active Containers Grid:**
  - Cards displaying cover images, status pills (Draft/Published), client count tags, price pills, and quick shortcut buttons to edit courses or view student pages.

---

### 5. Course Space Builder (Instructor Tools)
* **Step 1: Course Information:**
  - Set title, description, price, category tags, requirements, and upload thumbnails to Cloudinary.
* **Step 2: Course Builder:**
  - Add/delete custom sections.
  - Add/edit nested subsections (with file uploads, time durations, and lecture details).
* **Step 3: Publish Settings:**
  - Choose draft or published status visibility.

---

### 6. Settings Page
* **Avatar Upload:** Change profile pictures by uploading images to Cloudinary.
* **Information Edit:** Edit bio descriptions, gender, birth dates, phone numbers, and names.
* **Security settings:** Change active passwords.
- **Delete Account:** Remove account data and pull enrollments from active courses.

---

## 🛠️ API Routes (Backend Endpoints)

| Endpoint | Method | Middleware Guard | Description |
| :--- | :---: | :---: | :--- |
| `/api/v1/auth/sendotp` | `POST` | *None* | Generates and emails verification OTP |
| `/api/v1/auth/signup` | `POST` | *None* | Registers user account credentials |
| `/api/v1/auth/login` | `POST` | *None* | Log in user and returns user info + token |
| `/api/v1/auth/reset-password-token` | `POST` | *None* | Emails token link for password resetting |
| `/api/v1/auth/reset-password` | `POST` | *None* | Resets credentials in database |
| `/api/v1/profile/getUserDetails` | `GET` | `auth` | Fetches details for profile cards |
| `/api/v1/profile/getEnrolledCourses`| `GET` | `auth`, `isStudent` | Lists student courses with progress telemetry|
| `/api/v1/profile/instructorDashboard`| `GET`| `auth`, `isInstructor`| Fetches course stats for the dashboard |
| `/api/v1/course/createCourse` | `POST` | `auth`, `isInstructor`| Initiates a new course listing |
| `/api/v1/course/addSection` | `POST` | `auth`, `isInstructor`| Appends course outline sections |
| `/api/v1/course/addSubSection` | `POST` | `auth`, `isInstructor`| Appends video lecture subsections |
| `/api/v1/payment/capturePayment` | `POST` | `auth`, `isStudent` | captures Razorpay order details |
| `/api/v1/payment/verifyPayment` | `POST` | `auth`, `isStudent` | Verifies signatures on completed orders |
| `/api/v1/reach/contact` | `POST` | *None* | Logs contact messages and tickets |

---

## 🚀 Setting Up the Application

### 1. Prerequisites
Ensure you have the following installed on your system:
- **Node.js** (v16.0.0 or higher)
- **MongoDB** local instance running on port `27017`

### 2. Backend Config
1. Move to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependency files:
   ```bash
   npm install
   ```
3. Configure the `.env` settings:
   ```env
   PORT=4000
   MONGODB_URL=mongodb://127.0.0.1:27017/StudyDB
   JWT_SECRET=yourSecretTokenKey
   
   CLOUD_NAME=yourCloudinaryName
   API_KEY=yourCloudinaryApiKey
   API_SECRET=yourCloudinaryApiSecret
   FOLDER_NAME=yourCloudinaryFolder
   
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USER=yourGmailAccount@gmail.com
   MAIL_PASS=yourGmailAppPassword
   
   RAZORPAY_KEY=yourRazorpayKey
   RAZORPAY_SECRET=yourRazorpaySecret
   ```
4. Start the Node.js application:
   ```bash
   npm run dev
   ```

### 3. Frontend Config
1. Move to the frontend folder:
   ```bash
   cd ../frontend
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
