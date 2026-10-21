/**
 * OpenHand Circle Chat Message Notification Email Template
 * Drives user re-engagement and active traction in practitioner & peer growth circles.
 */

const getBrandHeader = (titleBadge = "👥 Circle Activity Alert") => `
  <div style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid #F1F5F9;">
    <a href="https://openhand.live" style="text-decoration: none; font-size: 26px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px;">
      Open<span style="color: #2563EB;">Hand</span>
    </a>
    <div style="margin-top: 10px;">
      <span style="background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE; padding: 4px 14px; border-radius: 20px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
        ${titleBadge}
      </span>
    </div>
  </div>
`

const getBrandFooter = (settingsUrl) => `
  <div style="margin-top: 36px; padding-top: 24px; border-top: 1px solid #F1F5F9; text-align: center; color: #94A3B8; font-size: 12px; line-height: 1.6;">
    <p style="margin: 0 0 6px 0;">You received this email because you are a member of this Circle on OpenHand.</p>
    <p style="margin: 0 0 12px 0;">
      To customize your email or WhatsApp alert preferences, visit your 
      <a href="${settingsUrl}" style="color: #2563EB; font-weight: 600; text-decoration: underline;">Notification Settings</a>.
    </p>
    <p style="margin: 0; font-size: 11px; color: #CBD5E1;">© ${new Date().getFullYear()} OpenHand. All rights reserved.</p>
  </div>
`

exports.circleChatMessageEmail = ({
  recipientName = "Learner",
  senderName = "A Circle Member",
  senderAccountType = "Member",
  circleName = "Peer Growth Circle",
  circleTopic = "",
  messageContent = "",
  attachmentsCount = 0,
  chatUrl = "https://openhand.live/dashboard?tab=community",
  settingsUrl = "https://openhand.live/dashboard?tab=profile",
}) => {
  const isFacilitator =
    senderAccountType === "Practitioner" || senderAccountType === "Instructor"

  const senderRoleLabel = isFacilitator ? "Circle Facilitator" : "Circle Peer"
  const senderRoleColor = isFacilitator ? "#1D4ED8" : "#059669"
  const senderRoleBg = isFacilitator ? "#DBEAFE" : "#D1FAE5"

  const sanitizedContent = messageContent
    ? messageContent
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br/>")
    : "Shared an attachment"

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Message in ${circleName} — OpenHand</title>
</head>
<body style="background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px; color: #0F172A;">
  <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; border: 1px solid #E2E8F0; padding: 36px 32px; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.04);">
    ${getBrandHeader("👥 Circle Activity Alert")}

    <div style="padding: 24px 0 12px 0;">
      <!-- Circle Context Header Banner -->
      <div style="background: linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%); border: 1px solid #BFDBFE; border-radius: 14px; padding: 14px 18px; margin-bottom: 22px;">
        <div style="font-size: 11px; font-weight: 800; color: #1D4ED8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">
          Circle Conversation
        </div>
        <div style="font-size: 17px; font-weight: 800; color: #0F172A;">
          ${circleName}
        </div>
        ${circleTopic ? `<div style="font-size: 12.5px; color: #475569; margin-top: 4px;">${circleTopic}</div>` : ""}
      </div>

      <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 18px 0;">
        Hello <strong>${recipientName}</strong>,
      </p>
      <p style="font-size: 14.5px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
        <strong>${senderName}</strong> posted a new message in your Circle:
      </p>

      <!-- Message Card -->
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #2563EB; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <div>
            <span style="font-size: 14px; font-weight: 800; color: #0F172A;">${senderName}</span>
            <span style="display: inline-block; margin-left: 8px; background: ${senderRoleBg}; color: ${senderRoleColor}; font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 12px; text-transform: uppercase;">
              ${senderRoleLabel}
            </span>
          </div>
          <span style="font-size: 11.5px; color: #94A3B8;">Just now</span>
        </div>
        <div style="font-size: 14.5px; color: #1E293B; line-height: 1.65;">
          ${sanitizedContent}
        </div>
        ${
          attachmentsCount > 0
            ? `<div style="margin-top: 10px; font-size: 12px; color: #2563EB; font-weight: 600;">📎 ${attachmentsCount} file/media attachment(s) included</div>`
            : ""
        }
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 28px 0 24px 0;">
        <a href="${chatUrl}" style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 30px; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);">
          Open Circle Chat &amp; Reply Now →
        </a>
      </div>

      <!-- Traction & Momentum Value Proposition Callout -->
      <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 14px 18px; font-size: 13px; color: #166534; line-height: 1.5; margin-top: 24px;">
        🌱 <strong>Why prompt replies matter:</strong> Interactive circles build lasting peer accountability and achieve 4x better outcomes. Your perspective makes a real difference in your community!
      </div>
    </div>

    ${getBrandFooter(settingsUrl)}
  </div>
</body>
</html>`
}
