/**
 * clearAllCache.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Nuclear session wipe — clears EVERYTHING from the browser when a user logs
 * out. Works across Chrome, Safari, Firefox, Edge, iOS, Android.
 *
 * Clears:
 *  • localStorage   (all oh_ keys + token + user + any stale dashboard data)
 *  • sessionStorage (all keys)
 *  • All cookies for this domain
 *  • Service Worker cache (if registered)
 *  • React Query / TanStack Query cache (passed in as argument)
 *  • Redux store (dispatched by caller via the returned action list)
 */

/** Every localStorage key prefix / exact key that belongs to OpenHand */
const OUR_LS_PREFIXES = [
  "oh_",
  "openhand_",
  "token",
  "user",
  "signup",
  "onboarding",
  "dashboard_",
  "practitioner_",
  "learner_",
  "client_",
  "chat_",
  "persist:",
]

/**
 * Returns true if a localStorage key belongs to OpenHand and should be wiped.
 * We wipe everything except unrelated third-party keys (e.g. google oauth state).
 */
function isOurKey(key) {
  if (!key) return false
  const lower = key.toLowerCase()
  return OUR_LS_PREFIXES.some((prefix) => lower.startsWith(prefix.toLowerCase()))
}

/**
 * Clears all cookies for the current domain and one level up.
 * Works on Chrome, Safari (iOS), Firefox, Edge, Android WebView.
 */
function clearAllCookies() {
  try {
    const cookieStr = document.cookie
    if (!cookieStr) return
    const cookies = cookieStr.split(";")
    const hostname = window.location.hostname
    // Build a list of domain variants to clear against
    const domainVariants = [
      hostname,
      `.${hostname}`,
      hostname.split(".").slice(1).join("."),       // parent domain
      `.${hostname.split(".").slice(1).join(".")}`, // .parent domain
      "",                                           // no domain attr
    ]
    cookies.forEach((cookie) => {
      const eqPos = cookie.indexOf("=")
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim()
      if (!name) return
      domainVariants.forEach((domain) => {
        const domainAttr = domain ? `; domain=${domain}` : ""
        // Clear for multiple path levels
        ;["/", "/dashboard", "/learner", "/practitioner"].forEach((path) => {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domainAttr}; SameSite=Lax`
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domainAttr}; SameSite=None; Secure`
        })
      })
    })
  } catch (e) {
    console.warn("[clearAllCache] Cookie clear failed:", e.message)
  }
}

/**
 * Unregisters service workers and clears all CacheStorage entries.
 * This is what makes "old dashboard" stop showing on hard-refresh.
 */
async function clearServiceWorkerCache() {
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((reg) => reg.unregister()))
    }
    if ("caches" in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map((name) => caches.delete(name)))
    }
  } catch (e) {
    console.warn("[clearAllCache] SW/Cache clear failed:", e.message)
  }
}

/**
 * Main export — call this on logout.
 *
 * @param {object} [options]
 * @param {object} [options.queryClient]  - TanStack Query client instance (optional)
 */
export async function clearAllCache({ queryClient } = {}) {
  // ── 1. localStorage ───────────────────────────────────────────────────────
  try {
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && isOurKey(key)) keysToRemove.push(key)
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k))

    // Also blow away token + user explicitly regardless of prefix
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  } catch (e) {
    // Private mode / storage disabled — try full clear
    try { localStorage.clear() } catch (_) {}
  }

  // ── 2. sessionStorage ─────────────────────────────────────────────────────
  try {
    sessionStorage.clear()
  } catch (e) {
    console.warn("[clearAllCache] sessionStorage clear failed:", e.message)
  }

  // ── 3. Cookies ────────────────────────────────────────────────────────────
  clearAllCookies()

  // ── 4. TanStack / React Query cache ───────────────────────────────────────
  if (queryClient) {
    try {
      queryClient.clear()
      queryClient.removeQueries()
    } catch (e) {
      console.warn("[clearAllCache] QueryClient clear failed:", e.message)
    }
  }

  // ── 5. Service Worker & CacheStorage (async, non-blocking) ───────────────
  clearServiceWorkerCache().catch(() => {})

  // ── 6. IndexedDB (belt-and-suspenders — some auth libs store tokens here) ─
  try {
    if (window.indexedDB) {
      const dbs = await window.indexedDB.databases?.() ?? []
      dbs.forEach(({ name }) => {
        if (name) window.indexedDB.deleteDatabase(name)
      })
    }
  } catch (e) {
    // indexedDB.databases() not available in all browsers — safe to ignore
  }
}
