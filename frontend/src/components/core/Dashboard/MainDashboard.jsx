import React from 'react'
import { useSelector } from 'react-redux'
import ClientDashboard from './ClientDashboard/ClientDashboard'
import PractitionerDashboard from './PractitionerDashboard/PractitionerDashboard'
import AdminApp from '../../../pages/admin/AdminApp'
import { ACCOUNT_TYPE } from '../../../utils/constants'

export function MainDashboard() {
  const { user } = useSelector((state) => state.profile)

  if (user?.accountType === ACCOUNT_TYPE.ADMIN || user?.accountType === 'Admin') {
    return <AdminApp />
  }

  const isPractitionerRole =
    user?.accountType === ACCOUNT_TYPE.PRACTITIONER ||
    user?.accountType === ACCOUNT_TYPE.INSTRUCTOR

  if (isPractitionerRole) {
    return <PractitionerDashboard />
  }

  return <ClientDashboard />
}

export default MainDashboard

