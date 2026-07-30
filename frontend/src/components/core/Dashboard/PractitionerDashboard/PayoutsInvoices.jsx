import React from 'react'
import { FiDollarSign, FiClock, FiCheckCircle, FiShield, FiFileText } from 'react-icons/fi'

export function PayoutsInvoices({ telemetryData }) {
  const payouts = telemetryData?.payouts || []
  const invoices = telemetryData?.invoices || []
  const stats = telemetryData?.stats || {}

  const totalEarnings = stats.totalEarnings || 0
  const monthlyEarnings = stats.monthlyEarnings || 0
  const clearingThisWeek = stats.clearingThisWeek || 0

  return (
    <section className="view on" id="payouts">
      <div className="htop" style={{ marginBottom: '24px' }}>
        <div>
          <div className="crumb">Business / Salary &amp; Payouts</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>Monthly Salary &amp; Payout Ledger</h1>
          <p style={{ color: '#64748B', marginTop: '4px' }}>
            Practitioners set offer prices. All client payments are collected centrally by Admin, and Admin disburses your monthly salary &amp; session earnings.
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card stat" style={{ background: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Earned This Month</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiDollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>₹{monthlyEarnings.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '12px', color: '#10B981', marginTop: '6px', fontWeight: 600 }}>Recorded session &amp; course fees</div>
        </div>

        <div className="card stat" style={{ background: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Total Lifetime Earnings</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F0FDF4', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiCheckCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>₹{totalEarnings.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>Cumulative earnings</div>
        </div>

        <div className="card stat" style={{ background: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Pending Admin Settlement</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiClock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#D97706' }}>₹{clearingThisWeek.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '12px', color: '#D97706', marginTop: '6px', fontWeight: 600 }}>Scheduled in upcoming payout cycle</div>
        </div>

        <div className="card stat" style={{ background: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Payout Settlements</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F3E8FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiShield size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>{payouts.length}</div>
          <div style={{ fontSize: '12px', color: '#8B5CF6', marginTop: '6px', fontWeight: 600 }}>Processed by Admin</div>
        </div>
      </div>

      {/* Payout Workflow & Recent Payouts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiShield style={{ color: '#2563EB' }} /> Payment &amp; Salary Workflow
          </h3>
          <div className="tl" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ borderLeft: '3px solid #10B981', paddingLeft: '12px' }}>
              <b style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>1. Practitioner Sets Offer Prices</b>
              <span style={{ fontSize: '12px', color: '#64748B' }}>You set custom session &amp; cohort prices in 'My Offers'.</span>
            </div>
            <div style={{ borderLeft: '3px solid #10B981', paddingLeft: '12px' }}>
              <b style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>2. Client Pays Central Admin</b>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Clients purchase offers or subscriptions. Payment is collected directly by Admin.</span>
            </div>
            <div style={{ borderLeft: '3px solid #3B82F6', paddingLeft: '12px' }}>
              <b style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>3. Session / Course Delivered</b>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Sessions and video views are logged automatically in your dashboard telemetry.</span>
            </div>
            <div style={{ borderLeft: '3px solid #8B5CF6', paddingLeft: '12px' }}>
              <b style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>4. Admin Disburses Monthly Salary</b>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Admin calculates net earnings and transfers salary directly to your bank account.</span>
            </div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiCheckCircle style={{ color: '#10B981' }} /> Recent Admin Payouts ({payouts.length})
          </h3>
          {payouts.length > 0 ? (
            payouts.slice(0, 5).map((p) => (
              <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>₹{(p.amount || 0).toLocaleString('en-IN')}</div>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>{new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: p.status === 'cleared' ? '#DCFCE7' : '#FEF3C7',
                  color: p.status === 'cleared' ? '#15803D' : '#B45309'
                }}>
                  {p.status ? p.status.toUpperCase() : 'CLEARED'}
                </span>
              </div>
            ))
          ) : (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
              No payout records logged yet. Admin settlements will appear here.
            </div>
          )}
        </div>
      </div>

      {/* Invoices & Settlement Statements */}
      <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiFileText style={{ color: '#8B5CF6' }} /> Settlement Invoices &amp; Statements ({invoices.length})
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 700 }}>Invoice Ref</th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 700 }}>Amount</th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 700 }}>Date</th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 700 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0F172A' }}>{inv.invoiceNumber || inv._id}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#10B981' }}>₹{(inv.amount || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 16px', color: '#64748B' }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: '#DCFCE7', color: '#15803D' }}>Paid</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#94A3B8' }}>
                    No billing settlement invoices logged yet.
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
