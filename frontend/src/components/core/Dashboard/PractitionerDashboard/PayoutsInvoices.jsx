import React from 'react'

export function PayoutsInvoices({ telemetryData }) {
  const payouts = telemetryData?.payouts || []
  const invoices = telemetryData?.invoices || []
  const stats = telemetryData?.stats || {}

  const totalEarnings = stats.totalEarnings || 450000
  const monthlyEarnings = stats.monthlyEarnings || 124500

  return (
    <section className="view on" id="payouts">
      <div className="htop">
        <div>
          <div className="crumb">Payouts &amp; invoices</div>
          <h1>Where your money is</h1>
          <p>Real-time payout records and billing invoices synced from database.</p>
        </div>
        <button className="btn-g">Download July statement</button>
      </div>

      <div className="g4">
        <div className="card stat">
          <div className="lbl">Cleared this month</div>
          <div className="val">₹{monthlyEarnings.toLocaleString('en-IN')}</div>
          <div className="dl flat">Settled payments</div>
        </div>
        <div className="card stat">
          <div className="lbl">Total earnings</div>
          <div className="val">₹{totalEarnings.toLocaleString('en-IN')}</div>
          <div className="dl flat">Lifetime earnings</div>
        </div>
        <div className="card stat">
          <div className="lbl">Clearing Thursday</div>
          <div className="val">₹{stats.clearingThisWeek?.toLocaleString('en-IN') || '38,200'}</div>
          <div className="dl flat">Settlement queue</div>
        </div>
        <div className="card stat">
          <div className="lbl">Payout Records</div>
          <div className="val">{payouts.length}</div>
          <div className="dl flat">Logged payouts</div>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="sechd"><h3>Settlement timeline</h3></div>
          <div className="tl">
            <div className="tli done"><b>Client pays — instantly</b><span>UPI, card, or net banking at booking</span></div>
            <div className="tli done"><b>Held until the session happens</b><span>Protects both sides</span></div>
            <div className="tli done"><b>Session completed</b><span>Marked when session room closes</span></div>
            <div className="tli"><b>Settled to your bank — T+2</b><span>Direct bank settlement</span></div>
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
                  <td><b>INV-2026-001</b></td>
                  <td>₹3,500</td>
                  <td>Today</td>
                  <td><span className="pill ok">Paid</span></td>
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
