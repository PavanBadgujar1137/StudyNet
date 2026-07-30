/**
 * Single Source of Truth Route Configuration for BubbleField
 * Determines bubble density and zone based on route path.
 */

export const BUBBLE_PAGE_CONFIG = {
  // Public Marketing Pages
  '/': { zone: 'fullscreen', density: 'low' },
  '/pricing': { zone: 'fullscreen', density: 'low' },
  '/for-organizations': { zone: 'fullscreen', density: 'low' },
  '/co-pilot': { zone: 'fullscreen', density: 'low' },
  '/aura': { zone: 'fullscreen', density: 'low' },
  '/client-journey': { zone: 'fullscreen', density: 'low' },
  '/start-free': { zone: 'fullscreen', density: 'low' },
  '/talk-to-human': { zone: 'fullscreen', density: 'low' },
  '/find-a-practitioner': { zone: 'fullscreen', density: 'low' },

  // Static Footer Pages
  '/platform-status': { zone: 'fullscreen', density: 'low' },
  '/documentation': { zone: 'fullscreen', density: 'low' },
  '/community': { zone: 'fullscreen', density: 'low' },
  '/help-support': { zone: 'fullscreen', density: 'low' },
  '/privacy-policy': { zone: 'fullscreen', density: 'low' },
  '/terms-of-service': { zone: 'fullscreen', density: 'low' },
  '/terms': { zone: 'fullscreen', density: 'low' },
  '/data-consent': { zone: 'fullscreen', density: 'low' },
  '/security': { zone: 'fullscreen', density: 'low' },

  // Auth pages — NONE (0 bubbles)
  '/login': { density: 'none' },
  '/signup': { density: 'none' },
  '/forgot-password': { density: 'none' },
  '/update-password': { density: 'none' },
  '/verify-email': { density: 'none' },
}

/**
 * Returns the bubble configuration for a given location path.
 * If path starts with /app, /practice, /admin, /org, or /dashboard, returns density: 'none'.
 */
export function getBubbleConfigForPath(pathname) {
  if (!pathname) return { density: 'none' }
  const cleanPath = pathname.toLowerCase()

  if (
    cleanPath.startsWith('/app') ||
    cleanPath.startsWith('/practice') ||
    cleanPath.startsWith('/admin') ||
    cleanPath.startsWith('/org') ||
    cleanPath.startsWith('/dashboard') ||
    cleanPath.startsWith('/live') ||
    cleanPath.startsWith('/onboarding')
  ) {
    return { density: 'none' }
  }

  const found = BUBBLE_PAGE_CONFIG[cleanPath]
  if (found) {
    return found
  }

  return { density: 'none' }
}
