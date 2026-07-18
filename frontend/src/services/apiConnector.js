import axios from "axios"

export const axiosInstance = axios.create({})

export const apiConnector = (method, url, bodyData, headers, params) => {
  const config = {
    method,
    url,
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
