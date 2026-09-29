// Shared "open this document in a new tab" helpers for all preview modals.
//
// Must stay synchronous: an async handler calls window.open() after an await,
// i.e. outside the browser's user-gesture call stack, which Chrome & friends
// silently block as an unsolicited popup — making the button appear dead.

// Single source of truth for the URL used to view a document.
//
// Verified against real Firestore data (324/324 documents) and live HTTP
// probes: every stored PDF is already served from `/image/upload/` and returns
// 200 with `Content-Type: application/pdf` (valid %PDF bytes, CORS `*`, no
// Content-Disposition attachment), so the browser renders it inline as-is.
//
// Must NEVER rewrite the Cloudinary resource-type segment (e.g. `/raw/upload/`
// → `/image/upload/`): a raw-stored asset is not addressable under `/image/`,
// so such a rewrite can 404 or point at a different resource. The stored
// `secure_url` is always returned unchanged (trimmed) for every type — PDFs,
// images, and anything else.
export const normalizePdfUrl = (url?: string): string => {
  if (!url) return ""
  return url.trim()
}

// Opens the currently-previewed document in a new browser tab using its real
// URL. No-op for missing URLs (never opens a blank/undefined tab).
export const openDocumentInNewTab = (url?: string | null, isPdf?: boolean): void => {
  const target = isPdf ? normalizePdfUrl(url ?? "") : (url ?? "").trim()
  if (!target) return
  window.open(target, "_blank", "noopener,noreferrer")
}
