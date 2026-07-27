"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PermissionGuard } from "@/components/permission-guard"
import { DataPagination } from "@/components/data-pagination"
import { 
  Plus, Trash2, UserCheck, CheckCircle, XCircle, 
  AlertCircle, Loader2, Undo, Search, ShieldCheck, Edit, User
} from "lucide-react"

// IMPORT FIRESTORE REAL-TIME UTILS
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

import { addRegistrationApprovalDb, deleteRegistrationApprovalDb, syncApprovalRecordWithUserDb } from "@/lib/storage"

type RegistrationApprovalRecord = {
  id: string
  firstName: string
  middleName: string
  lastName: string
  email: string
  status: "Available" | "Registered"
  createdAt: string
  profilePicture?: string
}

export default function RegistrationApprovalPage() {
  const { toast } = useToast()
  
  const [records, setRecords] = useState<RegistrationApprovalRecord[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  
  const [firstName, setFirstName] = useState("")
  const [middleName, setMiddleName] = useState("")
  const [lastName, setLastName] = useState("")
  const [emailInput, setEmailInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const syncedIds = useRef<Set<string>>(new Set())

  const [deletingIds, setDeletingIds] = useState<Record<string, ReturnType<typeof setTimeout>>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // State for Edit Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<RegistrationApprovalRecord | null>(null)
  const [editFirstName, setEditFirstName] = useState("")
  const [editMiddleName, setEditMiddleName] = useState("")
  const [editLastName, setEditLastName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [isEditLoading, setIsEditLoading] = useState(false)

  // REAL-TIME LISTENER
  useEffect(() => {
    setIsFetching(true)
    
    const unsubscribe = onSnapshot(collection(db, "pre_approved_emails"), (snapshot) => {
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RegistrationApprovalRecord))
      const sortedRecords = records.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      // Auto-sync records: missing names, wrong status, or missing profile picture
      for (const record of sortedRecords) {
        if (!syncedIds.current.has(record.id) && record.email) {
          const shouldSync =
            !record.firstName ||
            (record.status !== "Registered") ||
            (record.status === "Registered" && !record.profilePicture)
          if (shouldSync) {
            syncedIds.current.add(record.id)
            syncApprovalRecordWithUserDb(record.id, record.email)
          }
        }
      }

      setRecords(sortedRecords)
      setIsFetching(false)
    }, (error) => {
      console.error("Failed to load registration approval list:", error)
      toast({ title: "Error", description: "Failed to connect to database.", variant: "destructive" })
      setIsFetching(false)
    })

    return () => {
      setTimeout(() => {
        if (typeof unsubscribe === 'function') {
          try {
            unsubscribe()
          } catch (e) {
            console.warn("Firestore unsubscribe cleanup ignored:", e)
          }
        }
      }, 10)
      
      Object.values(deletingIds).forEach(timer => clearTimeout(timer))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAddRecord = async () => {
    if (!firstName.trim() || !lastName.trim() || !emailInput.trim()) {
      toast({ variant: "destructive", title: "Error", description: "First Name, Last Name, and Email are required." })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const cleanEmail = emailInput.trim().toLowerCase()

    if (!emailRegex.test(cleanEmail)) {
      toast({ variant: "destructive", title: "Invalid Email", description: "Please enter a valid email address." })
      return
    }

    const isDuplicate = records.some(r => r.email.toLowerCase() === cleanEmail)
    if (isDuplicate) {
      toast({ variant: "destructive", title: "Duplicate", description: "This email is already in the list." })
      return
    }

    setIsLoading(true)
    try {
      await addRegistrationApprovalDb({
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        email: cleanEmail,
      })

      toast({
        title: "Record Added",
        description: `${firstName.trim()} ${lastName.trim()} has been added to the registration approval list.`,
        className: "bg-emerald-600 text-white border-none"
      })

      setFirstName("")
      setMiddleName("")
      setLastName("")
      setEmailInput("")
      setIsAddDialogOpen(false)
    } catch (error: any) {
      toast({ variant: "destructive", title: "Database Error", description: error.message || "Failed to add record." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditRecord = async () => {
    if (!editingRecord || !editFirstName.trim() || !editLastName.trim() || !editEmail.trim()) return

    const newEmail = editEmail.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(newEmail)) {
      toast({ variant: "destructive", title: "Invalid Email", description: "Please enter a valid email format." })
      return
    }

    if (editingRecord.status === "Registered") {
      toast({ variant: "destructive", title: "Cannot Edit", description: "This record has already been completed and cannot be changed." })
      return
    }

    const isDuplicate = records.some(r => r.email.toLowerCase() === newEmail && r.id !== editingRecord.id)
    if (isDuplicate) {
      toast({ variant: "destructive", title: "Duplicate Email", description: "This email is already in the list." })
      return
    }

    setIsEditLoading(true)
    try {
      await addRegistrationApprovalDb({
        firstName: editFirstName.trim(),
        middleName: editMiddleName.trim(),
        lastName: editLastName.trim(),
        email: newEmail,
      })
      await deleteRegistrationApprovalDb(editingRecord.id)
      
      toast({ title: "Record Updated", description: "The record has been successfully updated.", className: "bg-emerald-600 text-white border-none" })
      setIsEditDialogOpen(false)
      setEditingRecord(null)
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message || "Failed to update record." })
    } finally {
      setIsEditLoading(false)
    }
  }

  const openEditDialog = (record: RegistrationApprovalRecord) => {
    if (record.status === "Registered") {
      toast({ variant: "destructive", title: "Cannot Edit", description: "This registration has already been completed." })
      return
    }
    setEditingRecord(record)
    setEditFirstName(record.firstName || "")
    setEditMiddleName(record.middleName || "")
    setEditLastName(record.lastName || "")
    setEditEmail(record.email)
    setIsEditDialogOpen(true)
  }

  const resetDialog = () => {
    setFirstName("")
    setMiddleName("")
    setLastName("")
    setEmailInput("")
    setIsAddDialogOpen(false)
  }

  const triggerDelete = (id: string, emailAddress: string) => {
    const timer = setTimeout(async () => {
      try {
        await deleteRegistrationApprovalDb(id)
        setDeletingIds(prev => {
          const next = { ...prev }
          delete next[id]
          return next
        })
        toast({ title: "Success", description: `Removed ${emailAddress} from the list` })
      } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to remove" })
        setDeletingIds(prev => {
          const next = { ...prev }
          delete next[id]
          return next
        })
      }
    }, 3000)

    setDeletingIds(prev => ({ ...prev, [id]: timer }))
  }

  const undoDelete = (id: string) => {
    if (deletingIds[id]) {
      clearTimeout(deletingIds[id])
      setDeletingIds(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      toast({ 
        title: "Undo Successful", 
        description: "The record was not deleted.", 
        className: "bg-slate-800 text-white border-none" 
      })
    }
  }

  const getFullName = (record: RegistrationApprovalRecord) => {
    const parts = [record.firstName, record.middleName, record.lastName].filter(Boolean)
    return parts.length > 0 ? parts.join(" ") : "N/A"
  }

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const fullName = getFullName(r).toLowerCase()
      const email = r.email.toLowerCase()
      const q = searchQuery.toLowerCase()
      return fullName.includes(q) || email.includes(q)
    })
  }, [records, searchQuery])

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredRecords.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredRecords, currentPage])

  useEffect(() => {
    const maxPage = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE)
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage)
    }
  }, [filteredRecords.length, currentPage])

  return (
    <PermissionGuard permission="approved-emails">
      <AdminLayout>
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
          
          <div className="flex justify-end">
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              if (!open) resetDialog()
              else setIsAddDialogOpen(true)
            }}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 px-6 font-bold shadow-md shadow-emerald-200">
                  <Plus className="mr-2 h-5 w-5" /> Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px] rounded-3xl border-0 shadow-2xl overflow-hidden p-0">
                <div className="h-2 bg-emerald-500 w-full" />
                <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100">
                  <DialogTitle className="text-xl font-black uppercase text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" /> Add to Registration Approval List
                  </DialogTitle>
                  <DialogDescription className="font-medium text-slate-500">
                    Add a student who has personally completed the registration process at the Municipal Office.
                  </DialogDescription>
                </DialogHeader>
                <div className="p-6 grid gap-5 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-xs font-black uppercase tracking-widest text-slate-400">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="Juan"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="middleName" className="text-xs font-black uppercase tracking-widest text-slate-400">Middle Name</Label>
                      <Input
                        id="middleName"
                        placeholder="Dela Cruz"
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-xs font-black uppercase tracking-widest text-slate-400">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Santos"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailInput" className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address *</Label>
                    <Input
                      id="emailInput"
                      type="email"
                      placeholder="student@gmail.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
                <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex gap-2 sm:justify-end">
                  <Button variant="outline" onClick={resetDialog} disabled={isLoading} className="rounded-xl font-bold">
                    Cancel
                  </Button>
                  <Button onClick={handleAddRecord} disabled={isLoading || !firstName.trim() || !lastName.trim() || !emailInput.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-8">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isLoading ? "Adding..." : "Add Record"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
            if (!open) {
              setIsEditDialogOpen(false)
              setEditingRecord(null)
            }
          }}>
            <DialogContent className="sm:max-w-md rounded-3xl border-0 shadow-2xl p-0 overflow-hidden bg-white">
              <div className="h-2 bg-blue-500 w-full" />
              <DialogHeader className="p-6 border-b border-slate-100">
                <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-800">Edit Record</DialogTitle>
                <DialogDescription className="font-medium text-slate-500 mt-1">
                  Update the student&apos;s information.
                </DialogDescription>
              </DialogHeader>
              <div className="p-6 grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">First Name</Label>
                    <Input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Middle Name</Label>
                    <Input value={editMiddleName} onChange={(e) => setEditMiddleName(e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Last Name</Label>
                    <Input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} className="h-11 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Address</Label>
                  <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="h-11 rounded-xl" />
                </div>
              </div>
              <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isEditLoading} className="rounded-xl font-bold">
                  Cancel
                </Button>
                <Button onClick={handleEditRecord} disabled={isEditLoading || !editFirstName.trim() || !editLastName.trim() || !editEmail.trim()} className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                  {isEditLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardContent className="p-6 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <UserCheck className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-wider">Total Records</span>
                </div>
                <span className="text-4xl font-black text-slate-900">{records.length}</span>
                <p className="text-xs font-medium text-slate-400 mt-1">Students in approval list</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-emerald-200 shadow-sm bg-emerald-50/30">
              <CardContent className="p-6 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-emerald-600 mb-2">
                  <CheckCircle className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-wider">Available</span>
                </div>
                <span className="text-4xl font-black text-emerald-700">{records.filter(r => r.status === "Available").length}</span>
                <p className="text-xs font-medium text-emerald-600/70 mt-1">Ready for registration</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-blue-200 shadow-sm bg-blue-50/30">
              <CardContent className="p-6 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <XCircle className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-wider">Registered</span>
                </div>
                <span className="text-4xl font-black text-blue-700">{records.filter(r => r.status === "Registered").length}</span>
                <p className="text-xs font-medium text-blue-600/70 mt-1">Already registered</p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-white border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight text-slate-800">Student Records</CardTitle>
                <CardDescription className="font-medium text-slate-500">Manage individual student records</CardDescription>
              </div>
              <div className="relative w-full sm:w-72 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search name or email..."
                  value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                  className="pl-10 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 h-10 font-medium shadow-none"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isFetching ? (
                <div className="py-24 flex flex-col items-center justify-center text-emerald-600">
                  <Loader2 className="h-10 w-10 animate-spin mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading records...</p>
                </div>
              ) : paginatedRecords.length === 0 ? (
                <div className="py-24 text-center text-slate-400">
                  <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-sm">No records found.</p>
                </div>
              ) : (
                <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-slate-100">
                        <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest pl-8 py-4">Profile</TableHead>
                        <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest py-4">Full Name</TableHead>
                        <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest py-4">Email Address</TableHead>
                        <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest py-4">Status</TableHead>
                        <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest text-right pr-8 py-4">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white">
                      {paginatedRecords.map((record) => (
                        deletingIds[record.id] ? (
                          <TableRow key={record.id} className="bg-red-50/80 hover:bg-red-50/80 border-b border-red-100/50">
                            <TableCell colSpan={5} className="py-3 px-8">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Loader2 className="w-5 h-5 animate-spin text-red-600" />
                                  <span className="text-sm font-black text-red-700 tracking-tight">
                                    Permanently deleting {record.email} in 3 seconds...
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => undoDelete(record.id)}
                                  className="border-red-200 bg-white text-red-700 hover:bg-red-100 hover:text-red-800 font-bold rounded-xl h-9 px-4 shadow-sm"
                                >
                                  <Undo className="w-4 h-4 mr-2" /> Undo
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          <TableRow key={record.id} className="hover:bg-slate-50/80 transition-colors border-slate-100">
                            <TableCell className="pl-8 py-4">
                              <div className="flex items-center gap-3">
                                {record.profilePicture ? (
                                  <Avatar className="h-8 w-8 border-2 border-white shadow-sm shrink-0">
                                    <AvatarImage src={record.profilePicture} className="object-cover" />
                                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-xs">
                                      {(record.firstName || "?").charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                    <User className="h-4 w-4" />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <span className="font-bold text-slate-800 text-sm">{getFullName(record)}</span>
                            </TableCell>
                            <TableCell className="py-4">
                              <span className="font-medium text-slate-600 text-sm">{record.email}</span>
                            </TableCell>
                            <TableCell className="py-4">
                              {record.status === "Registered" ? (
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none font-bold shadow-none">Registered</Badge>
                              ) : (
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-bold shadow-none">Available</Badge>
                              )}
                            </TableCell>
                            
                            <TableCell className="text-right pr-8 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openEditDialog(record)
                                  }}
                                  className={`h-8 w-8 rounded-lg shadow-sm border ${
                                    record.status === "Registered"
                                      ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50' 
                                      : 'border-blue-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50 bg-white'
                                  }`}
                                  title={record.status === "Registered" ? "Cannot edit registered record" : "Edit record"}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    triggerDelete(record.id, record.email)
                                  }}
                                  className="h-8 w-8 rounded-lg shadow-sm border border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 bg-white"
                                  title="Delete record"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>

                          </TableRow>
                        )
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <DataPagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredRecords.length / ITEMS_PER_PAGE)}
                  onPageChange={setCurrentPage}
                  totalItems={filteredRecords.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </PermissionGuard>
  )
}
