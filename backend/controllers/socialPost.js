const SocialPost = require("../models/SocialPost")
const SocialAccount = require("../models/SocialAccount")
const { uploadImageToCloudinary } = require("../utils/imageUploader")

// Helper function to build web share intents
const generateShareIntents = (caption, mediaUrl) => {
  const encodedText = encodeURIComponent(caption || "")
  const domain = process.env.PUBLIC_DOMAIN || "https://openhand.live"
  const encodedUrl = encodeURIComponent(mediaUrl || domain)

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`,
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
      const uploadDetails = await uploadImageToCloudinary(
        req.files.mediaFile,
        process.env.FOLDER_NAME || "openhand_social_posts"
      )
      mediaUrl = uploadDetails.secure_url
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

    return res.status(201).json({
      success: true,
      message: "Social post created successfully",
      post,
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
      const uploadDetails = await uploadImageToCloudinary(
        req.files.mediaFile,
        process.env.FOLDER_NAME || "openhand_social_posts"
      )
      mediaUrl = uploadDetails.secure_url
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
    post.metrics.shares += 1

    await post.save()

    return res.status(200).json({
      success: true,
      message: "Post published to social channels!",
      post,
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

// 6. Toggle Social Account Connection
exports.toggleSocialAccountConnection = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const { platform, handle, accountName } = req.body

    if (!platform) {
      return res.status(400).json({
        success: false,
        message: "Platform is required",
      })
    }

    let account = await SocialAccount.findOne({ practitioner: practitionerId, platform })

    if (account) {
      if (!account.isConnected) {
        if (!handle && !account.handle) {
          return res.status(400).json({
            success: false,
            message: "Social handle or username is required to connect",
          })
        }
        account.isConnected = true
        if (handle) account.handle = handle.startsWith("@") ? handle : `@${handle}`
        if (accountName) account.accountName = accountName
        account.connectedAt = new Date()
      } else {
        account.isConnected = false
      }
      await account.save()
    } else {
      if (!handle) {
        return res.status(400).json({
          success: false,
          message: "Social handle or username is required to connect",
        })
      }
      account = await SocialAccount.create({
        practitioner: practitionerId,
        platform,
        handle: handle.startsWith("@") ? handle : `@${handle}`,
        accountName: accountName || handle,
        isConnected: true,
        connectedAt: new Date(),
      })
    }

    return res.status(200).json({
      success: true,
      message: `${platform.toUpperCase()} ${account.isConnected ? "connected" : "disconnected"}`,
      account,
    })
  } catch (error) {
    console.error("Error in toggleSocialAccountConnection:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to toggle social account connection",
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

