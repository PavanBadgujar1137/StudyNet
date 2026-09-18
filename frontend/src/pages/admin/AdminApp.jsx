import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { apiConnector } from '../../services/apiConnector'
import toast from 'react-hot-toast'
import {
  FiGrid, FiUsers, FiDollarSign, FiCreditCard, FiCalendar,
  FiMessageSquare, FiSearch, FiRefreshCw, FiCheck,
  FiX, FiEye, FiArrowUp, FiArrowDown,
  FiShield, FiBookOpen, FiBell, FiUser, FiTrash2, FiAlertTriangle,
  FiVideo, FiDownload, FiPlay, FiClock,
  FiTag, FiPlus, FiEdit2, FiToggleLeft, FiToggleRight, FiSliders, FiCopy, FiStar
} from 'react-icons/fi'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

const formatDuration = (sec) => {
  if (!sec || isNaN(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

function getYouTubeEmbedUrl(url) {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = String(url).match(regExp)
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null
}

const downloadVideoHelper = async (videoUrl, title = 'course_video') => {
  if (!videoUrl) {
    toast.error('No video download URL available')
    return
  }
  const cleanName = (title || 'video').replace(/[^a-zA-Z0-9_-]/g, '_')
  const toastId = toast.loading(`Starting download: ${title}...`)
  try {
    const res = await fetch(videoUrl, { mode: 'cors' })
    if (!res.ok) throw new Error('Fetch failed')
    const blob = await res.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `${cleanName}.mp4`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(blobUrl)
    toast.success('Download started successfully!', { id: toastId })
  } catch (err) {
    // Direct link fallback if CORS prevents blob reading
    const a = document.createElement('a')
    a.href = videoUrl
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.download = `${cleanName}.mp4`
    document.body.appendChild(a)
    a.click()
    a.remove()
    toast.success('Opening video file for download...', { id: toastId })
  }
}

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
function DataTable({
  columns,
  data,
  loading,
  emptyMessage = "No records found",
  pageSize = 10,
  page: externalPage,
  totalItems: externalTotalItems,
  onPageChange: externalOnPageChange
}) {
  const [internalPage, setInternalPage] = useState(1)

  useEffect(() => {
    setInternalPage(1)
  }, [data?.length])

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

  const isServerPaginated = typeof externalOnPageChange === 'function'
  const currentPage = isServerPaginated ? (externalPage || 1) : internalPage
  const totalItems = isServerPaginated ? (externalTotalItems || data.length) : data.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1

  const displayData = isServerPaginated
    ? data
    : data.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const startIndex = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0
  const endIndex = Math.min(currentPage * pageSize, totalItems)

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    if (isServerPaginated) {
      externalOnPageChange(newPage)
    } else {
      setInternalPage(newPage)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
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
            {displayData.map((row, i) => (
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderTop: '1px solid #F1F5F9', background: '#FFFFFF',
          fontSize: 13, color: '#64748B', flexWrap: 'wrap', gap: 12
        }}>
          <div>
            Showing <b style={{ color: '#0F172A' }}>{startIndex}</b> to <b style={{ color: '#0F172A' }}>{endIndex}</b> of <b style={{ color: '#0F172A' }}>{totalItems}</b> entries
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              style={{
                padding: '6px 14px', borderRadius: 8, border: '1px solid #CBD5E1',
                background: currentPage <= 1 ? '#F8FAFC' : '#FFFFFF',
                color: currentPage <= 1 ? '#CBD5E1' : '#334155',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 12,
                transition: 'all 0.15s'
              }}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((p, idx, arr) => {
                const prevPage = arr[idx - 1]
                const showEllipsis = prevPage && p - prevPage > 1
                return (
                  <React.Fragment key={p}>
                    {showEllipsis && <span style={{ padding: '0 4px', color: '#94A3B8' }}>...</span>}
                    <button
                      onClick={() => handlePageChange(p)}
                      style={{
                        width: 32, height: 32, borderRadius: 8,
                        border: p === currentPage ? 'none' : '1px solid #CBD5E1',
                        background: p === currentPage ? 'linear-gradient(135deg, #1F5FE0, #8A2BE0)' : '#FFFFFF',
                        color: p === currentPage ? '#FFFFFF' : '#334155',
                        fontWeight: p === currentPage ? 700 : 600, fontSize: 12, cursor: 'pointer',
                        boxShadow: p === currentPage ? '0 2px 6px rgba(31,95,224,0.3)' : 'none'
                      }}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                )
              })
            }

            <button
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              style={{
                padding: '6px 14px', borderRadius: 8, border: '1px solid #CBD5E1',
                background: currentPage >= totalPages ? '#F8FAFC' : '#FFFFFF',
                color: currentPage >= totalPages ? '#CBD5E1' : '#334155',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 12,
                transition: 'all 0.15s'
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
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
  const [selectedPlan, setSelectedPlan] = useState('advance')
  const [extendDays, setExtendDays] = useState('7')
  const [updating, setUpdating] = useState(false)
  const [deleteModal, setDeleteModal] = useState(null)
  const [deletingUser, setDeletingUser] = useState(false)

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

  const handleHardDelete = async () => {
    if (!deleteModal) return
    setDeletingUser(true)
    try {
      const res = await apiConnector('DELETE', `/api/v1/admin/users/${deleteModal._id}`, null, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) {
        toast.success(res.data.message || 'Learner permanently deleted from database')
        setDeleteModal(null)
        load()
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to hard delete learner')
    }
    setDeletingUser(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Plan Override Modal */}
      {planModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 32, width: 460, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 4px', color: '#0F172A', fontSize: 18, fontWeight: 800 }}>Manage Plan &amp; Trial — {planModal.firstName} {planModal.lastName}</h3>
            <p style={{ margin: '0 0 16px', color: '#64748B', fontSize: 13 }}>
              Current status: <strong style={{ color: '#1F5FE0' }}>
                {planModal.hasActiveSub 
                  ? `Subscribed (${planModal.subscription?.planName || planModal.subscription?.planKey || 'Active Plan'})` 
                  : planModal.isTrialActive 
                  ? `${(planModal.accountType === 'Practitioner' || planModal.accountType === 'Instructor') ? '14-Day' : '7-Day'} Trial (${Math.min((planModal.accountType === 'Practitioner' || planModal.accountType === 'Instructor') ? 14 : 7, planModal.trialDaysRemaining || 7)}d left)` 
                  : 'Trial Expired'}
              </strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', color: '#475569', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Assign Subscription Plan</label>
                <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)}
                  style={{ width: '100%', background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: 10, padding: '10px 14px', color: '#0F172A', fontSize: 14, outline: 'none' }}>
                  <option value="trial">Keep Active Free Trial</option>
                  {(planModal.accountType === 'Practitioner' || planModal.accountType === 'Instructor') ? (
                    <>
                      <option value="starter">Starter Plan (₹999/mo)</option>
                      <option value="growth">Growth Plan (₹2,999/mo)</option>
                      <option value="master">Master Plan (₹5,999/mo)</option>
                    </>
                  ) : (
                    <>
                      <option value="beginner">Beginner Plan (₹51/mo)</option>
                      <option value="advance">Advance Plan (₹151/mo)</option>
                      <option value="champion">Champion Plan (₹1,500/mo)</option>
                    </>
                  )}
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

      {/* Admin Hard Delete Confirmation Modal */}
      {deleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #FECDD3', borderRadius: 24, padding: 32, width: 480, maxWidth: '90vw', boxShadow: '0 25px 60px rgba(0,0,0,0.25)', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiAlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#991B1B', fontSize: 18, fontWeight: 800 }}>Permanently Hard Delete User?</h3>
                <p style={{ margin: '2px 0 0', color: '#DC2626', fontSize: 12, fontWeight: 600 }}>Irreversible database purge</p>
              </div>
            </div>

            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 16px', marginBottom: 18, fontSize: 13, color: '#991B1B', lineHeight: 1.55 }}>
              Are you sure you want to permanently delete <strong>{deleteModal.firstName} {deleteModal.lastName}</strong> (<code>{deleteModal.email}</code>)?
              <div style={{ marginTop: 8, fontSize: 12, color: '#7F1D1D' }}>
                ⚠️ This will completely erase this user's profile, enrollment progress, circle memberships, notes, and records from MongoDB. This action cannot be undone.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteModal(null)} disabled={deletingUser}
                style={{ flex: 1, padding: '12px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 10, color: '#475569', cursor: deletingUser ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 13 }}>
                Cancel
              </button>
              <button onClick={handleHardDelete} disabled={deletingUser}
                style={{ flex: 1.5, padding: '12px', background: 'linear-gradient(135deg, #EF4444, #DC2626)', border: 'none', borderRadius: 10, color: '#fff', cursor: deletingUser ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 14px rgba(220,38,38,0.35)' }}>
                <FiTrash2 size={15} /> {deletingUser ? 'Hard Deleting...' : 'Confirm Hard Delete'}
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
            { key: 'planDisplayStatus', label: 'Subscription / Trial Status', render: r => {
              if (r.isDeleted) {
                return (
                  <span style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA'
                  }}>
                    ⚠️ Deletion in {r.deletionDaysLeft || 0}d
                  </span>
                )
              }
              const isPract = r.accountType === 'Practitioner' || r.accountType === 'Instructor'
              const isLearner = !isPract
              const statusText = r.hasActiveSub 
                ? `Subscribed (${r.subscription?.planName || r.subscription?.planKey || 'Active Plan'})` 
                : r.isTrialActive 
                ? `${isLearner ? '7-Day' : '14-Day'} Trial (${Math.min(isLearner ? 7 : 14, r.trialDaysRemaining || (isLearner ? 7 : 14))}d left)` 
                : 'Trial Expired'
              return (
                <span style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: r.hasActiveSub ? '#DCFCE7' : r.isTrialActive ? '#F3E8FF' : '#FEE2E2',
                  color: r.hasActiveSub ? '#166534' : r.isTrialActive ? '#7E22CE' : '#DC2626',
                  border: `1px solid ${r.hasActiveSub ? '#BBF7D0' : r.isTrialActive ? '#E9D5FF' : '#FCA5A5'}`
                }}>
                  {statusText}
                </span>
              )
            }},
            { key: 'sessionsBooked', label: 'Sessions Booked', render: r => <span style={{ color: '#334155' }}>{r.sessionsBooked || 0}</span> },
            { key: 'totalPaid', label: 'Total Paid', render: r => <span style={{ color: '#10B981', fontWeight: 700 }}>{fmt(r.totalPaid)}</span> },
            { key: 'createdAt', label: 'Joined', render: r => fmtDate(r.createdAt) },
            { key: 'action', label: 'Action', render: r => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <button onClick={() => { setPlanModal(r); setSelectedPlan(r.subscription?.planKey || r.activePlan || 'advance') }}
                  style={{ padding: '6px 12px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, color: '#1D4ED8', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
                  Manage Plan
                </button>
                <button onClick={() => setDeleteModal(r)}
                  title="Permanently hard delete user from database"
                  style={{ padding: '6px 10px', background: '#FEF2F2', border: '1px solid #FECDD3', borderRadius: 8, color: '#DC2626', cursor: 'pointer', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiTrash2 size={13} /> Hard Delete
                </button>
              </div>
            )},
          ]}
          data={clients}
        />
      </div>
    </div>
  )
}

// ─── Admin Courses & Video Management Tab ──────────────────────────────────────
function CoursesTab() {
  const { token } = useSelector(s => s.auth)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [assignModal, setAssignModal] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('published')
  const [saving, setSaving] = useState(false)

  // Video Preview & Download Modal State
  const [videoModal, setVideoModal] = useState(null)
  const [activeVideo, setActiveVideo] = useState(null)

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

  const handleOpenVideos = (course) => {
    setVideoModal(course)
    if (course.videos && course.videos.length > 0) {
      setActiveVideo(course.videos[0])
    } else {
      setActiveVideo(null)
    }
  }

  const filtered = courses.filter(c =>
    !search ||
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    `${c.practitioner?.firstName} ${c.practitioner?.lastName}`.toLowerCase().includes(search.toLowerCase())
  )

  const activeYtUrl = activeVideo ? getYouTubeEmbedUrl(activeVideo.videoUrl) : null

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
                  <option value="beginner">Beginner Plan &amp; above (₹51/mo)</option>
                  <option value="advance">Advance Plan &amp; above (₹151/mo)</option>
                  <option value="champion">Champion Plan (₹1,500/mo)</option>
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

      {/* ─── Admin Course Videos Preview & Download Modal ────────────────────── */}
      {videoModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }} onClick={() => setVideoModal(null)}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 24,
            width: '100%',
            maxWidth: '1100px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          }} onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              background: '#0F172A',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #1E293B',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ background: '#3B82F6', color: '#FFFFFF', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
                    ADMIN COURSE INSPECTOR
                  </span>
                  <span style={{ color: '#94A3B8', fontSize: 12 }}>
                    by Dr. {videoModal.practitioner?.firstName} {videoModal.practitioner?.lastName} ({videoModal.practitioner?.email})
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#FFFFFF' }}>
                  {videoModal.title}
                </h3>
              </div>

              <button
                onClick={() => setVideoModal(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: 10,
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: 18,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#EF4444'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <FiX />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'grid',
              gridTemplateColumns: videoModal.videos?.length ? '1.4fr 1fr' : '1fr',
              gap: 24,
            }}>
              {/* Left Column: Active Video Player & Download Controls */}
              <div>
                {activeVideo ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Video Player Container */}
                    <div style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      background: '#000000',
                      borderRadius: 16,
                      overflow: 'hidden',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {activeYtUrl ? (
                        <iframe
                          src={activeYtUrl}
                          title={activeVideo.title}
                          style={{ width: '100%', height: '100%', border: 'none' }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : activeVideo.videoUrl ? (
                        <video
                          key={activeVideo.videoUrl}
                          src={activeVideo.videoUrl}
                          controls
                          autoPlay
                          style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
                        />
                      ) : (
                        <div style={{ color: '#94A3B8', textAlign: 'center', padding: 20 }}>
                          <FiVideo size={48} style={{ marginBottom: 12, color: '#64748B' }} />
                          <div>No video stream URL available for this lecture.</div>
                        </div>
                      )}
                    </div>

                    {/* Active Video Info & Download Actions */}
                    <div style={{
                      background: '#F8FAFC',
                      borderRadius: 16,
                      padding: '18px 20px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                            {activeVideo.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#64748B', fontSize: 12 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <FiClock size={13} color="#3B82F6" /> {formatDuration(activeVideo.durationSeconds)}
                            </span>
                            {activeVideo.createdAt && (
                              <span>Uploaded: {fmtDate(activeVideo.createdAt)}</span>
                            )}
                          </div>
                        </div>

                        {/* Download Video Button */}
                        {activeVideo.videoUrl && (
                          <button
                            onClick={() => downloadVideoHelper(activeVideo.videoUrl, `${videoModal.title} - ${activeVideo.title}`)}
                            style={{
                              background: 'linear-gradient(135deg, #10B981, #059669)',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: 10,
                              padding: '10px 16px',
                              fontWeight: 700,
                              fontSize: 13,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                              flexShrink: 0,
                              transition: 'transform 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            title="Download this video to your computer"
                          >
                            <FiDownload size={15} /> Download Video
                          </button>
                        )}
                      </div>

                      {activeVideo.description && (
                        <p style={{ margin: 0, color: '#475569', fontSize: 13, lineHeight: 1.5 }}>
                          {activeVideo.description}
                        </p>
                      )}

                      {/* Video Stream URL Link */}
                      {activeVideo.videoUrl && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#64748B', borderTop: '1px solid #E2E8F0', paddingTop: 10 }}>
                          <span style={{ fontWeight: 600 }}>Stream URL:</span>
                          <a
                            href={activeVideo.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#2563EB', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '350px' }}
                          >
                            {activeVideo.videoUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: '#F8FAFC',
                    borderRadius: 16,
                    padding: '40px 20px',
                    border: '1.5px dashed #CBD5E1',
                    textAlign: 'center',
                    color: '#64748B',
                  }}>
                    <FiVideo size={48} style={{ color: '#94A3B8', marginBottom: 12 }} />
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#0F172A', marginBottom: 4 }}>
                      No Videos in this Course
                    </div>
                    <div style={{ fontSize: 13 }}>
                      The practitioner has not uploaded any video lectures to this course yet.
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Course Video Lectures List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ margin: 0, color: '#0F172A', fontSize: 15, fontWeight: 800 }}>
                    Course Lectures ({videoModal.videos?.length || 0})
                  </h4>
                  <span style={{ fontSize: 12, color: '#64748B' }}>
                    Click to preview or download
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  maxHeight: '460px',
                  overflowY: 'auto',
                  paddingRight: 4,
                }}>
                  {videoModal.videos && videoModal.videos.length > 0 ? (
                    videoModal.videos.map((vid, idx) => {
                      const isCurrent = activeVideo?._id === vid._id || (activeVideo?.videoUrl && activeVideo.videoUrl === vid.videoUrl)
                      return (
                        <div
                          key={vid._id || idx}
                          onClick={() => setActiveVideo(vid)}
                          style={{
                            background: isCurrent ? '#EFF6FF' : '#FFFFFF',
                            border: isCurrent ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                            borderRadius: 12,
                            padding: '12px 14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                            transition: 'all 0.15s',
                            boxShadow: isCurrent ? '0 2px 8px rgba(59, 130, 246, 0.15)' : 'none',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                            <div style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: isCurrent ? '#3B82F6' : '#F1F5F9',
                              color: isCurrent ? '#FFFFFF' : '#64748B',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 12,
                              flexShrink: 0,
                            }}>
                              {isCurrent ? <FiPlay size={14} /> : idx + 1}
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{
                                fontWeight: 700,
                                fontSize: 13,
                                color: isCurrent ? '#1D4ED8' : '#0F172A',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                {vid.title}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748B', fontSize: 11, marginTop: 2 }}>
                                <span>{formatDuration(vid.durationSeconds)}</span>
                                {vid.views !== undefined && <span>• {vid.views} views</span>}
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions for this item */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={e => e.stopPropagation()}>
                            {vid.videoUrl && (
                              <button
                                onClick={() => downloadVideoHelper(vid.videoUrl, `${videoModal.title} - ${vid.title}`)}
                                style={{
                                  background: '#10B981',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: 8,
                                  width: 32,
                                  height: 32,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                                }}
                                title="Download this video"
                              >
                                <FiDownload size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div style={{ padding: 20, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                      No videos uploaded for this course.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 24px',
              background: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ color: '#64748B', fontSize: 12 }}>
                Course Status: <strong>{videoModal.status}</strong> • Pricing: <strong>{videoModal.isFree || !videoModal.price ? 'Free Course' : `₹${videoModal.price}`}</strong>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => {
                    const c = videoModal
                    setVideoModal(null)
                    setAssignModal(c)
                    setSelectedPlan(c.requiredPlan || '')
                    setSelectedStatus(c.status || 'published')
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: 8,
                    color: '#334155',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Change Plan Tier
                </button>
                <button
                  onClick={() => setVideoModal(null)}
                  style={{
                    padding: '8px 18px',
                    background: '#0F172A',
                    border: 'none',
                    borderRadius: 8,
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Close Inspector
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Course Search & Refresh Bar */}
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

      {/* Courses Data Table */}
      <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
        <DataTable
          loading={loading}
          emptyMessage="No courses uploaded by practitioners yet"
          columns={[
            { key: 'course', label: 'Course Title', render: r => (
              <div>
                <div style={{ color: '#0F172A', fontWeight: 700 }}>{r.title}</div>
                <button
                  onClick={() => handleOpenVideos(r)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 4,
                    background: r.videos?.length ? '#EFF6FF' : '#F1F5F9',
                    color: r.videos?.length ? '#2563EB' : '#64748B',
                    border: r.videos?.length ? '1px solid #BFDBFE' : '1px solid #CBD5E1',
                    borderRadius: 12,
                    padding: '2px 8px',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  title="Click to view and download all course videos"
                >
                  <FiVideo size={12} /> {r.videos?.length || 0} videos (Preview &amp; Download)
                </button>
              </div>
            )},
            { key: 'practitioner', label: 'Practitioner (Creator)', render: r => (
              <div>
                <div style={{ color: '#0F172A', fontWeight: 600 }}>Dr. {r.practitioner?.firstName} {r.practitioner?.lastName}</div>
                <div style={{ color: '#64748B', fontSize: 11 }}>{r.practitioner?.email}</div>
              </div>
            )},
            { key: 'requiredPlan', label: 'Assigned Subscription Plan', render: r => r.requiredPlan ? (
              <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#F3E8FF', color: '#7E22CE', border: '1px solid #E9D5FF' }}>
                {r.requiredPlan === 'beginner' ? 'Beginner Plan (₹51)' : r.requiredPlan === 'advance' ? 'Advance Plan (₹151)' : r.requiredPlan === 'champion' ? 'Champion Plan (₹1,500)' : `${r.requiredPlan} Plan`}
              </span>
            ) : (
              <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0' }}>
                Free Access
              </span>
            )},
            { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
            { key: 'createdAt', label: 'Uploaded', render: r => fmtDate(r.createdAt) },
            { key: 'action', label: 'Admin Action', render: r => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => handleOpenVideos(r)}
                  style={{
                    padding: '6px 12px',
                    background: '#0F172A',
                    border: 'none',
                    borderRadius: 8,
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    boxShadow: '0 2px 6px rgba(15,23,42,0.2)',
                  }}
                  title="Preview & Download Course Videos"
                >
                  <FiVideo size={13} /> Videos ({r.videos?.length || 0})
                </button>
                <button
                  onClick={() => { setAssignModal(r); setSelectedPlan(r.requiredPlan || ''); setSelectedStatus(r.status || 'published') }}
                  style={{
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                    border: 'none',
                    borderRadius: 8,
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  Plan Tier
                </button>
              </div>
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
  const [planModal, setPlanModal] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState('trial')
  const [extendDays, setExtendDays] = useState('')
  const [updatingPlan, setUpdatingPlan] = useState(false)
  const [deleteModal, setDeleteModal] = useState(null)
  const [deletingUser, setDeletingUser] = useState(false)

  // Payment History Modal state
  const [historyModal, setHistoryModal] = useState(null)
  const [historyData, setHistoryData] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyTab, setHistoryTab] = useState('payouts') // 'payouts' | 'logs'

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiConnector('GET', `/api/v1/admin/practitioners?search=${search}&limit=100`, null, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) setPractitioners(res.data.practitioners)
    } catch (e) { toast.error('Failed to load practitioners') }
    setLoading(false)
  }, [token, search])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (historyModal?._id) {
      setHistoryLoading(true)
      apiConnector('GET', `/api/v1/admin/practitioners/${historyModal._id}/payment-history`, null, { Authorization: `Bearer ${token}` })
        .then(res => {
          if (res?.data?.success) setHistoryData(res.data)
        })
        .catch(() => toast.error('Failed to load practitioner payment history'))
        .finally(() => setHistoryLoading(false))
    }
  }, [historyModal, token])

  const handleUpdatePlan = async () => {
    setUpdatingPlan(true)
    try {
      const res = await apiConnector('PATCH', `/api/v1/admin/clients/${planModal._id}/plan`, {
        planKey: selectedPlan,
        extendTrialDays: Number(extendDays) || 0,
      }, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) {
        toast.success('Practitioner plan updated successfully')
        setPlanModal(null)
        load()
      }
    } catch (e) { toast.error('Failed to update plan') }
    setUpdatingPlan(false)
  }

  const handlePayout = async () => {
    const hasBankDetails = !!((payoutModal?.profile?.bankAccountNumber && payoutModal?.profile?.bankIfscCode) || payoutModal?.profile?.upiId)
    if (!hasBankDetails) {
      return toast.error('Cannot process payout: Practitioner has not added bank account or UPI details yet.')
    }
    const amountNum = Number(payoutAmount)
    if (!payoutAmount || isNaN(amountNum) || amountNum <= 0) {
      return toast.error('Please enter a valid positive payout amount.')
    }
    if (amountNum > (payoutModal?.salaryOwed || 0)) {
      return toast.error(`Payout amount (${fmt(amountNum)}) cannot exceed pending salary owed (${fmt(payoutModal.salaryOwed)}).`)
    }

    setPayingOut(true)
    try {
      const res = await apiConnector('POST', '/api/v1/admin/payout', {
        practitionerId: payoutModal._id,
        amount: amountNum,
      }, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) {
        toast.success(res.data.message)
        setPayoutModal(null)
        setPayoutAmount('')
        load()
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Payout failed')
    }
    setPayingOut(false)
  }

  const handleHardDelete = async () => {
    if (!deleteModal) return
    setDeletingUser(true)
    try {
      const res = await apiConnector('DELETE', `/api/v1/admin/users/${deleteModal._id}`, null, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) {
        toast.success(res.data.message || 'Practitioner permanently deleted from database')
        setDeleteModal(null)
        load()
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to hard delete practitioner')
    }
    setDeletingUser(false)
  }

  const hasBankDetails = !!((payoutModal?.profile?.bankAccountNumber && payoutModal?.profile?.bankIfscCode) || payoutModal?.profile?.upiId)
  const amountNum = Number(payoutAmount)
  const isAmountValid = !isNaN(amountNum) && amountNum > 0 && amountNum <= (payoutModal?.salaryOwed || 0)
  const canSubmitPayout = hasBankDetails && (payoutModal?.salaryOwed > 0) && isAmountValid

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Plan Override Modal for Practitioner */}
      {planModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 32, width: 460, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 4px', color: '#0F172A', fontSize: 18, fontWeight: 800 }}>Manage Practitioner Plan &amp; Trial — Dr. {planModal.firstName} {planModal.lastName}</h3>
            <p style={{ margin: '0 0 16px', color: '#64748B', fontSize: 13 }}>Current status: <strong style={{ color: '#1F5FE0' }}>{planModal.planDisplayStatus || (planModal.hasActiveSub ? 'Subscribed' : planModal.isTrialActive ? `14-Day Trial (${planModal.trialDaysRemaining}d left)` : 'Trial Expired')}</strong></p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', color: '#475569', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Assign Practitioner Plan</label>
                <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)}
                  style={{ width: '100%', background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: 10, padding: '10px 14px', color: '#0F172A', fontSize: 14, outline: 'none' }}>
                  <option value="trial">Keep Active 14-Day Free Trial</option>
                  <option value="starter">Starter Plan (₹999/mo)</option>
                  <option value="growth">Growth Plan (₹2,999/mo)</option>
                  <option value="master">Master Plan (₹5,999/mo)</option>
                  <option value="none">No Active Plan (Trial Expired)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#475569', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Extend Trial (Days)</label>
                <input type="number" value={extendDays} onChange={e => setExtendDays(e.target.value)}
                  placeholder="e.g. 14"
                  style={{ width: '100%', background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: 10, padding: '10px 14px', color: '#0F172A', fontSize: 14, outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setPlanModal(null)}
                style={{ flex: 1, padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: 10, color: '#64748B', cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={handleUpdatePlan} disabled={updatingPlan}
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                {updatingPlan ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Modal */}
      {payoutModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 32, width: 460, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 4px', color: '#0F172A', fontSize: 18, fontWeight: 800 }}>Pay Salary — Dr. {payoutModal.firstName} {payoutModal.lastName}</h3>
            <p style={{ margin: '0 0 16px', color: '#64748B', fontSize: 13 }}>Pending salary owed: <strong style={{ color: payoutModal.salaryOwed > 0 ? '#D97706' : '#64748B' }}>{fmt(payoutModal.salaryOwed)}</strong></p>

            {/* Missing Bank Details Banner */}
            {!hasBankDetails && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, padding: '12px 16px', margin: '0 0 16px', color: '#991B1B', fontSize: 13, fontWeight: 600 }}>
                ⚠️ Payout Disabled: Practitioner has not added bank details or UPI ID. Ask practitioner to update profile before paying.
              </div>
            )}

            {/* Zero Salary Owed Banner */}
            {hasBankDetails && payoutModal.salaryOwed <= 0 && (
              <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 12, padding: '12px 16px', margin: '0 0 16px', color: '#475569', fontSize: 13, fontWeight: 600 }}>
                ℹ️ No Pending Balance: Dr. {payoutModal.firstName} {payoutModal.lastName} currently has no pending salary balance owed.
              </div>
            )}

            {/* Practitioner Bank & UPI Details */}
            <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '14px 16px', margin: '0 0 20px', border: '1px solid #E2E8F0', fontSize: 13 }}>
              <div style={{ color: '#1F5FE0', fontWeight: 700, marginBottom: 8 }}>Practitioner Payout Info:</div>
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
                <div style={{ color: '#DC2626', fontWeight: 600 }}>❌ Bank Account &amp; UPI ID not added.</div>
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#475569', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Amount to Pay (₹)</label>
              <input type="number" value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)}
                disabled={!hasBankDetails || payoutModal.salaryOwed <= 0}
                placeholder={`Max: ${fmt(payoutModal.salaryOwed)}`}
                style={{ width: '100%', background: '#FFFFFF', border: `1.5px solid ${payoutAmount && amountNum > (payoutModal.salaryOwed || 0) ? '#EF4444' : '#CBD5E1'}`, borderRadius: 10, padding: '10px 14px', color: '#0F172A', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
              {payoutAmount && amountNum > (payoutModal.salaryOwed || 0) && (
                <div style={{ color: '#DC2626', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                  ⚠️ Amount cannot exceed pending salary owed ({fmt(payoutModal.salaryOwed)})
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setPayoutModal(null); setPayoutAmount('') }}
                style={{ flex: 1, padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: 10, color: '#64748B', cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={handlePayout} disabled={!canSubmitPayout || payingOut}
                style={{
                  flex: 1, padding: '12px',
                  background: canSubmitPayout ? 'linear-gradient(135deg, #10B981, #059669)' : '#CBD5E1',
                  border: 'none', borderRadius: 10, color: '#fff',
                  cursor: canSubmitPayout ? 'pointer' : 'not-allowed',
                  fontWeight: 700, opacity: payingOut ? 0.7 : 1
                }}>
                {payingOut ? 'Processing...' : 'Mark as Paid ✓'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Practitioner Payment & Payout History Modal */}
      {historyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, padding: 28, width: 840, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, color: '#0F172A', fontSize: 20, fontWeight: 800 }}>📜 Payment &amp; Payout History</h3>
                <div style={{ color: '#64748B', fontSize: 13, marginTop: 2 }}>
                  Dr. <strong>{historyModal.firstName} {historyModal.lastName}</strong> ({historyModal.email})
                </div>
              </div>
              <button onClick={() => { setHistoryModal(null); setHistoryData(null) }}
                style={{ width: 36, height: 36, borderRadius: '50%', background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#0F172A', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>
                ✕
              </button>
            </div>

            {/* Summary Stat Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
              <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>TOTAL GROSS EARNED</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#10B981', marginTop: 4 }}>{fmt(historyData?.totalEarned || historyModal.grossGenerated || 0)}</div>
              </div>
              <div style={{ background: '#FFFBEB', padding: 14, borderRadius: 12, border: '1px solid #FDE68A' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#B45309' }}>PENDING SALARY OWED</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#D97706', marginTop: 4 }}>{fmt(historyData?.pendingSalaryOwed || historyModal.salaryOwed || 0)}</div>
              </div>
              <div style={{ background: '#F3E8FF', padding: 14, borderRadius: 12, border: '1px solid #E9D5FF' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7E22CE' }}>DISBURSED PAYOUTS</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#8B5CF6', marginTop: 4 }}>{historyData?.payouts?.length || 0} Settled</div>
              </div>
            </div>

            {/* History Tabs */}
            <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid #E2E8F0', paddingBottom: 10, marginBottom: 16 }}>
              <button onClick={() => setHistoryTab('payouts')}
                style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: historyTab === 'payouts' ? '#2563EB' : '#F1F5F9', color: historyTab === 'payouts' ? '#FFF' : '#475569', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Disbursed Salary Payouts ({historyData?.payouts?.length || 0})
              </button>
              <button onClick={() => setHistoryTab('logs')}
                style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: historyTab === 'logs' ? '#2563EB' : '#F1F5F9', color: historyTab === 'logs' ? '#FFF' : '#475569', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Learner Payment Logs ({historyData?.paymentLogs?.length || 0})
              </button>
            </div>

            {historyLoading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#64748B', fontWeight: 600 }}>Loading payment history...</div>
            ) : historyTab === 'payouts' ? (
              historyData?.payouts?.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: 700 }}>Settlement Date</th>
                      <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: 700 }}>Disbursed Amount</th>
                      <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: 700 }}>Payout Method</th>
                      <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: 700 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.payouts.map(p => (
                      <tr key={p._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 12px', color: '#475569' }}>{new Date(p.createdAt || p.settledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 800, color: '#10B981' }}>{fmt(p.amount)}</td>
                        <td style={{ padding: '10px 12px', color: '#475569', textTransform: 'capitalize' }}>{p.payoutMethod?.replace('_', ' ') || 'Bank Payout'}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: '#DCFCE7', color: '#15803D' }}>{p.status?.toUpperCase() || 'SETTLED'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: 30, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>No disbursed payout records logged for this practitioner.</div>
              )
            ) : (
              historyData?.paymentLogs?.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: 700 }}>Date</th>
                      <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: 700 }}>Learner / Client</th>
                      <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: 700 }}>Type</th>
                      <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: 700 }}>Gross Fee</th>
                      <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: 700 }}>Practitioner Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.paymentLogs.map(l => (
                      <tr key={l._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 12px', color: '#475569' }}>{new Date(l.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0F172A' }}>{l.client ? `${l.client.firstName} ${l.client.lastName}` : l.clientName || 'Learner'}</td>
                        <td style={{ padding: '10px 12px', color: '#475569', textTransform: 'capitalize' }}>{l.paymentType?.replace('_', ' ') || 'Payment'}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0F172A' }}>{fmt(l.amount)}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 800, color: '#10B981' }}>{fmt(l.amountOwedToPractitioner || l.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: 30, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>No learner transaction logs logged for this practitioner.</div>
              )
            )}
          </div>
        </div>
      )}

      {/* Admin Hard Delete Confirmation Modal for Practitioner */}
      {deleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #FECDD3', borderRadius: 24, padding: 32, width: 480, maxWidth: '90vw', boxShadow: '0 25px 60px rgba(0,0,0,0.25)', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiAlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#991B1B', fontSize: 18, fontWeight: 800 }}>Permanently Hard Delete Practitioner?</h3>
                <p style={{ margin: '2px 0 0', color: '#DC2626', fontSize: 12, fontWeight: 600 }}>Irreversible database purge</p>
              </div>
            </div>

            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 16px', marginBottom: 18, fontSize: 13, color: '#991B1B', lineHeight: 1.55 }}>
              Are you sure you want to permanently delete Dr. <strong>{deleteModal.firstName} {deleteModal.lastName}</strong> (<code>{deleteModal.email}</code>)?
              <div style={{ marginTop: 8, fontSize: 12, color: '#7F1D1D' }}>
                ⚠️ This will completely remove their practitioner profile, uploaded courses, circle memberships, notes, reviews, and MongoDB database records. This cannot be undone.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteModal(null)} disabled={deletingUser}
                style={{ flex: 1, padding: '12px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 10, color: '#475569', cursor: deletingUser ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 13 }}>
                Cancel
              </button>
              <button onClick={handleHardDelete} disabled={deletingUser}
                style={{ flex: 1.5, padding: '12px', background: 'linear-gradient(135deg, #EF4444, #DC2626)', border: 'none', borderRadius: 10, color: '#fff', cursor: deletingUser ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 14px rgba(220,38,38,0.35)' }}>
                <FiTrash2 size={15} /> {deletingUser ? 'Hard Deleting...' : 'Confirm Hard Delete'}
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
            { key: 'plan', label: 'Plan / Free Trial', render: r => {
              if (r.isDeleted) {
                return (
                  <span style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA'
                  }}>
                    ⚠️ Deletion in {r.deletionDaysLeft || 0}d
                  </span>
                )
              }
              return (
                <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: r.hasActiveSub ? '#DCFCE7' : r.isTrialActive ? '#F3E8FF' : '#FEE2E2', color: r.hasActiveSub ? '#166534' : r.isTrialActive ? '#7E22CE' : '#DC2626', border: `1px solid ${r.hasActiveSub ? '#BBF7D0' : r.isTrialActive ? '#E9D5FF' : '#FCA5A5'}` }}>
                  {r.planDisplayStatus || (r.isTrialActive ? `14-Day Trial (${r.trialDaysRemaining}d left)` : 'Trial Expired')}
                </span>
              )
            }},
            { key: 'sessions', label: 'Sessions', render: r => r.sessionsDelivered || 0 },
            { key: 'courses', label: 'Courses', render: r => r.coursesCount || 0 },
            { key: 'grossGenerated', label: 'Gross Generated', render: r => <span style={{ color: '#10B981', fontWeight: 700 }}>{fmt(r.grossGenerated || 0)}</span> },
            { key: 'salaryOwed', label: 'Salary Owed', render: r => <span style={{ color: r.salaryOwed > 0 ? '#D97706' : '#64748B', fontWeight: 700 }}>{fmt(r.salaryOwed)}</span> },
            { key: 'action', label: 'Actions', render: r => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <button onClick={() => { setPayoutModal(r); setPayoutAmount(String(r.salaryOwed || '')) }}
                  style={{ padding: '6px 10px', background: r.salaryOwed > 0 ? 'linear-gradient(135deg, #10B981, #059669)' : '#F1F5F9', border: 'none', borderRadius: 8, color: r.salaryOwed > 0 ? '#fff' : '#94A3B8', cursor: r.salaryOwed > 0 ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: 11 }}>
                  Pay Salary
                </button>
                <button onClick={() => setHistoryModal(r)}
                  style={{ padding: '6px 10px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, color: '#1D4ED8', cursor: 'pointer', fontWeight: 700, fontSize: 11 }}>
                  📜 History
                </button>
                <button onClick={() => setDeleteModal(r)}
                  title="Permanently hard delete practitioner from database"
                  style={{ padding: '6px 10px', background: '#FEF2F2', border: '1px solid #FECDD3', borderRadius: 8, color: '#DC2626', cursor: 'pointer', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiTrash2 size={12} /> Hard Delete
                </button>
              </div>
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

// ─── Coupons & Discounts Management Tab ───────────────────────────────────────
function CouponsTab() {
  const { token } = useSelector(s => s.auth)
  const [coupons, setCoupons] = useState([])
  const [stats, setStats] = useState(null)
  const [usages, setUsages] = useState([])
  const [loading, setLoading] = useState(true)
  const [subView, setSubView] = useState('all') // 'all' | 'settings' | 'usages'
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [appFilter, setAppFilter] = useState('')

  // Modal
  const [modal, setModal] = useState(null)
  const [formCode, setFormCode] = useState('')
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formPct, setFormPct] = useState('20')
  const [formAppTo, setFormAppTo] = useState('both')
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0])
  const [formExpiryDate, setFormExpiryDate] = useState('')
  const [formUsageLimit, setFormUsageLimit] = useState('')
  const [formPerUserLimit, setFormPerUserLimit] = useState('1')
  const [formMinOrder, setFormMinOrder] = useState('')
  const [formMaxDiscount, setFormMaxDiscount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Stacking settings form
  const [allowStacking, setAllowStacking] = useState(true)
  const [stackingPriority, setStackingPriority] = useState('personal_first')
  const [allowAdminPractitioner, setAllowAdminPractitioner] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)

  // Delete modal
  const [deleteModal, setDeleteModal] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [allRes, statsRes, usagesRes] = await Promise.all([
        apiConnector('GET', `/api/v1/coupons/admin/all?search=${search}&type=${typeFilter}&applicableTo=${appFilter}`, null, { Authorization: `Bearer ${token}` }),
        apiConnector('GET', '/api/v1/coupons/admin/analytics', null, { Authorization: `Bearer ${token}` }),
        apiConnector('GET', '/api/v1/coupons/admin/usages', null, { Authorization: `Bearer ${token}` }),
      ])
      if (allRes?.data?.success) setCoupons(allRes.data.coupons || [])
      if (statsRes?.data?.success) {
        setStats(statsRes.data.analytics)
        setAllowStacking(statsRes.data.settings?.allowStacking ?? true)
        setStackingPriority(statsRes.data.settings?.stackingPriority || 'personal_first')
        setAllowAdminPractitioner(statsRes.data.settings?.allowAdminPractitionerStacking ?? true)
      }
      if (usagesRes?.data?.success) setUsages(usagesRes.data.usages || [])
    } catch (e) {
      toast.error('Failed to load coupons')
    }
    setLoading(false)
  }, [token, search, typeFilter, appFilter])

  useEffect(() => { load() }, [load])

  const openCreateModal = () => {
    setFormCode('')
    setFormName('')
    setFormDesc('')
    setFormPct('20')
    setFormAppTo('both')
    setFormStartDate(new Date().toISOString().split('T')[0])
    setFormExpiryDate('')
    setFormUsageLimit('')
    setFormPerUserLimit('1')
    setFormMinOrder('')
    setFormMaxDiscount('')
    setModal({ isEdit: false })
  }

  const openEditModal = (c) => {
    setFormCode(c.code)
    setFormName(c.name)
    setFormDesc(c.description || '')
    setFormPct(String(c.discountValue))
    setFormAppTo(c.applicableTo || 'both')
    setFormStartDate(c.startDate ? new Date(c.startDate).toISOString().split('T')[0] : '')
    setFormExpiryDate(c.expiryDate ? new Date(c.expiryDate).toISOString().split('T')[0] : '')
    setFormUsageLimit(c.usageLimit ? String(c.usageLimit) : '')
    setFormPerUserLimit(String(c.perUserLimit || 1))
    setFormMinOrder(c.minOrderAmount ? String(c.minOrderAmount) : '')
    setFormMaxDiscount(c.maxDiscountAmount ? String(c.maxDiscountAmount) : '')
    setModal({ isEdit: true, data: c })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formCode.trim() || !formName.trim() || !formPct) {
      return toast.error('Code, Name, and Discount % are required')
    }
    setSubmitting(true)
    const payload = {
      code: formCode.trim().toUpperCase(),
      name: formName.trim(),
      description: formDesc.trim(),
      discountValue: Number(formPct),
      applicableTo: formAppTo,
      startDate: formStartDate ? new Date(formStartDate) : new Date(),
      expiryDate: formExpiryDate ? new Date(formExpiryDate) : null,
      usageLimit: formUsageLimit ? Number(formUsageLimit) : null,
      perUserLimit: Number(formPerUserLimit) || 1,
      minOrderAmount: formMinOrder ? Number(formMinOrder) : 0,
      maxDiscountAmount: formMaxDiscount ? Number(formMaxDiscount) : null,
    }

    try {
      if (modal?.isEdit) {
        const res = await apiConnector('PUT', `/api/v1/coupons/admin/${modal.data._id}`, payload, { Authorization: `Bearer ${token}` })
        if (res?.data?.success) {
          toast.success('Coupon updated successfully')
          setModal(null)
          load()
        }
      } else {
        const res = await apiConnector('POST', '/api/v1/coupons/admin/create', payload, { Authorization: `Bearer ${token}` })
        if (res?.data?.success) {
          toast.success(res.data.message || 'Admin coupon created')
          setModal(null)
          load()
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save coupon')
    }
    setSubmitting(false)
  }

  const handleToggle = async (c) => {
    try {
      const res = await apiConnector('PATCH', `/api/v1/coupons/toggle/${c._id}`, null, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) {
        toast.success(res.data.message)
        load()
      }
    } catch (e) {
      toast.error('Failed to toggle status')
    }
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    try {
      const res = await apiConnector('DELETE', `/api/v1/coupons/admin/${deleteModal._id}`, null, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) {
        toast.success(res.data.message || 'Coupon deleted')
        setDeleteModal(null)
        load()
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to delete coupon')
    }
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    setSavingSettings(true)
    try {
      const res = await apiConnector('POST', '/api/v1/coupons/admin/settings', {
        allowStacking,
        stackingPriority,
        allowAdminPractitionerStacking: allowAdminPractitioner,
      }, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) {
        toast.success('Stacking & priority rules saved!')
      }
    } catch (e) {
      toast.error('Failed to save settings')
    }
    setSavingSettings(false)
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.success(`Copied '${code}' to clipboard!`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI Stats Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <KpiCard icon={<FiTag />} label="Total Coupons" value={stats?.totalCoupons || coupons.length} subLabel="Platform + Practitioner" color="#3B82F6" />
        <KpiCard icon={<FiCheck />} label="Active Coupons" value={stats?.activeCoupons || 0} subLabel="Currently usable" color="#10B981" />
        <KpiCard icon={<FiUsers />} label="Total Redemptions" value={stats?.totalUsages || 0} subLabel="Learners discounted" color="#F59E0B" />
        <KpiCard icon={<FiDollarSign />} label="Discount Generated" value={fmt(stats?.totalDiscountGiven || 0)} subLabel="Learner savings" color="#8B5CF6" />
      </div>

      {/* Sub Navigation Bar & Search */}
      <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setSubView('all')}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: subView === 'all' ? 700 : 500,
              background: subView === 'all' ? '#EFF6FF' : 'transparent',
              color: subView === 'all' ? '#1D4ED8' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <FiTag /> Coupons Catalog ({coupons.length})
          </button>
          <button
            onClick={() => setSubView('settings')}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: subView === 'settings' ? 700 : 500,
              background: subView === 'settings' ? '#F3E8FF' : 'transparent',
              color: subView === 'settings' ? '#7C3AED' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <FiSliders /> Stacking &amp; Rules
          </button>
          <button
            onClick={() => setSubView('usages')}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: subView === 'usages' ? 700 : 500,
              background: subView === 'usages' ? '#ECFDF5' : 'transparent',
              color: subView === 'usages' ? '#059669' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <FiClock /> Redemption Ledger ({usages.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {subView === 'all' && (
            <>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, color: '#0F172A', outline: 'none' }}
              >
                <option value="">All Types</option>
                <option value="admin">Platform Admin</option>
                <option value="practitioner">Practitioner</option>
              </select>
              <select
                value={appFilter}
                onChange={e => setAppFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, color: '#0F172A', outline: 'none' }}
              >
                <option value="">All Products</option>
                <option value="both">Courses &amp; Sessions</option>
                <option value="courses">Courses Only</option>
                <option value="sessions">Sessions Only</option>
              </select>
              <div style={{ position: 'relative', width: 220 }}>
                <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search code or name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <button
                onClick={openCreateModal}
                style={{
                  padding: '8px 18px',
                  background: 'linear-gradient(135deg, #1F5FE0, #1D4ED8)',
                  border: 'none',
                  borderRadius: 10,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 12px rgba(31,95,224,0.25)',
                }}
              >
                <FiPlus size={15} /> Create Admin Coupon
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sub-view 1: Coupons Catalog Table */}
      {subView === 'all' && (
        <DataTable
          loading={loading}
          columns={[
            {
              key: 'code',
              label: 'Coupon Code',
              render: r => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 800, color: '#1D4ED8', background: '#EFF6FF', padding: '4px 8px', borderRadius: 6, letterSpacing: 0.5 }}>
                    {r.code}
                  </span>
                  <button onClick={() => copyCode(r.code)} title="Copy code" style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 2 }}>
                    <FiCopy size={13} />
                  </button>
                </div>
              ),
            },
            {
              key: 'name',
              label: 'Campaign Name',
              render: r => (
                <div>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>{r.name}</div>
                  {r.description && <div style={{ fontSize: 11, color: '#94A3B8', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</div>}
                </div>
              ),
            },
            {
              key: 'couponType',
              label: 'Creator Type',
              render: r => (
                <span style={{
                  display: 'inline-block',
                  padding: '3px 8px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  background: r.couponType === 'admin' ? '#EDE9FE' : '#FEF3C7',
                  color: r.couponType === 'admin' ? '#6D28D9' : '#B45309',
                }}>
                  {r.couponType === 'admin' ? 'Platform Admin' : `Practitioner (${r.practitioner?.firstName || 'User'})`}
                </span>
              ),
            },
            {
              key: 'discountValue',
              label: 'Discount',
              render: r => (
                <span style={{ fontWeight: 800, color: '#059669', background: '#ECFDF5', padding: '3px 8px', borderRadius: 20 }}>
                  {r.discountValue}% OFF
                </span>
              ),
            },
            {
              key: 'applicableTo',
              label: 'Applies To',
              render: r => (
                <span style={{ textTransform: 'capitalize', color: '#475569', fontWeight: 600 }}>
                  {r.applicableTo === 'both' ? 'Courses & Sessions' : r.applicableTo}
                </span>
              ),
            },
            {
              key: 'validity',
              label: 'Validity',
              render: r => (
                <span style={{ fontSize: 12, color: '#64748B' }}>
                  {fmtDate(r.startDate)} → {fmtDate(r.expiryDate)}
                </span>
              ),
            },
            {
              key: 'usedCount',
              label: 'Redemptions',
              render: r => (
                <span>
                  <strong style={{ color: '#0F172A' }}>{r.usedCount || 0}</strong>
                  <span style={{ color: '#94A3B8' }}> / {r.usageLimit || '∞'}</span>
                </span>
              ),
            },
            {
              key: 'isActive',
              label: 'Status',
              render: r => (
                <button
                  onClick={() => handleToggle(r)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 12,
                    fontWeight: 700,
                    color: r.isActive ? '#10B981' : '#94A3B8',
                  }}
                >
                  {r.isActive ? <FiToggleRight size={22} color="#10B981" /> : <FiToggleLeft size={22} color="#94A3B8" />}
                  {r.isActive ? 'Active' : 'Disabled'}
                </button>
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              render: r => (
                <div style={{ display: 'flex', gap: 6 }}>
                  {r.couponType === 'admin' && (
                    <button onClick={() => openEditModal(r)} title="Edit Coupon" style={{ padding: '6px 10px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 6, color: '#475569', cursor: 'pointer' }}>
                      <FiEdit2 size={13} />
                    </button>
                  )}
                  <button onClick={() => setDeleteModal(r)} title="Delete Coupon" style={{ padding: '6px 10px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, color: '#DC2626', cursor: 'pointer' }}>
                    <FiTrash2 size={13} />
                  </button>
                </div>
              ),
            },
          ]}
          data={coupons}
        />
      )}

      {/* Sub-view 2: Stacking & Priority Settings */}
      {subView === 'settings' && (
        <div style={{ background: '#FFFFFF', borderRadius: 20, padding: 32, border: '1px solid #E2E8F0', maxWidth: 700, boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#F3E8FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              <FiSliders />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A' }}>Coupon Stacking &amp; Priority Engine</h3>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748B' }}>Configure how multiple discounts interact during student checkout</p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Allow Stacking Toggle */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A', marginBottom: 2 }}>Enable Coupon Stacking</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>When enabled, learners can combine Practitioner + Admin coupons or Personal Discounts</div>
              </div>
              <input
                type="checkbox"
                checked={allowStacking}
                onChange={e => setAllowStacking(e.target.checked)}
                style={{ width: 22, height: 22, cursor: 'pointer' }}
              />
            </div>

            {/* Stacking Priority Dropdown */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                Discount Application Priority Order
              </label>
              <select
                value={stackingPriority}
                onChange={e => setStackingPriority(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #CBD5E1', fontSize: 14, outline: 'none', background: '#fff' }}
              >
                <option value="personal_first">Option A: Personal Learner Discount First → Practitioner Coupon → Admin Coupon (Recommended)</option>
                <option value="admin_first">Option B: Admin Platform Coupon First → Practitioner Coupon</option>
                <option value="best_discount">Option C: Highest Single Discount Only (Stacking Bypassed)</option>
              </select>
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 6, margin: '6px 0 0' }}>
                Example with Option A: On a ₹10,000 course with 30% Personal Grant + 20% Practitioner Coupon, the price becomes ₹10,000 - 30% = ₹7,000, then ₹7,000 - 20% = ₹5,600.
              </p>
            </div>

            {/* Admin + Practitioner Stacking */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A', marginBottom: 2 }}>Allow Platform Admin &amp; Practitioner Coupon Combination</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Permits both an Admin promotional code and a Practitioner code on the same checkout</div>
              </div>
              <input
                type="checkbox"
                checked={allowAdminPractitioner}
                onChange={e => setAllowAdminPractitioner(e.target.checked)}
                style={{ width: 22, height: 22, cursor: 'pointer' }}
              />
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #1F5FE0, #1D4ED8)',
                border: 'none',
                borderRadius: 12,
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
                cursor: savingSettings ? 'not-allowed' : 'pointer',
                alignSelf: 'flex-start',
                boxShadow: '0 4px 14px rgba(31,95,224,0.3)',
              }}
            >
              {savingSettings ? 'Saving...' : 'Save Stacking Rules'}
            </button>
          </form>
        </div>
      )}

      {/* Sub-view 3: Redemption Usages Ledger */}
      {subView === 'usages' && (
        <DataTable
          loading={loading}
          columns={[
            {
              key: 'usedAt',
              label: 'Date & Time',
              render: r => fmtDateTime(r.usedAt || r.createdAt),
            },
            {
              key: 'code',
              label: 'Coupon / Grant',
              render: r => (
                <span style={{ fontWeight: 800, color: '#1D4ED8', background: '#EFF6FF', padding: '3px 8px', borderRadius: 6 }}>
                  {r.code || 'PERSONAL_GRANT'}
                </span>
              ),
            },
            {
              key: 'learner',
              label: 'Learner',
              render: r => (
                <div>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>{r.learner?.firstName} {r.learner?.lastName}</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{r.learner?.email}</div>
                </div>
              ),
            },
            {
              key: 'practitioner',
              label: 'Practitioner',
              render: r => r.practitioner ? `${r.practitioner.firstName} ${r.practitioner.lastName}` : 'Platform',
            },
            {
              key: 'product',
              label: 'Product / Item',
              render: r => (
                <span style={{ color: '#475569', fontWeight: 600 }}>
                  {r.productType === 'course' ? `📘 ${r.course?.title || 'Course'}` : `🗓️ ${r.offer?.title || 'Session'}`}
                </span>
              ),
            },
            {
              key: 'originalPrice',
              label: 'Original',
              render: r => fmt(r.originalPrice),
            },
            {
              key: 'discountAmount',
              label: 'Discount',
              render: r => <span style={{ color: '#059669', fontWeight: 700 }}>-{fmt(r.discountAmount)}</span>,
            },
            {
              key: 'finalPrice',
              label: 'Final Paid',
              render: r => (
                <span style={{ color: r.finalPrice === 0 ? '#10B981' : '#0F172A', fontWeight: 800 }}>
                  {r.finalPrice === 0 ? 'FREE (₹0)' : fmt(r.finalPrice)}
                </span>
              ),
            },
          ]}
          data={usages}
        />
      )}

      {/* ─── CREATE / EDIT ADMIN COUPON MODAL ────────────────────────────────── */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 20, padding: 32, width: 560, maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
              {modal.isEdit ? 'Edit Admin Platform Coupon' : 'Create Admin Platform Coupon'}
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748B' }}>
              Create a platform-wide promotional coupon for festivals, days, or special occasions.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DIWALI50"
                    value={formCode}
                    onChange={e => setFormCode(e.target.value.toUpperCase())}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Discount Percentage *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    placeholder="e.g. 50"
                    value={formPct}
                    onChange={e => setFormPct(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Campaign / Occasion Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diwali Mega Festival Sale"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Applicable on all platform courses & sessions"
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Applicable Products *
                </label>
                <select
                  value={formAppTo}
                  onChange={e => setFormAppTo(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                >
                  <option value="both">Both Courses &amp; Sessions</option>
                  <option value="courses">Courses Only</option>
                  <option value="sessions">Sessions Only</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formExpiryDate}
                    onChange={e => setFormExpiryDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Global Usage Limit
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1000 (empty = unlimited)"
                    value={formUsageLimit}
                    onChange={e => setFormUsageLimit(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Per-Learner Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formPerUserLimit}
                    onChange={e => setFormPerUserLimit(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Minimum Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={formMinOrder}
                    onChange={e => setFormMinOrder(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2000 (empty = no cap)"
                    value={formMaxDiscount}
                    onChange={e => setFormMaxDiscount(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  style={{ flex: 1, padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: 10, color: '#64748B', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #1F5FE0, #1D4ED8)', border: 'none', borderRadius: 10, color: '#FFFFFF', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Saving...' : modal.isEdit ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DELETE CONFIRM MODAL ────────────────────────────────────────────── */}
      {deleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 20, padding: 28, width: 440, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiTrash2 size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#991B1B' }}>Delete Coupon?</h3>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748B' }}>This action cannot be undone</p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 20 }}>
              Are you sure you want to permanently delete coupon code <strong>{deleteModal.code}</strong>?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setDeleteModal(null)}
                style={{ flex: 1, padding: '11px', background: '#F1F5F9', border: 'none', borderRadius: 10, color: '#64748B', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{ flex: 1, padding: '11px', background: '#DC2626', border: 'none', borderRadius: 10, color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
              >
                Delete Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Ratings & Reviews Moderation Tab ─────────────────────────────────────────
function RatingsTab() {
  const { token } = useSelector(s => s.auth)
  const [ratings, setRatings] = useState([])
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, platformAvg: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'pending' | 'approved' | 'rejected'
  const [search, setSearch] = useState('')
  const [selectedPractitioner, setSelectedPractitioner] = useState('all')
  const [actionModal, setActionModal] = useState(null) // { isOpen: true, type: 'approve'|'reject'|'delete', item: {...} }
  const [overrideRating, setOverrideRating] = useState(5)
  const [adminNotes, setAdminNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const loadRatings = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await apiConnector('GET', '/api/v1/admin/ratings', null, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) {
        setRatings(res.data.ratings || [])
        setStats(res.data.stats || { total: 0, pending: 0, approved: 0, rejected: 0, platformAvg: 0 })
      }
    } catch (err) {
      toast.error('Failed to load ratings & reviews')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadRatings()
  }, [loadRatings])

  const handleVerify = async (id, status, assignedRating = null, notes = '') => {
    setIsProcessing(true)
    const toastId = toast.loading(`Updating rating status to ${status}...`)
    try {
      const res = await apiConnector('PUT', `/api/v1/admin/ratings/${id}/verify`, {
        status,
        adminRating: assignedRating !== null ? Number(assignedRating) : undefined,
        adminNotes: notes,
      }, { Authorization: `Bearer ${token}` })

      if (res?.data?.success) {
        toast.success(res.data.message || 'Rating updated successfully!', { id: toastId })
        setActionModal(null)
        loadRatings()
      } else {
        toast.error(res?.data?.message || 'Failed to update rating', { id: toastId })
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error updating rating', { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this rating/review?')) return
    setIsProcessing(true)
    const toastId = toast.loading('Deleting rating...')
    try {
      const res = await apiConnector('DELETE', `/api/v1/admin/ratings/${id}`, null, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) {
        toast.success('Rating deleted successfully', { id: toastId })
        setActionModal(null)
        loadRatings()
      } else {
        toast.error(res?.data?.message || 'Failed to delete rating', { id: toastId })
      }
    } catch (err) {
      toast.error('Error deleting rating', { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  // Filter list
  const uniquePractitioners = Array.from(
    new Map(ratings.map(r => [r.practitionerId, { id: r.practitionerId, name: r.practitionerName }])).values()
  ).filter(p => p.id && p.name)

  const filteredRatings = ratings.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    const matchesPractitioner = selectedPractitioner === 'all' || String(r.practitionerId) === String(selectedPractitioner)
    const q = search.toLowerCase().trim()
    const matchesSearch = !q ||
      r.learnerName?.toLowerCase().includes(q) ||
      r.learnerEmail?.toLowerCase().includes(q) ||
      r.practitionerName?.toLowerCase().includes(q) ||
      r.content?.toLowerCase().includes(q)

    return matchesStatus && matchesPractitioner && matchesSearch
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ color: '#64748B', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Total Submissions</div>
          <div style={{ color: '#0F172A', fontSize: 28, fontWeight: 900 }}>{stats.total}</div>
          <div style={{ color: '#64748B', fontSize: 12, marginTop: 4 }}>All learner feedback records</div>
        </div>

        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 16, padding: '20px 24px' }}>
          <div style={{ color: '#B45309', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
            Pending Verification
          </div>
          <div style={{ color: '#92400E', fontSize: 28, fontWeight: 900 }}>{stats.pending}</div>
          <div style={{ color: '#B45309', fontSize: 12, marginTop: 4 }}>Awaiting admin approval</div>
        </div>

        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 16, padding: '20px 24px' }}>
          <div style={{ color: '#047857', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
            Approved &amp; Live
          </div>
          <div style={{ color: '#065F46', fontSize: 28, fontWeight: 900 }}>{stats.approved}</div>
          <div style={{ color: '#047857', fontSize: 12, marginTop: 4 }}>Visible on practitioner profiles</div>
        </div>

        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 16, padding: '20px 24px' }}>
          <div style={{ color: '#B91C1C', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
            Rejected / Hidden
          </div>
          <div style={{ color: '#991B1B', fontSize: 28, fontWeight: 900 }}>{stats.rejected}</div>
          <div style={{ color: '#B91C1C', fontSize: 12, marginTop: 4 }}>Filtered out of public view</div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)', borderRadius: 16, padding: '20px 24px', color: '#FFFFFF' }}>
          <div style={{ color: '#A5B4FC', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiStar color="#FBBF24" /> Platform Avg Rating
          </div>
          <div style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
            {stats.platformAvg > 0 ? stats.platformAvg : '5.0'} <span style={{ color: '#FBBF24', fontSize: 20 }}>★</span>
          </div>
          <div style={{ color: '#C7D2FE', fontSize: 12, marginTop: 4 }}>Verified score average</div>
        </div>
      </div>

      {/* Action & Filter Bar */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: '18px 24px', display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: 6, background: '#F1F5F9', padding: 4, borderRadius: 12 }}>
          {[
            { id: 'all', label: 'All Reviews', count: stats.total },
            { id: 'pending', label: 'Pending Moderation', count: stats.pending, highlight: stats.pending > 0 },
            { id: 'approved', label: 'Approved & Live', count: stats.approved },
            { id: 'rejected', label: 'Rejected', count: stats.rejected },
          ].map(tab => {
            const isTabActive = statusFilter === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: isTabActive ? '#FFFFFF' : 'transparent',
                  color: isTabActive ? '#0F172A' : '#64748B',
                  fontWeight: isTabActive ? 800 : 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: isTabActive ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s'
                }}
              >
                {tab.label}
                <span style={{
                  padding: '2px 7px',
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 700,
                  background: tab.highlight ? '#F59E0B' : (isTabActive ? '#E2E8F0' : '#E2E8F0'),
                  color: tab.highlight ? '#FFFFFF' : '#475569'
                }}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search & Practitioner Filter */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', minWidth: 220 }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: 12, color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search learner, practitioner, or text..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                fontSize: 13,
                color: '#0F172A',
                outline: 'none'
              }}
            />
          </div>

          <select
            value={selectedPractitioner}
            onChange={e => setSelectedPractitioner(e.target.value)}
            style={{
              padding: '9px 12px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 10,
              fontSize: 13,
              color: '#0F172A',
              fontWeight: 600,
              outline: 'none'
            }}
          >
            <option value="all">All Practitioners ({uniquePractitioners.length})</option>
            {uniquePractitioners.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button
            onClick={loadRatings}
            style={{
              padding: '9px 14px',
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: 10,
              color: '#334155',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <FiRefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Ratings Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748B' }}>
            <FiRefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 12px' }} />
            <div>Loading rating records...</div>
          </div>
        ) : filteredRatings.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748B' }}>
            <FiCheck size={32} style={{ color: '#10B981', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>No Ratings Found</h3>
            <p style={{ margin: 0, fontSize: 13 }}>There are no rating submissions matching your current filter criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  <th style={{ padding: '14px 20px' }}>Learner</th>
                  <th style={{ padding: '14px 20px' }}>Practitioner</th>
                  <th style={{ padding: '14px 20px' }}>Rating</th>
                  <th style={{ padding: '14px 20px', minWidth: 260 }}>Review &amp; Feedback</th>
                  <th style={{ padding: '14px 20px' }}>Date</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Moderation Actions</th>
                </tr>
              </thead>
              <tbody style={{ divideY: '1px solid #E2E8F0' }}>
                {filteredRatings.map((item) => {
                  const isPending = item.status === 'pending'
                  const isApproved = item.status === 'approved'
                  const isRejected = item.status === 'rejected'

                  return (
                    <tr key={item._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      {/* Learner */}
                      <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{item.learnerName}</div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>{item.learnerEmail}</div>
                      </td>

                      {/* Practitioner */}
                      <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 700, color: '#1E293B' }}>{item.practitionerName}</div>
                        {item.courseName && (
                          <div style={{ fontSize: 11, color: '#6366F1', fontWeight: 600 }}>Course: {item.courseName}</div>
                        )}
                      </td>

                      {/* Rating */}
                      <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#F59E0B', fontWeight: 800, fontSize: 14 }}>
                          {'★'.repeat(item.adminRating !== null ? item.adminRating : item.rating)}
                          {'☆'.repeat(5 - (item.adminRating !== null ? item.adminRating : item.rating))}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                          {item.adminRating !== null ? `Assigned: ${item.adminRating}★ (Raw: ${item.rating}★)` : `Submitted: ${item.rating}★`}
                        </div>
                      </td>

                      {/* Review text */}
                      <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                        <p style={{ margin: 0, color: '#334155', lineHeight: 1.5, fontSize: 13 }}>
                          "{item.content}"
                        </p>
                        {item.adminNotes && (
                          <div style={{ marginTop: 6, fontSize: 11, color: '#4F46E5', background: '#EEF2FF', padding: '4px 8px', borderRadius: 6 }}>
                            <strong>Admin Note:</strong> {item.adminNotes}
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td style={{ padding: '16px 20px', verticalAlign: 'top', color: '#64748B', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {fmtDate(item.createdAt)}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                        {isPending && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A', fontSize: 11.5, fontWeight: 800 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} />
                            Pending Admin Verification
                          </span>
                        )}
                        {isApproved && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', fontSize: 11.5, fontWeight: 800 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                            Approved &amp; Live
                          </span>
                        )}
                        {isRejected && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA', fontSize: 11.5, fontWeight: 800 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', verticalAlign: 'top', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => {
                              setActionModal({ isOpen: true, type: 'approve', item })
                              setOverrideRating(item.adminRating || item.rating || 5)
                              setAdminNotes(item.adminNotes || '')
                            }}
                            title="Verify and Approve"
                            style={{
                              padding: '6px 12px',
                              background: isApproved ? '#F1F5F9' : '#10B981',
                              color: isApproved ? '#334155' : '#FFFFFF',
                              border: isApproved ? '1px solid #CBD5E1' : 'none',
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <FiCheck size={13} /> {isApproved ? 'Edit Rating' : 'Approve'}
                          </button>

                          {item.status !== 'rejected' && (
                            <button
                              onClick={() => {
                                setActionModal({ isOpen: true, type: 'reject', item })
                                setAdminNotes(item.adminNotes || '')
                              }}
                              title="Reject rating"
                              style={{
                                padding: '6px 10px',
                                background: '#FFF1F2',
                                color: '#BE123C',
                                border: '1px solid #FECDD3',
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              <FiX size={13} /> Reject
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(item._id)}
                            title="Delete rating"
                            style={{
                              padding: '6px 8px',
                              background: '#F8FAFC',
                              color: '#94A3B8',
                              border: '1px solid #E2E8F0',
                              borderRadius: 8,
                              cursor: 'pointer'
                            }}
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verification & Approval Action Modal */}
      {actionModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 500, padding: 28, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                {actionModal.type === 'approve' ? 'Verify & Publish Rating' : 'Reject Rating'}
              </h3>
              <button onClick={() => setActionModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <FiX size={20} />
              </button>
            </div>

            {/* Review Snapshot Card */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 700, color: '#0F172A', fontSize: 13 }}>{actionModal.item.learnerName}</span>
                <span style={{ color: '#F59E0B', fontWeight: 800, fontSize: 13 }}>Raw: {actionModal.item.rating}★</span>
              </div>
              <p style={{ margin: 0, color: '#475569', fontSize: 13, fontStyle: 'italic', lineHeight: 1.4 }}>
                "{actionModal.item.content}"
              </p>
              <div style={{ marginTop: 8, fontSize: 11.5, color: '#64748B' }}>
                For Practitioner: <strong>{actionModal.item.practitionerName}</strong>
              </div>
            </div>

            {actionModal.type === 'approve' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                    Assigned Published Rating (Stars)
                  </label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setOverrideRating(star)}
                        style={{
                          flex: 1,
                          padding: '10px 0',
                          borderRadius: 10,
                          border: overrideRating === star ? '2px solid #F59E0B' : '1px solid #CBD5E1',
                          background: overrideRating === star ? '#FFFBEB' : '#FFFFFF',
                          color: overrideRating === star ? '#B45309' : '#475569',
                          fontWeight: 800,
                          fontSize: 14,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4
                        }}
                      >
                        {star} ★
                      </button>
                    ))}
                  </div>
                  <span style={{ fontSize: 11.5, color: '#64748B', marginTop: 4, display: 'block' }}>
                    Keep original submitted score ({actionModal.item.rating}★) or override with admin-approved value.
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                    Admin Notes (Optional, internal audit)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Verified authentic client session."
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #CBD5E1', borderRadius: 10, fontSize: 13 }}
                  />
                </div>
              </div>
            )}

            {actionModal.type === 'reject' && (
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                  Reason for Rejection (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Inappropriate content, spam, unverified."
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #CBD5E1', borderRadius: 10, fontSize: 13 }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                onClick={() => setActionModal(null)}
                style={{ flex: 1, padding: '11px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 10, color: '#475569', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              {actionModal.type === 'approve' && (
                <button
                  onClick={() => handleVerify(actionModal.item._id, 'approved', overrideRating, adminNotes)}
                  disabled={isProcessing}
                  style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', borderRadius: 10, color: '#FFFFFF', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}
                >
                  {isProcessing ? 'Publishing...' : 'Approve & Publish'}
                </button>
              )}
              {actionModal.type === 'reject' && (
                <button
                  onClick={() => handleVerify(actionModal.item._id, 'rejected', null, adminNotes)}
                  disabled={isProcessing}
                  style={{ flex: 1, padding: '11px', background: '#DC2626', border: 'none', borderRadius: 10, color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  {isProcessing ? 'Rejecting...' : 'Reject Rating'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────
const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: <FiGrid /> },
  { id: 'ratings', label: 'Ratings & Reviews', icon: <FiCheck /> },
  { id: 'coupons', label: 'Coupons & Discounts', icon: <FiTag /> },
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
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #F1F5F9; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
      `}</style>

      {/* Fixed Unscrollable Sidebar */}
      <aside style={{
        width: 260, flexShrink: 0, background: '#FFFFFF', borderRight: '1px solid #E2E8F0',
        display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', zIndex: 100,
      }}>
        {/* Brand */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #F1F5F9' }}>
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

        {/* Super Admin User Profile Card (Moved to Top) */}
        <div style={{ padding: '12px 16px', margin: '12px 12px 4px', borderRadius: 14, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #1F5FE0, #8A2BE0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0, boxShadow: '0 2px 8px rgba(31,95,224,0.2)' }}>
              {user?.firstName?.[0] || 'S'}{user?.lastName?.[0] || 'A'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#0F172A', fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.firstName || 'Super'} {user?.lastName || 'Admin'}
              </div>
              <div style={{ color: '#166534', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                Super Admin
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 12px', overflowY: 'auto' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 14px',
                background: isActive ? 'linear-gradient(135deg, #1F5FE0, #8A2BE0)' : 'transparent',
                border: 'none',
                borderRadius: 10, color: isActive ? '#FFFFFF' : '#64748B',
                cursor: 'pointer', fontSize: 13, fontWeight: isActive ? 700 : 500,
                marginBottom: 3, textAlign: 'left', transition: 'all 0.15s',
                boxShadow: isActive ? '0 4px 12px rgba(31,95,224,0.25)' : 'none',
              }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#0F172A' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B' } }}
              >
                <span style={{ fontSize: 16, color: isActive ? '#FFFFFF' : '#64748B' }}>{tab.icon}</span>
                {tab.label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Area (Scrolls independently) */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>
        {/* Top Bar */}
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, zIndex: 90, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
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

        {/* Tab Content (Scrolls vertically) */}
        <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          {activeTab === 'dashboard' && <DashboardTab stats={stats} recentPayments={recentPayments} loading={statsLoading} />}
          {activeTab === 'ratings' && <RatingsTab />}
          {activeTab === 'coupons' && <CouponsTab />}
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

