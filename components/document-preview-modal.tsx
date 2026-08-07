"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Loader2, ExternalLink } from "lucide-react"
import type { Document } from "@/lib/storage"
import { resolveRequirementLabel } from "@/lib/requirements-config"

interface DocumentPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documents: Document[]
  loading: boolean
  studentName?: string
  activeDocument: Document | null
  onSelectDocument: (doc: Document) => void
  contentClassName?: string
}

const openBase64InNewTab = async (base64Data: string) => {
  try {
    const response = await fetch(base64Data)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    window.open(blobUrl, "_blank")
  } catch (error) {
    console.error("Failed to open document", error)
    window.open(base64Data, "_blank")
  }
}

// Detects a PDF regardless of how the `type` was stored at upload time:
// - document-upload.tsx stores `"pdf"`
// - app/student/documents/page.tsx stores the raw MIME like `"application/pdf"`
// - legacy records may only have a `.pdf` URL/name
const isPdfDocument = (doc: Document | null | undefined): boolean => {
  if (!doc) return false
  const type = (doc.type || "").toLowerCase()
  const url = (doc.url || "").toLowerCase()
  const name = (doc.name || "").toLowerCase()
  return type.includes("pdf") || url.endsWith(".pdf") || name.endsWith(".pdf")
}

// Cloudinary PDFs uploaded via `/raw/upload/` are delivered with
// Content-Disposition: attachment, which forces the browser to download instead
// of rendering inline. Rewriting to the image resource type lets the browser
// render the PDF inside the iframe.
const normalizePdfUrl = (url?: string): string => {
  if (!url) return ""
  return url.replace(/\/(raw|auto|image)\/upload\//, "/image/upload/")
}

export function DocumentPreviewModal({
  open,
  onOpenChange,
  documents,
  loading,
  studentName,
  activeDocument,
  onSelectDocument,
  contentClassName,
}: DocumentPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent overlayClassName="z-[200]" className={`max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-50 border-none shadow-2xl rounded-3xl z-[210] ${contentClassName || ""}`}>
        <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-white shrink-0">
          <DialogTitle className="text-xl font-black uppercase text-slate-800 tracking-tight">
            Documents for {studentName || "Student"}
          </DialogTitle>
          <DialogDescription className="font-medium text-slate-500">Select a document from the sidebar to view it.</DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <div className="w-full md:w-1/3 md:max-w-[300px] md:border-r border-b md:border-b-0 border-slate-200 bg-white flex flex-col z-10 shrink-0">
            <ScrollArea className="flex-1 max-h-[28vh] md:max-h-none">
              <div className="p-4 space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                  </div>
                ) : documents.length === 0 ? (
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-400 text-center py-10">No documents found.</p>
                ) : (
                  documents.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => onSelectDocument(doc)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                        activeDocument?.id === doc.id 
                          ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 shadow-sm' 
                          : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between w-full">
                        <span className="font-bold text-xs text-slate-800 pr-2 leading-tight uppercase">{resolveRequirementLabel(doc)}</span>
                      </div>
                      <div className="flex items-center justify-between w-full text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 gap-2">
                        <span className="truncate">{doc.name}</span>
                        <Badge variant="outline" className={`text-[9px] shadow-none shrink-0 ${isPdfDocument(doc) ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>{isPdfDocument(doc) ? 'pdf' : 'image'}</Badge>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-1 bg-slate-900 flex flex-col relative overflow-hidden min-h-[40vh] md:min-h-0">
            {activeDocument ? (
              <div className="flex-1 flex flex-col w-full h-full">
                <div className="h-14 border-b border-white/10 bg-slate-800/90 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shrink-0 shadow-sm z-10 absolute top-0 w-full gap-3">
                  <span className="font-bold text-xs uppercase tracking-widest text-white flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-emerald-400 shrink-0"/>
                    <span className="truncate">{resolveRequirementLabel(activeDocument)}</span>
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-white hover:bg-white/20 rounded-xl text-xs font-bold shrink-0"
                    onClick={() => openBase64InNewTab(isPdfDocument(activeDocument) ? normalizePdfUrl(activeDocument.url) : activeDocument.url || "")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" /> Open in New Tab
                  </Button>
                </div>

                <div className="flex-1 overflow-hidden flex items-center justify-center pt-14">
                  {isPdfDocument(activeDocument) ? (
                    <iframe
                      src={`${normalizePdfUrl(activeDocument.url)}#toolbar=1&navpanes=0&view=FitH`}
                      title={activeDocument.name}
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <img src={activeDocument.url || ""} alt={activeDocument.name} className="max-w-full max-h-full object-contain rounded-md drop-shadow-2xl select-none" draggable={false} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600 bg-slate-50">
                <FileText className="h-16 w-16 mb-4 opacity-20 text-slate-400" />
                <p className="font-bold uppercase tracking-widest text-xs">Select a document to preview</p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="p-4 border-t border-slate-200 bg-white shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl font-bold">Close Viewer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}