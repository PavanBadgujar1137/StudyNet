import { useEffect } from "react"

// Redux
import { useDispatch } from "react-redux"
// React Router
import { Route, Routes, useNavigate, useLocation } from "react-router-dom"

// Components
import Navbar from "./components/Common/Navbar"
import OpenRoute from "./components/core/Auth/OpenRoute"
import PrivateRoute from "./components/core/Auth/PrivateRoute"
import Dashboard from "./pages/Dashboard"
import Error from "./pages/Error"
import ForgotPassword from "./pages/ForgotPassword"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import UpdatePassword from "./pages/UpdatePassword"
import VerifyEmail from "./pages/VerifyEmail"
import LiveClassRoom from "./pages/LiveClassRoom"

// OpenHand Marketing Pages (Verbatim Specs)
import HomeMarketing from "./pages/marketing/Home"
import PractitionerJourney from "./pages/marketing/PractitionerJourney"
import PricingPage from "./pages/marketing/PricingPage"
import ForOrganizations from "./pages/marketing/ForOrganizations"
import FindAPractitioner from "./pages/marketing/FindAPractitioner"
import CoPilot from "./pages/marketing/CoPilot"
import LearnerJourney from "./pages/marketing/LearnerJourney"
// import StartFree from "./pages/marketing/StartFree"
import ContactUs from "./pages/marketing/ContactUs"
import PractitionerOnboarding from "./pages/PractitionerOnboarding"

// OpenHand Footer Pages
import PlatformStatus from "./pages/footer/PlatformStatus"
import Documentation from "./pages/footer/Documentation"
import Community from "./pages/footer/Community"
import HelpSupport from "./pages/footer/HelpSupport"
import PrivacyPolicy from "./pages/footer/PrivacyPolicy"
import TermsOfService from "./pages/footer/TermsOfService"
import DataConsent from "./pages/footer/DataConsent"
import Security from "./pages/footer/Security"

// OpenHand Authenticated Apps (B & C)
import LearnerApp from "./pages/app/LearnerApp"
import PractitionerApp from "./pages/practice/PractitionerApp"
import OrgAdmin from "./pages/org/OrgAdmin"

// Phase 2 — Role Guards
import LearnerRoute from "./components/core/Auth/LearnerRoute"
import PractitionerRoute from "./components/core/Auth/PractitionerRoute"
import OrgAdminRoute from "./components/core/Auth/OrgAdminRoute"
import AdminRoute from "./components/core/Auth/AdminRoute"
import { getUserDetails } from "./services/operations/profileAPI"

// Admin Panel
import AdminApp from "./pages/admin/AdminApp"

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      let token = null;
      try {
        token = JSON.parse(storedToken);
      } catch (e) {
        token = storedToken;
      }
      if (token) {
        dispatch(getUserDetails(token, navigate))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-richblack-900 font-inter">
      <ScrollToTop />
      <Navbar />
      <Routes>
        {/* OpenHand Marketing Sitemap (A1-A8) */}
        <Route path="/" element={<HomeMarketing />} />
        <Route path="/practitioner-journey" element={<PractitionerJourney />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/for-organizations" element={<ForOrganizations />} />
        <Route path="/find-a-practitioner" element={<FindAPractitioner />} />
        <Route path="/co-pilot" element={<CoPilot />} />
        <Route path="/aura" element={<CoPilot />} />
        <Route path="/client-journey" element={<LearnerJourney />} />
        <Route path="/learner-journey" element={<LearnerJourney />} />
        {/* <Route path="/start-free" element={<StartFree />} /> */}
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/talk-to-human" element={<ContactUs />} />

        {/* Footer Pages */}
        <Route path="/platform-status" element={<PlatformStatus />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/community" element={<Community />} />
        <Route path="/help-support" element={<HelpSupport />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/data-consent" element={<DataConsent />} />
        <Route path="/security" element={<Security />} />

        {/* Learner App (5 Tabs) */}
        <Route
          path="/app/*"
          element={
            <LearnerRoute>
              <LearnerApp />
            </LearnerRoute>
          }
        />

        {/* Practitioner App (7 Sections) */}
        <Route
          path="/practice/*"
          element={
            <PractitionerRoute>
              <PractitionerApp />
            </PractitionerRoute>
          }
        />

        {/* Admin Panel */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminApp />
            </AdminRoute>
          }
        />

        {/* Org Portal */}
        <Route
          path="/org/dashboard"
          element={
            <OrgAdminRoute>
              <OrgAdmin />
            </OrgAdminRoute>
          }
        />

        {/* Practitioner Onboarding Flow */}
        <Route
          path="/onboarding/practitioner"
          element={
            <PractitionerRoute>
              <PractitionerOnboarding />
            </PractitionerRoute>
          }
        />

        {/* Live classroom */}
        <Route
          path="live/:classId"
          element={
            <PrivateRoute>
              <LiveClassRoom />
            </PrivateRoute>
          }
        />
        {/* Open Route - for Only Non Logged in User */}
        <Route
          path="login"
          element={
            <OpenRoute>
              <Login />
            </OpenRoute>
          }
        />
        <Route
          path="forgot-password"
          element={
            <OpenRoute>
              <ForgotPassword />
            </OpenRoute>
          }
        />
        <Route
          path="update-password/:id"
          element={
            <OpenRoute>
              <UpdatePassword />
            </OpenRoute>
          }
        />
        <Route
          path="signup"
          element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
        />
        <Route
          path="verify-email"
          element={
            <OpenRoute>
              <VerifyEmail />
            </OpenRoute>
          }
        />
        {/* Private Route - Client & Practitioner Dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* 404 Page */}
        <Route path="*" element={<Error />} />
      </Routes>
    </div>
  )
}

export default App
