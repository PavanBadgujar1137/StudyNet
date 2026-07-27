import React from 'react'

export function MyClients({ setActiveSection, telemetryData }) {
  const clients = telemetryData?.clients || []

  return (
    <section className="view on" id="clients">
      <div className="htop">
        <div>
          <div className="crumb">My clients</div>
          <h1>{clients.length} Active Client(s)</h1>
          <p>Records, notes, and status for students in your courses & sessions. Only you can see this.</p>
        </div>
        <button className="btn">Add a client</button>
      </div>

      <div className="card">
        <div className="scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Email</th>
                <th>Enrolled Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.length > 0 ? (
                clients.map((client) => (
                  <tr key={client._id}>
                    <td>
                      <b>{client.firstName} {client.lastName}</b>
                    </td>
                    <td>{client.email}</td>
                    <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                    <td><span className="pill ok">Active</span></td>
                    <td>
                      <button className="mini" onClick={() => setActiveSection('room')}>
                        Schedule Zoom Session
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>
                    No registered clients/students found in MongoDB database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="g2" style={{ marginTop: '18px' }}>
        <div className="card">
          <div className="sechd"><h3>Client Engagement Summary</h3></div>
          <div className="row">
            <div className="av g">{clients.length}</div>
            <div className="who">
              <b>Total Registered Students</b>
              <span>Active in platform courses and sessions</span>
            </div>
            <div className="rt"><span className="pill ok">100% Active</span></div>
          </div>
        </div>

        <div className="card">
          <div className="sechd"><h3>Draft Session Notes</h3></div>
          <p className="note">Session notes and AURA drafts are stored securely for approved sessions.</p>
        </div>
      </div>
    </section>
  )
}

export default MyClients
