import { useEffect } from "react"

import Certificate from "./pages/Certificate"
import "./App.css"
// Redux
import { useDispatch, useSelector } from "react-redux"
// React Router
import { Route, Routes, useNavigate } from "react-router-dom"

// Components
import Navbar from "./components/Common/Navbar"
import OpenRoute from "./components/core/Auth/OpenRoute"
import PrivateRoute from "./components/core/Auth/PrivateRoute"
import AddCourse from "./components/core/Dashboard/AddCourse"
import Cart from "./components/core/Dashboard/Cart"
import EditCourse from "./components/core/Dashboard/EditCourse"
import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses"
import Instructor from "./components/core/Dashboard/Instructor"
import MyCourses from "./components/core/Dashboard/MyCourses"
import MyProfile from "./components/core/Dashboard/MyProfile"
import Settings from "./components/core/Dashboard/Settings"
import VideoDetails from "./components/core/ViewCourse/VideoDetails"
import Catalog from "./pages/Catalog"
import CourseDetails from "./pages/CourseDetails"
import Dashboard from "./pages/Dashboard"
import Error from "./pages/Error"
import ForgotPassword from "./pages/ForgotPassword"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import UpdatePassword from "./pages/UpdatePassword"
import VerifyEmail from "./pages/VerifyEmail"
import DashboardAllCourses from "./pages/DashboardAllCourses"
import ViewCourse from "./pages/ViewCourse"
import LiveClassRoom from "./pages/LiveClassRoom"
import SchedulingDashboard from "./components/core/Dashboard/SchedulingDashboard"

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
import { ACCOUNT_TYPE } from "./utils/constants"

function App() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.profile)

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

        {/* Program & Course Compatibility Routes */}
        <Route path="courses/:courseId" element={<CourseDetails />} />
        <Route path="catalog/:catalogName" element={<Catalog />} />
        {/* Phase 2 — Live classroom */}
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
        {/* Private Route - for Only Logged in User */}
        <Route
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          {/* Route for all users */}
          <Route path="dashboard/my-profile" element={<MyProfile />} />
          <Route path="dashboard/all-courses" element={<DashboardAllCourses />} />
          <Route path="dashboard/Settings" element={<Settings />} />
          {/* Route only for Instructors */}
          {user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
            <>
              <Route path="dashboard/instructor" element={<Instructor />} />
              <Route path="dashboard/my-courses" element={<MyCourses />} />
              <Route path="dashboard/add-course" element={<AddCourse />} />
              <Route
                path="dashboard/edit-course/:courseId"
                element={<EditCourse />}
              />
              {/* Phase 2 — Live Schedule */}
              <Route path="dashboard/schedule" element={<SchedulingDashboard />} />
            </>
          )}
          {/* Route only for Students */}
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Route
                path="dashboard/enrolled-courses"
                element={<EnrolledCourses />}
              />
              <Route path="/dashboard/cart" element={<Cart />} />
            </>
          )}
          <Route path="dashboard/settings" element={<Settings />} />
        </Route>

        {/* For the watching course lectures */}
        <Route
          element={
            <PrivateRoute>
              <ViewCourse />
            </PrivateRoute>
          }
        >
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Route
                path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
                element={<VideoDetails />}
              />
            </>
          )}
        </Route>
        <Route path="/certificate" element={<Certificate />} />
        {/* 404 Page */}
        <Route path="*" element={<Error />} />
      </Routes>
    </div>
  )
}

export default App
