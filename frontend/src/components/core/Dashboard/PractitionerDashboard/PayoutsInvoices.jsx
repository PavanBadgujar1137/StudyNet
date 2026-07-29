import React from 'react'

export function PayoutsInvoices({ telemetryData }) {
  const payouts = telemetryData?.payouts || []
  const invoices = telemetryData?.invoices || []
  const stats = telemetryData?.stats || {}

  const totalEarnings = stats.totalEarnings || 0
  const monthlyEarnings = stats.monthlyEarnings || 0

  return (
    <section className="view on" id="payouts">
      <div className="htop">
        <div>
          <div className="crumb">Payouts &amp; invoices</div>
          <h1>Monthly Salary &amp; Payout Ledger</h1>
          <p>All client payments are collected centrally by Admin. Admin disburses your monthly practitioner salary.</p>
        </div>
      </div>

      <div className="g4">
        <div className="card stat">
          <div className="lbl">Earned this month</div>
          <div className="val">₹{monthlyEarnings.toLocaleString('en-IN')}</div>
          <div className="dl flat">Sessions &amp; course bookings</div>
        </div>
        <div className="card stat">
          <div className="lbl">Total Earnings</div>
          <div className="val">₹{totalEarnings.toLocaleString('en-IN')}</div>
          <div className="dl flat">Lifetime earnings</div>
        </div>
        <div className="card stat">
          <div className="lbl">Pending Admin Salary</div>
          <div className="val">₹{(stats.clearingThisWeek || 0).toLocaleString('en-IN')}</div>
          <div className="dl flat">Owed by Admin</div>
        </div>
        <div className="card stat">
          <div className="lbl">Salary Payout Logs</div>
          <div className="val">{payouts.length}</div>
          <div className="dl flat">Admin settlements</div>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="sechd"><h3>Admin Payout Timeline</h3></div>
          <div className="tl">
            <div className="tli done"><b>1. Client Books &amp; Pays</b><span>Payments (sessions, courses) go directly to Platform Admin</span></div>
            <div className="tli done"><b>2. Session Delivered / Video Watched</b><span>Tracked automatically in Practitioner Dashboard</span></div>
            <div className="tli done"><b>3. Admin Calculates Monthly Salary</b><span>Admin logs net earnings in Platform Control Center</span></div>
            <div className="tli"><b>4. Monthly Bank Transfer</b><span>Admin transfers monthly salary directly to your bank</span></div>
          </div>
        </div>

        <div className="card">
          <div className="sechd"><h3>Recent payouts ({payouts.length})</h3></div>
          {payouts.length > 0 ? (
            payouts.slice(0, 4).map((p) => (
              <div key={p._id} className="row">
                <div className="av g">↓</div>
                <div className="who">
                  <b>₹{(p.amount || 0).toLocaleString('en-IN')}</b>
                  <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="rt">
                  <span className={`pill ${p.status === 'cleared' ? 'ok' : 'wait'}`}>{p.status || 'Cleared'}</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '16px 0', color: '#64748B', fontSize: '13px' }}>
              No payout records logged yet.
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '18px' }}>
        <div className="sechd"><h3>Invoices ({invoices.length})</h3></div>
        <div className="scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>Invoice Ref</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv._id}>
                    <td><b>{inv.invoiceNumber || inv._id}</b></td>
                    <td>₹{(inv.amount || 0).toLocaleString('en-IN')}</td>
                    <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td><span className="pill ok">Paid</span></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#64748B' }}>
                    No billing invoices generated yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default PayoutsInvoices
