// This will prevent non-authenticated users from accessing this route
import { useSelector } from "react-redux"
import { Navigate, useLocation } from "react-router-dom"

function PrivateRoute({ children }) {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const location = useLocation()

  if (token === null) {
    return <Navigate to="/login" />
  }

  // Block entry to any private page until consent is accepted
  // Skip for Admin users and skip when already on /consent (prevents redirect loop)
  if (
    user &&
    !user.hasConsented &&
    user.accountType !== 'Admin' &&
    location.pathname !== '/consent'
  ) {
    return <Navigate to="/consent" />
  }

  return children
}

export default PrivateRoute
