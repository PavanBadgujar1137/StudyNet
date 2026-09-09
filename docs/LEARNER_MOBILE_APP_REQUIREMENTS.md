# OpenHand — Learner Mobile App Requirements

> **Product:** OpenHand (StudyNet)  
> **App:** Learner Mobile Application (iOS + Android)  
> **Parity source:** Existing Web Learner Portal (`/app/*`)  
> **Backend:** Same shared Express API — **no new backend required**  
> **API Base URL:** `https://api.openhand.live/api/v1` (prod) · `http://localhost:4000/api/v1` (local)  
> **Auth:** JWT Bearer token (`Authorization: Bearer <token>`)  
> **Account type:** `Learner` / `Client` / `Student` (aliases)

---

## 1. Purpose

Build a native/cross-platform **Learner Mobile App** that delivers **100% feature parity** with the existing OpenHand Web Learner Portal. Learners can check in daily, connect with practitioners, take courses, join circles, chat, attend Zoom live classes, answer reflections, manage subscription, and update profile — using the **same backend APIs** as the web app.

---

## 2. Scope & Principles

| Rule | Detail |
|------|--------|
| Feature parity | Every feature in Web Learner Portal must exist in mobile |
| Same backend | Reuse existing `/api/v1/*` endpoints; do not fork business logic |
| Same brand | OpenHand theme, colors, typography tokens |
| Same roles | Only Learner/Client/Student accounts can access this app |
| Payments | Razorpay (UPI / cards) — same payment flows as web |
| Media | Cloudinary-hosted avatars / course videos |
| Live sessions | Zoom join via deep link / in-app WebView or Zoom SDK |

**Out of scope for this app:** Practitioner portal features, Admin panel, Org dashboard.

---

## 3. Brand, Theme & Design System

Use the **same OpenHand design tokens** as the web app.

### 3.1 Colors

| Token | Hex | Usage |
|-------|-----|--------|
| `--oh-navy` / Ink | `#0F172A` | Primary text, headings |
| `--oh-blue` / Royal Blue | `#2563EB` | Primary CTA, links, active states |
| Indigo (mid gradient) | `#4733C9` | Brand gradient mid-stop |
| `--oh-violet` | `#7C3AED` | Accent, secondary highlights |
| Alt violet | `#8A2BE0` | Gradient end, brand icon |
| `--oh-sky` | `#60A5FA` | Soft highlights |
| `--oh-mist` | `#F8FAFC` | App background |
| `--oh-card` | `#FFFFFF` | Surfaces / cards |
| `--oh-muted` | `#334155` | Body text |
| `--oh-muted-2` | `#475569` | Subtitles |
| Slate meta | `#64748B` | Helper / secondary text |
| Border / rule | `rgba(13, 27, 61, 0.10)` | Dividers |
| `--oh-ok` | `#059669` | Success |
| `--oh-warn` | `#D97706` | Warning |
| `--oh-error` | `#DC2626` | Error / destructive |
| Light blue wash | `#DBEAFE` / `#EFF6FF` | Soft backgrounds |
| Light violet wash | `#EDE9FE` | Soft accent backgrounds |

### 3.2 Gradients

| Name | Value | Usage |
|------|-------|--------|
| Brand gradient | `linear-gradient(100deg, #2563EB 0%, #7C3AED 100%)` | Primary buttons, avatars, active nav |
| Journey gradient | `#1F5FE0 → #4733C9 → #8A2BE0` | Journey timeline path |
| Soft gradient | `rgba(37,99,235,.12) → rgba(124,58,237,.12)` | Subtle backgrounds |
| Brand icon | `linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)` | App icon / sidebar brand mark |

### 3.3 Typography

| Role | Font |
|------|------|
| Headings | **Outfit** (weights 400–900) |
| Body | **Plus Jakarta Sans** (weights 400–800) |
| Fallback | Poppins / Inter / system sans |

### 3.4 Radii, Shadows, Motion

| Token | Value |
|-------|--------|
| Radius SM | `10px` |
| Radius MD | `14px` |
| Radius LG | `20px` |
| Radius XL | `26px` |
| Pill | `999px` |
| Shadow SM | `0 4px 12px -4px rgba(13, 27, 61, 0.18)` |
| Shadow | `0 20px 60px -28px rgba(13, 27, 61, 0.28)` |
| Ease | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Durations | 140ms / 220ms / 380ms |

### 3.5 Mobile UI Shell

- Brand title: **Learner Portal**
- Subtitle: **Personalized Space**
- Bottom tab bar (mobile-first) mapping web sidebar tabs
- Greeting pattern: `Hello, {firstName}`
- Toast notifications for success/error (same messaging as web)
- Light mode only (match current web learner experience)

---

## 4. User Roles & Access

| Account type | Access |
|--------------|--------|
| `Learner` / `Client` / `Student` | Full app access |
| `Practitioner` / `Instructor` | Reject / redirect to Practitioner app |
| `Admin` / `OrgAdmin` | Reject / redirect to web admin/org |

**Subscription plans (same as web):** `trial`, `starter`, `growth`, `practice`, `master`, `none`  
Course / content access is **plan-gated** exactly like web.

---

## 5. Authentication & Onboarding Flows

### 5.1 Splash / Session Restore
1. App launch → read stored JWT
2. If valid → `GET /profile/getUserDetails` → route to Home (My Journey)
3. If invalid/expired → Login screen

### 5.2 Signup
1. Choose role: **Learner**
2. Enter: first name, last name, email, password, confirm password
3. `POST /auth/sendotp` → OTP verify screen
4. `POST /auth/signup` with OTP + accountType Learner
5. Store JWT → Home

### 5.3 Login
1. Email + password
2. `POST /auth/login`
3. Verify accountType is Learner/Client/Student
4. Store JWT → Home

### 5.4 Email Verification
- Screen for OTP entry (parity with `/verify-email`)

### 5.5 Forgot / Reset Password
1. `POST /auth/reset-password-token` (email)
2. Deep link / token screen → `POST /auth/reset-password`

### 5.6 Logout
- Clear token + local state (same as web `logout`)

---

## 6. App Navigation (Screens / Tabs)

Map 1:1 from web Learner Portal tabs:

| Tab ID | Label | Badge / Dot | Primary Screen |
|--------|-------|-------------|----------------|
| `journey` | My Journey | — | Personal path & streak (default home) |
| `checkin` | Check In | Today + dot | Daily mood/sleep check-in |
| `practitioners` | Practitioners | All Guides | Directory + connect/book |
| `courses` | Courses | — | Catalog + video player |
| `circle` | My Circle | Cohorts | Join peer cohorts |
| `community` | Community & Chat | Live + dot | Global / circle / DM |
| `sessions` | Sessions & Resources | — | Upcoming Zoom + notes |
| `reflections` | Reflections | Dot | Practitioner prompts journal |
| `profile` | Profile & Settings | — | Account, password, delete |

Suggested mobile IA:
- **Bottom tabs (primary):** Journey · Check In · Courses · Community · Profile  
- **More / overflow:** Practitioners · My Circle · Sessions · Reflections  

---

## 7. Feature Requirements (Complete)

### 7.1 My Journey (`journey`) — DEFAULT HOME

**Goal:** Personal learning path — private to learner + practitioner. No scores, no comparison.

**Features (must match web):**
- Greeting: `Hello, {firstName}`
- Check-in rhythm card:
  - Current streak (days)
  - Total check-in count
  - Week day strip (Mon–Sun), highlight today
  - Soft note: missed days don’t break progress
- Journey timeline (vertical path with brand gradient):
  1. **Account created** — always done after signup
  2. **Daily check-in rhythm** — done if `checkInCount > 0`
  3. **Zoom live classes** — done if upcoming classes exist
  4. **Peer support & growth circles** — ongoing / locked until joined
- Milestones grid (achieved / not achieved cards from dashboard data)
- Copy: private space, no wrong pace

**APIs:**
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/profile/client-dashboard` | Journey stats, streak, milestones, classes, practitioner |
| GET | `/payments/subscription/mine` | Subscription status banner / gating |

---

### 7.2 Check In (`checkin`)

**Goal:** ~15 second daily wellbeing check-in visible to connected practitioner.

**Features:**
- Header: “How are you today?”
- Date display (weekday, day, month — `en-IN`)
- Mood picker (exactly these 5):

| Key | Label |
|-----|-------|
| `low` | Heavy |
| `challenged` | Stretched thin |
| `steady` | Steady (default) |
| `energetic` | Lighter |
| `peaceful` | Good |

- Sleep score slider `0–10` (default `7`)
- Optional note textarea
- Save → `POST /checkins` with `{ mood, sleepScore, note, isPrivate: false }`
- Success state + toast
- History list from dashboard `checkIns`
- Practitioner reference text: “Dr. {name} can review…”

**APIs:**
| Method | Endpoint |
|--------|----------|
| POST | `/checkins` |
| GET | `/checkins` |
| GET | `/profile/client-dashboard` |

---

### 7.3 Practitioners (`practitioners`)

**Goal:** Browse directory, connect/book with practitioners via Razorpay.

**Features:**
- List all practitioners (directory)
- Show specialties / profile summary
- Connection status (connected / pending / not connected)
- Connect / Book flow:
  1. Create payment order (Razorpay)
  2. Verify / connect after payment
- View own connections
- Deep link to chat with connected practitioner

**APIs:**
| Method | Endpoint |
|--------|----------|
| GET | `/practitioners` |
| GET | `/practitioners/handle/:handle` |
| GET | `/practitioners/my-connections` |
| POST | `/practitioners/connect` |
| POST | `/payment/book-offer` |
| POST | `/payment/verify-offer-booking` |
| GET | `/payment/my-bookings` |

> Note: Web also references `/payment/create-practitioner-order` in some flows — mobile must support the **live payment + connect** path used by web Learner Practitioners screen.

---

### 7.4 Courses (`courses`)

**Goal:** Browse catalog, play videos, buy courses, respect plan gating.

**Features:**
- Course catalog list (`GET /courses`)
- Course detail + video list (`GET /courses/:id`, `GET /courses/:id/videos`)
- In-app video player (Cloudinary / streamed URL)
- Next-video progression
- Plan / trial gating — locked courses show upsell
- Pricing modal / subscription upsell (`OHPricingModal` parity)
- Buy individual course via Razorpay:
  - `POST /payments/buy-course`
  - `POST /payments/verify-course-payment`
- Subscription create/verify for platform plans
- Enrolled courses via profile if needed

**APIs:**
| Method | Endpoint |
|--------|----------|
| GET | `/courses` |
| GET | `/courses/:id` |
| GET | `/courses/:id/videos` |
| GET | `/payments/subscription/mine` |
| POST | `/payments/subscription/create` |
| POST | `/payments/subscription/verify` |
| POST | `/payments/buy-course` |
| POST | `/payments/verify-course-payment` |
| GET | `/plans` |
| GET | `/profile/getEnrolledCourses` |
| GET | `/lecture/course/:courseId` |
| GET | `/lecture/:lectureId/playback` |
| GET | `/note/course/:courseId` |
| POST | `/note/:noteId/download` |

---

### 7.5 My Circle (`circle`)

**Goal:** Join peer cohorts / growth circles.

**Features:**
- List all circles (`GET /circle/all`)
- Circle detail (name, topic, seats, members)
- Join circle (`POST /circle/:cohortId/join`)
- Capacity / seats filled display
- Deep-link into Community Chat for that circle
- Cohort feed view if available (`GET /circle/:cohortId`, `POST /circle/:cohortId/feed`)
- Kanban stage view if exposed to learners (`PATCH` is typically practitioner-driven)

**APIs:**
| Method | Endpoint |
|--------|----------|
| GET | `/circle/all` (alias `/circles/all`) |
| GET | `/circle/:cohortId` |
| POST | `/circle/:cohortId/join` |
| POST | `/circle/:cohortId/feed` |

---

### 7.6 Community & Chat (`community`)

**Goal:** Messaging hub — global, circle/group, and direct messages.

**Features:**
- Contacts list
- Global chat: list + send
- Practitioner group chat: list + send
- Direct messages with target user
- Circle-aware chat entry points
- Real-time feel (poll or Socket.io if web uses it)
- Unread / Live indicator on tab

**APIs:**
| Method | Endpoint |
|--------|----------|
| GET | `/chat/contacts` |
| GET | `/chat/global` |
| POST | `/chat/global` |
| GET | `/chat/group/:practitionerId` |
| POST | `/chat/group/:practitionerId` |
| GET | `/chat/direct/:targetUserId` |
| POST | `/chat/direct/:targetUserId` |
| GET | `/circle/all` |

---

### 7.7 Sessions & Resources (`sessions`)

**Goal:** Upcoming Zoom live classes + resources in one place.

**Features:**
- Upcoming Zoom classes list (date, title, instructor, time)
- **Join Zoom Class** → open `/live/:classId` equivalent (in-app live room or Zoom)
- Join/leave class API calls
- Past sessions & notes placeholder / list when available
- Course study materials & resources section
- Session notes modal viewer

**APIs:**
| Method | Endpoint |
|--------|----------|
| GET | `/profile/client-dashboard` |
| GET | `/live/upcoming` |
| GET | `/live/:classId` |
| POST | `/live/:classId/join` |
| POST | `/live/:classId/leave` |
| GET | `/note/course/:courseId` |
| POST | `/note/:noteId/download` |

---

### 7.8 Reflections (`reflections`)

**Goal:** Answer practitioner-written reflection prompts (journal).

**Features:**
- Header shows pending prompt count
- List prompts with status (`pending` / answered)
- Answer textarea per prompt
- Actions (same as web): save / send / private flag
- `POST /reflections/answer` with `{ promptId, answerText, action, isPrivate }`
- Empty state when no prompts
- Practitioner attribution (“Written by Dr. …”)

**APIs:**
| Method | Endpoint |
|--------|----------|
| GET | `/reflections` |
| POST | `/reflections/answer` |

---

### 7.9 Profile & Settings (`profile`)

**Features:**
- View profile (name, email, avatar)
- Edit profile (`PUT /profile/updateProfile`)
- Update display picture (`PUT /profile/updateDisplayPicture`) — multipart / Cloudinary
- Change password (`POST /auth/changepassword`)
- View subscription status
- Open pricing / manage plan
- Delete account (`DELETE /profile/deleteProfile`) with confirmation
- Logout
- Consent grant/revoke if used in learner flows:
  - `POST /consent/grant`
  - `POST /consent/revoke`
  - `GET /consent/status/:clientId`

**APIs:**
| Method | Endpoint |
|--------|----------|
| GET | `/profile/getUserDetails` |
| PUT | `/profile/updateProfile` |
| PUT | `/profile/updateDisplayPicture` |
| DELETE | `/profile/deleteProfile` |
| POST | `/auth/changepassword` |
| GET | `/payments/subscription/mine` |
| POST | `/consent/grant` |
| POST | `/consent/revoke` |
| GET | `/consent/status/:clientId` |

---

### 7.10 Subscription & Pricing (Cross-cutting)

**Features:**
- Fetch plans `GET /plans`
- Show trial / active plan status
- Create subscription order → Razorpay checkout → verify
- Gate courses/features by plan (`trial`, `starter`, `growth`, `practice`, `master`)
- Pricing modal parity with web `OHPricingModal`

**APIs:**
| Method | Endpoint |
|--------|----------|
| GET | `/plans` |
| POST | `/payments/subscription/create` |
| POST | `/payments/subscription/verify` |
| GET | `/payments/subscription/mine` |
| POST | `/payments/sendPaymentSuccessEmail` |

---

### 7.11 Live Classroom

**Features:**
- Open live session for `classId`
- Display session metadata
- Join Zoom meeting (SDK or external Zoom app / WebView)
- Leave session
- Handle started / ended / cancelled states from API

**APIs:**
| Method | Endpoint |
|--------|----------|
| GET | `/live/:classId` |
| POST | `/live/:classId/join` |
| POST | `/live/:classId/leave` |

---

## 8. Complete Learner API Matrix (Shared Backend)

Base: `/api/v1`

### Auth
| Method | Path | Auth |
|--------|------|------|
| POST | `/auth/login` | No |
| POST | `/auth/signup` | No |
| POST | `/auth/sendotp` | No |
| POST | `/auth/changepassword` | Yes |
| POST | `/auth/reset-password-token` | No |
| POST | `/auth/reset-password` | No |

### Profile
| Method | Path | Auth |
|--------|------|------|
| GET | `/profile/getUserDetails` | Yes |
| PUT | `/profile/updateProfile` | Yes |
| PUT | `/profile/updateDisplayPicture` | Yes |
| DELETE | `/profile/deleteProfile` | Yes |
| GET | `/profile/getEnrolledCourses` | Yes |
| GET | `/profile/client-dashboard` | Yes |

### Payments / Plans
| Method | Path | Auth |
|--------|------|------|
| GET | `/payments/subscription/mine` | Yes |
| POST | `/payments/subscription/create` | Yes |
| POST | `/payments/subscription/verify` | Yes |
| POST | `/payments/buy-course` | Yes |
| POST | `/payments/verify-course-payment` | Yes |
| POST | `/payments/book-offer` | Yes |
| POST | `/payments/verify-offer-booking` | Yes |
| GET | `/payments/my-bookings` | Yes |
| POST | `/payments/sendPaymentSuccessEmail` | Yes |
| GET | `/plans` | No/Yes |
| POST | `/plans/create-order` | Yes |
| POST | `/plans/verify-payment` | Yes |

> `/payment/*` and `/payments/*` are mounted to the same router — mobile may use either prefix consistently.

### Courses / Lectures / Notes
| Method | Path | Auth |
|--------|------|------|
| GET | `/courses` | No/Yes |
| GET | `/courses/:id` | No/Yes |
| GET | `/courses/:id/videos` | Yes |
| GET | `/lecture/course/:courseId` | Yes |
| GET | `/lecture/:lectureId/playback` | Yes |
| GET | `/note/course/:courseId` | Yes |
| POST | `/note/:noteId/download` | Yes |

### Practitioners
| Method | Path | Auth |
|--------|------|------|
| GET | `/practitioners` | No |
| GET | `/practitioners/handle/:handle` | No |
| POST | `/practitioners/connect` | Yes |
| GET | `/practitioners/my-connections` | Yes |

### Check-ins
| Method | Path | Auth |
|--------|------|------|
| POST | `/checkins` | Yes (Client) |
| GET | `/checkins` | Yes (Client) |

### Reflections
| Method | Path | Auth |
|--------|------|------|
| GET | `/reflections` | Yes (Client) |
| POST | `/reflections/answer` | Yes (Client) |

### Circles
| Method | Path | Auth |
|--------|------|------|
| GET | `/circle/all` | No/Yes |
| GET | `/circle/:cohortId` | Yes |
| POST | `/circle/:cohortId/join` | Yes |
| POST | `/circle/:cohortId/feed` | Yes |

### Live
| Method | Path | Auth |
|--------|------|------|
| GET | `/live/upcoming` | Yes |
| GET | `/live/:classId` | Yes |
| POST | `/live/:classId/join` | Yes (Student) |
| POST | `/live/:classId/leave` | Yes (Student) |

### Chat
| Method | Path | Auth |
|--------|------|------|
| GET | `/chat/global` | Yes* |
| POST | `/chat/global` | Yes* |
| GET | `/chat/group/:practitionerId` | Yes* |
| POST | `/chat/group/:practitionerId` | Yes* |
| GET | `/chat/direct/:targetUserId` | Yes* |
| POST | `/chat/direct/:targetUserId` | Yes* |
| GET | `/chat/contacts` | Yes* |

### Consent / Contact
| Method | Path | Auth |
|--------|------|------|
| POST | `/consent/grant` | Yes |
| POST | `/consent/revoke` | Yes |
| GET | `/consent/status/:clientId` | Yes |
| POST | `/reach/contact` | No |

---

## 9. Shared Backend Contract (Do Not Change)

- **Do not** create a separate learner backend.
- Use existing JWT auth + role middleware (`isClient` / `isStudent`).
- Payments go to **Admin ledger**; practitioners are paid by Admin (learner only pays platform / offers / courses).
- Media via Cloudinary; do not re-host differently.
- Razorpay keys from backend order responses (`key`, `order.id`, amounts).
- Env for mobile: `API_BASE_URL` = same as web `REACT_APP_BASE_URL`.

---

## 10. Non-Functional Requirements

| Area | Requirement |
|------|-------------|
| Platforms | iOS 14+ and Android 8+ |
| Offline | Graceful empty/error states; retry; cache profile lightly |
| Security | Secure token storage (Keychain / EncryptedSharedPreferences) |
| Performance | Tab screens lazy-load; video buffered; image caching |
| Accessibility | Dynamic type friendly; contrast on navy/blue |
| Localization | English first (match web `en-IN` date formatting where used) |
| Push (optional phase-2) | Check-in reminders, class starting, new reflection, chat |
| Analytics (optional) | Screen views parity with product needs |
| Error handling | Toast / inline errors matching web copy |

---

## 11. Acceptance Criteria

- [ ] Learner can sign up, verify OTP, login, reset password, logout
- [ ] Non-learner accounts cannot use this app
- [ ] All 9 tabs/features work with live `/api/v1` backend
- [ ] Check-in moods/sleep/note match web exactly
- [ ] Courses gated by plan; Razorpay buy + subscription works
- [ ] Practitioners directory + connect/book works
- [ ] Circles join works; Community chat (global/group/DM) works
- [ ] Upcoming Zoom sessions joinable
- [ ] Reflections answer (private/send) works
- [ ] Profile edit, avatar, password, delete account work
- [ ] Theme colors/typography match OpenHand tokens above
- [ ] No backend schema or route changes required for v1 parity

---

## 12. Delivery Phases (Suggested)

1. **Auth + Shell + Theme**
2. **Journey + Check-in + Profile**
3. **Courses + Payments**
4. **Practitioners + Bookings**
5. **Circles + Community Chat**
6. **Sessions / Live Zoom + Reflections**
7. **Polish, QA parity vs web `/app`**

---

*Document generated from existing OpenHand Web Learner Portal feature set. Keep features identical; mobile is a client of the same backend.*
