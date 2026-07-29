import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { apiConnector } from '../../services/apiConnector'
import toast from 'react-hot-toast'
import {
  FiGrid, FiUsers, FiDollarSign, FiCreditCard, FiCalendar,
  FiMessageSquare, FiBarChart2, FiSearch, FiRefreshCw, FiCheck,
  FiClock, FiX, FiEye, FiArrowUp, FiArrowDown, FiZap,
  FiShield, FiBookOpen, FiFilter, FiBell, FiLogOut, FiUser
} from 'react-icons/fi'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

const STATUS_COLORS = {
  active: '#10B981', expired: '#6B7280', cancelled: '#EF4444',
  pending: '#F59E0B', confirmed: '#3B82F6', completed: '#10B981',
  new: '#8B5CF6', in_review: '#F59E0B', contacted: '#3B82F6', resolved: '#10B981',
  received: '#10B981', refunded: '#EF4444',
}

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || '#6B7280'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: color + '20', color,
      textTransform: 'capitalize', letterSpacing: 0.3
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {status?.replace(/_/g, ' ')}
    </span>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, subLabel, color = '#3B82F6', trend }) {
  return (
    <div style={{
      background: '#1E293B', borderRadius: 16, padding: '24px',
      border: '1px solid #334155', position: 'relative', overflow: 'hidden',
      transition: 'transform 0.2s', cursor: 'default',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, borderRadius: '50%', background: color + '10', transform: 'translate(30%, -30%)' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: 20 }}>
          {icon}
        </div>
        {trend !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: trend >= 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>
            {trend >= 0 ? <FiArrowUp /> : <FiArrowDown />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.5px', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 14, color: '#94A3B8', fontWeight: 500 }}>{label}</div>
      {subLabel && <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{subLabel}</div>}
    </div>
  )
}

// ─── Data Table ───────────────────────────────────────────────────────────────
function DataTable({ columns, data, loading, emptyMessage = "No records found" }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 48, color: '#64748B' }}>
        <FiRefreshCw style={{ animation: 'spin 1s linear infinite', marginRight: 10 }} /> Loading data...
      </div>
    )
  }
  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 48, color: '#64748B', gap: 12 }}>
        <FiBookOpen size={32} />
        <span>{emptyMessage}</span>
      </div>
    )
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1E293B' }}>
            {columns.map(col => (
              <th key={col.key} style={{ padding: '10px 16px', textAlign: 'left', color: '#64748B', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, whiteSpace: 'nowrap' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row._id || i} style={{ borderBottom: '1px solid #0F172A', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1E293B'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {columns.map(col => (
                <td key={col.key} style={{ padding: '12px 16px', color: '#CBD5E1', whiteSpace: col.wrap ? 'normal' : 'nowrap' }}>
                  {col.render ? col.render(row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab({ stats, recentPayments, loading }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <KpiCard icon={<FiDollarSign />} label="Total Revenue" value={fmt(stats?.totalRevenue)} color="#10B981" trend={12} />
        <KpiCard icon={<FiUsers />} label="Total Clients" value={stats?.totalClients || 0} color="#3B82F6" trend={8} />
        <KpiCard icon={<FiUser />} label="Practitioners" value={stats?.totalPractitioners || 0} color="#8B5CF6" />
        <KpiCard icon={<FiCreditCard />} label="Pending Payouts" value={fmt(stats?.pendingPayouts)} subLabel="Admin owes practitioners" color="#F59E0B" />
        <KpiCard icon={<FiCalendar />} label="Active Subscriptions" value={stats?.activeSubscriptions || 0} color="#06B6D4" />
        <KpiCard icon={<FiMessageSquare />} label="New Org Inquiries" value={stats?.newOrgConversations || 0} color="#EC4899" />
      </div>

      {/* Recent Payments */}
      <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #334155' }}>
          <h3 style={{ margin: 0, color: '#F1F5F9', fontSize: 16, fontWeight: 700 }}>Recent Payments Received</h3>
          <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: 13 }}>All payments collected by the platform</p>
        </div>
        <DataTable
          loading={loading}
          columns={[
            { key: 'createdAt', label: 'Date', render: r => fmtDate(r.createdAt) },
            { key: 'clientName', label: 'Client' },
            { key: 'paymentType', label: 'Type', render: r => (
              <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                background: r.paymentType === 'subscription' ? '#3B82F620' : '#8B5CF620',
                color: r.paymentType === 'subscription' ? '#3B82F6' : '#8B5CF6' }}>
                {r.paymentType?.replace(/_/g, ' ')}
              </span>
            )},
            { key: 'description', label: 'Description', wrap: true },
            { key: 'amount', label: 'Amount', render: r => <span style={{ color: '#10B981', fontWeight: 700 }}>{fmt(r.amount)}</span> },
            { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
          ]}
          data={recentPayments}
        />
      </div>
    </div>
  )
}

// ─── Clients Tab ──────────────────────────────────────────────────────────────
function ClientsTab() {
  const { token } = useSelector(s => s.auth)
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiConnector('GET', `/api/v1/admin/clients?search=${search}&limit=100`, null, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) { setClients(res.data.clients); setTotal(res.data.total) }
    } catch (e) { toast.error('Failed to load clients') }
    setLoading(false)
  }, [token, search])

  useEffect(() => { load() }, [load])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1E293B', border: '1px solid #334155', borderRadius: 10, padding: '8px 14px', flex: 1 }}>
          <FiSearch color="#64748B" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
            style={{ background: 'none', border: 'none', outline: 'none', color: '#F1F5F9', fontSize: 14, width: '100%' }} />
        </div>
        <button onClick={load} style={{ background: '#334155', border: 'none', borderRadius: 10, padding: '10px 16px', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiRefreshCw /> Refresh
        </button>
      </div>
      <div style={{ color: '#64748B', fontSize: 13 }}>{total} total clients</div>
      <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' }}>
        <DataTable
          loading={loading}
          columns={[
            { key: 'name', label: 'Client', render: r => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {r.firstName?.[0]}{r.lastName?.[0]}
                </div>
                <div>
                  <div style={{ color: '#F1F5F9', fontWeight: 600 }}>{r.firstName} {r.lastName}</div>
                  <div style={{ color: '#64748B', fontSize: 12 }}>{r.email}</div>
                </div>
              </div>
            )},
            { key: 'subscription', label: 'Subscription', render: r => r.subscription
              ? <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#10B98120', color: '#10B981', textTransform: 'capitalize' }}>{r.subscription.planKey}</span>
              : <span style={{ color: '#64748B', fontSize: 12 }}>No subscription</span> },
            { key: 'sessionsBooked', label: 'Sessions Booked', render: r => <span style={{ color: '#94A3B8' }}>{r.sessionsBooked || 0}</span> },
            { key: 'totalPaid', label: 'Total Paid to Platform', render: r => <span style={{ color: '#10B981', fontWeight: 700 }}>{fmt(r.totalPaid)}</span> },
            { key: 'createdAt', label: 'Joined', render: r => fmtDate(r.createdAt) },
            { key: 'active', label: 'Status', render: r => <StatusBadge status={r.active ? 'active' : 'inactive'} /> },
          ]}
          data={clients}
        />
      </div>
    </div>
  )
}

// ─── Practitioners Tab ────────────────────────────────────────────────────────
function PractitionersTab() {
  const { token } = useSelector(s => s.auth)
  const [practitioners, setPractitioners] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [payoutModal, setPayoutModal] = useState(null)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [payingOut, setPayingOut] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiConnector('GET', `/api/v1/admin/practitioners?search=${search}&limit=100`, null, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) setPractitioners(res.data.practitioners)
    } catch (e) { toast.error('Failed to load practitioners') }
    setLoading(false)
  }, [token, search])

  useEffect(() => { load() }, [load])

  const handlePayout = async () => {
    if (!payoutAmount || isNaN(payoutAmount)) return toast.error('Enter valid amount')
    setPayingOut(true)
    try {
      const res = await apiConnector('POST', '/api/v1/admin/payout', {
        practitionerId: payoutModal._id,
        amount: Number(payoutAmount),
      }, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) {
        toast.success(res.data.message)
        setPayoutModal(null)
        setPayoutAmount('')
        load()
      }
    } catch (e) { toast.error('Payout failed') }
    setPayingOut(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Payout Modal */}
      {payoutModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 20, padding: 32, width: 400, maxWidth: '90vw' }}>
            <h3 style={{ margin: '0 0 8px', color: '#F1F5F9' }}>Pay Salary — {payoutModal.firstName} {payoutModal.lastName}</h3>
            <p style={{ margin: '0 0 8px', color: '#64748B', fontSize: 13 }}>Pending owed: <strong style={{ color: '#F59E0B' }}>{fmt(payoutModal.salaryOwed)}</strong></p>
            <p style={{ margin: '0 0 20px', color: '#64748B', fontSize: 12 }}>This logs a manual bank transfer. It does not auto-transfer funds.</p>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: 12, marginBottom: 6 }}>Amount to Pay (₹)</label>
            <input type="number" value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)}
              placeholder={`e.g. ${payoutModal.salaryOwed}`}
              style={{ width: '100%', background: '#0F172A', border: '1px solid #334155', borderRadius: 10, padding: '10px 14px', color: '#F1F5F9', fontSize: 15, outline: 'none', boxSizing: 'border-box', marginBottom: 20 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setPayoutModal(null); setPayoutAmount('') }}
                style={{ flex: 1, padding: '10px', background: '#334155', border: 'none', borderRadius: 10, color: '#94A3B8', cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={handlePayout} disabled={payingOut}
                style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontWeight: 600, opacity: payingOut ? 0.7 : 1 }}>
                {payingOut ? 'Processing...' : 'Mark as Paid ✓'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1E293B', border: '1px solid #334155', borderRadius: 10, padding: '8px 14px', flex: 1 }}>
          <FiSearch color="#64748B" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search practitioners..."
            style={{ background: 'none', border: 'none', outline: 'none', color: '#F1F5F9', fontSize: 14, width: '100%' }} />
        </div>
        <button onClick={load} style={{ background: '#334155', border: 'none', borderRadius: 10, padding: '10px 16px', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' }}>
        <DataTable
          loading={loading}
          columns={[
            { key: 'name', label: 'Practitioner', render: r => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {r.firstName?.[0]}{r.lastName?.[0]}
                </div>
                <div>
                  <div style={{ color: '#F1F5F9', fontWeight: 600 }}>{r.firstName} {r.lastName}</div>
                  <div style={{ color: '#64748B', fontSize: 12 }}>{r.email}</div>
                </div>
              </div>
            )},
            { key: 'plan', label: 'Plan', render: r => <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#8B5CF620', color: '#8B5CF6', textTransform: 'capitalize' }}>{r.profile?.plan || 'starter'}</span> },
            { key: 'verification', label: 'Verification', render: r => <StatusBadge status={r.profile?.verificationStatus || 'pending'} /> },
            { key: 'sessions', label: 'Sessions', render: r => r.sessionsDelivered || 0 },
            { key: 'courses', label: 'Courses', render: r => r.coursesCount || 0 },
            { key: 'salaryOwed', label: 'Salary Owed', render: r => <span style={{ color: r.salaryOwed > 0 ? '#F59E0B' : '#64748B', fontWeight: 700 }}>{fmt(r.salaryOwed)}</span> },
            { key: 'action', label: 'Action', render: r => (
              <button onClick={() => { setPayoutModal(r); setPayoutAmount(String(r.salaryOwed || '')) }}
                style={{ padding: '6px 14px', background: r.salaryOwed > 0 ? 'linear-gradient(135deg, #10B981, #059669)' : '#334155', border: 'none', borderRadius: 8, color: r.salaryOwed > 0 ? '#fff' : '#64748B', cursor: r.salaryOwed > 0 ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: 12 }}>
                Pay Salary
              </button>
            )},
          ]}
          data={practitioners}
        />
      </div>
    </div>
  )
}

// ─── Payments Tab ─────────────────────────────────────────────────────────────
function PaymentsTab() {
  const { token } = useSelector(s => s.auth)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ type: '', search: '' })
  const [total, setTotal] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100', ...Object.fromEntries(Object.entries(filter).filter(([,v]) => v)) })
      const res = await apiConnector('GET', `/api/v1/admin/payments?${params}`, null, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) { setPayments(res.data.payments); setTotal(res.data.total) }
    } catch (e) { toast.error('Failed to load payments') }
    setLoading(false)
  }, [token, filter])

  useEffect(() => { load() }, [load])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1E293B', border: '1px solid #334155', borderRadius: 10, padding: '8px 14px', flex: 1, minWidth: 200 }}>
          <FiSearch color="#64748B" />
          <input value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} placeholder="Search payments..."
            style={{ background: 'none', border: 'none', outline: 'none', color: '#F1F5F9', fontSize: 14, width: '100%' }} />
        </div>
        <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
          style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 10, padding: '10px 14px', color: '#F1F5F9', fontSize: 14, cursor: 'pointer' }}>
          <option value="">All Types</option>
          <option value="subscription">Subscription</option>
          <option value="offer_booking">Offer Booking</option>
          <option value="org_booking">Org Booking</option>
        </select>
        <button onClick={load} style={{ background: '#334155', border: 'none', borderRadius: 10, padding: '10px 16px', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiRefreshCw /> Refresh
        </button>
      </div>
      <div style={{ color: '#64748B', fontSize: 13 }}>{total} total payments</div>
      <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' }}>
        <DataTable
          loading={loading}
          columns={[
            { key: 'createdAt', label: 'Date', render: r => fmtDate(r.createdAt) },
            { key: 'clientName', label: 'Client', render: r => (
              <div>
                <div style={{ color: '#F1F5F9', fontWeight: 600 }}>{r.clientName || `${r.client?.firstName} ${r.client?.lastName}`}</div>
                <div style={{ color: '#64748B', fontSize: 11 }}>{r.client?.email}</div>
              </div>
            )},
            { key: 'paymentType', label: 'Type', render: r => (
              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: r.paymentType === 'subscription' ? '#3B82F620' : '#8B5CF620',
                color: r.paymentType === 'subscription' ? '#3B82F6' : '#8B5CF6' }}>
                {r.paymentType?.replace(/_/g, ' ')}
              </span>
            )},
            { key: 'description', label: 'Description', wrap: true },
            { key: 'practitionerName', label: 'Practitioner', render: r => r.practitionerName || r.practitioner ? `${r.practitioner?.firstName || ''} ${r.practitioner?.lastName || ''}`.trim() || '—' : '—' },
            { key: 'amount', label: 'Amount Received', render: r => <span style={{ color: '#10B981', fontWeight: 700 }}>{fmt(r.amount)}</span> },
            { key: 'amountOwedToPractitioner', label: 'Owed to Practitioner', render: r => r.amountOwedToPractitioner > 0 ? <span style={{ color: '#F59E0B', fontWeight: 600 }}>{fmt(r.amountOwedToPractitioner)}</span> : <span style={{ color: '#64748B' }}>—</span> },
            { key: 'practitionerSalaryPaid', label: 'Salary Paid', render: r => r.practitionerSalaryPaid
              ? <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}><FiCheck /> Paid</span>
              : r.amountOwedToPractitioner > 0 ? <span style={{ color: '#F59E0B' }}>Pending</span> : <span style={{ color: '#64748B' }}>N/A</span>
            },
            { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
          ]}
          data={payments}
        />
      </div>
    </div>
  )
}

// ─── Subscriptions Tab ────────────────────────────────────────────────────────
function SubscriptionsTab() {
  const { token } = useSelector(s => s.auth)
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = statusFilter ? `?status=${statusFilter}&limit=100` : '?limit=100'
      const res = await apiConnector('GET', `/api/v1/admin/subscriptions${params}`, null, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) setSubs(res.data.subscriptions)
    } catch (e) { toast.error('Failed to load subscriptions') }
    setLoading(false)
  }, [token, statusFilter])

  useEffect(() => { load() }, [load])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 10, padding: '10px 14px', color: '#F1F5F9', fontSize: 14, cursor: 'pointer' }}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button onClick={load} style={{ background: '#334155', border: 'none', borderRadius: 10, padding: '10px 16px', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiRefreshCw /> Refresh
        </button>
      </div>
      <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' }}>
        <DataTable
          loading={loading}
          columns={[
            { key: 'client', label: 'Client', render: r => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                  {r.client?.firstName?.[0]}{r.client?.lastName?.[0]}
                </div>
                <div>
                  <div style={{ color: '#F1F5F9' }}>{r.client?.firstName} {r.client?.lastName}</div>
                  <div style={{ color: '#64748B', fontSize: 11 }}>{r.client?.email}</div>
                </div>
              </div>
            )},
            { key: 'planKey', label: 'Plan', render: r => <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#06B6D420', color: '#06B6D4', textTransform: 'capitalize' }}>{r.planName || r.planKey}</span> },
            { key: 'amount', label: 'Amount Paid', render: r => <span style={{ color: '#10B981', fontWeight: 700 }}>{fmt(r.amount)}</span> },
            { key: 'startDate', label: 'Start Date', render: r => fmtDate(r.startDate) },
            { key: 'endDate', label: 'Expiry Date', render: r => fmtDate(r.endDate) },
            { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
            { key: 'paymentGateway', label: 'Gateway', render: r => <span style={{ color: '#94A3B8', textTransform: 'capitalize' }}>{r.paymentGateway}</span> },
          ]}
          data={subs}
        />
      </div>
    </div>
  )
}

// ─── Bookings Tab ─────────────────────────────────────────────────────────────
function BookingsTab() {
  const { token } = useSelector(s => s.auth)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: '', offerType: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100', ...Object.fromEntries(Object.entries(filter).filter(([,v]) => v)) })
      const res = await apiConnector('GET', `/api/v1/admin/bookings?${params}`, null, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) setBookings(res.data.bookings)
    } catch (e) { toast.error('Failed to load bookings') }
    setLoading(false)
  }, [token, filter])

  useEffect(() => { load() }, [load])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
          style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 10, padding: '10px 14px', color: '#F1F5F9', fontSize: 14, cursor: 'pointer' }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={filter.offerType} onChange={e => setFilter(f => ({ ...f, offerType: e.target.value }))}
          style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 10, padding: '10px 14px', color: '#F1F5F9', fontSize: 14, cursor: 'pointer' }}>
          <option value="">All Offer Types</option>
          <option value="session">1:1 Session</option>
          <option value="circle">Circle</option>
          <option value="program">Program</option>
        </select>
        <button onClick={load} style={{ background: '#334155', border: 'none', borderRadius: 10, padding: '10px 16px', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiRefreshCw /> Refresh
        </button>
      </div>
      <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' }}>
        <DataTable
          loading={loading}
          columns={[
            { key: 'client', label: 'Client', render: r => (
              <div>
                <div style={{ color: '#F1F5F9', fontWeight: 600 }}>{r.client?.firstName} {r.client?.lastName}</div>
                <div style={{ color: '#64748B', fontSize: 11 }}>{r.client?.email}</div>
              </div>
            )},
            { key: 'practitioner', label: 'Practitioner', render: r => (
              <div>
                <div style={{ color: '#F1F5F9', fontWeight: 600 }}>{r.practitioner?.firstName} {r.practitioner?.lastName}</div>
                <div style={{ color: '#64748B', fontSize: 11 }}>{r.practitioner?.email}</div>
              </div>
            )},
            { key: 'offer', label: 'Offer', render: r => (
              <div>
                <div style={{ color: '#CBD5E1' }}>{r.offer?.title || '—'}</div>
                <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 6, background: '#334155', color: '#94A3B8' }}>{r.offerType}</span>
              </div>
            )},
            { key: 'amount', label: 'Amount', render: r => <span style={{ color: '#10B981', fontWeight: 700 }}>{fmt(r.amount)}</span> },
            { key: 'scheduledAt', label: 'Scheduled At', render: r => <span style={{ color: '#94A3B8' }}>{fmtDateTime(r.scheduledAt)}</span> },
            { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
          ]}
          data={bookings}
        />
      </div>
    </div>
  )
}

// ─── Org Conversations Tab ────────────────────────────────────────────────────
function OrgConversationsTab() {
  const { token } = useSelector(s => s.auth)
  const [convos, setConvos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = statusFilter ? `?status=${statusFilter}&limit=100` : '?limit=100'
      const res = await apiConnector('GET', `/api/v1/admin/org-conversations${params}`, null, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) setConvos(res.data.conversations)
    } catch (e) { toast.error('Failed to load org conversations') }
    setLoading(false)
  }, [token, statusFilter])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id, status) => {
    try {
      const res = await apiConnector('PATCH', `/api/v1/admin/org-conversations/${id}`, { status }, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) { toast.success('Status updated'); load() }
    } catch (e) { toast.error('Update failed') }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 20, padding: 32, width: 560, maxWidth: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h3 style={{ margin: 0, color: '#F1F5F9' }}>{selected.organizationName}</h3>
                <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: 13 }}>{fmtDateTime(selected.createdAt)}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><FiX size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><div style={{ color: '#64748B', fontSize: 11, marginBottom: 4 }}>CONTACT NAME</div><div style={{ color: '#F1F5F9' }}>{selected.contactName}</div></div>
                <div><div style={{ color: '#64748B', fontSize: 11, marginBottom: 4 }}>EMAIL</div><div style={{ color: '#3B82F6' }}>{selected.contactEmail}</div></div>
                <div><div style={{ color: '#64748B', fontSize: 11, marginBottom: 4 }}>PHONE</div><div style={{ color: '#F1F5F9' }}>{selected.contactPhone || '—'}</div></div>
                <div><div style={{ color: '#64748B', fontSize: 11, marginBottom: 4 }}>COMPANY SIZE</div><div style={{ color: '#F1F5F9' }}>{selected.companySize || '—'}</div></div>
              </div>
              {selected.interestedIn?.length > 0 && (
                <div>
                  <div style={{ color: '#64748B', fontSize: 11, marginBottom: 8 }}>INTERESTED IN</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {selected.interestedIn.map(i => <span key={i} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, background: '#8B5CF620', color: '#8B5CF6' }}>{i}</span>)}
                  </div>
                </div>
              )}
              <div>
                <div style={{ color: '#64748B', fontSize: 11, marginBottom: 8 }}>MESSAGE</div>
                <div style={{ background: '#0F172A', borderRadius: 10, padding: '12px 16px', color: '#CBD5E1', lineHeight: 1.6, fontSize: 14 }}>{selected.message}</div>
              </div>
              <div>
                <div style={{ color: '#64748B', fontSize: 11, marginBottom: 8 }}>UPDATE STATUS</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['in_review', 'contacted', 'resolved'].map(s => (
                    <button key={s} onClick={() => { updateStatus(selected._id, s); setSelected(null) }}
                      style={{ padding: '8px 16px', background: STATUS_COLORS[s] + '20', border: `1px solid ${STATUS_COLORS[s]}40`, borderRadius: 8, color: STATUS_COLORS[s], cursor: 'pointer', fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>
                      {s.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 10, padding: '10px 14px', color: '#F1F5F9', fontSize: 14, cursor: 'pointer' }}>
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="in_review">In Review</option>
          <option value="contacted">Contacted</option>
          <option value="resolved">Resolved</option>
        </select>
        <button onClick={load} style={{ background: '#334155', border: 'none', borderRadius: 10, padding: '10px 16px', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' }}>
        <DataTable
          loading={loading}
          emptyMessage="No organization inquiries yet"
          columns={[
            { key: 'organizationName', label: 'Organization', render: r => <span style={{ color: '#F1F5F9', fontWeight: 600 }}>{r.organizationName}</span> },
            { key: 'contactName', label: 'Contact Person' },
            { key: 'contactEmail', label: 'Email', render: r => <span style={{ color: '#3B82F6' }}>{r.contactEmail}</span> },
            { key: 'companySize', label: 'Size', render: r => r.companySize || '—' },
            { key: 'message', label: 'Message Preview', wrap: true, render: r => (
              <span style={{ color: '#94A3B8', maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r.message}
              </span>
            )},
            { key: 'createdAt', label: 'Received', render: r => fmtDate(r.createdAt) },
            { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
            { key: 'view', label: 'Action', render: r => (
              <button onClick={() => setSelected(r)} style={{ padding: '6px 12px', background: '#334155', border: 'none', borderRadius: 8, color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                <FiEye /> View
              </button>
            )},
          ]}
          data={convos}
        />
      </div>
    </div>
  )
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────
const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: <FiGrid /> },
  { id: 'clients', label: 'Clients', icon: <FiUsers /> },
  { id: 'practitioners', label: 'Practitioners', icon: <FiUser /> },
  { id: 'payments', label: 'All Payments', icon: <FiDollarSign /> },
  { id: 'subscriptions', label: 'Subscriptions', icon: <FiCreditCard /> },
  { id: 'bookings', label: 'Bookings', icon: <FiCalendar /> },
  { id: 'org', label: 'Org Conversations', icon: <FiMessageSquare /> },
]

export default function AdminApp() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [recentPayments, setRecentPayments] = useState([])
  const [statsLoading, setStatsLoading] = useState(true)
  const { token } = useSelector(s => s.auth)
  const { user } = useSelector(s => s.profile)

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const res = await apiConnector('GET', '/api/v1/admin/stats', null, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) {
        setStats(res.data.stats)
        setRecentPayments(res.data.recentPayments || [])
      }
    } catch (e) { toast.error('Failed to load dashboard stats') }
    setStatsLoading(false)
  }, [token])

  useEffect(() => { loadStats() }, [loadStats])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0F172A', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #1E293B; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        select option { background: #1E293B; color: #F1F5F9; }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: 260, flexShrink: 0, background: '#0B1220', borderRight: '1px solid #1E293B',
        display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        {/* Brand */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1E293B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #1F5FE0, #8A2BE0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>
              <FiShield />
            </div>
            <div>
              <div style={{ color: '#F1F5F9', fontWeight: 800, fontSize: 15 }}>Admin Panel</div>
              <div style={{ color: '#475569', fontSize: 11 }}>Platform Control Center</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px',
                background: isActive ? 'linear-gradient(135deg, #1F5FE020, #8A2BE020)' : 'none',
                border: isActive ? '1px solid #1F5FE030' : '1px solid transparent',
                borderRadius: 10, color: isActive ? '#E2E8F0' : '#64748B',
                cursor: 'pointer', fontSize: 13, fontWeight: isActive ? 600 : 500,
                marginBottom: 2, textAlign: 'left', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#1E293B'; e.currentTarget.style.color = '#94A3B8' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748B' } }}
              >
                <span style={{ fontSize: 16, color: isActive ? '#818CF8' : '#475569' }}>{tab.icon}</span>
                {tab.label}
              </button>
            )
          })}
        </nav>

        {/* Admin user card */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1E293B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #1F5FE0, #8A2BE0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ color: '#475569', fontSize: 11 }}>Super Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <div style={{ background: '#0B1220', borderBottom: '1px solid #1E293B', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
          <div>
            <div style={{ color: '#475569', fontSize: 12, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
              Admin / {TABS.find(t => t.id === activeTab)?.label}
            </div>
            <h1 style={{ margin: 0, color: '#F1F5F9', fontSize: 20, fontWeight: 800 }}>
              {TABS.find(t => t.id === activeTab)?.label}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={loadStats} title="Refresh stats" style={{ width: 36, height: 36, borderRadius: 10, background: '#1E293B', border: '1px solid #334155', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiRefreshCw size={15} />
            </button>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#1E293B', border: '1px solid #334155', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiBell size={15} />
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          {activeTab === 'dashboard' && <DashboardTab stats={stats} recentPayments={recentPayments} loading={statsLoading} />}
          {activeTab === 'clients' && <ClientsTab />}
          {activeTab === 'practitioners' && <PractitionersTab />}
          {activeTab === 'payments' && <PaymentsTab />}
          {activeTab === 'subscriptions' && <SubscriptionsTab />}
          {activeTab === 'bookings' && <BookingsTab />}
          {activeTab === 'org' && <OrgConversationsTab />}
        </div>
      </main>
    </div>
  )
}
