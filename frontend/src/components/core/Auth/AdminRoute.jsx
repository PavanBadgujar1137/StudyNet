import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"
import { ACCOUNT_TYPE } from "../../../utils/constants"

function AdminRoute({ children }) {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  if (token === null) {
    return <Navigate to="/login" />
  }

  if (user?.accountType === ACCOUNT_TYPE.ADMIN) {
    return children
  }

  return <Navigate to="/" />
}

export default AdminRoute
