// AWS S3 Client Configuration
// Replaces Cloudinary — used for all media and avatar uploads

const { S3Client } = require("@aws-sdk/client-s3")

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  // Browser PUT + CORS: default CRC32 checksum headers break OPTIONS preflight (403)
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
})

module.exports = s3Client
