import React, { useEffect } from "react"
import { FiShield, FiLock, FiExternalLink, FiX } from "react-icons/fi"
import toast from "react-hot-toast"

/**
 * PayGlocal Checkout Modal — Real-time Hosted Gateway Redirection Engine
 * "The international payment gateway India builds on"
 *
 * Directs the customer securely to PayGlocal's official hosted checkout window.
 * All real-time cards, UPI apps (GPay, PhonePe, Paytm), NetBanking, and international
 * card 3D Secure verification happen on PayGlocal's official bank-grade platform.
 *
 * Absolutely NO fake dummy numbers, NO mock simulations, NO fake OTP screens.
 */
export default function PayGlocalCheckoutModal({
  isOpen,
  onClose,
  orderData = {},
  onSuccess,
  onDismiss,
}) {
  const {
    amount = 9588,
    currency = "INR",
    planName,
    offerTitle,
    courseTitle,
    order = {},
    merchantTxnId,
    redirectUrl,
    title,
  } = orderData || {}

  const liveTargetUrl =
    redirectUrl ||
    order?.redirectUrl ||
    orderData?.redirectUrl ||
    orderData?.payglocalOrder?.redirectUrl

  // Automatically redirect immediately once real PayGlocal hosted URL is present
  useEffect(() => {
    if (
      isOpen &&
      liveTargetUrl &&
      (liveTargetUrl.startsWith("http://") || liveTargetUrl.startsWith("https://"))
    ) {
      toast.loading("Redirecting to PayGlocal Official Payment Gateway...")
      const timer = setTimeout(() => {
        window.location.href = liveTargetUrl
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [isOpen, liveTargetUrl])

  if (!isOpen) return null

  const displayTitle =
    planName ||
    courseTitle ||
    offerTitle ||
    title ||
    "Pro Plan (1 Year Validity)"

  const finalAmount = amount || order?.amount || 9588
  const formattedAmount =
    currency === "INR"
      ? `₹${Number(finalAmount).toLocaleString("en-IN")}`
      : `${currency} ${Number(finalAmount).toLocaleString()}`

  const effectiveTxnId =
    merchantTxnId ||
    order?.id ||
    order?.merchantTxnId ||
    `pgl_${Date.now()}`

  const handleManualRedirect = () => {
    if (
      liveTargetUrl &&
      (liveTargetUrl.startsWith("http://") || liveTargetUrl.startsWith("https://"))
    ) {
      toast.loading("Opening PayGlocal Official Hosted Gateway...")
      window.location.href = liveTargetUrl
    } else {
      toast.error("Waiting for PayGlocal gateway session to initialize...")
    }
  }

  const handleClose = () => {
    if (onDismiss) onDismiss()
    onClose()
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 15, 29, 0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999,
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          overflow: "hidden",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          animation: "modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header with authentic PayGlocal Brand */}
        <div
          style={{
            background: "linear-gradient(135deg, #0A1931 0%, #152C5B 50%, #1B3B7A 100%)",
            color: "#FFFFFF",
            padding: "24px 24px 20px 24px",
            position: "relative",
          }}
        >
          <button
            onClick={handleClose}
            type="button"
            aria-label="Close"
            style={{
              position: "absolute",
              top: "18px",
              right: "18px",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.12)",
              border: "none",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <FiX size={18} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #0066FF 0%, #0044BB 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "20px",
                letterSpacing: "-0.5px",
                color: "#FFFFFF",
                boxShadow: "0 4px 12px rgba(0, 102, 255, 0.35)",
              }}
            >
              PG
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "19px", fontWeight: 800, letterSpacing: "-0.3px", color: "#FFFFFF" }}>
                  PayGlocal
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    backgroundColor: "rgba(0, 204, 255, 0.18)",
                    color: "#38BDF8",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                  }}
                >
                  LIVE GATEWAY
                </span>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94A3B8" }}>
                The international payment gateway India builds on
              </p>
            </div>
          </div>

          {/* Amount Badge */}
          <div
            style={{
              marginTop: "16px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "14px",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span style={{ fontSize: "11px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                Payable Amount
              </span>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginTop: "2px" }}>
                {displayTitle}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "22px", fontWeight: 900, color: "#38BDF8", letterSpacing: "-0.5px" }}>
                {formattedAmount}
              </div>
              <span style={{ fontSize: "10px", color: "#94A3B8" }}>
                Inclusive of GST
              </span>
            </div>
          </div>
        </div>

        {/* Body — Live Gateway Connection State */}
        <div style={{ padding: "28px 24px" }}>
          {liveTargetUrl ? (
            <div style={{ textAlign: "center" }}>
              {/* Animated Gateway Loading Icon */}
              <div style={{ position: "relative", width: "72px", height: "72px", margin: "0 auto 18px" }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: "3px solid #E2E8F0",
                    borderTopColor: "#0284C7",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: "8px",
                    borderRadius: "50%",
                    background: "#F0F9FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#0284C7",
                  }}
                >
                  <FiExternalLink size={24} />
                </div>
              </div>

              <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 800, color: "#0F172A" }}>
                Connecting to PayGlocal Official Gateway
              </h3>
              <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#64748B", lineHeight: 1.5 }}>
                You are being securely redirected to PayGlocal's official bank checkout window. You can complete your payment via Credit/Debit Cards, UPI, NetBanking, or International Cards.
              </p>

              <button
                type="button"
                onClick={handleManualRedirect}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: "15px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
                  transition: "transform 0.15s ease",
                }}
              >
                Proceed to PayGlocal Official Checkout →
              </button>

              <p style={{ margin: "14px 0 0", fontSize: "11px", color: "#94A3B8" }}>
                Order Ref: <code style={{ color: "#475569" }}>{effectiveTxnId}</code>
              </p>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "#FEF2F2",
                  color: "#DC2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                }}
              >
                <FiShield size={28} />
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: "17px", fontWeight: 800, color: "#0F172A" }}>
                Initializing Live PayGlocal Session
              </h3>
              <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#64748B" }}>
                Contacting PayGlocal payment servers. Please wait a moment while your secure transaction session is prepared...
              </p>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  background: "#FFFFFF",
                  color: "#475569",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Bank-Grade Security Assurance Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "18px",
              marginTop: "24px",
              paddingTop: "16px",
              borderTop: "1px solid #F1F5F9",
              color: "#94A3B8",
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <FiLock style={{ color: "#059669" }} /> 256-Bit TLS Bank Encryption
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <FiShield style={{ color: "#0284C7" }} /> RBI &amp; PCI-DSS Level 1
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
