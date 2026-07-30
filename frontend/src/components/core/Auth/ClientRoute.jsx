import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"
import { ACCOUNT_TYPE } from "../../../utils/constants"

function ClientRoute({ children }) {
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

  if (
    user?.accountType === ACCOUNT_TYPE.CLIENT ||
    user?.accountType === ACCOUNT_TYPE.STUDENT
  ) {
    return children
  }

  if (
    user?.accountType === ACCOUNT_TYPE.ADMIN ||
    user?.accountType === "Admin"
  ) {
    return <Navigate to="/admin" />
  }

  return <Navigate to="/" />
}

export default ClientRoute
