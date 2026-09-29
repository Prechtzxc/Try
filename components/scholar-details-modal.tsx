"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { DocumentPreviewModal } from "@/components/document-preview-modal"
import { User, Mail, GraduationCap, FileText, Loader2, History } from "lucide-react"
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Document } from "@/lib/storage"

interface ScholarDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scholar: any | null
}

function InfoItem({ label, value }: { label: string; value?: string | number | boolean | null }) {
  const display = value === undefined || value === null || value === "" ? "N/A" : String(value)
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="break-words text-sm font-bold text-slate-800">{display}</p>
    </div>
  )
}

interface AssistanceCycleEntry {
  cycleId: string
  label: string
  status: "claimed" | "unclaimed"
}

// Archived applications and ended cycles are stamped at the same moment in the
// "End Cycle" batch, so match them by closeness of archivedAt vs endedAt.
const CYCLE_MATCH_WINDOW_MS = 24 * 60 * 60 * 1000

const ASSISTANCE_PAGE_SIZE = 5

function buildAssistanceHistory(historyRecords: any[], endedCycles: any[]): AssistanceCycleEntry[] {
  const cycles = endedCycles
    .filter((c) => c.endedAt)
    .map((c) => ({ id: c.id, endedTime: new Date(c.endedAt).getTime(), label: `${new Date(c.endedAt).getFullYear()} Scholarship Cycle` }))
    .sort((a, b) => a.endedTime - b.endedTime)

  const approvedRecords = historyRecords.filter(
    (r) => !r.isCancelled && (r.isApproved === true || r.status === "approved")
  )

  const grouped = new Map<string, { label: string; statuses: string[] }>()

  for (const record of approvedRecords) {
    const archivedAt = record.archivedAt || record.createdAt
    let matched: { id: string; label: string } | null = null

    if (archivedAt) {
      const archivedTime = new Date(archivedAt).getTime()
      let bestDiff = Infinity
      for (const c of cycles) {
        const diff = Math.abs(c.endedTime - archivedTime)
        if (diff < bestDiff && diff <= CYCLE_MATCH_WINDOW_MS) {
          bestDiff = diff
          matched = { id: c.id, label: c.label }
        }
      }
    }

    if (!matched) {
      const year = archivedAt ? new Date(archivedAt).getFullYear() : new Date().getFullYear()
      matched = { id: record.id, label: `${year} Scholarship Cycle` }
    }

    if (!grouped.has(matched.id)) grouped.set(matched.id, { label: matched.label, statuses: [] })
    grouped.get(matched.id)!.statuses.push(record.isClaimed ? "claimed" : "unclaimed")
  }

  const assistance: AssistanceCycleEntry[] = []
  for (const [cycleId, group] of grouped) {
    assistance.push({
      cycleId,
      label: group.label,
      status: group.statuses.includes("claimed") ? "claimed" : "unclaimed",
    })
  }

  return assistance
}

export function ScholarDetailsModal({ scholar, onOpenChange, open }: ScholarDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [userRecord, setUserRecord] = useState<any | null>(null)
  const [application, setApplication] = useState<any | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [assistanceCycles, setAssistanceCycles] = useState<AssistanceCycleEntry[]>([])
  const [assistancePage, setAssistancePage] = useState(1)
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [activeDocument, setActiveDocument] = useState<Document | null>(null)

  const studentId = scholar?.studentId || scholar?.id

  useEffect(() => {
    if (!open || !scholar || !studentId) return
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setLoadingDocs(true)
      try {
        const [userSnap, appResult, docsSnap, historySnap, cycleSnap] = await Promise.all([
          getDoc(doc(db, "users", studentId)),
          scholar.applicationId
            ? getDoc(doc(db, "applications", scholar.applicationId))
            : getDocs(query(collection(db, "applications"), where("studentId", "==", studentId))),
          getDocs(query(collection(db, "documents"), where("studentId", "==", studentId))),
          getDocs(query(collection(db, "history"), where("studentId", "==", studentId))),
          getDocs(collection(db, "schedule_history")),
        ])

        if (cancelled) return

        setUserRecord(userSnap.exists() ? userSnap.data() : null)
        setApplication(
          (appResult as any).exists
            ? (appResult as any).data?.() || null
            : (appResult as any).docs?.[0]?.data?.() || null
        )

        // Active scholars carry { id: studentId, applicationId }; archived scholars
        // carry { id: historyRecordId, studentId } and no applicationId.
        const isArchivedScholar = Boolean(scholar.studentId) && !scholar.applicationId
        const rawDocs = docsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Document[]

        let relevantDocs: Document[]
        if (isArchivedScholar) {
          relevantDocs = rawDocs.filter(
            (doc) =>
              (doc as any).applicationId === scholar.id ||
              ((doc as any).isArchived === true && !(doc as any).applicationId)
          )
          if (relevantDocs.length === 0) {
            relevantDocs = rawDocs.filter((doc) => !(doc as any).applicationId)
          }
        } else {
          relevantDocs = rawDocs.filter((doc) => !(doc as any).isArchived)
        }

        setDocuments(relevantDocs)

        const rawHistory = historySnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        const endedCycles = cycleSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setAssistanceCycles(buildAssistanceHistory(rawHistory, endedCycles))
        setAssistancePage(1)
      } catch (error) {
        console.error("Failed to load scholar details:", error)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
          setLoadingDocs(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [open, scholar, studentId])

  if (!scholar) return null

  const profile = userRecord?.profileData || {}
  const app = application || {}

  const fullName = profile.fullName || app.fullName || scholar.name || "Unknown"
  const email = profile.email || app.email || scholar.email || "Unknown"
  const photo = profile.studentPhoto || scholar.profilePicture || ""

  const isCancelled = Boolean(scholar.isCancelled || app.isCancelled)
  const isClaimed = Boolean(scholar.isClaimed || app.isClaimed)

  const claimedCount = assistanceCycles.filter((c) => c.status === "claimed").length
  const unclaimedCount = assistanceCycles.filter((c) => c.status === "unclaimed").length

  const assistanceTotalPages = Math.max(1, Math.ceil(assistanceCycles.length / ASSISTANCE_PAGE_SIZE))
  const safeAssistancePage = Math.min(assistancePage, assistanceTotalPages)
  const paginatedCycles = assistanceCycles.slice(
    (safeAssistancePage - 1) * ASSISTANCE_PAGE_SIZE,
    safeAssistancePage * ASSISTANCE_PAGE_SIZE
  )

  const statusBadge = isCancelled
    ? { label: "Cancelled", className: "bg-red-500 text-white" }
    : isClaimed
      ? { label: "Claimed", className: "bg-emerald-500 text-white" }
      : { label: "Not Yet Claimed", className: "bg-amber-400 text-amber-950" }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-2xl w-[95vw] max-h-[92vh] p-0 flex flex-col overflow-hidden rounded-3xl sm:rounded-3xl border-0 shadow-2xl gap-0 z-[100] [&>button]:text-white [&>button]:bg-white/20 [&>button]:hover:bg-white/30 [&>button]:rounded-full [&>button]:h-9 [&>button]:w-9 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:transition-colors [&>button]:opacity-100"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 md:px-8 py-6 text-white relative shrink-0 rounded-t-[24px] flex items-center gap-4">
          <Avatar className="h-14 w-14 md:h-16 md:w-16 border-4 border-white/40 bg-white/20 shadow-lg shrink-0">
            {photo ? <AvatarImage src={photo} alt={fullName} className="object-cover" /> : null}
            <AvatarFallback className="bg-emerald-700 text-white font-black text-xl">
              {(fullName || "?").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <DialogTitle className="text-lg md:text-xl font-black uppercase tracking-tight text-white leading-tight">
                {fullName}
              </DialogTitle>
              <Badge className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-sm ${statusBadge.className}`}>
                {statusBadge.label}
              </Badge>
            </div>
            <DialogDescription className="text-green-100 mt-1 text-sm font-medium flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="break-all">{email}</span>
            </DialogDescription>
          </div>
        </div>

        {/* Body */}
        <div className="bg-slate-50/50 px-6 md:px-8 py-6 md:py-8 min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3 text-emerald-600">
                <Loader2 className="h-9 w-9 animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading scholar record...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Personal Information */}
              <section>
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-tight text-slate-800">Personal Information</h4>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                    <InfoItem label="Full Name" value={fullName} />
                    <InfoItem label="Age" value={profile.age || app.age} />
                    <InfoItem label="Gender" value={profile.gender || app.gender} />
                    <InfoItem label="Contact Number" value={profile.contactNumber || app.contactNumber} />
                    <InfoItem label="Email Address" value={email} />
                    <InfoItem label="Home Address" value={profile.address || app.address} />
                    <InfoItem label="Barangay" value={profile.barangay || app.barangay || scholar.barangay} />
                  </div>
                </div>
              </section>

              {/* Academic Information */}
              <section>
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <GraduationCap className="h-3.5 w-3.5" />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-tight text-slate-800">Academic Information</h4>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                    <InfoItem label="School / University" value={profile.schoolName || app.school || scholar.school} />
                    <InfoItem label="Course" value={profile.course || profile.program || app.course || scholar.course} />
                    <InfoItem label="Year Level" value={profile.yearLevel || app.yearLevel || scholar.yearLevel} />
                  </div>
                </div>
              </section>

              {/* Assistance History */}
              {assistanceCycles.length > 0 && (
                <section>
                  <div className="mb-4 flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <History className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-tight text-slate-800">Assistance History</h4>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6">
                    <div className={`grid gap-3 sm:gap-4 ${claimedCount > 0 && unclaimedCount > 0 ? "grid-cols-2" : "grid-cols-1"}`}>
                      {claimedCount > 0 && (
                        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center">
                          <p className="text-2xl md:text-3xl font-black text-emerald-600">{claimedCount}x</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700 mt-1">Claimed</p>
                        </div>
                      )}
                      {unclaimedCount > 0 && (
                        <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-center">
                          <p className="text-2xl md:text-3xl font-black text-amber-600">{unclaimedCount}x</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-amber-700 mt-1">Unclaimed</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 space-y-2">
                      {paginatedCycles.map((cycle) => (
                        <div
                          key={cycle.cycleId}
                          className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 border border-slate-100 px-3.5 py-2.5"
                        >
                          <span className="text-xs font-bold text-slate-700">{cycle.label}</span>
                          <span
                            className={
                              cycle.status === "claimed"
                                ? "inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-700"
                                : "inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-700"
                            }
                          >
                            {cycle.status === "claimed" ? "Claimed" : "Unclaimed"}
                          </span>
                        </div>
                      ))}
                    </div>
                    {assistanceTotalPages > 1 && (
                      <div className="mt-4 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          disabled={safeAssistancePage === 1}
                          onClick={() => setAssistancePage((p) => Math.max(1, p - 1))}
                          className="rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700 hover:bg-emerald-50 disabled:pointer-events-none disabled:opacity-40 transition-colors"
                        >
                          ‹ Previous
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: assistanceTotalPages }, (_, i) => i + 1).map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setAssistancePage(n)}
                              className={`flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-[10px] font-black transition-colors ${
                                n === safeAssistancePage
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          disabled={safeAssistancePage === assistanceTotalPages}
                          onClick={() => setAssistancePage((p) => Math.min(assistanceTotalPages, p + 1))}
                          className="rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700 hover:bg-emerald-50 disabled:pointer-events-none disabled:opacity-40 transition-colors"
                        >
                          Next ›
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 md:px-8 py-5 bg-white border-t border-slate-200 flex justify-end gap-3 shrink-0 rounded-b-[24px]">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="h-11 px-6 rounded-xl border-slate-300 text-slate-600 hover:bg-slate-50 font-bold"
            >
              Close
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={() => {
              setActiveDocument(documents[0] || null)
              setPreviewOpen(true)
            }}
            className="h-11 gap-2 rounded-xl bg-green-600 px-6 font-bold text-white shadow-md hover:bg-green-700"
          >
            <FileText className="h-4 w-4" />
            View Uploaded Requirements
          </Button>
        </div>
      </DialogContent>

      <DocumentPreviewModal
        open={previewOpen}
        onOpenChange={(o) => {
          setPreviewOpen(o)
          if (!o) setActiveDocument(null)
        }}
        documents={documents}
        loading={loadingDocs}
        studentName={fullName}
        activeDocument={activeDocument}
        onSelectDocument={setActiveDocument}
      />
    </Dialog>
  )
}