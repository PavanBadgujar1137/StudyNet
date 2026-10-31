/**
 * React Webpack Dev Server Proxy & Middleware
 *
 * Handles:
 * 1. Converts any incoming POST requests directed at frontend SPA routes (like /app/practitioners)
 *    into 303 GET redirects so the development server never errors with "Cannot POST /...".
 * 2. Proxies /api calls to the backend if relative paths are used.
 */
module.exports = function (app) {
  app.post("*", (req, res, next) => {
    // If it's an API call or webpack internal, let it proceed
    if (req.path.startsWith("/api/") || req.path.startsWith("/sockjs-node") || req.path.startsWith("/ws")) {
      return next()
    }

    // Combine any body params (e.g. from payment gateway POST) and query params into URL search params
    const searchParams = new URLSearchParams()
    if (req.query) {
      Object.entries(req.query).forEach(([k, v]) => {
        if (v) searchParams.set(k, String(v))
      })
    }
    if (req.body && typeof req.body === "object") {
      Object.entries(req.body).forEach(([k, v]) => {
        if (v && typeof v !== "object") searchParams.set(k, String(v))
      })
    }

    const qs = searchParams.toString()
    const redirectUrl = `${req.path}${qs ? `?${qs}` : ""}`

    // 303 See Other forces the browser to re-request using GET
    return res.redirect(303, redirectUrl)
  })
}
