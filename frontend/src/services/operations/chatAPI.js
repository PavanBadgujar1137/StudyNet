import { apiConnector } from "../apiConnector"
import { chatEndpoints } from "../apis"
import toast from "react-hot-toast"

const {
  GET_GLOBAL_CHAT_API,
  SEND_GLOBAL_CHAT_API,
  GET_GROUP_CHAT_API,
  SEND_GROUP_CHAT_API,
  GET_DIRECT_CHAT_API,
  SEND_DIRECT_CHAT_API,
  GET_CHAT_CONTACTS_API,
} = chatEndpoints

export const fetchGlobalMessages = async (token) => {
  try {
    const response = await apiConnector("GET", GET_GLOBAL_CHAT_API, null, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to load global chat")
    }
    return response?.data?.data || []
  } catch (error) {
    console.error("fetchGlobalMessages error:", error)
    return []
  }
}

export const sendGlobalMessage = async (token, content) => {
  try {
    const response = await apiConnector(
      "POST",
      SEND_GLOBAL_CHAT_API,
      { content },
      { Authorization: `Bearer ${token}` }
    )
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to send message")
    }
    return response?.data?.data
  } catch (error) {
    console.error("sendGlobalMessage error:", error)
    toast.error(error.message || "Could not send message")
    return null
  }
}

export const fetchGroupMessages = async (token, practitionerId) => {
  if (!practitionerId) return []
  try {
    const response = await apiConnector(
      "GET",
      `${GET_GROUP_CHAT_API}/${practitionerId}`,
      null,
      { Authorization: `Bearer ${token}` }
    )
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to load group chat")
    }
    return response?.data?.data || []
  } catch (error) {
    console.error("fetchGroupMessages error:", error)
    return []
  }
}

export const sendGroupMessage = async (token, practitionerId, content) => {
  try {
    const response = await apiConnector(
      "POST",
      `${SEND_GROUP_CHAT_API}/${practitionerId}`,
      { content },
      { Authorization: `Bearer ${token}` }
    )
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to send group message")
    }
    return response?.data?.data
  } catch (error) {
    console.error("sendGroupMessage error:", error)
    toast.error(error.message || "Could not send group message")
    return null
  }
}

export const fetchDirectMessages = async (token, targetUserId) => {
  if (!targetUserId) return []
  try {
    const response = await apiConnector(
      "GET",
      `${GET_DIRECT_CHAT_API}/${targetUserId}`,
      null,
      { Authorization: `Bearer ${token}` }
    )
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to load direct chat")
    }
    return response?.data?.data || []
  } catch (error) {
    console.error("fetchDirectMessages error:", error)
    return []
  }
}

export const sendDirectMessage = async (token, targetUserId, content) => {
  try {
    const response = await apiConnector(
      "POST",
      `${SEND_DIRECT_CHAT_API}/${targetUserId}`,
      { content },
      { Authorization: `Bearer ${token}` }
    )
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to send message")
    }
    return response?.data?.data
  } catch (error) {
    console.error("sendDirectMessage error:", error)
    toast.error(error.message || "Could not send message")
    return null
  }
}

export const fetchChatContacts = async (token) => {
  try {
    const response = await apiConnector("GET", GET_CHAT_CONTACTS_API, null, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to load chat contacts")
    }
    return response?.data?.data || []
  } catch (error) {
    console.error("fetchChatContacts error:", error)
    return []
  }
}
