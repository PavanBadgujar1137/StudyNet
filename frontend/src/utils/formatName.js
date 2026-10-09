/**
 * Utility function to format practitioner / user names cleanly with title prefixes (Dr., Prof., Mr., Ms., Mrs., Mx.),
 * avoiding duplicate titles like "Dr. Dr.Anamika Chawhan".
 */
export function formatPractitionerName(userObj, fallback = 'Practitioner') {
  if (!userObj) return fallback

  const u = userObj.user || userObj
  let rawTitle = (u.title || userObj.title || '').trim()
  let firstName = (u.firstName || userObj.firstName || '').trim()
  let lastName = (u.lastName || userObj.lastName || '').trim()

  // Match title prefixes at start of firstName (e.g. "Dr.", "Dr ", "Prof.", "Mr.", "Ms.", "Mrs.", "Mx.")
  const prefixRegex = /^(dr\.?|prof\.?|mr\.?|ms\.?|mrs\.?|mx\.?)\s+/i
  const match = firstName.match(prefixRegex)

  if (match) {
    const titleFromFirst = match[0].trim()
    if (!rawTitle) {
      rawTitle = titleFromFirst
    }
    // Remove the title prefix from firstName to prevent duplicate "Dr. Dr."
    firstName = firstName.replace(prefixRegex, '').trim()
  }

  // Handle case where firstName itself is "Dr." or "Dr"
  if (/^(dr\.?|prof\.?|mr\.?|ms\.?|mrs\.?|mx\.?)$/i.test(firstName)) {
    if (!rawTitle) rawTitle = firstName
    firstName = ''
  }

  // Remove any duplicate prefix from lastName
  if (prefixRegex.test(lastName)) {
    lastName = lastName.replace(prefixRegex, '').trim()
  }

  const baseName = `${firstName} ${lastName}`.trim() || fallback

  if (rawTitle && rawTitle.toLowerCase() !== 'none' && rawTitle.toLowerCase() !== 'select title') {
    let formattedTitle = rawTitle
    if (!formattedTitle.endsWith('.')) {
      formattedTitle = `${formattedTitle}.`
    }
    const capTitle = formattedTitle.charAt(0).toUpperCase() + formattedTitle.slice(1)

    // Immune check: if baseName already starts with capTitle, return baseName directly
    if (baseName.toLowerCase().startsWith(capTitle.toLowerCase())) {
      return baseName
    }
    return `${capTitle} ${baseName}`
  }

  return baseName
}
