import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import {
  FiTag, FiCheck, FiX, FiAlertCircle, FiGift, FiLock,
  FiArrowRight, FiPercent, FiShoppingBag, FiCalendar
} from 'react-icons/fi'
import { apiConnector } from '../../../services/apiConnector'
import {
  calculateCheckoutDiscounts,
  enrollFreeDiscountCourse,
  confirmFreeDiscountBooking,
} from '../../../services/operations/couponAPI'

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n || 0)

export default function CheckoutCouponModal({
  isOpen,
  onClose,
  productType = 'course', // 'course' | 'session'
  product, // Course or Offer object
  scheduledAt, // For session bookings
  onSuccess, // Callback on purchase/booking complete
}) {
  const { token } = useSelector((s) => s.auth)
  const { user } = useSelector((s) => s.profile)

  const [inputCode, setInputCode] = useState('')
  const [appliedCodes, setAppliedCodes] = useState([])
  const [calculating, setCalculating] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [calculationResult, setCalculationResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const productId = product?._id

  // ─── Fetch Price Calculation from Server ─────────────────────────────────────
  const fetchCalculation = useCallback(
    async (codesToApply) => {
      if (!productId || !token) return
      setCalculating(true)
      setErrorMessage('')
      try {
        const res = await calculateCheckoutDiscounts(
          {
            productType,
            productId,
            couponCodes: codesToApply,
          },
          token
        )

        if (res?.success) {
          setCalculationResult(res)
          if (res.invalidCoupons?.length > 0) {
            const err = res.invalidCoupons[0]
            setErrorMessage(`Coupon '${err.code}': ${err.reason}`)
          }
        } else {
          setErrorMessage(res?.message || 'Failed to calculate discounts')
        }
      } catch (err) {
        setErrorMessage('Could not connect to discount engine')
      }
      setCalculating(false)
    },
    [productId, productType, token]
  )

  useEffect(() => {
    if (isOpen && productId) {
      setInputCode('')
      setAppliedCodes([])
      setErrorMessage('')
      fetchCalculation([])
    }
  }, [isOpen, productId, fetchCalculation])

  if (!isOpen || !product) return null

  // ─── Handle Apply Coupon Code ───────────────────────────────────────────────
  const handleApplyCoupon = () => {
    const clean = inputCode.trim().toUpperCase()
    if (!clean) return

    if (appliedCodes.includes(clean)) {
      toast.error('Coupon code is already entered')
      return
    }

    const nextCodes = [...appliedCodes, clean]
    setAppliedCodes(nextCodes)
    setInputCode('')
    fetchCalculation(nextCodes)
  }

  // ─── Handle Remove Coupon Code ──────────────────────────────────────────────
  const handleRemoveCoupon = (codeToRemove) => {
    const nextCodes = appliedCodes.filter((c) => c !== codeToRemove)
    setAppliedCodes(nextCodes)
    setErrorMessage('')
    fetchCalculation(nextCodes)
  }

  // ─── Load Razorpay SDK ───────────────────────────────────────────────────────
  const loadRazorpaySDK = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  // ─── Execute Purchase / ₹0 Direct Unlock ────────────────────────────────────
  const handleProceed = async () => {
    if (!token) {
      toast.error('Please log in to complete purchase')
      return
    }

    const finalAmount = calculationResult?.finalPrice ?? Number(product.price || 0)
    const isFree = calculationResult?.isFree || finalAmount === 0

    setProcessingPayment(true)

    try {
      // 1. Zero-Rupee Free Discount Bypass Flow
      if (isFree) {
        if (productType === 'course') {
          const res = await enrollFreeDiscountCourse(
            {
              courseId: productId,
              couponCodes: appliedCodes,
            },
            token
          )
          if (res?.success) {
            if (onSuccess) onSuccess(res)
            onClose()
          }
        } else {
          // Free Session Booking
          const res = await confirmFreeDiscountBooking(
            {
              offerId: productId,
              scheduledAt,
              couponCodes: appliedCodes,
            },
            token
          )
          if (res?.success) {
            if (onSuccess) onSuccess(res)
            onClose()
          }
        }
        setProcessingPayment(false)
        return
      }

      // 2. Paid Flow via Razorpay Gateway
      const isLoaded = await loadRazorpaySDK()
      if (!isLoaded) {
        toast.error('Razorpay SDK failed to load')
        setProcessingPayment(false)
        return
      }

      let orderRes = null
      if (productType === 'course') {
        orderRes = await apiConnector(
          'POST',
          '/api/v1/payments/buy-course',
          {
            courseId: productId,
            couponCodes: appliedCodes,
          },
          { Authorization: `Bearer ${token}` }
        )
      } else {
        // Session Booking
        const pId = product.practitioner?._id || product.practitioner
        orderRes = await apiConnector(
          'POST',
          '/api/v1/payment/create-practitioner-order',
          {
            practitionerId: pId,
            amount: finalAmount,
            offerId: productId,
            couponCodes: appliedCodes,
          },
          { Authorization: `Bearer ${token}` }
        )
      }

      if (!orderRes?.data?.success) {
        toast.error(orderRes?.data?.message || 'Failed to initialize payment')
        setProcessingPayment(false)
        return
      }

      const { order, key } = orderRes.data

      const isRealRazorpayOrder =
        typeof order?.id === 'string' &&
        /^order_[A-Za-z0-9]{14,}$/.test(order.id) &&
        !order.id.includes('pract') &&
        !order.id.includes('mock')

      const options = {
        key: key || 'rzp_test_TDhFSRuAl18Gcb',
        amount: order?.amount || Math.round(finalAmount * 100),
        currency: order?.currency || 'INR',
        name: 'OpenHand Platform',
        description: `Purchase: ${product.title}`,
        ...(isRealRazorpayOrder ? { order_id: order.id } : {}),
        prefill: {
          name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
          email: user?.email || '',
        },
        theme: { color: '#1F5FE0' },
        handler: async (response) => {
          const vToast = toast.loading('Verifying payment...')
          try {
            if (productType === 'course') {
              const vRes = await apiConnector(
                'POST',
                '/api/v1/payments/verify-course-payment',
                {
                  courseId: productId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  couponCodes: appliedCodes,
                },
                { Authorization: `Bearer ${token}` }
              )
              if (vRes?.data?.success) {
                toast.success('🎉 Course unlocked successfully!', { id: vToast })
                if (onSuccess) onSuccess(vRes.data)
                onClose()
              } else {
                toast.error(vRes?.data?.message || 'Verification failed', { id: vToast })
              }
            } else {
              // Session Booking
              const vRes = await apiConnector(
                'POST',
                '/api/v1/payments/verify-offer-booking',
                {
                  bookingId: orderRes.data.bookingId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
                { Authorization: `Bearer ${token}` }
              )
              if (vRes?.data?.success) {
                toast.success('🎉 Session booked successfully!', { id: vToast })
                if (onSuccess) onSuccess(vRes.data)
                onClose()
              } else {
                toast.error(vRes?.data?.message || 'Verification failed', { id: vToast })
              }
            }
          } catch (e) {
            toast.error('Payment verification failed', { id: vToast })
          } finally {
            setProcessingPayment(false)
          }
        },
        modal: {
          ondismiss: () => setProcessingPayment(false),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      toast.error('Payment flow encountered an error')
      setProcessingPayment(false)
    }
  }

  const originalPrice = calculationResult?.originalPrice ?? Number(product.price || 0)
  const finalPrice = calculationResult?.finalPrice ?? originalPrice
  const totalDiscount = calculationResult?.totalDiscountAmount ?? 0
  const isFree = calculationResult?.isFree || finalPrice === 0
  const breakdown = calculationResult?.breakdown || {}
  const hasPersonalDiscount = calculationResult?.hasPersonalDiscount
  const personalDiscount = calculationResult?.personalDiscount

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 24,
          width: 520,
          maxWidth: '95vw',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            padding: '24px 28px',
            color: '#FFFFFF',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#94A3B8',
              borderRadius: '50%',
              width: 32,
              height: 32,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.color = '#94A3B8'
            }}
          >
            <FiX size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                color: '#93C5FD',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                padding: '3px 8px',
                borderRadius: 6,
              }}
            >
              {productType === 'course' ? <FiShoppingBag size={11} /> : <FiCalendar size={11} />}
              {productType === 'course' ? 'Course Checkout' : 'Session Booking'}
            </span>
          </div>

          <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: '#FFFFFF' }}>
            {product.title}
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: '#94A3B8' }}>
            Practitioner:{' '}
            <strong style={{ color: '#E2E8F0' }}>
              {product.practitioner?.firstName
                ? `Dr. ${product.practitioner.firstName} ${product.practitioner.lastName}`
                : 'OpenHand Practitioner'}
            </strong>
          </p>
        </div>

        {/* Modal Scroll Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {/* Personal Learner Discount Notice */}
          {hasPersonalDiscount && (
            <div
              style={{
                background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                border: '1.5px solid #6EE7B7',
                borderRadius: 14,
                padding: '12px 16px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: '#10B981',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: 16,
                }}
              >
                <FiGift />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#065F46', marginBottom: 2 }}>
                  {personalDiscount?.isFreeAccess
                    ? '🎁 Exclusive 100% Free Access Grant!'
                    : `🎁 Special ${personalDiscount?.percentage}% Personal Discount Applied!`}
                </div>
                <div style={{ fontSize: 12, color: '#047857' }}>
                  {personalDiscount?.notes ||
                    'This personalized offer was directly granted to you by the practitioner.'}
                </div>
              </div>
            </div>
          )}

          {/* Coupon Code Input */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 700,
                color: '#475569',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Have a Coupon Code?
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <FiTag
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94A3B8',
                  }}
                />
                <input
                  type="text"
                  placeholder="Enter coupon code (e.g. DIWALI50)"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleApplyCoupon()
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 36px',
                    borderRadius: 12,
                    border: '1.5px solid #CBD5E1',
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    outline: 'none',
                    background: '#F8FAFC',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <button
                onClick={handleApplyCoupon}
                disabled={!inputCode.trim() || calculating}
                style={{
                  padding: '0 20px',
                  background: 'linear-gradient(135deg, #1F5FE0, #1D4ED8)',
                  border: 'none',
                  borderRadius: 12,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: !inputCode.trim() || calculating ? 'not-allowed' : 'pointer',
                  opacity: !inputCode.trim() || calculating ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Apply
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 600,
                }}
              >
                <FiAlertCircle size={14} /> {errorMessage}
              </div>
            )}

            {/* Applied Coupons Chips */}
            {calculationResult?.appliedCoupons?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {calculationResult.appliedCoupons.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: c.type === 'personal' ? '#ECFDF5' : '#EFF6FF',
                      border: `1px solid ${c.type === 'personal' ? '#A7F3D0' : '#BFDBFE'}`,
                      color: c.type === 'personal' ? '#065F46' : '#1E40AF',
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    <FiCheck size={13} color={c.type === 'personal' ? '#10B981' : '#3B82F6'} />
                    <span>
                      {c.code || c.name} ({c.discountPercentage}% off)
                    </span>
                    {c.type !== 'personal' && (
                      <button
                        onClick={() => handleRemoveCoupon(c.code)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748B',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <FiX size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price Breakdown Card */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 16,
              padding: '16px 20px',
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 12,
              }}
            >
              Price Summary
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              {/* Original Price */}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Original Price</span>
                <span style={{ fontWeight: 600 }}>{fmt(originalPrice)}</span>
              </div>

              {/* Personal Discount */}
              {breakdown.personalDiscountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiGift size={13} /> Personal Discount
                  </span>
                  <span style={{ fontWeight: 700 }}>-{fmt(breakdown.personalDiscountAmount)}</span>
                </div>
              )}

              {/* Practitioner Discount */}
              {breakdown.practitionerDiscountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563EB' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiPercent size={13} /> Practitioner Coupon
                  </span>
                  <span style={{ fontWeight: 700 }}>-{fmt(breakdown.practitionerDiscountAmount)}</span>
                </div>
              )}

              {/* Admin Discount */}
              {breakdown.adminDiscountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#7C3AED' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiTag size={13} /> Admin Platform Coupon
                  </span>
                  <span style={{ fontWeight: 700 }}>-{fmt(breakdown.adminDiscountAmount)}</span>
                </div>
              )}

              {/* Divider */}
              <div style={{ borderTop: '1px solid #CBD5E1', margin: '6px 0' }} />

              {/* Final Payable */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#0F172A',
                }}
              >
                <span>Total Payable</span>
                <span
                  style={{
                    fontSize: 20,
                    color: isFree ? '#10B981' : '#0F172A',
                    fontWeight: 900,
                  }}
                >
                  {isFree ? 'FREE (₹0)' : fmt(finalPrice)}
                </span>
              </div>

              {totalDiscount > 0 && (
                <div
                  style={{
                    fontSize: 12,
                    color: '#059669',
                    fontWeight: 700,
                    textAlign: 'right',
                    marginTop: 2,
                  }}
                >
                  🎉 You are saving {fmt(totalDiscount)} on this purchase!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '18px 28px',
            background: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            onClick={onClose}
            disabled={processingPayment}
            style={{
              padding: '11px 20px',
              background: '#F1F5F9',
              border: 'none',
              borderRadius: 12,
              color: '#64748B',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleProceed}
            disabled={processingPayment || calculating}
            style={{
              padding: '12px 28px',
              background: isFree
                ? 'linear-gradient(135deg, #10B981, #059669)'
                : 'linear-gradient(135deg, #1F5FE0, #8A2BE0)',
              border: 'none',
              borderRadius: 12,
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 14,
              cursor: processingPayment || calculating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: isFree
                ? '0 6px 18px rgba(16, 185, 129, 0.35)'
                : '0 6px 18px rgba(31, 95, 224, 0.35)',
              transition: 'all 0.15s',
            }}
          >
            {processingPayment ? (
              'Processing...'
            ) : isFree ? (
              <>
                <FiGift size={16} /> Claim &amp; Unlock Free (₹0)
              </>
            ) : (
              <>
                <FiLock size={15} /> Pay {fmt(finalPrice)} <FiArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
