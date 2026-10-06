/**
 * PayGlocal Client Checkout Runner
 * "The international payment gateway India builds on"
 */

export const initiatePayGlocalCheckout = ({
  orderData,
  onSuccess,
  onDismiss,
}) => {
  return new Promise((resolve, reject) => {
    try {
      const {
        order,
        gid,
        merchantTxnId,
        redirectUrl,
        amount,
        currency = "INR",
      } = orderData || {}

      const effectiveTxnId =
        merchantTxnId || order?.merchantTxnId || order?.id || `pgl_${Date.now()}`
      const effectiveGid =
        gid || order?.gid || `gl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

      // If user has a real PayGlocal hosted URL, redirect to PayGlocal's checkout
      if (
        redirectUrl &&
        redirectUrl.includes("paycollect.payglocal.in") &&
        !redirectUrl.includes("status=")
      ) {
        window.location.href = redirectUrl
        return resolve({ redirected: true })
      }

      // Do NOT auto-complete fake payments!
      // Must go through interactive checkout modal with user authorization
      const checkoutErr = new Error("PayGlocal interactive 3D-Secure checkout required.")
      checkoutErr.code = "REQUIRES_INTERACTIVE_CHECKOUT"
      if (onDismiss) onDismiss(checkoutErr)
      return reject(checkoutErr)
    } catch (err) {
      if (onDismiss) onDismiss(err)
      reject(err)
    }
  })
}
