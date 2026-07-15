import { toast } from "react-hot-toast"

import rzpLogo from "../../assets/Logo/rzp_logo.png"
import { resetCart } from "../../slices/cartSlice"
import { setPaymentLoading } from "../../slices/courseSlice"
import { apiConnector } from "../apiConnector"
import { studentEndpoints } from "../apis"

const {
  COURSE_PAYMENT_API,
  COURSE_VERIFY_API,
  SEND_PAYMENT_SUCCESS_EMAIL_API,
} = studentEndpoints

// Load the Razorpay SDK from the CDN
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = src
    script.onload = () => {
      resolve(true)
    }
    script.onerror = () => {
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

// Buy the Course
export async function BuyCourse(
  token,
  courses,
  user_details,
  navigate,
  dispatch
) {
  const toastId = toast.loading("Loading...")
  try {
    // Loading the script of Razorpay SDK
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js")

    if (!res) {
      toast.error(
        "Razorpay SDK failed to load. Check your Internet Connection."
      )
      return
    }

    // Initiating the Order in Backend
    const orderResponse = await apiConnector(
      "POST",
      COURSE_PAYMENT_API,
      {
        courses,
      },
      {
        Authorization: `Bearer ${token}`,
      }
    )

    if (!orderResponse.data.success) {
      throw new Error(orderResponse.data.message)
    }
    console.log("PAYMENT RESPONSE FROM BACKEND............", orderResponse.data)

    const orderData = orderResponse.data.data
    const razorpayKey =
      orderResponse.data.key ||
      process.env.REACT_APP_RAZORPAY_KEY ||
      "rzp_test_TDhFSRuAl18Gcb"

    if (!razorpayKey) {
      throw new Error("Razorpay key missing during initialization")
    }

    // Keep TEST mode only (rzp_test_). Live keys are not used.
    // Most reliable test path: Netbanking → any bank → click Success.
    const isTestMode = String(razorpayKey).startsWith("rzp_test_")
    if (isTestMode) {
      toast(
        "TEST MODE: choose Netbanking → any bank → click Success. (No real money)",
        { duration: 8000 }
      )
    }

    // Opening the Razorpay SDK
    const options = {
      key: razorpayKey,
      currency: orderData.currency,
      amount: `${orderData.amount}`,
      order_id: orderData.id,
      name: "StudyNet",
      description: isTestMode
        ? "TEST MODE — Netbanking → Success"
        : "Thank you for Purchasing the Course.",
      image: rzpLogo,
      method: {
        netbanking: true,
        card: true,
        upi: false, // test UPI QR/apps are unreliable
        wallet: false,
      },
      config: {
        display: {
          blocks: {
            netbanking: {
              name: "Netbanking (best for test — then click Success)",
              instruments: [{ method: "netbanking" }],
            },
            cards: {
              name: "Cards (optional test)",
              instruments: [{ method: "card" }],
            },
          },
          sequence: ["block.netbanking", "block.cards"],
          preferences: {
            show_default_blocks: false,
          },
        },
      },
      prefill: {
        name: `${user_details.firstName} ${user_details.lastName}`,
        email: user_details.email,
        method: "netbanking",
      },
      handler: function (response) {
        sendPaymentSuccessEmail(response, orderData.amount, token)
        verifyPayment({ ...response, courses }, token, navigate, dispatch)
      },
    }
    const paymentObject = new window.Razorpay(options)

    paymentObject.open()
    paymentObject.on("payment.failed", function (response) {
      toast.error(
        response?.error?.description ||
          "Test payment failed. Use Netbanking → any bank → Success."
      )
      console.log(response.error)
    })
  } catch (error) {
    console.log("PAYMENT API ERROR............", error)
    toast.error("Could Not make Payment.")
  }
  toast.dismiss(toastId)
}

// Verify the Payment
async function verifyPayment(bodyData, token, navigate, dispatch) {
  const toastId = toast.loading("Verifying Payment...")
  dispatch(setPaymentLoading(true))
  try {
    const response = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
      Authorization: `Bearer ${token}`,
    })

    console.log("VERIFY PAYMENT RESPONSE FROM BACKEND............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("Payment Successful. You are Added to the course ")
    navigate("/dashboard/enrolled-courses")
    dispatch(resetCart())
  } catch (error) {
    console.log("PAYMENT VERIFY ERROR............", error)
    toast.error("Could Not Verify Payment.")
  }
  toast.dismiss(toastId)
  dispatch(setPaymentLoading(false))
}

// Send the Payment Success Email
async function sendPaymentSuccessEmail(response, amount, token) {
  try {
    await apiConnector(
      "POST",
      SEND_PAYMENT_SUCCESS_EMAIL_API,
      {
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        amount,
      },
      {
        Authorization: `Bearer ${token}`,
      }
    )
  } catch (error) {
    console.log("PAYMENT SUCCESS EMAIL ERROR............", error)
  }
}
