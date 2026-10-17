const SocialPost = require("../models/SocialPost")
const SocialAccount = require("../models/SocialAccount")
const { uploadFileToS3 } = require("../utils/imageUploader")
const { dispatchPostToPlatforms } = require("../services/socialDispatcher")

// Resolve LinkedIn redirect URI dynamically
const resolveLinkedInRedirectUri = (req) => {
  // 1. Explicit override passed from frontend
  if (req?.query?.redirectUri) {
    return req.query.redirectUri
  }
  if (req?.body?.redirectUri) {
    return req.body.redirectUri
  }

  // 2. Explicit environment override if configured and not matching old api route
  if (process.env.LINKEDIN_REDIRECT_URI && !process.env.LINKEDIN_REDIRECT_URI.includes("/api/v1/social-posts/oauth/linkedin/callback")) {
    return process.env.LINKEDIN_REDIRECT_URI
  }

  // 3. Fallback based on incoming request origin or referer
  if (req) {
    const origin = req.headers["origin"] || req.headers["referer"]
    if (origin) {
      try {
        const u = new URL(origin)
        return `${u.origin}/social-callback`
      } catch (e) {}
    }
  }

  const frontendUrl = process.env.FRONTEND_URL || "https://openhand.live"
  return `${frontendUrl.replace(/\/$/, "")}/social-callback`
}

// Helper to truncate text cleanly for Twitter's 280-character limit
const formatTweetText = (caption, hasUrl = true) => {
  if (!caption) return ""
  const maxLen = hasUrl ? 245 : 275
  if (caption.length <= maxLen) return caption
  const truncated = caption.slice(0, maxLen)
  const lastSpace = truncated.lastIndexOf(" ")
  return (lastSpace > 180 ? truncated.slice(0, lastSpace) : truncated) + "..."
}

// Helper function to build web share intents
const generateShareIntents = (caption, mediaUrl) => {
  const domain = process.env.PUBLIC_DOMAIN || "https://openhand.live"
  const shareTargetUrl = mediaUrl || domain
  const encodedUrl = encodeURIComponent(shareTargetUrl)
  const encodedText = encodeURIComponent(caption || "")
  const tweetText = formatTweetText(caption, Boolean(shareTargetUrl))
  const encodedTweet = encodeURIComponent(tweetText)

  return {
    instagram: "https://www.instagram.com/",
    twitter: `https://twitter.com/intent/tweet?text=${encodedTweet}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`,
    linkedinShare: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
  }
}

// 1. Create Post (Draft, Scheduled, or Published)
exports.createPost = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const { title, caption, mediaUrl: rawMediaUrl, platforms: rawPlatforms, status, scheduledAt } = req.body

    if (!caption) {
      return res.status(400).json({
        success: false,
        message: "Caption is required for creating a social media post",
      })
    }

    let platforms = []
    if (typeof rawPlatforms === "string") {
      try {
        platforms = JSON.parse(rawPlatforms)
      } catch (e) {
        platforms = [rawPlatforms]
      }
    } else if (Array.isArray(rawPlatforms)) {
      platforms = rawPlatforms
    }
    if (!platforms || platforms.length === 0) {
      platforms = ["instagram", "twitter", "linkedin", "facebook"]
    }

    let mediaUrl = rawMediaUrl || ""
    if (req.files && req.files.mediaFile) {
      try {
        const uploadDetails = await uploadFileToS3(
          req.files.mediaFile,
          "social_posts"
        )
        mediaUrl = uploadDetails.url
      } catch (uploadErr) {
        console.warn("S3 upload warning in social post:", uploadErr.message)
      }
    }

    const shareIntents = generateShareIntents(caption, mediaUrl)
    const postStatus = status || "published"

    const post = await SocialPost.create({
      practitioner: practitionerId,
      title: title || "Social Update",
      caption,
      mediaUrl,
      platforms,
      status: postStatus,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      publishedAt: postStatus === "published" ? new Date() : null,
      webShareIntents: shareIntents,
      metrics: {
        views: 0,
        likes: 0,
        shares: 0,
      },
    })

    // If published immediately, dispatch directly to connected social media platforms
    let dispatchResults = {}
    if (postStatus === "published") {
      try {
        dispatchResults = await dispatchPostToPlatforms(practitionerId, post)
        post.dispatchResults = dispatchResults
        const successfulCount = Object.values(dispatchResults).filter((r) => r && r.success).length
        post.metrics.shares += successfulCount
        await post.save()
      } catch (dispatchErr) {
        console.error("Auto dispatch error on createPost:", dispatchErr)
      }
    }

    return res.status(201).json({
      success: true,
      message: "Social post created successfully",
      post,
      dispatchResults,
    })
  } catch (error) {
    console.error("Error in createPost:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to create social post",
      error: error.message,
    })
  }
}

// ITEM 15 FIX: Update Post (Draft / Scheduled / Active)
exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params
    const practitionerId = req.user.id
    const { title, caption, mediaUrl: rawMediaUrl, platforms: rawPlatforms, status, scheduledAt } = req.body

    const post = await SocialPost.findOne({ _id: postId, practitioner: practitionerId })
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or unauthorized",
      })
    }

    if (title !== undefined) post.title = title
    if (caption !== undefined) post.caption = caption

    if (rawPlatforms) {
      let platforms = []
      if (typeof rawPlatforms === "string") {
        try {
          platforms = JSON.parse(rawPlatforms)
        } catch (e) {
          platforms = [rawPlatforms]
        }
      } else if (Array.isArray(rawPlatforms)) {
        platforms = rawPlatforms
      }
      if (platforms.length) post.platforms = platforms
    }

    let mediaUrl = rawMediaUrl !== undefined ? rawMediaUrl : post.mediaUrl
    if (req.files && req.files.mediaFile) {
      try {
        const uploadDetails = await uploadFileToS3(
          req.files.mediaFile,
          "social_posts"
        )
        mediaUrl = uploadDetails.url
      } catch (uploadErr) {
        console.warn("S3 upload warning in update post:", uploadErr.message)
      }
    }
    post.mediaUrl = mediaUrl

    if (status) post.status = status
    if (scheduledAt !== undefined) post.scheduledAt = scheduledAt ? new Date(scheduledAt) : null
    if (post.status === "published" && !post.publishedAt) post.publishedAt = new Date()

    post.webShareIntents = generateShareIntents(post.caption, post.mediaUrl)
    await post.save()

    return res.status(200).json({
      success: true,
      message: "Social post updated successfully",
      post,
    })
  } catch (error) {
    console.error("Error in updatePost:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to update social post",
      error: error.message,
    })
  }
}

// 2. Get Practitioner Posts
exports.getPractitionerPosts = async (req, res) => {
  try {
    const practitionerId = req.user.id

    const posts = await SocialPost.find({ practitioner: practitionerId })
      .sort({ createdAt: -1 })
      .exec()

    return res.status(200).json({
      success: true,
      posts,
    })
  } catch (error) {
    console.error("Error in getPractitionerPosts:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch practitioner posts",
      error: error.message,
    })
  }
}

// 3. Publish Post Now
exports.publishPostNow = async (req, res) => {
  try {
    const { postId } = req.params
    const practitionerId = req.user.id

    const post = await SocialPost.findOne({ _id: postId, practitioner: practitionerId })

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Social post not found",
      })
    }

    const shareIntents = generateShareIntents(post.caption, post.mediaUrl)
    post.status = "published"
    post.publishedAt = new Date()
    post.webShareIntents = shareIntents

    let dispatchResults = {}
    try {
      dispatchResults = await dispatchPostToPlatforms(practitionerId, post)
      post.dispatchResults = dispatchResults
      const successfulCount = Object.values(dispatchResults).filter((r) => r && r.success).length
      post.metrics.shares += (successfulCount > 0 ? successfulCount : 1)
    } catch (dispatchErr) {
      console.error("Auto dispatch error on publishPostNow:", dispatchErr)
      post.metrics.shares += 1
    }

    await post.save()

    return res.status(200).json({
      success: true,
      message: "Post published to social channels!",
      post,
      dispatchResults,
    })
  } catch (error) {
    console.error("Error in publishPostNow:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to publish post",
      error: error.message,
    })
  }
}

// 4. Delete Post
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params
    const practitionerId = req.user.id

    const post = await SocialPost.findOneAndDelete({ _id: postId, practitioner: practitionerId })

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or unauthorized",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    })
  } catch (error) {
    console.error("Error in deletePost:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to delete post",
      error: error.message,
    })
  }
}

// 5. Get Connected Social Accounts
exports.getSocialAccounts = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const accounts = await SocialAccount.find({ practitioner: practitionerId }).exec()

    return res.status(200).json({
      success: true,
      accounts: accounts || [],
    })
  } catch (error) {
    console.error("Error in getSocialAccounts:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch social accounts",
      error: error.message,
    })
  }
}

// 6. Connect, Update or Disconnect Social Account
exports.toggleSocialAccountConnection = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const { platform, handle, accountName, action } = req.body

    if (!platform) {
      return res.status(400).json({
        success: false,
        message: "Platform is required",
      })
    }

    const cleanHandle = (rawHandle) => {
      if (!rawHandle) return ""
      let clean = String(rawHandle).trim().replace(/\/+$/, "")
      if (clean.includes("/") || clean.startsWith("http")) {
        const parts = clean.split("/").filter(Boolean)
        clean = parts[parts.length - 1] || clean
      }
      clean = clean.replace(/^@+/, "")
      return `@${clean}`
    }

    let account = await SocialAccount.findOne({ practitioner: practitionerId, platform })

    if (action === "disconnect") {
      if (account) {
        account.isConnected = false
        await account.save()
      }
      return res.status(200).json({
        success: true,
        message: `${platform.toUpperCase()} disconnected`,
        account,
      })
    }

    // Connect or update handle
    if (!account) {
      account = new SocialAccount({ practitioner: practitionerId, platform })
    }

    if (handle) {
      account.handle = cleanHandle(handle)
      account.accountName = accountName || account.handle
    } else if (!account.handle) {
      return res.status(400).json({
        success: false,
        message: "Social handle or username is required to connect",
      })
    }

    account.isConnected = true
    account.connectedAt = new Date()
    await account.save()

    return res.status(200).json({
      success: true,
      message: `${platform.toUpperCase()} connected successfully as ${account.handle}!`,
      account,
    })
  } catch (error) {
    console.error("Error in toggleSocialAccountConnection:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to update social account connection",
      error: error.message,
    })
  }
}

// 7. Track Share Event
exports.trackShare = async (req, res) => {
  try {
    const { postId } = req.params
    const practitionerId = req.user.id

    const post = await SocialPost.findOne({ _id: postId, practitioner: practitionerId })

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or unauthorized",
      })
    }

    post.metrics.shares += 1
    await post.save()

    return res.status(200).json({
      success: true,
      message: "Share tracked successfully",
      shares: post.metrics.shares,
    })
  } catch (error) {
    console.error("Error in trackShare:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to track share",
      error: error.message,
    })
  }
}

// 8. Generate LinkedIn OAuth Authorization URL
exports.getLinkedInAuthUrl = async (req, res) => {
  try {
    const userId = req.user.id
    const clientId = process.env.LINKEDIN_CLIENT_ID
    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "LinkedIn Client ID is not configured in backend environment",
      })
    }

    const redirectUri = resolveLinkedInRedirectUri(req)
    const returnTo = req.query.returnTo || "/practice?tab=channels"

    const state = Buffer.from(
      JSON.stringify({ userId, redirectUri, returnTo, isSocialStudio: true, platform: "linkedin", timestamp: Date.now() })
    ).toString("base64")

    // Scopes for LinkedIn API
    const scope = "openid profile email w_member_social"

    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(scope)}`

    return res.status(200).json({
      success: true,
      url,
      redirectUri,
    })
  } catch (error) {
    console.error("Error generating LinkedIn auth url:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to generate LinkedIn authorization URL",
      error: error.message,
    })
  }
}

// 9. LinkedIn OAuth Callback (Exchanges code for access token and saves profile)
exports.linkedInAuthCallback = async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000"
  const isJson = req.method === "POST" || req.headers.accept?.includes("application/json") || req.is?.("json")

  try {
    const code = req.query?.code || req.body?.code
    const state = req.query?.state || req.body?.state
    const authError = req.query?.error || req.body?.error
    const error_description = req.query?.error_description || req.body?.error_description

    if (authError) {
      console.warn("LinkedIn OAuth error from LinkedIn:", authError, error_description)
      if (isJson) {
        return res.status(400).json({ success: false, error: error_description || authError })
      }
      return res.redirect(
        `${frontendUrl}/practice?tab=channels&linkedin_error=${encodeURIComponent(
          error_description || authError
        )}`
      )
    }

    if (!code || !state) {
      if (isJson) {
        return res.status(400).json({ success: false, message: "Missing code or state" })
      }
      return res.redirect(
        `${frontendUrl}/practice?tab=channels&linkedin_error=Missing+code+or+state`
      )
    }

    let parsedState = {}
    try {
      parsedState = JSON.parse(Buffer.from(state, "base64").toString("ascii"))
    } catch (parseErr) {
      try {
        parsedState = JSON.parse(decodeURIComponent(state))
      } catch (err2) {
        console.error("Failed to decode LinkedIn OAuth state:", parseErr)
        if (isJson) {
          return res.status(400).json({ success: false, message: "Invalid state parameter" })
        }
        return res.redirect(
          `${frontendUrl}/practice?tab=channels&linkedin_error=Invalid+state+parameter`
        )
      }
    }

    const userId = parsedState.userId || req.user?.id
    const redirectUri = req.body?.redirectUri || parsedState.redirectUri || resolveLinkedInRedirectUri(req)
    const returnTo = parsedState.returnTo || "/practice?tab=channels"

    if (!userId) {
      if (isJson) {
        return res.status(400).json({ success: false, message: "User missing from state" })
      }
      return res.redirect(
        `${frontendUrl}/practice?tab=channels&linkedin_error=User+missing+from+state`
      )
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
    const effectiveRedirectUri = redirectUri

    // Exchange authorization code for access token
    const tokenParams = new URLSearchParams()
    tokenParams.append("grant_type", "authorization_code")
    tokenParams.append("code", code)
    tokenParams.append("redirect_uri", effectiveRedirectUri)
    tokenParams.append("client_id", clientId)
    tokenParams.append("client_secret", clientSecret)

    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenParams.toString(),
    })

    const tokenData = await tokenRes.json()

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("LinkedIn token exchange error:", tokenData)
      const msg = tokenData.error_description || tokenData.error || "Failed to exchange token"
      if (isJson) {
        return res.status(400).json({ success: false, message: msg })
      }
      return res.redirect(
        `${frontendUrl}/practice?tab=channels&linkedin_error=${encodeURIComponent(msg)}`
      )
    }

    const accessToken = tokenData.access_token
    const expiresIn = tokenData.expires_in
    const refreshToken = tokenData.refresh_token

    // Fetch user profile info via OpenID userinfo
    let platformUserId = ""
    let accountName = "LinkedIn Member"
    let handle = "@linkedin_user"
    let avatarUrl = ""

    try {
      const userinfoRes = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (userinfoRes.ok) {
        const uInfo = await userinfoRes.json()
        if (uInfo.sub) {
          platformUserId = `urn:li:person:${uInfo.sub}`
        }
        if (uInfo.name) {
          accountName = uInfo.name
          handle = `@${uInfo.name.replace(/\s+/g, "").toLowerCase()}`
        }
        if (uInfo.picture) {
          avatarUrl = uInfo.picture
        }
      }
    } catch (uErr) {
      console.warn("userinfo fetch warning:", uErr.message)
    }

    // Fallback to /v2/me if sub not found
    if (!platformUserId) {
      try {
        const meRes = await fetch("https://api.linkedin.com/v2/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (meRes.ok) {
          const meData = await meRes.json()
          if (meData.id) {
            platformUserId = `urn:li:person:${meData.id}`
          }
          if (meData.localizedFirstName) {
            accountName = `${meData.localizedFirstName} ${meData.localizedLastName || ""}`.trim()
            handle = `@${accountName.replace(/\s+/g, "").toLowerCase()}`
          }
        }
      } catch (meErr) {
        console.warn("/v2/me fetch warning:", meErr.message)
      }
    }

    // Save or update SocialAccount in MongoDB
    let account = await SocialAccount.findOne({ practitioner: userId, platform: "linkedin" })
    if (!account) {
      account = new SocialAccount({ practitioner: userId, platform: "linkedin" })
    }

    account.isConnected = true
    account.isAuthorized = true
    account.accessToken = accessToken
    if (refreshToken) account.refreshToken = refreshToken
    if (expiresIn) account.tokenExpiry = new Date(Date.now() + expiresIn * 1000)
    if (platformUserId) account.platformUserId = platformUserId
    if (accountName) account.accountName = accountName
    if (handle) account.handle = handle
    if (avatarUrl) account.avatarUrl = avatarUrl
    account.connectedAt = new Date()

    await account.save()

    if (isJson) {
      return res.status(200).json({
        success: true,
        message: "LinkedIn connected and authorized successfully!",
        account,
        returnTo,
      })
    }

    const destination = returnTo || "/practice?tab=channels"
    const sep = destination.includes("?") ? "&" : "?"
    return res.redirect(`${frontendUrl}${destination}${sep}social_connected=linkedin`)
  } catch (error) {
    console.error("LinkedIn callback error:", error)
    if (isJson) {
      return res.status(500).json({ success: false, message: error.message })
    }
    return res.redirect(
      `${frontendUrl}/practice?tab=channels&linkedin_error=${encodeURIComponent(
        error.message
      )}`
    )
  }
}

// 10. Direct Token Connection (Allows pasting LinkedIn Access Token or API Token)
exports.connectTokenDirectly = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const { platform, accessToken, handle, platformUserId } = req.body

    if (!platform || !accessToken) {
      return res.status(400).json({
        success: false,
        message: "Platform and Access Token are required",
      })
    }

    let resolvedUrn = platformUserId || ""
    let resolvedName = handle || `${platform} User`
    let resolvedHandle = handle || `@${platform}_user`
    let avatarUrl = ""

    // If platform is LinkedIn, verify and resolve userinfo
    if (platform === "linkedin") {
      try {
        const uRes = await fetch("https://api.linkedin.com/v2/userinfo", {
          headers: { Authorization: `Bearer ${accessToken.trim()}` },
        })
        if (uRes.ok) {
          const uInfo = await uRes.json()
          if (uInfo.sub) resolvedUrn = `urn:li:person:${uInfo.sub}`
          if (uInfo.name) {
            resolvedName = uInfo.name
            resolvedHandle = `@${uInfo.name.replace(/\s+/g, "").toLowerCase()}`
          }
          if (uInfo.picture) avatarUrl = uInfo.picture
        } else {
          const meRes = await fetch("https://api.linkedin.com/v2/me", {
            headers: { Authorization: `Bearer ${accessToken.trim()}` },
          })
          if (meRes.ok) {
            const meData = await meRes.json()
            if (meData.id) resolvedUrn = `urn:li:person:${meData.id}`
            if (meData.localizedFirstName) {
              resolvedName = `${meData.localizedFirstName} ${meData.localizedLastName || ""}`.trim()
              resolvedHandle = `@${resolvedName.replace(/\s+/g, "").toLowerCase()}`
            }
          }
        }
      } catch (verifyErr) {
        console.warn("LinkedIn direct token verification warning:", verifyErr.message)
      }
    }

    let account = await SocialAccount.findOne({ practitioner: practitionerId, platform })
    if (!account) {
      account = new SocialAccount({ practitioner: practitionerId, platform })
    }

    account.isConnected = true
    account.isAuthorized = true
    account.accessToken = accessToken.trim()
    if (resolvedUrn) account.platformUserId = resolvedUrn
    if (resolvedName) account.accountName = resolvedName
    if (resolvedHandle) account.handle = resolvedHandle
    if (avatarUrl) account.avatarUrl = avatarUrl
    account.connectedAt = new Date()

    await account.save()

    return res.status(200).json({
      success: true,
      message: `${platform.toUpperCase()} token connected and verified successfully! Direct auto-posting is now enabled.`,
      account,
    })
  } catch (error) {
    console.error("Error in connectTokenDirectly:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to connect token",
      error: error.message,
    })
  }
}


