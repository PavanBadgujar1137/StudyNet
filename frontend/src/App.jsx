import { useEffect } from "react"

// Redux
import { useDispatch } from "react-redux"
// React Router
import { Route, Routes, useNavigate } from "react-router-dom"

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
import Pricing from "./pages/marketing/Pricing"
import ForOrganizations from "./pages/marketing/ForOrganizations"
import FindAPractitioner from "./pages/marketing/FindAPractitioner"
import CoPilot from "./pages/marketing/CoPilot"
import ClientJourney from "./pages/marketing/ClientJourney"
import StartFree from "./pages/marketing/StartFree"
import TalkToHuman from "./pages/marketing/TalkToHuman"
import PractitionerOnboarding from "./pages/PractitionerOnboarding"

// OpenHand Authenticated Apps (B & C)
import ClientApp from "./pages/app/ClientApp"
import PractitionerApp from "./pages/practice/PractitionerApp"
import OrgAdmin from "./pages/org/OrgAdmin"

// Phase 2 — Role Guards
import ClientRoute from "./components/core/Auth/ClientRoute"
import PractitionerRoute from "./components/core/Auth/PractitionerRoute"
import OrgAdminRoute from "./components/core/Auth/OrgAdminRoute"
import { getUserDetails } from "./services/operations/profileAPI"

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
      <Navbar />
      <Routes>
        {/* OpenHand Marketing Sitemap (A1-A8) */}
        <Route path="/" element={<HomeMarketing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/for-organizations" element={<ForOrganizations />} />
        <Route path="/find-a-practitioner" element={<FindAPractitioner />} />
        <Route path="/co-pilot" element={<CoPilot />} />
        <Route path="/client-journey" element={<ClientJourney />} />
        <Route path="/start-free" element={<StartFree />} />
        <Route path="/talk-to-human" element={<TalkToHuman />} />

        {/* Client App (5 Tabs) */}
        <Route
          path="/app/*"
          element={
            <ClientRoute>
              <ClientApp />
            </ClientRoute>
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
