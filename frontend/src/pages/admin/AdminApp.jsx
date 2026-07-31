import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { apiConnector } from '../../services/apiConnector'
import toast from 'react-hot-toast'
import {
  FiGrid, FiUsers, FiDollarSign, FiCreditCard, FiCalendar,
  FiMessageSquare, FiSearch, FiRefreshCw, FiCheck,
  FiX, FiEye, FiArrowUp, FiArrowDown,
  FiShield, FiBookOpen, FiBell, FiUser
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
      background: color + '15', color, border: `1px solid ${color}30`,
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
      background: '#FFFFFF', borderRadius: 16, padding: '20px 24px',
      border: '1px solid #E2E8F0', position: 'relative', overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.03)', transition: 'all 0.2s', cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.03)' }}
    >
      <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, borderRadius: '50%', background: color + '0D', transform: 'translate(25%, -25%)' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: 20 }}>
          {icon}
        </div>
        {trend !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: trend >= 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>
            {trend >= 0 ? <FiArrowUp /> : <FiArrowDown />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>{label}</div>
      {subLabel && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>{subLabel}</div>}
    </div>
  )
}

// ─── Data Table ───────────────────────────────────────────────────────────────
function DataTable({ columns, data, loading, emptyMessage = "No records found" }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 48, color: '#94A3B8' }}>
        <FiRefreshCw style={{ animation: 'spin 1s linear infinite', marginRight: 10 }} /> Loading data...
      </div>
    )
  }
  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 48, color: '#94A3B8', gap: 12 }}>
        <FiBookOpen size={32} />
        <span>{emptyMessage}</span>
      </div>
    )
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            {columns.map(col => (
              <th key={col.key} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748B', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, whiteSpace: 'nowrap' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row._id || i} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {columns.map(col => (
                <td key={col.key} style={{ padding: '12px 16px', color: '#334155', whiteSpace: col.wrap ? 'normal' : 'nowrap' }}>
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
        <KpiCard icon={<FiDollarSign />} label="Total Revenue" value={fmt(stats?.totalRevenue)} color="#10B981" trend={stats?.revenueTrend} />
        <KpiCard icon={<FiUsers />} label="Total Learners" value={stats?.totalClients || 0} color="#3B82F6" trend={stats?.clientsTrend} />
        <KpiCard icon={<FiUser />} label="Practitioners" value={stats?.totalPractitioners || 0} color="#8B5CF6" />
        <KpiCard icon={<FiCreditCard />} label="Pending Payouts" value={fmt(stats?.pendingPayouts)} subLabel="Admin owes practitioners" color="#F59E0B" />
        <KpiCard icon={<FiCalendar />} label="Active Subscriptions" value={stats?.activeSubscriptions || 0} color="#06B6D4" />
        <KpiCard icon={<FiMessageSquare />} label="New Org Inquiries" value={stats?.newOrgConversations || 0} color="#EC4899" />
      </div>

      {/* Recent Payments */}
      <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
          <h3 style={{ margin: 0, color: '#0F172A', fontSize: 16, fontWeight: 700 }}>Recent Payments Received</h3>
          <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: 13 }}>All payments collected centrally by the platform admin</p>
        </div>
        <DataTable
          loading={loading}
          columns={[
            { key: 'createdAt', label: 'Date', render: r => fmtDate(r.createdAt) },
            { key: 'clientName', label: 'Learner', render: r => <span style={{ fontWeight: 600, color: '#0F172A' }}>{r.clientName}</span> },
            { key: 'paymentType', label: 'Type', render: r => (
              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: r.paymentType === 'subscription' ? '#EFF6FF' : '#F5F3FF',
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
// ─── Clients Tab ──────────────────────────────────────────────────────────────
function ClientsTab() {
  const { token } = useSelector(s => s.auth)
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [planModal, setPlanModal] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState('growth')
  const [extendDays, setExtendDays] = useState('7')
  const [updating, setUpdating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiConnector('GET', `/api/v1/admin/clients?search=${search}&limit=100`, null, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) { setClients(res.data.clients); setTotal(res.data.total) }
    } catch (e) { toast.error('Failed to load clients') }
    setLoading(false)
  }, [token, search])

  useEffect(() => { load() }, [load])

  const handleUpdatePlan = async () => {
    setUpdating(true)
    try {
      const res = await apiConnector('PATCH', `/api/v1/admin/clients/${planModal._id}/plan`, {
        planKey: selectedPlan,
        extendTrialDays: Number(extendDays) || 0,
      }, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) {
        toast.success('Client plan updated successfully')
        setPlanModal(null)
        load()
      }
    } catch (e) { toast.error('Failed to update plan') }
    setUpdating(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Plan Override Modal */}
      {planModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 32, width: 460, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 4px', color: '#0F172A', fontSize: 18, fontWeight: 800 }}>Manage Plan &amp; Trial — {planModal.firstName} {planModal.lastName}</h3>
            <p style={{ margin: '0 0 16px', color: '#64748B', fontSize: 13 }}>Current status: <strong style={{ color: '#1F5FE0' }}>{planModal.planDisplayStatus}</strong></p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', color: '#475569', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Assign Subscription Plan</label>
                <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)}
                  style={{ width: '100%', background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: 10, padding: '10px 14px', color: '#0F172A', fontSize: 14, outline: 'none' }}>
                  <option value="trial">Keep 7-Day Free Trial</option>
                  <option value="starter">Starter Plan (₹999/mo)</option>
                  <option value="growth">Growth Plan (₹2,999/mo)</option>
                  <option value="master">Master VIP Plan (₹5,999/mo)</option>
                  <option value="none">No Active Plan (Trial Expired)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#475569', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Extend Trial (Days)</label>
                <input type="number" value={extendDays} onChange={e => setExtendDays(e.target.value)}
                  placeholder="e.g. 7"
                  style={{ width: '100%', background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: 10, padding: '10px 14px', color: '#0F172A', fontSize: 14, outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setPlanModal(null)}
                style={{ flex: 1, padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: 10, color: '#64748B', cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={handleUpdatePlan} disabled={updating}
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '8px 14px', flex: 1 }}>
          <FiSearch color="#94A3B8" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
            style={{ background: 'none', border: 'none', outline: 'none', color: '#0F172A', fontSize: 14, width: '100%' }} />
        </div>
        <button onClick={load} style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '10px 16px', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13 }}>
          <FiRefreshCw /> Refresh
        </button>
      </div>
      <div style={{ color: '#64748B', fontSize: 13 }}>{total} total learners</div>
      <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
        <DataTable
          loading={loading}
          columns={[
            { key: 'name', label: 'Learner', render: r => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {r.firstName?.[0]}{r.lastName?.[0]}
                </div>
                <div>
                  <div style={{ color: '#0F172A', fontWeight: 600 }}>{r.firstName} {r.lastName}</div>
                  <div style={{ color: '#64748B', fontSize: 12 }}>{r.email}</div>
                </div>
              </div>
            )},
            { key: 'planDisplayStatus', label: 'Subscription / Trial Status', render: r => (
              <span style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: r.hasActiveSub ? '#DCFCE7' : r.isTrialActive ? '#F3E8FF' : '#FEE2E2',
                color: r.hasActiveSub ? '#166534' : r.isTrialActive ? '#7E22CE' : '#DC2626',
                border: `1px solid ${r.hasActiveSub ? '#BBF7D0' : r.isTrialActive ? '#E9D5FF' : '#FCA5A5'}`
              }}>
                {r.planDisplayStatus}
              </span>
            )},
            { key: 'sessionsBooked', label: 'Sessions Booked', render: r => <span style={{ color: '#334155' }}>{r.sessionsBooked || 0}</span> },
            { key: 'totalPaid', label: 'Total Paid', render: r => <span style={{ color: '#10B981', fontWeight: 700 }}>{fmt(r.totalPaid)}</span> },
            { key: 'createdAt', label: 'Joined', render: r => fmtDate(r.createdAt) },
            { key: 'action', label: 'Action', render: r => (
              <button onClick={() => { setPlanModal(r); setSelectedPlan(r.subscription?.planKey || 'growth') }}
                style={{ padding: '6px 12px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, color: '#1D4ED8', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
                Manage Plan
              </button>
            )},
          ]}
          data={clients}
        />
      </div>
    </div>
  )
}

// ─── Admin Courses & Plan Assignment Tab ──────────────────────────────────────
function CoursesTab() {
  const { token } = useSelector(s => s.auth)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [assignModal, setAssignModal] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('published')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiConnector('GET', '/api/v1/admin/courses', null, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) setCourses(res.data.courses || [])
    } catch (e) { toast.error('Failed to load courses') }
    setLoading(false)
  }, [token])

  useEffect(() => { load() }, [load])

  const handleSavePlan = async () => {
    setSaving(true)
    try {
      const res = await apiConnector('PATCH', `/api/v1/admin/courses/${assignModal._id}`, {
        requiredPlan: selectedPlan,
        status: selectedStatus,
      }, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) {
        toast.success('Course plan tier assigned successfully!')
        setAssignModal(null)
        load()
      }
    } catch (e) { toast.error('Failed to update course plan') }
    setSaving(false)
  }

  const filtered = courses.filter(c =>
    !search ||
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    `${c.practitioner?.firstName} ${c.practitioner?.lastName}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Assign Plan Modal */}
      {assignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 32, width: 480, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 4px', color: '#0F172A', fontSize: 18, fontWeight: 800 }}>Assign Subscription Plan Tier</h3>
            <p style={{ margin: '0 0 16px', color: '#64748B', fontSize: 13 }}>Course: <strong>{assignModal.title}</strong> by Dr. {assignModal.practitioner?.firstName} {assignModal.practitioner?.lastName}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', color: '#475569', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Required Subscription Plan</label>
                <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)}
                  style={{ width: '100%', background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: 10, padding: '10px 14px', color: '#0F172A', fontSize: 14, outline: 'none' }}>
                  <option value="">Free Access (No subscription needed)</option>
                  <option value="starter">Starter Plan &amp; above (₹999/mo)</option>
                  <option value="growth">Growth Plan &amp; above (₹2,999/mo)</option>
                  <option value="master">Master VIP Plan (₹5,999/mo)</option>
                </select>
                <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: 11 }}>
                  Clients must have an active subscription or trial matching this tier to access videos.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', color: '#475569', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Publication Status</label>
                <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
                  style={{ width: '100%', background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: 10, padding: '10px 14px', color: '#0F172A', fontSize: 14, outline: 'none' }}>
                  <option value="published">Published (Visible to Clients)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setAssignModal(null)}
                style={{ flex: 1, padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: 10, color: '#64748B', cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={handleSavePlan} disabled={saving}
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                {saving ? 'Saving...' : 'Assign Plan Tier ✓'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '8px 14px', flex: 1 }}>
          <FiSearch color="#94A3B8" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses or practitioners..."
            style={{ background: 'none', border: 'none', outline: 'none', color: '#0F172A', fontSize: 14, width: '100%' }} />
        </div>
        <button onClick={load} style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '10px 16px', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13 }}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div style={{ color: '#64748B', fontSize: 13 }}>{filtered.length} total courses uploaded by practitioners</div>

      <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
        <DataTable
          loading={loading}
          emptyMessage="No courses uploaded by practitioners yet"
          columns={[
            { key: 'course', label: 'Course Title', render: r => (
              <div>
                <div style={{ color: '#0F172A', fontWeight: 700 }}>{r.title}</div>
                <div style={{ color: '#64748B', fontSize: 11 }}>{r.videos?.length || 0} videos</div>
              </div>
            )},
            { key: 'practitioner', label: 'Practitioner (Creator)', render: r => (
              <div>
                <div style={{ color: '#0F172A', fontWeight: 600 }}>Dr. {r.practitioner?.firstName} {r.practitioner?.lastName}</div>
                <div style={{ color: '#64748B', fontSize: 11 }}>{r.practitioner?.email}</div>
              </div>
            )},
            { key: 'requiredPlan', label: 'Assigned Subscription Plan', render: r => r.requiredPlan ? (
              <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#F3E8FF', color: '#7E22CE', border: '1px solid #E9D5FF', textTransform: 'capitalize' }}>
                {r.requiredPlan} Plan
              </span>
            ) : (
              <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0' }}>
                Free Access
              </span>
            )},
            { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
            { key: 'createdAt', label: 'Uploaded', render: r => fmtDate(r.createdAt) },
            { key: 'action', label: 'Admin Action', render: r => (
              <button onClick={() => { setAssignModal(r); setSelectedPlan(r.requiredPlan || ''); setSelectedStatus(r.status || 'published') }}
                style={{ padding: '6px 14px', background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
                Assign Plan Tier
              </button>
            )},
          ]}
          data={filtered}
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 32, width: 440, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 4px', color: '#0F172A', fontSize: 18, fontWeight: 800 }}>Pay Salary — {payoutModal.firstName} {payoutModal.lastName}</h3>
            <p style={{ margin: '0 0 16px', color: '#64748B', fontSize: 13 }}>Pending salary owed: <strong style={{ color: '#D97706' }}>{fmt(payoutModal.salaryOwed)}</strong></p>

            {/* Practitioner Bank & UPI Details */}
            <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '14px 16px', margin: '0 0 20px', border: '1px solid #E2E8F0', fontSize: 13 }}>
              <div style={{ color: '#1F5FE0', fontWeight: 700, marginBottom: 8 }}>Practitioner Bank Details:</div>
              {payoutModal.profile?.bankAccountNumber ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ color: '#334155' }}><strong>Bank:</strong> {payoutModal.profile.bankName || 'N/A'}</div>
                  <div style={{ color: '#334155' }}><strong>Account Holder:</strong> {payoutModal.profile.bankAccountName || `${payoutModal.firstName} ${payoutModal.lastName}`}</div>
                  <div style={{ color: '#334155' }}><strong>Account No:</strong> <span style={{ fontFamily: 'monospace', color: '#0F172A', fontWeight: 600 }}>{payoutModal.profile.bankAccountNumber}</span></div>
                  <div style={{ color: '#334155' }}><strong>IFSC:</strong> <span style={{ fontFamily: 'monospace', color: '#0F172A', fontWeight: 600 }}>{payoutModal.profile.bankIfscCode}</span></div>
                  {payoutModal.profile.upiId && <div style={{ color: '#059669', marginTop: 4 }}><strong>UPI ID:</strong> {payoutModal.profile.upiId}</div>}
                </div>
              ) : payoutModal.profile?.upiId ? (
                <div style={{ color: '#059669' }}><strong>UPI ID:</strong> {payoutModal.profile.upiId}</div>
              ) : (
                <div style={{ color: '#DC2626' }}>⚠️ Practitioner has not added bank details yet.</div>
              )}
            </div>

            <label style={{ display: 'block', color: '#475569', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Amount to Pay (₹)</label>
            <input type="number" value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)}
              placeholder={`e.g. ${payoutModal.salaryOwed}`}
              style={{ width: '100%', background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: 10, padding: '10px 14px', color: '#0F172A', fontSize: 15, outline: 'none', boxSizing: 'border-box', marginBottom: 20 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setPayoutModal(null); setPayoutAmount('') }}
                style={{ flex: 1, padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: 10, color: '#64748B', cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={handlePayout} disabled={payingOut}
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontWeight: 700, opacity: payingOut ? 0.7 : 1 }}>
                {payingOut ? 'Processing...' : 'Mark as Paid ✓'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '8px 14px', flex: 1 }}>
          <FiSearch color="#94A3B8" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search practitioners..."
            style={{ background: 'none', border: 'none', outline: 'none', color: '#0F172A', fontSize: 14, width: '100%' }} />
        </div>
        <button onClick={load} style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '10px 16px', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13 }}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
        <DataTable
          loading={loading}
          columns={[
            { key: 'name', label: 'Practitioner', render: r => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {r.firstName?.[0]}{r.lastName?.[0]}
                </div>
                <div>
                  <div style={{ color: '#0F172A', fontWeight: 600 }}>{r.firstName} {r.lastName}</div>
                  <div style={{ color: '#64748B', fontSize: 12 }}>{r.email}</div>
                </div>
              </div>
            )},
            { key: 'specialization', label: 'Specialization', render: r => <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#EFF6FF', color: '#1D4ED8' }}>{r.profile?.specialties?.[0] || 'Integrative Health'}</span> },
            { key: 'sessions', label: 'Sessions', render: r => r.sessionsDelivered || 0 },
            { key: 'courses', label: 'Courses', render: r => r.coursesCount || 0 },
            { key: 'totalCourseSales', label: 'Course Sales', render: r => <span style={{ color: '#0F172A', fontWeight: 600 }}>{fmt(r.totalCourseSales || 0)}</span> },
            { key: 'totalSessionSales', label: 'Session Sales', render: r => <span style={{ color: '#0F172A', fontWeight: 600 }}>{fmt(r.totalSessionSales || 0)}</span> },
            { key: 'grossGenerated', label: 'Gross Generated', render: r => <span style={{ color: '#10B981', fontWeight: 700 }}>{fmt(r.grossGenerated || 0)}</span> },
            { key: 'salaryOwed', label: 'Salary Owed', render: r => <span style={{ color: r.salaryOwed > 0 ? '#D97706' : '#64748B', fontWeight: 700 }}>{fmt(r.salaryOwed)}</span> },
            { key: 'action', label: 'Action', render: r => (
              <button onClick={() => { setPayoutModal(r); setPayoutAmount(String(r.salaryOwed || '')) }}
                style={{ padding: '6px 14px', background: r.salaryOwed > 0 ? 'linear-gradient(135deg, #10B981, #059669)' : '#F1F5F9', border: 'none', borderRadius: 8, color: r.salaryOwed > 0 ? '#fff' : '#94A3B8', cursor: r.salaryOwed > 0 ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: 12 }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '8px 14px', flex: 1, minWidth: 200 }}>
          <FiSearch color="#94A3B8" />
          <input value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} placeholder="Search payments..."
            style={{ background: 'none', border: 'none', outline: 'none', color: '#0F172A', fontSize: 14, width: '100%' }} />
        </div>
        <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
          style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '10px 14px', color: '#0F172A', fontSize: 14, cursor: 'pointer' }}>
          <option value="">All Types</option>
          <option value="subscription">Subscription</option>
          <option value="offer_booking">Offer Booking (Session/Circle)</option>
          <option value="paid_course">Paid Course Purchase</option>
          <option value="org_booking">Org Booking</option>
        </select>
        <button onClick={load} style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '10px 16px', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13 }}>
          <FiRefreshCw /> Refresh
        </button>
      </div>
      <div style={{ color: '#64748B', fontSize: 13 }}>{total} total payments</div>
      <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
        <DataTable
          loading={loading}
          columns={[
            { key: 'createdAt', label: 'Date', render: r => fmtDate(r.createdAt) },
            { key: 'clientName', label: 'Learner', render: r => (
              <div>
                <div style={{ color: '#0F172A', fontWeight: 600 }}>{r.clientName || `${r.client?.firstName} ${r.client?.lastName}`}</div>
                <div style={{ color: '#64748B', fontSize: 11 }}>{r.client?.email}</div>
              </div>
            )},
            { key: 'paymentType', label: 'Type', render: r => (
              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: r.paymentType === 'subscription' ? '#EFF6FF' : '#F5F3FF',
                color: r.paymentType === 'subscription' ? '#3B82F6' : '#8B5CF6' }}>
                {r.paymentType?.replace(/_/g, ' ')}
              </span>
            )},
            { key: 'description', label: 'Description', wrap: true },
            { key: 'practitionerName', label: 'Practitioner', render: r => r.practitionerName || r.practitioner ? `${r.practitioner?.firstName || ''} ${r.practitioner?.lastName || ''}`.trim() || '—' : '—' },
            { key: 'amount', label: 'Amount Received', render: r => <span style={{ color: '#10B981', fontWeight: 700 }}>{fmt(r.amount)}</span> },
            { key: 'amountOwedToPractitioner', label: 'Owed to Practitioner', render: r => r.amountOwedToPractitioner > 0 ? <span style={{ color: '#D97706', fontWeight: 600 }}>{fmt(r.amountOwedToPractitioner)}</span> : <span style={{ color: '#94A3B8' }}>—</span> },
            { key: 'practitionerSalaryPaid', label: 'Salary Paid', render: r => r.practitionerSalaryPaid
              ? <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}><FiCheck /> Paid</span>
              : r.amountOwedToPractitioner > 0 ? <span style={{ color: '#D97706' }}>Pending</span> : <span style={{ color: '#94A3B8' }}>N/A</span>
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
          style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '10px 14px', color: '#0F172A', fontSize: 14, cursor: 'pointer' }}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button onClick={load} style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '10px 16px', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13 }}>
          <FiRefreshCw /> Refresh
        </button>
      </div>
      <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
        <DataTable
          loading={loading}
          columns={[
            { key: 'client', label: 'Learner', render: r => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                  {r.client?.firstName?.[0]}{r.client?.lastName?.[0]}
                </div>
                <div>
                  <div style={{ color: '#0F172A' }}>{r.client?.firstName} {r.client?.lastName}</div>
                  <div style={{ color: '#64748B', fontSize: 11 }}>{r.client?.email}</div>
                </div>
              </div>
            )},
            { key: 'planKey', label: 'Plan', render: r => <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#ECFEFF', color: '#0891B2', textTransform: 'capitalize' }}>{r.planName || r.planKey}</span> },
            { key: 'amount', label: 'Amount Paid', render: r => <span style={{ color: '#10B981', fontWeight: 700 }}>{fmt(r.amount)}</span> },
            { key: 'startDate', label: 'Start Date', render: r => fmtDate(r.startDate) },
            { key: 'endDate', label: 'Expiry Date', render: r => fmtDate(r.endDate) },
            { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
            { key: 'paymentGateway', label: 'Gateway', render: r => <span style={{ color: '#64748B', textTransform: 'capitalize' }}>{r.paymentGateway}</span> },
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
          style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '10px 14px', color: '#0F172A', fontSize: 14, cursor: 'pointer' }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={filter.offerType} onChange={e => setFilter(f => ({ ...f, offerType: e.target.value }))}
          style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '10px 14px', color: '#0F172A', fontSize: 14, cursor: 'pointer' }}>
          <option value="">All Offer Types</option>
          <option value="session">1:1 Session</option>
          <option value="circle">Circle</option>
          <option value="program">Program</option>
        </select>
        <button onClick={load} style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '10px 16px', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13 }}>
          <FiRefreshCw /> Refresh
        </button>
      </div>
      <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
        <DataTable
          loading={loading}
          columns={[
            { key: 'client', label: 'Learner', render: r => (
              <div>
                <div style={{ color: '#0F172A', fontWeight: 600 }}>{r.client?.firstName} {r.client?.lastName}</div>
                <div style={{ color: '#64748B', fontSize: 11 }}>{r.client?.email}</div>
              </div>
            )},
            { key: 'practitioner', label: 'Practitioner', render: r => (
              <div>
                <div style={{ color: '#0F172A', fontWeight: 600 }}>{r.practitioner?.firstName} {r.practitioner?.lastName}</div>
                <div style={{ color: '#64748B', fontSize: 11 }}>{r.practitioner?.email}</div>
              </div>
            )},
            { key: 'offer', label: 'Offer', render: r => (
              <div>
                <div style={{ color: '#334155' }}>{r.offer?.title || '—'}</div>
                <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 6, background: '#F1F5F9', color: '#64748B' }}>{r.offerType}</span>
              </div>
            )},
            { key: 'amount', label: 'Amount', render: r => <span style={{ color: '#10B981', fontWeight: 700 }}>{fmt(r.amount)}</span> },
            { key: 'scheduledAt', label: 'Scheduled At', render: r => <span style={{ color: '#64748B' }}>{fmtDateTime(r.scheduledAt)}</span> },
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 32, width: 560, maxWidth: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h3 style={{ margin: 0, color: '#0F172A' }}>{selected.organizationName}</h3>
                <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: 13 }}>{fmtDateTime(selected.createdAt)}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, width: 32, height: 32, color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><div style={{ color: '#64748B', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>CONTACT NAME</div><div style={{ color: '#0F172A', fontWeight: 600 }}>{selected.contactName}</div></div>
                <div><div style={{ color: '#64748B', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>EMAIL</div><div style={{ color: '#1F5FE0', fontWeight: 600 }}>{selected.contactEmail}</div></div>
                <div><div style={{ color: '#64748B', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>PHONE</div><div style={{ color: '#0F172A' }}>{selected.contactPhone || '—'}</div></div>
                <div><div style={{ color: '#64748B', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>COMPANY SIZE</div><div style={{ color: '#0F172A' }}>{selected.companySize || '—'}</div></div>
              </div>
              {selected.interestedIn?.length > 0 && (
                <div>
                  <div style={{ color: '#64748B', fontSize: 11, fontWeight: 700, marginBottom: 8 }}>INTERESTED IN</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {selected.interestedIn.map(i => <span key={i} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, background: '#F5F3FF', color: '#8B5CF6', fontWeight: 600 }}>{i}</span>)}
                  </div>
                </div>
              )}
              <div>
                <div style={{ color: '#64748B', fontSize: 11, fontWeight: 700, marginBottom: 8 }}>MESSAGE</div>
                <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '14px 16px', color: '#334155', lineHeight: 1.6, fontSize: 14, border: '1px solid #E2E8F0' }}>{selected.message}</div>
              </div>
              <div>
                <div style={{ color: '#64748B', fontSize: 11, fontWeight: 700, marginBottom: 8 }}>UPDATE STATUS</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['in_review', 'contacted', 'resolved'].map(s => (
                    <button key={s} onClick={() => { updateStatus(selected._id, s); setSelected(null) }}
                      style={{ padding: '8px 16px', background: STATUS_COLORS[s] + '15', border: `1px solid ${STATUS_COLORS[s]}40`, borderRadius: 8, color: STATUS_COLORS[s], cursor: 'pointer', fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>
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
          style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '10px 14px', color: '#0F172A', fontSize: 14, cursor: 'pointer' }}>
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="in_review">In Review</option>
          <option value="contacted">Contacted</option>
          <option value="resolved">Resolved</option>
        </select>
        <button onClick={load} style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '10px 16px', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13 }}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
        <DataTable
          loading={loading}
          emptyMessage="No organization inquiries yet"
          columns={[
            { key: 'organizationName', label: 'Organization', render: r => <span style={{ color: '#0F172A', fontWeight: 600 }}>{r.organizationName}</span> },
            { key: 'contactName', label: 'Contact Person' },
            { key: 'contactEmail', label: 'Email', render: r => <span style={{ color: '#1F5FE0' }}>{r.contactEmail}</span> },
            { key: 'companySize', label: 'Size', render: r => r.companySize || '—' },
            { key: 'message', label: 'Message Preview', wrap: true, render: r => (
              <span style={{ color: '#64748B', maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r.message}
              </span>
            )},
            { key: 'createdAt', label: 'Received', render: r => fmtDate(r.createdAt) },
            { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
            { key: 'view', label: 'Action', render: r => (
              <button onClick={() => setSelected(r)} style={{ padding: '6px 12px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 8, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}>
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
  { id: 'clients', label: 'Learners', icon: <FiUsers /> },
  { id: 'courses', label: 'Courses & Plans', icon: <FiBookOpen /> },
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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #F1F5F9; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: 260, flexShrink: 0, background: '#FFFFFF', borderRight: '1px solid #E2E8F0',
        display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        {/* Brand */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #1F5FE0, #8A2BE0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, boxShadow: '0 4px 12px rgba(31,95,224,0.3)' }}>
              <FiShield />
            </div>
            <div>
              <div style={{ color: '#0F172A', fontWeight: 800, fontSize: 15 }}>Admin Panel</div>
              <div style={{ color: '#64748B', fontSize: 11 }}>Platform Control Center</div>
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
                background: isActive ? 'linear-gradient(135deg, #1F5FE0, #8A2BE0)' : 'none',
                border: 'none',
                borderRadius: 10, color: isActive ? '#FFFFFF' : '#64748B',
                cursor: 'pointer', fontSize: 13, fontWeight: isActive ? 700 : 500,
                marginBottom: 4, textAlign: 'left', transition: 'all 0.15s',
                boxShadow: isActive ? '0 4px 12px rgba(31,95,224,0.25)' : 'none',
              }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#0F172A' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748B' } }}
              >
                <span style={{ fontSize: 16, color: isActive ? '#FFFFFF' : '#64748B' }}>{tab.icon}</span>
                {tab.label}
              </button>
            )
          })}
        </nav>

        {/* Admin user card */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #F1F5F9', background: '#FAFAFA' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #1F5FE0, #8A2BE0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#0F172A', fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ color: '#166534', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                Super Admin
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div>
            <div style={{ color: '#64748B', fontSize: 12, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
              Admin / {TABS.find(t => t.id === activeTab)?.label}
            </div>
            <h1 style={{ margin: 0, color: '#0F172A', fontSize: 20, fontWeight: 800 }}>
              {TABS.find(t => t.id === activeTab)?.label}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={loadStats} title="Refresh stats" style={{ width: 36, height: 36, borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiRefreshCw size={15} />
            </button>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiBell size={15} />
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          {activeTab === 'dashboard' && <DashboardTab stats={stats} recentPayments={recentPayments} loading={statsLoading} />}
          {activeTab === 'clients' && <ClientsTab />}
          {activeTab === 'courses' && <CoursesTab />}
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
