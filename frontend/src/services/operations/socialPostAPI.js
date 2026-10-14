import { apiConnector } from "../apiConnector"
import { socialPostEndpoints } from "../apis"
import toast from "react-hot-toast"

const endpoints = socialPostEndpoints || {}
const CREATE_POST_API = endpoints.CREATE_POST_API || "/api/v1/social-posts/create"
const GET_POSTS_API = endpoints.GET_POSTS_API || "/api/v1/social-posts/mine"
const PUBLISH_POST_API = endpoints.PUBLISH_POST_API || "/api/v1/social-posts"
const DELETE_POST_API = endpoints.DELETE_POST_API || "/api/v1/social-posts"
const GET_ACCOUNTS_API = endpoints.GET_ACCOUNTS_API || "/api/v1/social-posts/accounts"
const TOGGLE_ACCOUNT_API = endpoints.TOGGLE_ACCOUNT_API || "/api/v1/social-posts/accounts/toggle"
const TRACK_SHARE_API = endpoints.TRACK_SHARE_API || "/api/v1/social-posts"

// Create a new social post
export const createSocialPost = async (formData, token) => {
  const toastId = toast.loading("Creating social post...")
  try {
    const response = await apiConnector("POST", CREATE_POST_API, formData, {
      Authorization: `Bearer ${token}`,
      "Content-Type": formData instanceof FormData ? "multipart/form-data" : "application/json",
    })

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to create post")
    }

    toast.success("Social post created successfully!", { id: toastId })
    return response.data.post
  } catch (error) {
    console.error("createSocialPost error:", error)
    toast.error(error?.response?.data?.message || error?.message || "Error creating post", { id: toastId })
    return null
  }
}

// Update an existing social post (Draft / Scheduled / Active)
export const updateSocialPost = async (postId, formData, token) => {
  const toastId = toast.loading("Updating social post...")
  try {
    const response = await apiConnector("PUT", `/api/v1/social-posts/update/${postId}`, formData, {
      Authorization: `Bearer ${token}`,
      "Content-Type": formData instanceof FormData ? "multipart/form-data" : "application/json",
    })

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to update post")
    }

    toast.success("Social post updated successfully!", { id: toastId })
    return response.data.post
  } catch (error) {
    console.error("updateSocialPost error:", error)
    toast.error(error?.response?.data?.message || error?.message || "Error updating post", { id: toastId })
    return null
  }
}


// Fetch all practitioner posts
export const fetchPractitionerPosts = async (token) => {
  try {
    const response = await apiConnector("GET", GET_POSTS_API, null, {
      Authorization: `Bearer ${token}`,
    })

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to fetch posts")
    }

    return response.data.posts || []
  } catch (error) {
    console.error("fetchPractitionerPosts error:", error)
    return []
  }
}

// Publish post immediately
export const publishSocialPostNow = async (postId, token) => {
  const toastId = toast.loading("Publishing post to social platforms...")
  try {
    const response = await apiConnector("POST", `${PUBLISH_POST_API}/${postId}/publish`, null, {
      Authorization: `Bearer ${token}`,
    })

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to publish post")
    }

    toast.success("Post published to active social channels! 🚀", { id: toastId })
    return response.data.post
  } catch (error) {
    console.error("publishSocialPostNow error:", error)
    toast.error("Failed to publish post", { id: toastId })
    return null
  }
}

// Delete post
export const deleteSocialPost = async (postId, token) => {
  const toastId = toast.loading("Deleting post...")
  try {
    const response = await apiConnector("DELETE", `${DELETE_POST_API}/${postId}`, null, {
      Authorization: `Bearer ${token}`,
    })

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to delete post")
    }

    toast.success("Post deleted", { id: toastId })
    return true
  } catch (error) {
    console.error("deleteSocialPost error:", error)
    toast.error("Failed to delete post", { id: toastId })
    return false
  }
}

// Get practitioner connected social accounts
export const fetchSocialAccounts = async (token) => {
  try {
    const response = await apiConnector("GET", GET_ACCOUNTS_API, null, {
      Authorization: `Bearer ${token}`,
    })

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to fetch social accounts")
    }

    return response.data.accounts || []
  } catch (error) {
    console.error("fetchSocialAccounts error:", error)
    return []
  }
}

// Toggle social account connection status
export const toggleSocialAccount = async (data, token) => {
  const toastId = toast.loading("Updating social channel connection...")
  try {
    const response = await apiConnector("POST", TOGGLE_ACCOUNT_API, data, {
      Authorization: `Bearer ${token}`,
    })

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to toggle account")
    }

    toast.success(response.data.message || "Connection updated", { id: toastId })
    return response.data.account
  } catch (error) {
    console.error("toggleSocialAccount error:", error)
    toast.error("Error updating account connection", { id: toastId })
    return null
  }
}

// Track post share click event in DB
export const trackPostShare = async (postId, token) => {
  try {
    const response = await apiConnector("POST", `${TRACK_SHARE_API}/${postId}/track-share`, null, {
      Authorization: `Bearer ${token}`,
    })
    return response?.data?.success || false
  } catch (error) {
    console.error("trackPostShare error:", error)
    return false
  }
}

// Get LinkedIn OAuth Auth URL
export const getLinkedInAuthUrl = async (token, returnTo) => {
  try {
    const urlEndpoint = endpoints.LINKEDIN_AUTH_URL_API || "/api/v1/social-posts/oauth/linkedin/url"
    const response = await apiConnector(
      "GET",
      `${urlEndpoint}?returnTo=${encodeURIComponent(returnTo || "/dashboard/my-profile?tab=social-studio")}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    )
    return response?.data?.url || null
  } catch (error) {
    console.error("getLinkedInAuthUrl error:", error)
    toast.error("Failed to generate LinkedIn authorization URL")
    return null
  }
}

// Connect token directly (for LinkedIn personal token or developer token)
export const connectSocialTokenDirectly = async (data, token) => {
  const toastId = toast.loading(`Connecting ${data.platform?.toUpperCase()} token...`)
  try {
    const response = await apiConnector(
      "POST",
      endpoints.CONNECT_TOKEN_API || "/api/v1/social-posts/accounts/connect-token",
      data,
      {
        Authorization: `Bearer ${token}`,
      }
    )

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to connect token")
    }

    toast.success(response.data.message || "Token connected & verified!", { id: toastId })
    return response.data.account
  } catch (error) {
    console.error("connectSocialTokenDirectly error:", error)
    toast.error(error?.response?.data?.message || error?.message || "Failed to connect token", { id: toastId })
    return null
  }
}

