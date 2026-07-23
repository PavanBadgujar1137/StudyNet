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
    user?.accountType === ACCOUNT_TYPE.CLIENT ||
    user?.accountType === ACCOUNT_TYPE.STUDENT
  ) {
    return <Navigate to="/app/journey" />
  }

  return <Navigate to="/" />
}

export default PractitionerRoute
