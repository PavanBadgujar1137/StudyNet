import React from 'react'
import PractitionerDashboard from '../../components/core/Dashboard/PractitionerDashboard/PractitionerDashboard'
import CompleteProfileModal from '../../components/Common/CompleteProfileModal'

export function PractitionerApp() {
  return (
    <>
      <CompleteProfileModal />
      <PractitionerDashboard />
    </>
  )
}

export default PractitionerApp
