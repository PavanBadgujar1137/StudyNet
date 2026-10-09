const CDN_HOST = String(
  process.env.REACT_APP_CLOUDFRONT_DOMAIN || "d2ruooz1ktuxdd.cloudfront.net"
)
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "")

const S3_PREFIXES = [
  "https://zwiebel-ai-assets.s3.ap-south-1.amazonaws.com/",
  "https://zwiebel-ai-assets.s3.amazonaws.com/",
]

export function mediaUrl(url) {
  if (!url || typeof url !== "string") return url
  if (url.startsWith("data:") || url.startsWith("blob:")) return url
  let next = url
  for (const prefix of S3_PREFIXES) {
    if (next.startsWith(prefix)) {
      next = `https://${CDN_HOST}/${next.slice(prefix.length)}`
      break
    }
  }
  return next
}
