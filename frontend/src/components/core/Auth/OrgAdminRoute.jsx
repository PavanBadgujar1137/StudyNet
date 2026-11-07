import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"
import { ACCOUNT_TYPE } from "../../../utils/constants"

function OrgAdminRoute({ children }) {
  const { token } = useSelector((state) => state.auth)
  const { user, loading } = useSelector((state) => state.profile)

  if (token === null) {
    return <Navigate to="/login" />
  }

  if (loading || !user) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (user?.accountType === ACCOUNT_TYPE.ORG_ADMIN) {
    return children
  }

  return <Navigate to="/" />
}

export default OrgAdminRoute
