/**
 * Formats and sanitizes class/course titles to ensure clean, human-readable text without garbled special characters or keyboard mash.
 * @param {string} title
 * @param {string} fallbackTitle
 * @returns {string}
 */
export const formatClassTitle = (title, fallbackTitle = 'Live Zoom Class') => {
  if (!title || typeof title !== 'string') return fallbackTitle

  let clean = title.trim()

  // Remove garbled/random special characters like *^%$#@!~`+={}[\]\\|;"'<>,?
  clean = clean.replace(/[*^%$#@!~`+={}[\]\\|;"'<>,?]/g, ' ')

  // Collapse multiple spaces
  clean = clean.replace(/\s+/g, ' ').trim()

  // Remove leading/trailing dashes/colons/slashes
  clean = clean.replace(/^[-:/&\s]+/, '')
  clean = clean.replace(/[-:/&\s]+$/, '')

  // Count alphanumeric characters
  const alphaNumericMatches = clean.match(/[a-zA-Z0-9]/g) || []
  if (alphaNumericMatches.length < 2) {
    return fallbackTitle
  }

  // Detect random keyboard mash (words >= 4 letters with zero vowels/numbers)
  const hasVowelsOrDigits = /[aeiouyAEIOUY0-9]/.test(clean)
  if (!hasVowelsOrDigits && clean.length >= 4) {
    return fallbackTitle
  }

  return clean || fallbackTitle
}

export default formatClassTitle
