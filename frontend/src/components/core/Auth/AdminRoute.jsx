import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"

/**
 * AdminRoute — Only allows users with accountType "Admin" to access the route.
 * All other users are redirected to their respective dashboards.
 */
function AdminRoute({ children }) {
  const { user } = useSelector((state) => state.profile)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.accountType !== "Admin") {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute
