// Shared "open this document in a new tab" helpers for all preview modals.
//
// Must stay synchronous: an async handler calls window.open() after an await,
// i.e. outside the browser's user-gesture call stack, which Chrome & friends
// silently block as an unsolicited popup — making the button appear dead.

// Cloudinary PDFs uploaded via `/raw/upload/` are delivered with
// Content-Disposition: attachment, which forces the browser to download instead
// of rendering inline. Rewrite to `/image/upload/` so the file displays inline
// in the new tab. Non-matching URLs (images, already-normalized URLs) pass
// through untouched.
export const normalizePdfUrl = (url?: string): string => {
  if (!url) return ""
  return url.replace(/\/(raw|auto|image)\/upload\//, "/image/upload/")
}

// Opens the currently-previewed document in a new browser tab using its real
// URL. No-op for missing URLs (never opens a blank/undefined tab). For PDFs the
// Cloudinary URL is normalized so it renders inline instead of downloading.
export const openDocumentInNewTab = (url?: string | null, isPdf?: boolean): void => {
  const target = isPdf ? normalizePdfUrl(url ?? "") : (url ?? "")
  if (!target) return
  window.open(target, "_blank", "noopener,noreferrer")
}