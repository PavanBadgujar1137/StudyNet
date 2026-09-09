# OpenHand Learner App (`flutter_customer_app`)

Native Flutter client for the **OpenHand Learner Portal**. It talks to the existing StudyNet / OpenHand Express API. The web frontend and backend in this repository are unchanged.

## What this app is

A mobile-first learner client with the same business rules as `/app` on the web:

- Email login, OTP signup, password reset, logout, session restore
- My Journey, daily check-in, practitioners + Razorpay booking, courses, circles, community chat, sessions/Zoom, reflections, profile
- Plan gating and Razorpay subscriptions using live `/api/v1` endpoints

Practitioner, Admin, and OrgAdmin accounts are rejected with a message to use the web portal or the practitioner app.

## Run

```bash
cd flutter_customer_app
flutter pub get
```

**Production API** (default — same as the live website):

```bash
flutter run
flutter build apk --release
```

The app calls `https://api.openhand.live/api/v1`, the same backend as `https://openhand.live`.

**Local backend** (emulator only):

```bash
flutter run --dart-define=APP_ENV=development
```

That uses `http://10.0.2.2:4000/api/v1`. Start `backend` first.

Razorpay keys are returned by the backend on each order. They are never hardcoded in the app.

## Architecture

```
lib/
  app/           theme, router, env config
  core/          Dio client, secure storage, errors, shared widgets
  features/      auth, journey, check-in, courses, community, profile, …
```

State: **Riverpod**. Routing: **go_router** with auth redirects. Tokens: **flutter_secure_storage**.

## Auth

Same contract as the web app:

| Action | Endpoint |
|--------|----------|
| Login | `POST /auth/login` |
| Send OTP | `POST /auth/sendotp` |
| Signup | `POST /auth/signup` (`accountType: Learner`) |
| Reset token | `POST /auth/reset-password-token` |
| Reset password | `POST /auth/reset-password` |
| Session restore | stored JWT → `GET /profile/getUserDetails` |

JWT is stored in Keychain / EncryptedSharedPreferences. 401 responses clear the session.

Social login (Google / LinkedIn) exists on the web but is **not** implemented here. It needs native OAuth client IDs. Email + password is the supported mobile path.

## Payments

Learner payments use the **real** backend routes (not the web-only `/payment/create-practitioner-order` path, which is not mounted on the server):

- Membership: `POST /payments/subscription/create` → Razorpay → `POST /payments/subscription/verify`
- Course: `POST /payments/buy-course` → Razorpay → `POST /payments/verify-course-payment`
- Practitioner offer: `POST /payments/book-offer` → Razorpay → `POST /payments/verify-offer-booking` → `POST /practitioners/connect`

## Backend gap (do not silently change)

The web Practitioners screen posts to `/api/v1/payment/create-practitioner-order`. That route is **not** registered in `backend/routes/Payments.js`. This app uses `book-offer` + `connect`, which are the live endpoints.

If product wants the old web connect-order path on mobile as well, that backend route must be added first.

## Push notifications

Not implemented in v1. The current backend does not expose a device-token registration API for learners. Deep links for password reset (`openhand://app/reset-password/:token`) are reserved for a later web email update.

## Brand

Colors, type (Outfit + Plus Jakarta Sans), and logo assets are taken from the existing OpenHand web design tokens and `frontend/src/assets/Logo`.
