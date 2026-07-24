import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { OHLogo } from '../../components/openhand'
import MyJourney from './client/MyJourney'
import CheckIn from './client/CheckIn'
import MyCircle from './client/MyCircle'
import SessionsResources from './client/SessionsResources'
import Reflections from './client/Reflections'

export function ClientApp() {
  const [activeTab, setActiveTab] = useState('journey')
  const { user } = useSelector((state) => state.profile)

  const clientName = user?.firstName || 'Priya'
  const practitionerName = 'Dr. Meera Iyer'

  return (
    <div className="client-app-shell">
      {/* Top Header */}
      <header className="client-app-top">
        <div className="oh-wrap top-inner">
          <div className="brand-group">
            <OHLogo variant="full-color" size={28} />
          </div>
          <div className="me-badge">
            Working with {practitionerName}
            <div className="av-circle">
              {clientName.slice(0, 1)}{user?.lastName?.slice(0, 1) || 'S'}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Bar */}
      <nav className="client-app-tabs">
        <div className="oh-wrap tabs-inner">
          <button
            className={`tab-btn ${activeTab === 'journey' ? 'on' : ''}`}
            onClick={() => setActiveTab('journey')}
          >
            My journey
          </button>

          <button
            className={`tab-btn ${activeTab === 'checkin' ? 'on' : ''}`}
            onClick={() => setActiveTab('checkin')}
          >
            Check in <span className="tab-dot" />
          </button>

          <button
            className={`tab-btn ${activeTab === 'circle' ? 'on' : ''}`}
            onClick={() => setActiveTab('circle')}
          >
            My circle
          </button>

          <button
            className={`tab-btn ${activeTab === 'sessions' ? 'on' : ''}`}
            onClick={() => setActiveTab('sessions')}
          >
            Sessions &amp; resources
          </button>

          <button
            className={`tab-btn ${activeTab === 'reflections' ? 'on' : ''}`}
            onClick={() => setActiveTab('reflections')}
          >
            Reflections <span className="tab-dot" />
          </button>
        </div>
      </nav>

      {/* Main Tab View Container */}
      <main className="client-app-view oh-wrap">
        {activeTab === 'journey' && <MyJourney clientName={clientName} practitionerName={practitionerName} />}
        {activeTab === 'checkin' && <CheckIn clientName={clientName} practitionerName={practitionerName} />}
        {activeTab === 'circle' && <MyCircle clientName={clientName} practitionerName={practitionerName} />}
        {activeTab === 'sessions' && <SessionsResources clientName={clientName} practitionerName={practitionerName} />}
        {activeTab === 'reflections' && <Reflections clientName={clientName} practitionerName={practitionerName} />}
      </main>
    </div>
  )
}

export default ClientApp
