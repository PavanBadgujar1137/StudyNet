import axios from "axios"

export const axiosInstance = axios.create({})

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api/v1"
const BACKEND_HOST = BASE_URL.replace(/\/api\/v1\/?$/, "")

export const apiConnector = (method, url, bodyData, headers, params) => {
  let finalUrl = url
  if (url && url.startsWith("/api/v1")) {
    finalUrl = `${BACKEND_HOST}${url}`
  }

  const config = {
    method,
    url: finalUrl,
    data: bodyData ?? null,
    params: params ?? null,
    headers: { ...(headers || {}) },
  }

  // Let the browser set the multipart boundary for FormData uploads
  if (typeof FormData !== "undefined" && bodyData instanceof FormData) {
    delete config.headers["Content-Type"]
  }

  return axiosInstance(config)
}
