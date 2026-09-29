"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2, FileWarning, ExternalLink } from "lucide-react"
import type * as pdfjsType from "pdfjs-dist"

// The Cloudinary PDF endpoint can send headers (X-Frame-Options / CSP frame-ancestors)
// that make mobile Chrome show "Blocked by the owner" when rendered inside an <iframe>.
// Instead of relying on the browser's built-in PDF viewer, we fetch the PDF bytes and
// render them ourselves with PDF.js, which works identically on desktop and mobile.
// The worker is served from /public/pdfjs so it is same-origin and allowed by the
// app's Content-Security-Policy (`script-src 'self'`), and it matches the installed
// pdfjs-dist version exactly (copied from its build/ directory).
const PDFJS_WORKER_SRC = "/pdfjs/pdf.worker.min.mjs"

interface PdfViewerProps {
  url: string
  fileName?: string
  className?: string
}

export function PdfViewer({ url, fileName, className }: PdfViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const pagesRef = useRef<HTMLDivElement>(null)
  const docRef = useRef<pdfjsType.PDFDocumentProxy | null>(null)
  const rafRef = useRef<number | null>(null)
  const seqRef = useRef(0)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")
  const [numPages, setNumPages] = useState(0)
  const [renderedPages, setRenderedPages] = useState(0)

  const renderPages = useCallback(async (containerWidth: number) => {
    const pagesEl = pagesRef.current
    const doc = docRef.current
    if (!pagesEl || !doc || containerWidth <= 0) return

    const seq = ++seqRef.current
    // Keep total canvas memory bounded (~256 MB) so large documents such as an
    // 86-page PDF stay renderable on desktops and low-memory phones. Pages are
    // still rendered at full width; only the device-pixel multiplier drops.
    const maxTotalPixels = (256 * 1024 * 1024) / 4

    pagesEl.querySelectorAll("canvas").forEach((c) => c.remove())

    let rendered = 0
    for (let i = 1; i <= doc.numPages; i++) {
      if (seq !== seqRef.current) return

      let page: pdfjsType.PDFPageProxy
      try {
        page = await doc.getPage(i)
      } catch (e) {
        if (seq !== seqRef.current) return
        throw e
      }

      const baseViewport = page.getViewport({ scale: 1 })
      // Fit the page width to the available container width; never upscale beyond 2x
      const scale = Math.min(containerWidth / baseViewport.width, 2)
      const viewport = page.getViewport({ scale })

      let dpr = Math.min(window.devicePixelRatio || 1, 2)
      const pagePixels = viewport.width * viewport.height
      const budgetPerPage = maxTotalPixels / doc.numPages
      if (pagePixels * dpr * dpr > budgetPerPage) {
        dpr = Math.max(Math.sqrt(budgetPerPage / pagePixels), 0.75)
      }

      const canvas = document.createElement("canvas")
      canvas.width = Math.max(1, Math.floor(viewport.width * dpr))
      canvas.height = Math.max(1, Math.floor(viewport.height * dpr))
      canvas.style.width = "100%"
      canvas.style.height = "auto"
      canvas.style.display = "block"
      canvas.style.background = "white"

      const wrapper = document.createElement("div")
      wrapper.className = "w-full shrink-0"
      const pageLabel = document.createElement("p")
      pageLabel.className =
        "text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-2"
      pageLabel.textContent = `Page ${i} of ${doc.numPages}`
      wrapper.appendChild(pageLabel)
      wrapper.appendChild(canvas)
      pagesEl.appendChild(wrapper)

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        if (seq !== seqRef.current) return
        throw new Error("Canvas 2D context is unavailable")
      }

      try {
        await page.render({
          canvasContext: ctx,
          viewport,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
        }).promise
        page.cleanup()
      } catch (e) {
        if (seq !== seqRef.current) return
        throw e
      }

      rendered++
      setRenderedPages(rendered)
      // Yield so the browser can paint the completed page before the next one starts.
      await new Promise((resolve) => setTimeout(resolve, 0))
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setStatus("loading")
    setErrorMessage("")
    setRenderedPages(0)

    const load = async () => {
      try {
        const pdfjs = await import("pdfjs-dist")
        pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC

        // Diagnostics: confirm the source responds with a real PDF before rendering.
        console.log("[PdfViewer] fetching PDF:", url)
        const response = await fetch(url)
        const contentType = response.headers.get("content-type") || "unknown"
        const contentLength = response.headers.get("content-length") || "unknown"
        console.log(
          `[PdfViewer] fetch done: status=${response.status} content-type=${contentType} content-length=${contentLength}`
        )
        if (!response.ok) {
          throw new Error(`Failed to load document (HTTP ${response.status})`)
        }

        const buffer = await response.arrayBuffer()
        if (cancelled) return
        console.log(`[PdfViewer] received ${buffer.byteLength} bytes`)

        const doc = await pdfjs.getDocument({ data: buffer }).promise
        if (cancelled) {
          doc.destroy()
          return
        }
        docRef.current = doc
        setNumPages(doc.numPages)
        setStatus("ready")
        console.log(`[PdfViewer] document loaded: ${doc.numPages} pages`)
      } catch (e: any) {
        if (cancelled) return
        console.error("[PdfViewer] failed to load PDF:", e)
        setErrorMessage(e?.message || "Unable to load this PDF.")
        setStatus("error")
      }
    }

    load()

    return () => {
      cancelled = true
      seqRef.current += 1
      docRef.current?.destroy()
      docRef.current = null
    }
  }, [url])

  // Render pages only once the scroll container is actually visible and sized
  // (`display: none` reports clientWidth = 0, which previously made the whole
  // viewer render nothing). Re-render whenever the container width changes
  // (window resize / device rotation) so pages always fit at full resolution.
  useEffect(() => {
    if (status !== "ready") return
    const scrollEl = scrollRef.current
    if (!scrollEl) return

    let cancelled = false

    const scheduleRender = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const width = scrollEl.clientWidth
        if (width > 0) {
          renderPages(width).catch((e) => {
            if (cancelled) return
            console.error("[PdfViewer] failed to render pages:", e)
            setErrorMessage(e?.message || "Unable to render this PDF.")
            setStatus("error")
          })
        }
      })
    }

    scheduleRender()

    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(scheduleRender)
      observer.observe(scrollEl)
    }
    window.addEventListener("resize", scheduleRender)

    return () => {
      cancelled = true
      observer?.disconnect()
      window.removeEventListener("resize", scheduleRender)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      seqRef.current += 1
    }
  }, [status, renderPages])

  const showPageCount = status === "ready" && renderedPages > 0

  return (
    <div className={`relative w-full h-full flex flex-col ${className || ""}`}>
      {status === "loading" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-slate-50 p-8">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">
            Loading PDF...
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center">
          <FileWarning className="h-10 w-10 text-amber-500" />
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-slate-700 mb-1">
              Unable to preview this PDF
            </p>
            <p className="text-xs font-medium text-slate-500 break-words">{errorMessage}</p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 hover:bg-emerald-100 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open in new tab
          </a>
        </div>
      )}

      {showPageCount && (
        <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none flex justify-center">
          <span className="mt-2 px-3 py-1 rounded-full bg-slate-800/80 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest text-white">
            {numPages} page{numPages !== 1 ? "s" : ""} • scroll to read
          </span>
        </div>
      )}

      <div
        ref={scrollRef}
        className={`flex-1 w-full overflow-y-auto overflow-x-hidden bg-slate-200 px-2 sm:px-4 py-3 ${
          status === "ready" ? "block" : "hidden"
        }`}
        aria-label={fileName ? `PDF preview: ${fileName}` : "PDF preview"}
      >
        <div ref={pagesRef} className="w-full flex flex-col gap-4" />
      </div>
    </div>
  )
}
