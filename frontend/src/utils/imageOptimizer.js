/**
 * High-definition image resolution enhancer
 * Automatically upgrades low-resolution avatar endpoints (such as Google OAuth's default =s96-c)
 * and CDN thumbnails to razor-sharp full-resolution assets while strictly preserving layout dimensions.
 */
export function getOptimizedImageUrl(url, targetSize = 800) {
  if (!url || typeof url !== 'string') return url

  // 1. Google OAuth / Google User Content:
  // Google defaults to `=s96-c` (96x96px), which looks severely pixelated when scaled to 300px+ cards.
  // Upgrading `=s96-c` (or any `=s...`) to `=s800-c` requests Google's crisp original high-res photo.
  if (url.includes('googleusercontent.com')) {
    if (/=s\d+(-[a-zA-Z0-9]+)?/i.test(url)) {
      return url.replace(/=s\d+(-[a-zA-Z0-9]+)?/i, `=s${targetSize}-c`)
    }
  }

  // 2. Unsplash Images:
  // Ensure auto format and crisp pixel resolution (w=800, q=85)
  if (url.includes('images.unsplash.com')) {
    try {
      const u = new URL(url)
      u.searchParams.set('w', String(targetSize))
      u.searchParams.set('q', '85')
      u.searchParams.set('auto', 'format')
      u.searchParams.set('fit', 'crop')
      return u.toString()
    } catch {
      return url
    }
  }

  // 3. Cloudinary transformations:
  // Upgrade restrictive width bounds if present
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    if (/\/w_\d+[^/]*\//i.test(url)) {
      return url.replace(/\/w_\d+[^/]*\//i, `/w_${targetSize},c_fill,q_auto,f_auto/`)
    }
  }

  return url
}
