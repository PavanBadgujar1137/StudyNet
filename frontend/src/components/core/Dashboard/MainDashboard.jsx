import React from 'react'
import { useSelector } from 'react-redux'
import ClientDashboard from './ClientDashboard/ClientDashboard'
import PractitionerDashboard from './PractitionerDashboard/PractitionerDashboard'
import { ACCOUNT_TYPE } from '../../../utils/constants'

export function MainDashboard() {
  const { user } = useSelector((state) => state.profile)

  const isPractitionerRole =
    user?.accountType === ACCOUNT_TYPE.PRACTITIONER ||
    user?.accountType === ACCOUNT_TYPE.INSTRUCTOR ||
    user?.accountType === ACCOUNT_TYPE.ADMIN

  if (isPractitionerRole) {
    return <PractitionerDashboard />
  }

  return <ClientDashboard />
}

export default MainDashboard
