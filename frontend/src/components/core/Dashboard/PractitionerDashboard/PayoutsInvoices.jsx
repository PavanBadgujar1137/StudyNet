import React from 'react'
import { FiDollarSign, FiClock, FiCheckCircle, FiShield, FiFileText } from 'react-icons/fi'

export function PayoutsInvoices({ telemetryData }) {
  const payouts = telemetryData?.payouts || []
  const invoices = telemetryData?.invoices || []
  const stats = telemetryData?.stats || {}

  const totalEarnings = stats.totalEarnings || 0
  const monthlyEarnings = stats.monthlyEarnings || 0
  const clearingThisWeek = stats.clearingThisWeek || 0

  const formatAmount = (val) => {
    const num = Number(val) || 0
    return num.toLocaleString('en-IN')
  }

  const getFontSize = (strVal) => {
    const len = String(strVal).length
    if (len > 18) return '14px'
    if (len > 14) return '17px'
    if (len > 10) return '20px'
    return '24px'
  }

  const formattedMonthly = formatAmount(monthlyEarnings)
  const formattedTotal = formatAmount(totalEarnings)
  const formattedClearing = formatAmount(clearingThisWeek)

  return (
    <section className="view on" id="payouts">
      <div className="htop" style={{ marginBottom: '24px' }}>
        <div>
          <div className="crumb">Business / Salary &amp; Payouts</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>Monthly Salary &amp; Payout Ledger</h1>
          <p style={{ color: '#64748B', marginTop: '4px' }}>
            Practitioners set offer prices. All learner payments are collected centrally by Admin, and Admin disburses your monthly salary &amp; session earnings.
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Earned This Month */}
        <div className="card stat" style={{ background: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Earned This Month</span>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0 }}>
                <FiDollarSign size={18} />
              </div>
            </div>
            <div 
              style={{ 
                fontSize: getFontSize(formattedMonthly), 
                fontWeight: 800, 
                color: '#0F172A',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.25,
                margin: '4px 0'
              }}
              title={`₹${formattedMonthly}`}
            >
              ₹{formattedMonthly}
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#10B981', marginTop: '8px', fontWeight: 600 }}>Recorded session &amp; course fees</div>
        </div>

        {/* Total Lifetime Earnings */}
        <div className="card stat" style={{ background: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Total Lifetime Earnings</span>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F0FDF4', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0 }}>
                <FiCheckCircle size={18} />
              </div>
            </div>
            <div 
              style={{ 
                fontSize: getFontSize(formattedTotal), 
                fontWeight: 800, 
                color: '#0F172A',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.25,
                margin: '4px 0'
              }}
              title={`₹${formattedTotal}`}
            >
              ₹{formattedTotal}
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px' }}>Cumulative earnings</div>
        </div>

        {/* Pending Admin Settlement */}
        <div className="card stat" style={{ background: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Pending Admin Settlement</span>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0 }}>
                <FiClock size={18} />
              </div>
            </div>
            <div 
              style={{ 
                fontSize: getFontSize(formattedClearing), 
                fontWeight: 800, 
                color: '#D97706',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.25,
                margin: '4px 0'
              }}
              title={`₹${formattedClearing}`}
            >
              ₹{formattedClearing}
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#D97706', marginTop: '8px', fontWeight: 600 }}>Scheduled in upcoming payout cycle</div>
        </div>

        {/* Payout Settlements Count */}
        <div className="card stat" style={{ background: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Payout Settlements</span>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F3E8FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0 }}>
                <FiShield size={18} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', lineHeight: 1.25, margin: '4px 0' }}>{payouts.length}</div>
          </div>
          <div style={{ fontSize: '12px', color: '#8B5CF6', marginTop: '8px', fontWeight: 600 }}>Processed by Admin</div>
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
              <span style={{ fontSize: '12px', color: '#64748B' }}>You set custom session &amp; Circle prices in 'Offers'.</span>
            </div>
            <div style={{ borderLeft: '3px solid #10B981', paddingLeft: '12px' }}>
              <b style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>2. Learner Pays Central Admin</b>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Learners purchase offers or subscriptions. Payment is collected directly by Admin.</span>
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
            payouts.slice(0, 5).map((p) => {
              const formattedP = formatAmount(p.amount || 0)
              return (
                <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ maxWidth: '65%' }}>
                    <div 
                      style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={`₹${formattedP}`}
                    >
                      ₹{formattedP}
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>{new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: p.status === 'cleared' ? '#DCFCE7' : '#FEF3C7',
                    color: p.status === 'cleared' ? '#15803D' : '#B45309',
                    shrink: 0
                  }}>
                    {p.status ? p.status.toUpperCase() : 'CLEARED'}
                  </span>
                </div>
              )
            })
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
                invoices.map((inv) => {
                  const invAmt = formatAmount(inv.amount || 0)
                  return (
                    <tr key={inv._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0F172A' }}>{inv.invoiceNumber || inv._id}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#10B981' }}>₹{invAmt}</td>
                      <td style={{ padding: '12px 16px', color: '#64748B' }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: '#DCFCE7', color: '#15803D' }}>Paid</span>
                      </td>
                    </tr>
                  )
                })
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
