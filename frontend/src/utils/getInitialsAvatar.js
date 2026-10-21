export function getInitialsAvatar(firstName = "", lastName = "") {
  const f = (firstName || "U").charAt(0).toUpperCase()
  const l = (lastName || "").charAt(0).toUpperCase()
  const initials = `${f}${l}` || "U"
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="#2563EB"/><text x="50%" y="55%" font-size="38" font-weight="bold" fill="#ffffff" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif">${initials}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
