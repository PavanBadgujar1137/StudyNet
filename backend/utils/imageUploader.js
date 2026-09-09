// utils/imageUploader.js
// AWS S3 File Upload Utility — replaces Cloudinary uploadImageToCloudinary
// Supports: images, videos, PDFs, and any binary file type

const { PutObjectCommand } = require("@aws-sdk/client-s3")
const { Upload } = require("@aws-sdk/lib-storage")
const s3Client = require("../config/s3")
const mime = require("mime-types")
const path = require("path")
const fs = require("fs")

const BUCKET = process.env.AWS_S3_BUCKET_NAME
const REGION = process.env.AWS_REGION || "ap-south-1"
const FOLDER_PREFIX = process.env.AWS_S3_FOLDER || "openhand"

/**
 * Builds the public S3 URL for a given key.
 */
function buildS3Url(key) {
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`
}

/**
 * Generates a unique S3 key for the uploaded file.
 * Format: <folder>/<subfolder>/<timestamp>-<original-name>
 */
function buildS3Key(folder, originalName) {
  const timestamp = Date.now()
  const ext = path.extname(originalName || "file") || ""
  const baseName = path.basename(originalName || "upload", ext)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 80)
  return `${FOLDER_PREFIX}/${folder}/${timestamp}-${baseName}${ext}`
}

/**
 * uploadFileToS3 — Universal file uploader to AWS S3.
 *
 * @param {Object} file         - express-fileupload file object (has .tempFilePath, .name, .mimetype)
 * @param {string} folder       - S3 subfolder path (e.g. "profile_pictures", "course_videos")
 * @returns {Promise<{url: string, key: string}>}
 */
exports.uploadFileToS3 = async (file, folder = "uploads") => {
  if (!file?.tempFilePath) {
    throw new Error("No file uploaded or tempFilePath missing")
  }

  if (!BUCKET) {
    throw new Error(
      "AWS_S3_BUCKET_NAME is not set in environment variables"
    )
  }

  const key = buildS3Key(folder, file.name || "upload")
  const contentType =
    file.mimetype ||
    mime.lookup(file.name || "upload") ||
    "application/octet-stream"

  const fileStream = fs.createReadStream(file.tempFilePath)

  // Use @aws-sdk/lib-storage Upload for reliable multipart support
  // (handles both small files and large video files >5MB automatically)
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: BUCKET,
      Key: key,
      Body: fileStream,
      ContentType: contentType,
    },
    // Part size for multipart uploads (5MB min per AWS requirement)
    partSize: 10 * 1024 * 1024, // 10MB per part
    // Number of concurrent upload parts
    queueSize: 4,
  })

  await upload.done()

  const url = buildS3Url(key)
  return { url, key, secure_url: url } // secure_url alias for backward compatibility
}

/**
 * Backward-compatible alias used by older controller imports.
 * Maps the old Cloudinary-style call signature to uploadFileToS3.
 */
exports.uploadImageToCloudinary = async (file, folder, _height, _quality) => {
  return exports.uploadFileToS3(file, folder)
}
