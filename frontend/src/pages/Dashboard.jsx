import { useSelector } from "react-redux"
import { Outlet } from "react-router-dom"

import Sidebar from "../components/core/Dashboard/Sidebar"

function Dashboard() {
  const { loading: profileLoading } = useSelector((state) => state.profile)
  const { loading: authLoading } = useSelector((state) => state.auth)

  if (profileLoading || authLoading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="relative flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-50 text-navy">
      <Sidebar />
      <main className="dashboard-scroll h-full min-w-0 flex-1 bg-slate-50 overflow-y-auto">
        <div className="mx-auto w-11/12 max-w-[1200px] py-10 pb-24 text-left">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Dashboard
