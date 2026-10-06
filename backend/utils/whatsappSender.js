/**
 * OpenHand WhatsApp Notification Dispatcher
 * Multi-provider support:
 * 1. Meta WhatsApp Business Cloud API (Official Graph API v19.0+)
 * 2. Twilio WhatsApp API
 * 3. Custom WhatsApp Webhook / Gateway
 * 4. Development Simulated Dispatcher (Logs formatted message to console)
 */

function normalizeWhatsAppNumber(raw) {
  if (!raw) return null
  let cleaned = String(raw).trim().replace(/[^\d+]/g, "")
  if (!cleaned) return null

  // Handle leading 00 (common international exit code, e.g. 0091 -> +91)
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.slice(2)
  }

  // Handle leading 0 for domestic mobile (e.g. 09876543210 -> +919876543210)
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = "+91" + cleaned.slice(1)
  }

  // Ensure leading +
  if (!cleaned.startsWith("+")) {
    // If 10 digits (typical mobile), default to +91
    if (cleaned.length === 10) {
      cleaned = "+91" + cleaned
    } else {
      cleaned = "+" + cleaned
    }
  }

  // Remove any redundant pluses
  cleaned = "+" + cleaned.replace(/\+/g, "")
  return cleaned
}

/**
 * Send a WhatsApp message to an international phone number.
 * @param {string} to - Recipient phone number (e.g., +919876543210 or +38267123456)
 * @param {string} message - Formatted message body
 * @returns {Promise<{success: boolean, provider: string, messageId?: string, simulated?: boolean}>}
 */
async function sendWhatsAppMessage(to, message) {
  try {
    const formattedPhone = normalizeWhatsAppNumber(to)
    if (!formattedPhone) {
      console.warn("[WhatsAppSender] Invalid or missing recipient phone number:", to)
      return { success: false, error: "Invalid phone number" }
    }

    const enabled = process.env.WHATSAPP_ENABLED !== "false"
    if (!enabled) {
      console.log(`[WhatsAppSender] WhatsApp dispatch is disabled via WHATSAPP_ENABLED=false`)
      return { success: true, disabled: true }
    }

    const provider = (process.env.WHATSAPP_PROVIDER || "meta").toLowerCase()

    // ── 1. Meta WhatsApp Cloud API (Graph API) ─────────────────────────────────
    const metaToken = process.env.WHATSAPP_API_TOKEN || process.env.META_WHATSAPP_TOKEN
    const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID

    if (
      provider === "meta" &&
      metaToken &&
      metaPhoneId &&
      !metaToken.includes("your_") &&
      !metaPhoneId.includes("your_")
    ) {
      const cleanTo = formattedPhone.replace("+", "") // Meta expects digits without '+'
      const metaUrl = `https://graph.facebook.com/v19.0/${metaPhoneId}/messages`

      const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanTo,
        type: "text",
        text: {
          preview_url: true,
          body: message,
        },
      }

      const res = await fetch(metaUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${metaToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data?.messages?.[0]?.id) {
        console.log(`[WhatsAppSender] ✅ Meta Cloud API message sent to ${formattedPhone} (id: ${data.messages[0].id})`)
        return {
          success: true,
          provider: "meta",
          delivered: true,
          messageId: data.messages[0].id,
        }
      } else {
        console.error(`[WhatsAppSender] ❌ Meta Cloud API error:`, data)
        // Fall back to simulated logging so flow continues
      }
    }

    // ── 2. Twilio WhatsApp API ─────────────────────────────────────────────────
    const twilioSid = process.env.TWILIO_ACCOUNT_SID
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN
    const twilioFrom = process.env.TWILIO_WHATSAPP_NUMBER || "+14155238886"

    if (
      provider === "twilio" &&
      twilioSid &&
      twilioAuth &&
      !twilioSid.includes("your_") &&
      !twilioAuth.includes("your_")
    ) {
      const fromFormatted = twilioFrom.startsWith("whatsapp:") ? twilioFrom : `whatsapp:${twilioFrom}`
      const toFormatted = `whatsapp:${formattedPhone}`
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`

      const bodyParams = new URLSearchParams({
        From: fromFormatted,
        To: toFormatted,
        Body: message,
      })

      const authHeader = "Basic " + Buffer.from(`${twilioSid}:${twilioAuth}`).toString("base64")
      const res = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: bodyParams.toString(),
      })

      const data = await res.json()
      if (res.ok && data?.sid) {
        console.log(`[WhatsAppSender] ✅ Twilio WhatsApp sent to ${formattedPhone} (sid: ${data.sid})`)
        return {
          success: true,
          provider: "twilio",
          delivered: true,
          messageId: data.sid,
        }
      } else {
        console.error(`[WhatsAppSender] ❌ Twilio WhatsApp error:`, data)
      }
    }

    // ── 3. Custom Gateway / Webhook ───────────────────────────────────────────
    const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL
    if (gatewayUrl && !gatewayUrl.includes("your_")) {
      const headers = { "Content-Type": "application/json" }
      if (process.env.WHATSAPP_GATEWAY_AUTH_HEADER) {
        headers["Authorization"] = process.env.WHATSAPP_GATEWAY_AUTH_HEADER
      }

      const res = await fetch(gatewayUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ to: formattedPhone, message }),
      })
      if (res.ok) {
        console.log(`[WhatsAppSender] ✅ Custom Gateway message sent to ${formattedPhone}`)
        return { success: true, provider: "custom_gateway", delivered: true }
      }
    }

    // ── 4. Simulated / Development Logger ─────────────────────────────────────
    console.log("\n" + "=".repeat(70))
    console.log(`📱 [WHATSAPP DISPATCH] Recipient: ${formattedPhone}`)
    console.log("-".repeat(70))
    console.log(message)
    console.log("=".repeat(70) + "\n")

    return {
      success: true,
      provider: "simulated",
      delivered: false,
      simulated: true,
      recipient: formattedPhone,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("[WhatsAppSender] Unexpected error dispatching message:", error.message)
    return { success: false, error: error.message }
  }
}

module.exports = {
  sendWhatsAppMessage,
  normalizeWhatsAppNumber,
}
