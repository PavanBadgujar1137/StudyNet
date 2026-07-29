import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"
import { ACCOUNT_TYPE } from "../../../utils/constants"

function PractitionerRoute({ children }) {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  if (token === null) {
    return <Navigate to="/login" />
  }

  if (
    user?.accountType === ACCOUNT_TYPE.PRACTITIONER ||
    user?.accountType === ACCOUNT_TYPE.INSTRUCTOR
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

export default PractitionerRoute
