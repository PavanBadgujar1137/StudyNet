import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { OHLogo } from '../../components/openhand'
import Dashboard from './Dashboard'
import MyOffers from './MyOffers'
import MyClients from './MyClients'
import Circles from './Circles'
import SessionRoom from './SessionRoom'
import PayoutsInvoices from './PayoutsInvoices'
import GrowthTools from './GrowthTools'
import './PractitionerApp.css'

export function PractitionerApp() {
  const [activeSection, setActiveSection] = useState('dash')
  const { user } = useSelector((state) => state.profile)

  const practitionerName = `${user?.firstName || 'Dr. Meera'} ${user?.lastName || 'Iyer'}`

  return (
    <div className="practitioner-app-layout">
      {/* Sidebar Navigation */}
      <aside className="practitioner-sidebar">
        <div className="sidebar-brand">
          <OHLogo variant="white-on-navy" size={28} />
        </div>

        <div className="nav-group-lbl">Practice</div>
        <button
          className={`sidebar-nav-btn ${activeSection === 'dash' ? 'on' : ''}`}
          onClick={() => setActiveSection('dash')}
        >
          <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10ZM13 21h8V11h-8v10ZM3 21h8v-6H3v6ZM13 9h8V3h-8v6Z" fill="currentColor"/></svg>
          Dashboard
        </button>

        <button
          className={`sidebar-nav-btn ${activeSection === 'offers' ? 'on' : ''}`}
          onClick={() => setActiveSection('offers')}
        >
          <svg viewBox="0 0 24 24"><path d="M20 7H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1ZM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" fill="none" strokeWidth="2"/></svg>
          My offers
        </button>

        <button
          className={`sidebar-nav-btn ${activeSection === 'clients' ? 'on' : ''}`}
          onClick={() => setActiveSection('clients')}
        >
          <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" fill="none" strokeWidth="2"/></svg>
          My clients
        </button>

        <button
          className={`sidebar-nav-btn ${activeSection === 'circles' ? 'on' : ''}`}
          onClick={() => setActiveSection('circles')}
        >
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" fill="none" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>
          Circles
        </button>

        <div className="nav-group-lbl">Live</div>
        <button
          className={`sidebar-nav-btn ${activeSection === 'room' ? 'on' : ''}`}
          onClick={() => setActiveSection('room')}
        >
          <svg viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7ZM14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" stroke="currentColor" fill="none" strokeWidth="2"/></svg>
          Session room <span className="live-badge">LIVE</span>
        </button>

        <div className="nav-group-lbl">Business</div>
        <button
          className={`sidebar-nav-btn ${activeSection === 'payouts' ? 'on' : ''}`}
          onClick={() => setActiveSection('payouts')}
        >
          <svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" fill="none" strokeWidth="2"/></svg>
          Payouts &amp; invoices
        </button>

        <button
          className={`sidebar-nav-btn ${activeSection === 'growth' ? 'on' : ''}`}
          onClick={() => setActiveSection('growth')}
        >
          <svg viewBox="0 0 24 24"><path d="M3 3v18h18M7 15l4-5 4 3 5-7" stroke="currentColor" fill="none" strokeWidth="2"/></svg>
          Growth tools
        </button>

        <div className="sidebar-me">
          <div className="av">MI</div>
          <div>
            <b>{practitionerName}</b>
            <span>Growth plan</span>
          </div>
        </div>
      </aside>

      {/* Main Section View */}
      <main className="practitioner-main">
        {activeSection === 'dash' && <Dashboard practitionerName={practitionerName} setActiveSection={setActiveSection} />}
        {activeSection === 'offers' && <MyOffers />}
        {activeSection === 'clients' && <MyClients setActiveSection={setActiveSection} />}
        {activeSection === 'circles' && <Circles />}
        {activeSection === 'room' && <SessionRoom practitionerName={practitionerName} />}
        {activeSection === 'payouts' && <PayoutsInvoices />}
        {activeSection === 'growth' && <GrowthTools />}
      </main>
    </div>
  )
}

export default PractitionerApp
