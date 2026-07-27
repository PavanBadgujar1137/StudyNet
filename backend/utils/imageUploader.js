const cloudinary = require("cloudinary").v2

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
  if (!file?.tempFilePath) {
    throw new Error("No file uploaded")
  }

  const options = {
    folder,
    resource_type: "auto",
  }

  if (height) {
    options.height = Number(height)
    options.crop = "scale"
  }

  if (quality) {
    // Cloudinary quality must be 1-100 or "auto"
    const parsedQuality = Number(quality)
    options.quality = Number.isNaN(parsedQuality)
      ? quality
      : Math.min(Math.max(parsedQuality, 1), 100)
  }

  return await cloudinary.uploader.upload(file.tempFilePath, options)
}
