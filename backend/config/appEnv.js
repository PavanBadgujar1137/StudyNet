// Reads whichever Mongo URL + S3 folder is uncommented in .env.

function apply() {
  const mongoUrl = process.env.MONGODB_URL || ""
  const s3Folder = process.env.AWS_S3_FOLDER || "openhand/uat"
  const envName = String(process.env.APP_ENV || "").toLowerCase()
  const name =
    envName === "production" || envName === "prod" || mongoUrl.includes("/openhand?")
      ? "production"
      : "uat"

  return { name, s3Folder }
}

function isProduction() {
  return apply().name === "production"
}

module.exports = { apply, isProduction }
