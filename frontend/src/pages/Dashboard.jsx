import { useSelector } from "react-redux"
import MainDashboard from "../components/core/Dashboard/MainDashboard"

function Dashboard() {
  const { loading: profileLoading } = useSelector((state) => state.profile)
  const { loading: authLoading } = useSelector((state) => state.auth)

  if (profileLoading || authLoading) {
    return (
      <div className="grid min-h-screen w-full place-items-center bg-slate-50">
        <div className="spinner"></div>
      </div>
    )
  }

  // Render MainDashboard directly for all dashboard paths
  return <MainDashboard />
}

export default Dashboard
