const SocialAccount = require("../models/SocialAccount")

/**
 * Social Media Automated Publishing Service
 * Handles direct automated posting to LinkedIn, Twitter/X, and Meta platforms.
 */

// 1. Post to LinkedIn
const publishToLinkedIn = async (account, post) => {
  if (!account || !account.accessToken) {
    return {
      success: false,
      error: "LinkedIn account not authorized with an API Access Token.",
      requiresAuthorization: true,
    }
  }

  try {
    let authorUrn = account.platformUserId
    if (!authorUrn) {
      // Fetch user profile to get person URN
      try {
        const userinfoRes = await fetch("https://api.linkedin.com/v2/userinfo", {
          headers: { Authorization: `Bearer ${account.accessToken}` },
        })
        if (userinfoRes.ok) {
          const uInfo = await userinfoRes.json()
          authorUrn = `urn:li:person:${uInfo.sub}`
          account.platformUserId = authorUrn
          await account.save().catch(() => {})
        }
      } catch (_) {}
    }

    if (!authorUrn) {
      authorUrn = `urn:li:person:${account.handle.replace(/^@/, "")}`
    } else if (!authorUrn.startsWith("urn:li:")) {
      authorUrn = `urn:li:person:${authorUrn}`
    }

    // Try LinkedIn Community Management REST API v202401
    const postBody = {
      author: authorUrn,
      commentary: post.caption || post.title || "OpenHand Practitioner Post",
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }

    if (post.mediaUrl && (post.mediaUrl.startsWith("http://") || post.mediaUrl.startsWith("https://"))) {
      postBody.content = {
        article: {
          source: post.mediaUrl,
          title: post.title || "OpenHand Practice Update",
          description: (post.caption || "").slice(0, 200),
        },
      }
    }

    const restResponse = await fetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${account.accessToken}`,
        "LinkedIn-Version": "202401",
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postBody),
    })

    if (restResponse.ok || restResponse.status === 201) {
      const restliId = restResponse.headers.get("x-restli-id") || restResponse.headers.get("x-linkedin-id") || `li_${Date.now()}`
      return {
        success: true,
        platform: "linkedin",
        externalPostId: restliId,
        postUrl: `https://www.linkedin.com/feed/update/${restliId}`,
        publishedAt: new Date(),
        message: "Published directly to LinkedIn feed!",
      }
    }

    // Fallback: Try LinkedIn UGC Posts API
    const hasMedia = post.mediaUrl && (post.mediaUrl.startsWith("http://") || post.mediaUrl.startsWith("https://"))
    const ugcBody = {
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: post.caption || post.title || "OpenHand Practice Update",
          },
          shareMediaCategory: hasMedia ? "ARTICLE" : "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }

    if (hasMedia) {
      ugcBody.specificContent["com.linkedin.ugc.ShareContent"].media = [
        {
          status: "READY",
          originalUrl: post.mediaUrl,
          title: { text: post.title || "OpenHand Practice Update" },
          description: { text: (post.caption || "").slice(0, 200) },
        },
      ]
    }

    const ugcResponse = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${account.accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ugcBody),
    })

    if (ugcResponse.ok || ugcResponse.status === 201) {
      const ugcData = await ugcResponse.json().catch(() => ({}))
      const postId = ugcData.id || `ugc_${Date.now()}`
      return {
        success: true,
        platform: "linkedin",
        externalPostId: postId,
        postUrl: `https://www.linkedin.com/feed/update/${postId}`,
        publishedAt: new Date(),
        message: "Published directly to LinkedIn feed!",
      }
    }

    const errText = await restResponse.text().catch(() => "")
    console.warn("LinkedIn direct API response:", restResponse.status, errText)
    return {
      success: false,
      platform: "linkedin",
      error: `LinkedIn API error (${restResponse.status}): ${errText.slice(0, 150)}`,
      requiresAuthorization: restResponse.status === 401 || restResponse.status === 403,
    }
  } catch (err) {
    console.error("publishToLinkedIn network error:", err.message)
    return {
      success: false,
      platform: "linkedin",
      error: err.message,
    }
  }
}

// 2. Post to Twitter / X (API v2)
const publishToTwitter = async (account, post) => {
  const token = account?.accessToken || process.env.TWITTER_BEARER_TOKEN
  if (!token) {
    return {
      success: false,
      error: "Twitter account not authorized with an API token.",
      requiresAuthorization: true,
    }
  }

  try {
    const tweetText = post.mediaUrl
      ? `${post.caption}\n\n${post.mediaUrl}`.slice(0, 280)
      : (post.caption || "").slice(0, 280)

    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: tweetText }),
    })

    if (response.ok || response.status === 201) {
      const data = await response.json().catch(() => ({}))
      return {
        success: true,
        platform: "twitter",
        externalPostId: data.data?.id || `tw_${Date.now()}`,
        publishedAt: new Date(),
        message: "Tweet posted directly to 𝕏 / Twitter!",
      }
    }

    const errText = await response.text().catch(() => "")
    return {
      success: false,
      platform: "twitter",
      error: `Twitter API error (${response.status}): ${errText.slice(0, 150)}`,
      requiresAuthorization: response.status === 401 || response.status === 403,
    }
  } catch (err) {
    return {
      success: false,
      platform: "twitter",
      error: err.message,
    }
  }
}

// 3. Post to Facebook (Graph API v19.0)
const publishToFacebook = async (account, post) => {
  if (!account || !account.accessToken) {
    return {
      success: false,
      error: "Facebook account not authorized with a Page Access Token.",
      requiresAuthorization: true,
    }
  }

  try {
    const pageId = account.platformUserId || "me"
    const params = new URLSearchParams()
    params.append("message", post.caption || "")
    if (post.mediaUrl && post.mediaUrl.startsWith("http")) {
      params.append("link", post.mediaUrl)
    }
    params.append("access_token", account.accessToken)

    const response = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
      method: "POST",
      body: params,
    })

    if (response.ok) {
      const data = await response.json().catch(() => ({}))
      return {
        success: true,
        platform: "facebook",
        externalPostId: data.id || `fb_${Date.now()}`,
        publishedAt: new Date(),
        message: "Published directly to Facebook Page!",
      }
    }

    const errData = await response.json().catch(() => ({}))
    return {
      success: false,
      platform: "facebook",
      error: errData.error?.message || "Failed to post to Facebook",
      requiresAuthorization: true,
    }
  } catch (err) {
    return {
      success: false,
      platform: "facebook",
      error: err.message,
    }
  }
}

// 4. Master Dispatcher: Dispatches to all selected platforms
const dispatchPostToPlatforms = async (practitionerId, post) => {
  const platforms = Array.isArray(post.platforms) ? post.platforms : []
  if (platforms.length === 0) {
    return {}
  }

  const accounts = await SocialAccount.find({
    practitioner: practitionerId,
    platform: { $in: platforms },
    isConnected: true,
  })

  const accountMap = {}
  accounts.forEach((acc) => {
    accountMap[acc.platform] = acc
  })

  const results = {}

  for (const plat of platforms) {
    const acc = accountMap[plat]

    if (plat === "linkedin") {
      if (acc && acc.accessToken) {
        results.linkedin = await publishToLinkedIn(acc, post)
      } else {
        results.linkedin = {
          success: true,
          platform: "linkedin",
          mode: "broadcast_ready",
          handle: acc?.handle || "",
          message: acc?.handle ? `Connected as ${acc.handle} • 1-Click Launch Ready` : "1-Click Launch Ready for LinkedIn",
          shareUrl: `https://www.linkedin.com/feed/?shareActive=true`,
        }
      }
    } else if (plat === "twitter") {
      if (acc && acc.accessToken) {
        results.twitter = await publishToTwitter(acc, post)
      } else {
        const rawCaption = post.caption || ""
        const mediaUrl = post.mediaUrl || ""
        const maxChars = mediaUrl ? 240 : 270
        let tweetText = rawCaption
        if (rawCaption.length > maxChars) {
          const truncated = rawCaption.slice(0, maxChars)
          const lastSpace = truncated.lastIndexOf(" ")
          tweetText = (lastSpace > 160 ? truncated.slice(0, lastSpace) : truncated) + "..."
        }
        const twitterIntentUrl = mediaUrl
          ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(mediaUrl)}`
          : `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`

        results.twitter = {
          success: true,
          platform: "twitter",
          mode: "broadcast_ready",
          handle: acc?.handle || "",
          message: acc?.handle ? `Connected as ${acc.handle} • Ready for 1-click tweet` : "Ready to launch on 𝕏 (Twitter)",
          shareUrl: twitterIntentUrl,
        }
      }
    } else if (plat === "facebook") {
      if (acc && acc.accessToken) {
        results.facebook = await publishToFacebook(acc, post)
      } else {
        results.facebook = {
          success: true,
          platform: "facebook",
          mode: "broadcast_ready",
          handle: acc?.handle || "",
          message: acc?.handle ? `Connected as ${acc.handle} • Ready for Facebook share` : "Ready to post on Facebook",
          shareUrl: `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(post.caption || "")}`,
        }
      }
    } else if (plat === "instagram") {
      results.instagram = {
        success: true,
        platform: "instagram",
        mode: "broadcast_ready",
        handle: acc?.handle || "",
        message: acc?.handle ? `Connected as ${acc.handle} • Photo & caption ready to upload` : "Ready to upload on Instagram",
        shareUrl: "https://www.instagram.com/",
      }
    }
  }

  return results
}

module.exports = {
  publishToLinkedIn,
  publishToTwitter,
  publishToFacebook,
  dispatchPostToPlatforms,
}
