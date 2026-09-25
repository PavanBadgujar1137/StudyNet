const { AccessToken, RoomServiceClient } = require("livekit-server-sdk")

/**
 * LiveKit WebRTC Service Helper
 * Docs: https://docs.livekit.io/server/
 *
 * Environment variables:
 *   LIVEKIT_API_KEY
 *   LIVEKIT_API_SECRET
 *   LIVEKIT_SERVER_URL  (e.g., wss://your-project.livekit.cloud)
 */

const getLiveKitConfig = () => {
  const apiKey = process.env.LIVEKIT_API_KEY || "devkey"
  const apiSecret = process.env.LIVEKIT_API_SECRET || "secret_openhand_livekit_key_2026"
  const serverUrl = process.env.LIVEKIT_SERVER_URL || process.env.LIVEKIT_URL || "wss://openhand-live.livekit.cloud"

  return { apiKey, apiSecret, serverUrl }
}

/**
 * Sanitize and format a room name for a live class
 */
const generateRoomName = (classId, title = "") => {
  const cleanTitle = (title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 30)

  return `openhand-${cleanTitle ? cleanTitle + "-" : ""}${classId}`
}

/**
 * Generate a cryptographically signed LiveKit Access Token
 *
 * @param {object} params
 * @param {string} params.roomName - Unique LiveKit room identifier
 * @param {string} params.identity - Unique participant user ID
 * @param {string} params.name - Display name of participant
 * @param {boolean} params.isHost - Whether participant is Instructor/Practitioner
 * @param {object} [params.metadata] - Extra metadata (role, avatar, etc.)
 * @param {number} [params.ttlSeconds=21600] - Token TTL (default 6 hours)
 * @returns {Promise<{ token: string, serverUrl: string, roomName: string }>}
 */
const generateLiveKitToken = async ({
  roomName,
  identity,
  name,
  isHost = false,
  metadata = {},
  ttlSeconds = 21600, // 6 hours
}) => {
  const { apiKey, apiSecret, serverUrl } = getLiveKitConfig()

  const at = new AccessToken(apiKey, apiSecret, {
    identity: String(identity),
    name: name || `Participant-${identity}`,
    metadata: typeof metadata === "string" ? metadata : JSON.stringify(metadata),
    ttl: `${ttlSeconds}s`,
  })

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    roomAdmin: Boolean(isHost),
    roomRecord: Boolean(isHost),
    canUpdateOwnMetadata: true,
  })

  const token = await at.toJwt()

  return {
    token,
    serverUrl,
    roomName,
  }
}

/**
 * Optionally end/close a LiveKit room on the server when instructor leaves
 */
const closeLiveKitRoom = async (roomName) => {
  try {
    const { apiKey, apiSecret, serverUrl } = getLiveKitConfig()
    // Convert wss:// to https:// for REST client
    const httpUrl = serverUrl.replace(/^wss:\/\//i, "https://").replace(/^ws:\/\//i, "http://")
    const svc = new RoomServiceClient(httpUrl, apiKey, apiSecret)
    await svc.deleteRoom(roomName)
    return true
  } catch (err) {
    console.warn(`[LiveKit] Could not close room ${roomName} via API (may already be empty):`, err.message)
    return false
  }
}

module.exports = {
  getLiveKitConfig,
  generateRoomName,
  generateLiveKitToken,
  closeLiveKitRoom,
}
