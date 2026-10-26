import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  FiDollarSign, 
  FiClock, 
  FiCheckCircle, 
  FiShield, 
  FiFileText, 
  FiCreditCard, 
  FiAlertTriangle, 
  FiCopy, 
  FiCheck, 
  FiEdit2, 
  FiX, 
  FiPrinter, 
  FiArrowRight, 
  FiZap 
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { apiConnector } from '../../../../services/apiConnector'

export function PayoutsInvoices({ telemetryData }) {
  const { token } = useSelector((state) => state.auth)

  const [payouts, setPayouts] = useState(telemetryData?.payouts || [])
  const [invoices, setInvoices] = useState(telemetryData?.invoices || [])
  const [bankDetails, setBankDetails] = useState(telemetryData?.bankDetails || {})
  const [loading, setLoading] = useState(false)
  const [copiedUtr, setCopiedUtr] = useState('')
  const [isBankModalOpen, setIsBankModalOpen] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState(null)

  // Bank Form State
  const [bankForm, setBankForm] = useState({
    bankAccountName: '',
    bankAccountNumber: '',
    confirmAccountNumber: '',
    bankIfscCode: '',
    bankName: '',
    upiId: '',
    paypalEmail: '',
    bankRoutingNumber: '',
    bankIban: '',
    bankSwiftBic: '',
    payoutMethod: 'bank',
    payoutCountry: 'India',
  })
  const [savingBank, setSavingBank] = useState(false)

  // Fetch latest bank and payout details
  const refreshPayoutsData = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await apiConnector('GET', '/api/v1/practitioners/payouts', null, {
        Authorization: `Bearer ${token}`,
      })
      if (res?.data?.success) {
        setPayouts(res.data.payouts || [])
        setInvoices(res.data.invoices || [])
        if (res.data.bankDetails) {
          setBankDetails(res.data.bankDetails)
        }
      }
    } catch (err) {
      console.warn('Failed to refresh payouts:', err.message)
    } finally {
      setLoading(false)
    }
  }

  // Populate bank form when opening modal or on mount
  useEffect(() => {
    if (telemetryData?.payouts) setPayouts(telemetryData.payouts)
    if (telemetryData?.invoices) setInvoices(telemetryData.invoices)
    if (telemetryData?.bankDetails) {
      setBankDetails(telemetryData.bankDetails)
      setBankForm((prev) => ({
        ...prev,
        bankAccountName: telemetryData.bankDetails.bankAccountName || '',
        bankAccountNumber: telemetryData.bankDetails.bankAccountNumber || '',
        confirmAccountNumber: telemetryData.bankDetails.bankAccountNumber || '',
        bankIfscCode: telemetryData.bankDetails.bankIfscCode || '',
        bankName: telemetryData.bankDetails.bankName || '',
        upiId: telemetryData.bankDetails.upiId || '',
        paypalEmail: telemetryData.bankDetails.paypalEmail || '',
        bankRoutingNumber: telemetryData.bankDetails.bankRoutingNumber || '',
        bankIban: telemetryData.bankDetails.bankIban || '',
        bankSwiftBic: telemetryData.bankDetails.bankSwiftBic || '',
        payoutMethod: telemetryData.bankDetails.payoutMethod || 'bank',
        payoutCountry: telemetryData.bankDetails.payoutCountry || 'India',
      }))
    }
  }, [telemetryData])

  const openBankModal = () => {
    setBankForm({
      bankAccountName: bankDetails?.bankAccountName || '',
      bankAccountNumber: bankDetails?.bankAccountNumber || '',
      confirmAccountNumber: bankDetails?.bankAccountNumber || '',
      bankIfscCode: bankDetails?.bankIfscCode || '',
      bankName: bankDetails?.bankName || '',
      upiId: bankDetails?.upiId || '',
      paypalEmail: bankDetails?.paypalEmail || '',
      bankRoutingNumber: bankDetails?.bankRoutingNumber || '',
      bankIban: bankDetails?.bankIban || '',
      bankSwiftBic: bankDetails?.bankSwiftBic || '',
      payoutMethod: bankDetails?.payoutMethod || 'bank',
      payoutCountry: bankDetails?.payoutCountry || 'India',
    })
    setIsBankModalOpen(true)
  }

  const handleSaveBankDetails = async (e) => {
    e.preventDefault()

    if (bankForm.payoutMethod === 'bank') {
      if (!bankForm.bankAccountName?.trim()) {
        return toast.error('Please enter Account Holder Name')
      }
      if (!bankForm.bankAccountNumber?.trim()) {
        return toast.error('Please enter Bank Account Number')
      }
      if (bankForm.bankAccountNumber !== bankForm.confirmAccountNumber) {
        return toast.error('Bank Account Numbers do not match')
      }
      if (!bankForm.bankIfscCode?.trim()) {
        return toast.error('Please enter valid Bank IFSC Code')
      }
    } else if (bankForm.payoutMethod === 'upi') {
      if (!bankForm.upiId?.trim() || !bankForm.upiId.includes('@')) {
        return toast.error('Please enter a valid UPI ID (e.g. name@okhdfcbank)')
      }
    } else if (bankForm.payoutMethod === 'wire') {
      if (!bankForm.bankAccountName?.trim()) {
        return toast.error('Please enter Account Holder Name')
      }
      if (!bankForm.bankRoutingNumber?.trim()) {
        return toast.error('Please enter your US ABA Routing Number (9 digits)')
      }
      if (!bankForm.bankAccountNumber?.trim()) {
        return toast.error('Please enter your US Bank Account Number')
      }
      if (bankForm.bankAccountNumber !== bankForm.confirmAccountNumber) {
        return toast.error('Account Numbers do not match')
      }
    } else if (bankForm.payoutMethod === 'paypal') {
      if (!bankForm.paypalEmail?.trim() || !bankForm.paypalEmail.includes('@')) {
        return toast.error('Please enter a valid PayPal email address')
      }
    }

    setSavingBank(true)
    const toastId = toast.loading('Saving bank details & syncing payouts...')
    try {
      const res = await apiConnector(
        'PUT',
        '/api/v1/practitioners/bank-details',
        {
          bankAccountName: bankForm.bankAccountName?.trim(),
          bankAccountNumber: bankForm.bankAccountNumber?.trim(),
          bankIfscCode: bankForm.bankIfscCode?.trim().toUpperCase(),
          bankName: bankForm.bankName?.trim(),
          upiId: bankForm.upiId?.trim(),
          paypalEmail: bankForm.paypalEmail?.trim().toLowerCase(),
          bankRoutingNumber: bankForm.bankRoutingNumber?.trim(),
          bankIban: bankForm.bankIban?.trim().toUpperCase(),
          bankSwiftBic: bankForm.bankSwiftBic?.trim().toUpperCase(),
          payoutMethod: bankForm.payoutMethod,
          payoutCountry: bankForm.payoutCountry,
        },
        { Authorization: `Bearer ${token}` }
      )

      if (res?.data?.success) {
        toast.success(res.data.message || 'Bank details saved successfully!', { id: toastId })
        setIsBankModalOpen(false)
        await refreshPayoutsData()
      } else {
        toast.error(res?.data?.message || 'Failed to save bank details', { id: toastId })
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error updating bank details', { id: toastId })
    } finally {
      setSavingBank(false)
    }
  }

  const handleCopyUtr = (utr) => {
    if (!utr) return
    navigator.clipboard.writeText(utr)
    setCopiedUtr(utr)
    toast.success('Bank UTR Number copied to clipboard!')
    setTimeout(() => setCopiedUtr(''), 2500)
  }

  const formatAmount = (val) => {
    const num = Number(val) || 0
    return num.toLocaleString('en-IN')
  }

  // Calculate live countdown for 72-hour window
  const getRemainingHoursText = (scheduledPayoutAt, createdAt) => {
    const targetDate = scheduledPayoutAt
      ? new Date(scheduledPayoutAt)
      : new Date(new Date(createdAt).getTime() + 72 * 60 * 60 * 1000)
    const diffMs = targetDate.getTime() - Date.now()

    if (diffMs <= 0) {
      return 'Disbursing now...'
    }

    const totalHours = Math.floor(diffMs / (1000 * 60 * 60))
    const totalMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${totalHours}h ${totalMinutes}m remaining`
  }

  // Dynamic statistics
  const settledPayouts = payouts.filter((p) => p.status === 'settled')
  const pendingPayouts = payouts.filter((p) => p.status === 'processing' || p.status === 'pending_bank_details')

  const totalLifetimeEarnings = payouts.reduce((sum, p) => sum + (p.netAmount || p.amount || 0), 0)
  const clearingIn72h = pendingPayouts.reduce((sum, p) => sum + (p.netAmount || p.amount || 0), 0)
  const currentMonthEarnings = payouts
    .filter((p) => new Date(p.createdAt).getMonth() === new Date().getMonth())
    .reduce((sum, p) => sum + (p.netAmount || p.amount || 0), 0)

  const hasLinkedBank = Boolean(
    (bankDetails?.bankAccountNumber && bankDetails?.bankIfscCode) ||
    (bankDetails?.upiId && bankDetails.upiId.includes('@')) ||
    bankDetails?.hasBankDetails
  )

  return (
    <section className="view on" id="payouts" style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Top Breadcrumb & Heading */}
      <div className="htop" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="crumb" style={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>Business / Financials</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', margin: '4px 0 0', letterSpacing: '-0.5px' }}>
              72-Hour Automated Payout Center
            </h1>
            <p style={{ color: '#64748B', marginTop: 4, fontSize: 14 }}>
              All learner payments are collected centrally. Platform fees are deducted, and your net earnings are
              disbursed to your registered bank account (India: Bank/UPI · US: ACH Wire/PayPal) within 72 hours.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={refreshPayoutsData}
              disabled={loading}
              style={{
                padding: '9px 16px',
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: 10,
                color: '#475569',
                fontSize: 13,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <FiClock className={loading ? 'animate-spin' : ''} /> {loading ? 'Syncing...' : 'Sync Payouts'}
            </button>
            <button
              onClick={openBankModal}
              style={{
                padding: '9px 18px',
                background: 'linear-gradient(135deg, #065F46, #047857)',
                border: 'none',
                borderRadius: 10,
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 3px 10px rgba(4,120,87,0.25)',
              }}
            >
              <FiCreditCard size={15} /> {hasLinkedBank ? 'Manage Bank Details' : 'Connect Bank Account'}
            </button>
          </div>
        </div>
      </div>

      {/* Bank Account Alert Banner (If Missing) */}
      {!hasLinkedBank ? (
        <div
          style={{
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
            border: '2px solid #FCD34D',
            borderRadius: 16,
            padding: '20px 24px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            boxShadow: '0 4px 14px rgba(245,158,11,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#F59E0B',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              <FiAlertTriangle />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#92400E' }}>
                Bank Account Details Required for 72-Hour Direct Autopay
              </div>
              <div style={{ fontSize: 13, color: '#B45309', marginTop: 3 }}>
                Learner payments are securely held in platform escrow. Please enter your bank account or UPI details so our system can automatically disburse your net earnings directly to you within 72 hours.
              </div>
            </div>
          </div>
          <button
            onClick={openBankModal}
            style={{
              padding: '11px 22px',
              background: '#D97706',
              border: 'none',
              borderRadius: 10,
              color: '#FFFFFF',
              fontSize: 13.5,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 8px rgba(217,119,6,0.3)',
            }}
          >
            Add Bank Account <FiArrowRight />
          </button>
        </div>
      ) : (
        /* Connected Bank Details Card */
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 16,
            padding: '20px 24px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#F0FDF4',
                color: '#166534',
                border: '1px solid #BBF7D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              <FiCheckCircle />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                  {bankDetails?.bankName || 'Direct Bank Account'}
                </span>
                <span
                  style={{
                    background: '#DCFCE7',
                    color: '#15803D',
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 12,
                  }}
                >
                  ✓ VERIFIED FOR 72H AUTOPAY
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {bankDetails?.bankAccountNumberMasked && (
                  <span>
                    <strong>Account:</strong>{' '}
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                      {bankDetails.bankAccountNumberMasked}
                    </span>
                  </span>
                )}
                {bankDetails?.bankIfscCode && (
                  <span>
                    <strong>IFSC:</strong>{' '}
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                      {bankDetails.bankIfscCode}
                    </span>
                  </span>
                )}
                {bankDetails?.upiId && (
                  <span>
                    <strong>UPI ID:</strong>{' '}
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                      {bankDetails.upiId}
                    </span>
                  </span>
                )}
                {bankDetails?.bankAccountName && (
                  <span>
                    <strong>Beneficiary:</strong> {bankDetails.bankAccountName}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={openBankModal}
            style={{
              padding: '8px 14px',
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: 8,
              color: '#334155',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <FiEdit2 size={13} /> Update Details
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div
        className="g4"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Card 1: Clearing in 72h */}
        <div
          style={{
            background: '#FFFFFF',
            padding: 22,
            borderRadius: 16,
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                In 72-Hour Autopay Hold
              </span>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: '#FFFBEB',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FiClock size={19} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
              ₹{formatAmount(clearingIn72h)}
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#D97706', marginTop: 10, fontWeight: 600 }}>
            {pendingPayouts.length} payout{pendingPayouts.length !== 1 ? 's' : ''} maturing to your bank
          </div>
        </div>

        {/* Card 2: Settled to Bank */}
        <div
          style={{
            background: '#FFFFFF',
            padding: 22,
            borderRadius: 16,
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Directly Settled to Bank
              </span>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: '#F0FDF4',
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FiCheckCircle size={19} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
              ₹{formatAmount(settledPayouts.reduce((s, p) => s + (p.netAmount || 0), 0))}
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#10B981', marginTop: 10, fontWeight: 600 }}>
            {settledPayouts.length} disbursements successfully deposited
          </div>
        </div>

        {/* Card 3: Earned This Month */}
        <div
          style={{
            background: '#FFFFFF',
            padding: 22,
            borderRadius: 16,
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Earned This Month
              </span>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: '#EFF6FF',
                  color: '#3B82F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FiDollarSign size={19} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
              ₹{formatAmount(currentMonthEarnings)}
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#3B82F6', marginTop: 10, fontWeight: 600 }}>
            Session bookings &amp; course sales
          </div>
        </div>

        {/* Card 4: Total Lifetime Earnings */}
        <div
          style={{
            background: '#FFFFFF',
            padding: 22,
            borderRadius: 16,
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#6D28D9', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Lifetime Net Earnings
              </span>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: '#F5F3FF',
                  color: '#7C3AED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FiShield size={19} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
              ₹{formatAmount(totalLifetimeEarnings)}
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 10 }}>Cumulative practitioner revenue</div>
        </div>
      </div>

      {/* 4-Step 72-Hour Settlement Lifecycle Explanation */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: 16,
          padding: '24px 28px',
          color: '#FFFFFF',
          marginBottom: 24,
          boxShadow: '0 6px 20px rgba(15,23,42,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <FiZap style={{ color: '#38BDF8', fontSize: 20 }} />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#F8FAFC' }}>
            How OpenHand 72-Hour Automated Bank Payouts Work
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#38BDF8', marginBottom: 4 }}>STEP 1</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9', marginBottom: 4 }}>Learner Purchases</div>
            <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.4 }}>
              Learner pays for your course or 1:1 session. 100% of the payment flows securely into OpenHand's central bank account.
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#38BDF8', marginBottom: 4 }}>STEP 2</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9', marginBottom: 4 }}>Fee &amp; Tax Calculation</div>
            <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.4 }}>
              Transparent platform fee (10% Open / 5% Pro) and standard 18% GST are automatically calculated and deducted.
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#F59E0B', marginBottom: 4 }}>STEP 3 (72-HOUR HOLD)</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9', marginBottom: 4 }}>Settlement Escrow</div>
            <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.4 }}>
              The payout enters a standard 72-hour automated escrow hold for payment reconciliation and anti-fraud safety.
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#10B981', marginBottom: 4 }}>STEP 4 (AUTOPAY)</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9', marginBottom: 4 }}>Direct Bank Credit</div>
            <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.4 }}>
              At the 72-hour mark, our automated engine automatically deposits the net amount directly into your Bank/UPI with a verified UTR.
            </div>
          </div>
        </div>
      </div>

      {/* Payouts Ledger Table */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1.5px solid #E2E8F0',
          padding: 24,
          marginBottom: 24,
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0F172A' }}>
              Your Payout Transactions ({payouts.length})
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748B' }}>
              Detailed ledger of course sales, 1-on-1 session fees, 72-hour countdowns, and bank transfer receipts.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0', color: '#475569', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Date</th>
                <th style={{ padding: '12px 16px' }}>Item / Source</th>
                <th style={{ padding: '12px 16px' }}>Gross Amount</th>
                <th style={{ padding: '12px 16px' }}>Fee &amp; GST</th>
                <th style={{ padding: '12px 16px' }}>Net Payout</th>
                <th style={{ padding: '12px 16px' }}>Destination Bank</th>
                <th style={{ padding: '12px 16px' }}>72-Hour Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Voucher</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length > 0 ? (
                payouts.map((p) => {
                  const netAmt = formatAmount(p.netAmount || p.amount || 0)
                  const grossAmt = formatAmount(p.grossAmount || p.amount || 0)
                  const fee = p.platformFeeDeducted || p.commissionDeducted || 0
                  const tax = p.taxDeducted || 0
                  const totalDeducted = fee + tax

                  const isSettled = p.status === 'settled'
                  const isMissingBank = p.status === 'pending_bank_details'

                  const destText = p.bankDetails?.bankName && p.bankDetails?.accountNumberMasked
                    ? `${p.bankDetails.bankName} (${p.bankDetails.accountNumberMasked})`
                    : p.bankDetails?.upiId
                    ? `UPI: ${p.bankDetails.upiId}`
                    : hasLinkedBank
                    ? `${bankDetails?.bankName || 'Direct Bank'} (${bankDetails?.bankAccountNumberMasked || 'Linked'})`
                    : 'Awaiting Bank Info'

                  return (
                    <tr key={p._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      {/* Date */}
                      <td style={{ padding: '14px 16px', color: '#64748B', whiteSpace: 'nowrap' }}>
                        {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>
                          {new Date(p.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Source */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>
                          {p.sourceTitle || (p.sourceType === 'course' ? '📘 Paid Course Sale' : '🗓️ 1:1 Client Session')}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B', textTransform: 'capitalize' }}>
                          Type: {p.sourceType?.replace(/_/g, ' ') || 'Session'}
                        </div>
                      </td>

                      {/* Gross */}
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>
                        ₹{grossAmt}
                      </td>

                      {/* Deductions */}
                      <td style={{ padding: '14px 16px', color: '#DC2626', fontSize: 12 }}>
                        {totalDeducted > 0 ? (
                          <>
                            -₹{formatAmount(totalDeducted)}
                            <div style={{ fontSize: 10.5, color: '#94A3B8' }}>
                              Fee: -₹{formatAmount(fee)} · GST: -₹{formatAmount(tax)}
                            </div>
                          </>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>₹0</span>
                        )}
                      </td>

                      {/* Net */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontWeight: 800, fontSize: 14, color: '#059669' }}>
                          ₹{netAmt}
                        </span>
                      </td>

                      {/* Destination */}
                      <td style={{ padding: '14px 16px', fontSize: 12, color: '#475569' }}>
                        <div style={{ fontWeight: 600 }}>{destText}</div>
                        {p.payoutUtrNumber && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                            <span style={{ fontSize: 11, fontFamily: 'monospace', background: '#F1F5F9', padding: '1px 6px', borderRadius: 4, color: '#1E293B' }}>
                              {p.payoutUtrNumber}
                            </span>
                            <button
                              onClick={() => handleCopyUtr(p.payoutUtrNumber)}
                              title="Copy UTR Number"
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: copiedUtr === p.payoutUtrNumber ? '#10B981' : '#64748B', padding: 2 }}
                            >
                              {copiedUtr === p.payoutUtrNumber ? <FiCheck size={12} /> : <FiCopy size={12} />}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        {isSettled ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '4px 10px',
                              borderRadius: 14,
                              fontSize: 11,
                              fontWeight: 800,
                              background: '#DCFCE7',
                              color: '#15803D',
                              border: '1px solid #BBF7D0',
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                            DEPOSITED TO BANK
                          </span>
                        ) : isMissingBank ? (
                          <div>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                padding: '4px 10px',
                                borderRadius: 14,
                                fontSize: 11,
                                fontWeight: 800,
                                background: '#FEE2E2',
                                color: '#B91C1C',
                                border: '1px solid #FECACA',
                              }}
                            >
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
                              NEEDS BANK DETAILS
                            </span>
                            <div style={{ marginTop: 4 }}>
                              <button
                                onClick={openBankModal}
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: '#DC2626',
                                  textDecoration: 'underline',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: 0,
                                }}
                              >
                                Connect Bank Now &rarr;
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                padding: '4px 10px',
                                borderRadius: 14,
                                fontSize: 11,
                                fontWeight: 800,
                                background: '#FEF3C7',
                                color: '#B45309',
                                border: '1px solid #FDE68A',
                              }}
                            >
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} />
                              72H AUTOPAY HOLD
                            </span>
                            <div style={{ fontSize: 11, color: '#B45309', fontWeight: 600, marginTop: 4 }}>
                              {getRemainingHoursText(p.scheduledPayoutAt, p.createdAt)}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Voucher Button */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedVoucher(p)}
                          style={{
                            padding: '6px 12px',
                            background: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            borderRadius: 8,
                            color: '#334155',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <FiFileText size={13} /> Advice
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 16px', color: '#94A3B8' }}>
                    <FiDollarSign size={28} style={{ color: '#CBD5E1', margin: '0 auto 8px', display: 'block' }} />
                    No payout records generated yet. When learners book your sessions or purchase your courses, their payments and 72-hour autopay disbursements will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settlement Invoices */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1.5px solid #E2E8F0',
          padding: 24,
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiFileText style={{ color: '#8B5CF6' }} /> Settlement Invoices &amp; Statements ({invoices.length})
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
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
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#10B981' }}>₹{formatAmount(inv.totalAmount || inv.amount || 0)}</td>
                    <td style={{ padding: '12px 16px', color: '#64748B' }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: '#DCFCE7', color: '#15803D' }}>
                        {inv.status || 'Paid'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 24, color: '#94A3B8' }}>
                    No billing settlement invoices logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MODAL 1: Connect / Manage Bank Details ──────────────────────────── */}
      {isBankModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              padding: 28,
              width: 520,
              maxWidth: '95vw',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F0FDF4', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  <FiCreditCard />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0F172A' }}>
                    Practitioner Bank Account Details
                  </h3>
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    Required for automated 72-hour direct salary &amp; session payouts
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsBankModalOpen(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4 }}
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBankDetails} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Payout Method Selector */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                  Payout Transfer Method
                </label>
                {/* Payout Country Selector */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>
                    Payout Country / Region
                  </label>
                  <select
                    value={bankForm.payoutCountry}
                    onChange={(e) => setBankForm((f) => ({ ...f, payoutCountry: e.target.value, payoutMethod: e.target.value === 'United States' ? 'wire' : 'bank' }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #CBD5E1', fontSize: 13, outline: 'none', background: '#FFFFFF' }}
                  >
                    <option value="India">🇮🇳 India (INR — Bank / UPI)</option>
                    <option value="United States">🇺🇸 United States (USD — ACH Wire / PayPal)</option>
                    <option value="Other">🌍 Other Country (IBAN / SWIFT Wire)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: bankForm.payoutCountry === 'India' ? '1fr 1fr' : '1fr 1fr', gap: 10 }}>
                  {bankForm.payoutCountry === 'India' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setBankForm((f) => ({ ...f, payoutMethod: 'bank' }))}
                        style={{
                          padding: '10px',
                          borderRadius: 10,
                          border: bankForm.payoutMethod === 'bank' ? '2px solid #059669' : '1px solid #CBD5E1',
                          background: bankForm.payoutMethod === 'bank' ? '#ECFDF5' : '#FFFFFF',
                          color: bankForm.payoutMethod === 'bank' ? '#065F46' : '#64748B',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        🏦 Direct Bank Transfer
                      </button>
                      <button
                        type="button"
                        onClick={() => setBankForm((f) => ({ ...f, payoutMethod: 'upi' }))}
                        style={{
                          padding: '10px',
                          borderRadius: 10,
                          border: bankForm.payoutMethod === 'upi' ? '2px solid #059669' : '1px solid #CBD5E1',
                          background: bankForm.payoutMethod === 'upi' ? '#ECFDF5' : '#FFFFFF',
                          color: bankForm.payoutMethod === 'upi' ? '#065F46' : '#64748B',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        ⚡ Instant UPI Transfer
                      </button>
                    </>
                  )}
                  {(bankForm.payoutCountry === 'United States' || bankForm.payoutCountry === 'Other') && (
                    <>
                      <button
                        type="button"
                        onClick={() => setBankForm((f) => ({ ...f, payoutMethod: 'wire' }))}
                        style={{
                          padding: '10px',
                          borderRadius: 10,
                          border: bankForm.payoutMethod === 'wire' ? '2px solid #2563EB' : '1px solid #CBD5E1',
                          background: bankForm.payoutMethod === 'wire' ? '#EFF6FF' : '#FFFFFF',
                          color: bankForm.payoutMethod === 'wire' ? '#1D4ED8' : '#64748B',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        🏦 {bankForm.payoutCountry === 'United States' ? 'US ACH Bank Wire' : 'IBAN / SWIFT Wire'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setBankForm((f) => ({ ...f, payoutMethod: 'paypal' }))}
                        style={{
                          padding: '10px',
                          borderRadius: 10,
                          border: bankForm.payoutMethod === 'paypal' ? '2px solid #2563EB' : '1px solid #CBD5E1',
                          background: bankForm.payoutMethod === 'paypal' ? '#EFF6FF' : '#FFFFFF',
                          color: bankForm.payoutMethod === 'paypal' ? '#1D4ED8' : '#64748B',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        💳 PayPal Transfer
                      </button>
                    </>
                  )}
                </div>
              </div>

              {bankForm.payoutMethod === 'bank' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Account Holder Name <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Jane Doe"
                      value={bankForm.bankAccountName}
                      onChange={(e) => setBankForm((f) => ({ ...f, bankAccountName: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #CBD5E1', fontSize: 13.5, outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Bank Name <span style={{ color: '#94A3B8' }}>(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank, ICICI Bank, State Bank of India"
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm((f) => ({ ...f, bankName: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #CBD5E1', fontSize: 13.5, outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Bank Account Number <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 50100482910482"
                      value={bankForm.bankAccountNumber}
                      onChange={(e) => setBankForm((f) => ({ ...f, bankAccountNumber: e.target.value.replace(/\D/g, '') }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #CBD5E1', fontSize: 13.5, outline: 'none', fontFamily: 'monospace' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Confirm Bank Account Number <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Re-enter bank account number"
                      value={bankForm.confirmAccountNumber}
                      onChange={(e) => setBankForm((f) => ({ ...f, confirmAccountNumber: e.target.value.replace(/\D/g, '') }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #CBD5E1', fontSize: 13.5, outline: 'none', fontFamily: 'monospace' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      IFSC Code <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HDFC0001234"
                      value={bankForm.bankIfscCode}
                      onChange={(e) => setBankForm((f) => ({ ...f, bankIfscCode: e.target.value.toUpperCase() }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #CBD5E1', fontSize: 13.5, outline: 'none', fontFamily: 'monospace', textTransform: 'uppercase' }}
                    />
                  </div>
                </>
              )}

              {bankForm.payoutMethod === 'upi' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Virtual Payment Address / UPI ID <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. drjanedoe@okhdfcbank"
                    value={bankForm.upiId}
                    onChange={(e) => setBankForm((f) => ({ ...f, upiId: e.target.value.toLowerCase().trim() }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #CBD5E1', fontSize: 13.5, outline: 'none', fontFamily: 'monospace' }}
                  />
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                    Funds will be directly transferred to your bank via NPCI UPI gateway upon 72-hour maturity.
                  </div>
                </div>
              )}

              {bankForm.payoutMethod === 'wire' && (
                <>
                  <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '10px 14px', fontSize: 12.5, color: '#1D4ED8', lineHeight: 1.5 }}>
                    🇺🇸 <strong>US ACH Bank Wire</strong> — Payouts will be transferred in <strong>USD</strong> to your US bank account via ACH/Wire. Admin will manually convert from INR → USD at prevailing interbank rate and disburse within 72 hours.
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Account Holder Name <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Full legal name as on bank account"
                      value={bankForm.bankAccountName}
                      onChange={(e) => setBankForm((f) => ({ ...f, bankAccountName: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #CBD5E1', fontSize: 13.5, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Bank Name <span style={{ color: '#94A3B8' }}>(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chase Bank, Bank of America, Wells Fargo"
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm((f) => ({ ...f, bankName: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #CBD5E1', fontSize: 13.5, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      ABA Routing Number (9 digits) <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 021000021"
                      maxLength={9}
                      value={bankForm.bankRoutingNumber}
                      onChange={(e) => setBankForm((f) => ({ ...f, bankRoutingNumber: e.target.value.replace(/\D/g, '') }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #CBD5E1', fontSize: 13.5, outline: 'none', fontFamily: 'monospace' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      US Bank Account Number <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 000123456789"
                      value={bankForm.bankAccountNumber}
                      onChange={(e) => setBankForm((f) => ({ ...f, bankAccountNumber: e.target.value.replace(/\D/g, '') }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #CBD5E1', fontSize: 13.5, outline: 'none', fontFamily: 'monospace' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Confirm Account Number <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Re-enter account number"
                      value={bankForm.confirmAccountNumber}
                      onChange={(e) => setBankForm((f) => ({ ...f, confirmAccountNumber: e.target.value.replace(/\D/g, '') }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #CBD5E1', fontSize: 13.5, outline: 'none', fontFamily: 'monospace' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      SWIFT / BIC Code <span style={{ color: '#94A3B8' }}>(for international wires)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CHASUS33"
                      value={bankForm.bankSwiftBic}
                      onChange={(e) => setBankForm((f) => ({ ...f, bankSwiftBic: e.target.value.toUpperCase() }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #CBD5E1', fontSize: 13.5, outline: 'none', fontFamily: 'monospace', textTransform: 'uppercase' }}
                    />
                  </div>
                </>
              )}

              {bankForm.payoutMethod === 'paypal' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    PayPal Email Address <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="your-paypal@email.com"
                    value={bankForm.paypalEmail}
                    onChange={(e) => setBankForm((f) => ({ ...f, paypalEmail: e.target.value.toLowerCase().trim() }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #CBD5E1', fontSize: 13.5, outline: 'none' }}
                  />
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                    Your net earnings (in USD) will be sent to this PayPal account within 72 hours of client payment.
                  </div>
                </div>
              )}

              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11.5, color: '#64748B', lineHeight: 1.4 }}>
                🔒 <strong>Bank-Grade Encryption:</strong> Your payout details are encrypted and utilized solely for disbursing your 72-hour automated salary, session fees, and course royalties.
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  style={{ flex: 1, padding: '11px', background: '#F1F5F9', border: 'none', borderRadius: 10, color: '#64748B', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBank}
                  style={{
                    flex: 1,
                    padding: '11px',
                    background: 'linear-gradient(135deg, #065F46, #047857)',
                    border: 'none',
                    borderRadius: 10,
                    color: '#FFFFFF',
                    fontWeight: 800,
                    cursor: savingBank ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(4,120,87,0.3)',
                  }}
                >
                  {savingBank ? 'Saving...' : 'Save & Link for Autopay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: Payout Advice / Voucher ────────────────────────────────── */}
      {selectedVoucher && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              padding: 32,
              width: 540,
              maxWidth: '95vw',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              border: '1px solid #E2E8F0',
            }}
          >
            {/* Voucher Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #F1F5F9', paddingBottom: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#0F172A' }}>OpenHand</div>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Practitioner Disbursement Advice</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 800,
                    background: selectedVoucher.status === 'settled' ? '#DCFCE7' : '#FEF3C7',
                    color: selectedVoucher.status === 'settled' ? '#15803D' : '#B45309',
                  }}
                >
                  {selectedVoucher.status === 'settled' ? 'DEPOSITED TO BANK' : '72H ESCROW HOLD'}
                </span>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                  Ref: {selectedVoucher._id?.slice(-8).toUpperCase()}
                </div>
              </div>
            </div>

            {/* Voucher Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Source / Item:</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{selectedVoucher.sourceTitle || selectedVoucher.sourceType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Learner Transaction Date:</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{new Date(selectedVoucher.createdAt).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Bank Destination:</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>
                  {selectedVoucher.bankDetails?.bankName || 'Direct Bank'} ({selectedVoucher.bankDetails?.accountNumberMasked || '••••'})
                </span>
              </div>
              {selectedVoucher.payoutUtrNumber && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Bank UTR / Transaction Ref:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A', background: '#F8FAFC', padding: '2px 8px', borderRadius: 4 }}>
                    {selectedVoucher.payoutUtrNumber}
                  </span>
                </div>
              )}
              {selectedVoucher.settledAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Disbursed Date:</span>
                  <span style={{ fontWeight: 600, color: '#059669' }}>{new Date(selectedVoucher.settledAt).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 12, marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: '#64748B' }}>Gross Learner Payment:</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>₹{formatAmount(selectedVoucher.grossAmount || selectedVoucher.amount)}</span>
                </div>
                {(selectedVoucher.platformFeeDeducted || selectedVoucher.commissionDeducted) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#DC2626' }}>
                    <span>Platform Service Fee:</span>
                    <span>-₹{formatAmount(selectedVoucher.platformFeeDeducted || selectedVoucher.commissionDeducted)}</span>
                  </div>
                )}
                {selectedVoucher.taxDeducted > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#DC2626' }}>
                    <span>18% GST on Platform Service:</span>
                    <span>-₹{formatAmount(selectedVoucher.taxDeducted)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #0F172A', marginTop: 8, fontSize: 16 }}>
                  <span style={{ fontWeight: 900, color: '#0F172A' }}>Net Deposited into Bank:</span>
                  <span style={{ fontWeight: 900, color: '#059669' }}>₹{formatAmount(selectedVoucher.netAmount || selectedVoucher.amount)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                onClick={() => window.print()}
                style={{
                  flex: 1,
                  padding: '11px',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  borderRadius: 10,
                  color: '#334155',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <FiPrinter /> Print Voucher
              </button>
              <button
                onClick={() => setSelectedVoucher(null)}
                style={{
                  flex: 1,
                  padding: '11px',
                  background: '#0F172A',
                  border: 'none',
                  borderRadius: 10,
                  color: '#FFFFFF',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default PayoutsInvoices
