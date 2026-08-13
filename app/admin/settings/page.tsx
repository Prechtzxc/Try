"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { AdminLayout } from "@/components/admin-layout"
import { useToast } from "@/components/ui/use-toast"
import { MapPin, Plus, Search, Edit, Trash2, Loader2, BookCheck, ListChecks, ArrowUp, ArrowDown, Info, AlertTriangle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { collection, doc, onSnapshot, setDoc, getDocs, query, where, writeBatch, addDoc, deleteDoc, updateDoc, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  HOW_TO_APPLY_SETTINGS_DOC,
  HOW_TO_APPLY_ICON_OPTIONS,
  DEFAULT_IMPORTANT_NOTICE,
  DEFAULT_REGISTRATION_NOTICE,
  createDefaultHowToApplySteps,
  getHowToApplyIcon,
  normalizeHowToApplySteps,
  normalizeNotice,
  type HowToApplyStep,
  type NoticeConfig,
} from "@/lib/how-to-apply"

type Barangay = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

type Requirement = {
  id: string;
  name: string;
  description?: string;
  required: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSettingsPage() {
  const { toast } = useToast()

  // ============= BARANGAY STATE =============
  const [barangaysList, setBarangaysList] = useState<Barangay[]>([])
  const [barangaySearch, setBarangaySearch] = useState("")
  const [isBarangayFormOpen, setIsBarangayFormOpen] = useState(false)
  const [editingBarangay, setEditingBarangay] = useState<Barangay | null>(null)
  const [barangayFormName, setBarangayFormName] = useState("")
  const [isSavingBarangay, setIsSavingBarangay] = useState(false)
  const [isDeleteBarangayOpen, setIsDeleteBarangayOpen] = useState(false)
  const [barangayToDelete, setBarangayToDelete] = useState<Barangay | null>(null)

  // ============= REQUIREMENT STATE =============
  const [requirementsList, setRequirementsList] = useState<Requirement[]>([])
  const [requirementSearch, setRequirementSearch] = useState("")
  const [isReqFormOpen, setIsReqFormOpen] = useState(false)
  const [editingReq, setEditingReq] = useState<Requirement | null>(null)
  const [reqFormName, setReqFormName] = useState("")
  const [reqFormDesc, setReqFormDesc] = useState("")
  const [isSavingReq, setIsSavingReq] = useState(false)
  const [isDeleteReqOpen, setIsDeleteReqOpen] = useState(false)
  const [reqToDelete, setReqToDelete] = useState<Requirement | null>(null)

  // ============= HOW TO APPLY STATE =============
  const [howToSteps, setHowToSteps] = useState<HowToApplyStep[]>([])
  const [importantNotice, setImportantNotice] = useState<NoticeConfig>(DEFAULT_IMPORTANT_NOTICE)
  const [registrationNotice, setRegistrationNotice] = useState<NoticeConfig>(DEFAULT_REGISTRATION_NOTICE)
  const [noticeDialogMode, setNoticeDialogMode] = useState<"important" | "registration" | null>(null)
  const [noticeFormTitle, setNoticeFormTitle] = useState("")
  const [noticeFormMessage, setNoticeFormMessage] = useState("")
  const [isSavingNotice, setIsSavingNotice] = useState(false)
  const [isStepFormOpen, setIsStepFormOpen] = useState(false)
  const [editingStep, setEditingStep] = useState<HowToApplyStep | null>(null)
  const [stepFormTitle, setStepFormTitle] = useState("")
  const [stepFormDesc, setStepFormDesc] = useState("")
  const [stepFormIcon, setStepFormIcon] = useState("landmark")
  const [isSavingStep, setIsSavingStep] = useState(false)
  const [isDeleteStepOpen, setIsDeleteStepOpen] = useState(false)
  const [stepToDelete, setStepToDelete] = useState<HowToApplyStep | null>(null)
  const [isReorderingStep, setIsReorderingStep] = useState(false)

  const seededRef = useRef(false);
  const seededConfigRef = useRef(false);

  useEffect(() => {
    const unsubBarangays = onSnapshot(doc(db, "settings", "barangays"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().list) {
        const rawList = docSnap.data().list;
        const mappedList: Barangay[] = rawList.map((b: any) => {
          if (typeof b === "string") {
            return { id: Math.random().toString(36).substr(2, 9), name: b, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          }
          return b;
        });
        setBarangaysList(mappedList.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })));
      } else {
        setBarangaysList([]);
      }
    });

    const unsubReqs = onSnapshot(query(collection(db, "requirements"), orderBy("order", "asc")), (snapshot) => {
      const reqs: Requirement[] = snapshot.docs.map(d => ({
        id: d.id,
        name: d.data().name || "",
        description: d.data().description || "",
        required: d.data().required ?? true,
        order: d.data().order ?? 0,
        createdAt: d.data().createdAt || new Date().toISOString(),
        updatedAt: d.data().updatedAt || new Date().toISOString(),
      }));
      setRequirementsList(reqs);

      if (reqs.length === 0 && !seededRef.current) {
        seededRef.current = true;
        const defaults = [
          "Filled-out Application Form",
          "School Registration Form",
          "Enrollment Receipt",
          "School ID / Cert of Non-issuance",
          "Original Barangay Indigency",
          "Original Barangay Clearance",
          "Letter to City Mayor",
          "Voter's Certification",
          "Previous Grades",
        ];
        const now = new Date().toISOString();
        defaults.forEach((name, i) => {
          addDoc(collection(db, "requirements"), {
            name,
            description: "",
            required: true,
            order: i,
            createdAt: now,
            updatedAt: now,
          });
        });
      }
    });

    return () => {
      unsubBarangays();
      unsubReqs();
    }
  }, [])

  useEffect(() => {
    const unsubSteps = onSnapshot(doc(db, "settings", HOW_TO_APPLY_SETTINGS_DOC), (docSnap) => {
      const data = docSnap.exists() ? docSnap.data() : {}
      const steps = normalizeHowToApplySteps(data?.steps);
      setHowToSteps(steps);
      setImportantNotice(normalizeNotice(data?.importantNotice, DEFAULT_IMPORTANT_NOTICE));
      setRegistrationNotice(normalizeNotice(data?.registrationNotice, DEFAULT_REGISTRATION_NOTICE));

      const missingSteps = steps.length === 0;
      const missingNotices = !data?.importantNotice || !data?.registrationNotice;

      if ((missingSteps || missingNotices) && !seededConfigRef.current) {
        seededConfigRef.current = true;
        const payload: Record<string, unknown> = {};
        if (missingSteps) payload.steps = createDefaultHowToApplySteps();
        if (missingNotices) {
          payload.importantNotice = DEFAULT_IMPORTANT_NOTICE;
          payload.registrationNotice = DEFAULT_REGISTRATION_NOTICE;
        }
        setDoc(doc(db, "settings", HOW_TO_APPLY_SETTINGS_DOC), payload, { merge: true });
      }
    });

    return () => {
      unsubSteps();
    }
  }, [])

  const filteredBarangays = barangaysList.filter(b => b.name.toLowerCase().includes(barangaySearch.toLowerCase()));

  const handleSaveBarangay = async () => {
    if (!barangayFormName.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Barangay name cannot be empty." });
      return;
    }
    const isDuplicate = barangaysList.some(b => b.name.toLowerCase() === barangayFormName.trim().toLowerCase() && b.id !== editingBarangay?.id);
    if (isDuplicate) {
      toast({ variant: "destructive", title: "Error", description: "A barangay with this name already exists." });
      return;
    }
    setIsSavingBarangay(true);
    try {
      const now = new Date().toISOString();
      let updatedList;
      if (editingBarangay) {
        const oldName = editingBarangay.name;
        const newName = barangayFormName.trim();
        updatedList = barangaysList.map(b => b.id === editingBarangay.id ? { ...b, name: newName, updatedAt: now } : b);
        if (oldName !== newName) {
          const batch = writeBatch(db);
          const usersSnap = await getDocs(query(collection(db, "users"), where("profileData.barangay", "==", oldName)));
          usersSnap.forEach(userDoc => batch.update(userDoc.ref, { "profileData.barangay": newName }));
          const appsSnap = await getDocs(query(collection(db, "applications"), where("barangay", "==", oldName)));
          appsSnap.forEach(appDoc => batch.update(appDoc.ref, { "barangay": newName }));
          await batch.commit();
        }
      } else {
        const newBarangay = { id: Math.random().toString(36).substr(2, 9), name: barangayFormName.trim(), createdAt: now, updatedAt: now };
        updatedList = [...barangaysList, newBarangay];
      }
      await setDoc(doc(db, "settings", "barangays"), { list: updatedList }, { merge: true });
      toast({ title: "Success", description: editingBarangay ? "Barangay updated & synced successfully." : "Barangay added successfully.", className: "bg-emerald-600 text-white" });
      setIsBarangayFormOpen(false);
      setBarangayFormName("");
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save barangay." });
    } finally {
      setIsSavingBarangay(false);
    }
  }

  const confirmDeleteBarangay = async () => {
    if (!barangayToDelete) return;
    setIsSavingBarangay(true);
    try {
      const updatedList = barangaysList.filter(b => b.id !== barangayToDelete.id);
      await setDoc(doc(db, "settings", "barangays"), { list: updatedList }, { merge: true });
      toast({ title: "Success", description: "Barangay removed successfully." });
      setIsDeleteBarangayOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete barangay." });
    } finally {
      setIsSavingBarangay(false);
    }
  }

  const filteredRequirements = requirementsList.filter(r => r.name.toLowerCase().includes(requirementSearch.toLowerCase()));

  const handleSaveRequirement = async () => {
    if (!reqFormName.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Requirement name cannot be empty." });
      return;
    }
    setIsSavingReq(true);
    try {
      const now = new Date().toISOString();
      if (editingReq) {
        await updateDoc(doc(db, "requirements", editingReq.id), {
          name: reqFormName.trim(),
          description: reqFormDesc.trim(),
          updatedAt: now,
        });
        toast({ title: "Success", description: "Requirement updated successfully.", className: "bg-emerald-600 text-white" });
      } else {
        const maxOrder = requirementsList.reduce((max, r) => Math.max(max, r.order), -1);
        await addDoc(collection(db, "requirements"), {
          name: reqFormName.trim(),
          description: reqFormDesc.trim(),
          required: true,
          order: maxOrder + 1,
          createdAt: now,
          updatedAt: now,
        });
        toast({ title: "Success", description: "Requirement added successfully.", className: "bg-emerald-600 text-white" });
      }
      setIsReqFormOpen(false);
      setReqFormName("");
      setReqFormDesc("");
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save requirement." });
    } finally {
      setIsSavingReq(false);
    }
  }

  const confirmDeleteRequirement = async () => {
    if (!reqToDelete) return;
    setIsSavingReq(true);
    try {
      await deleteDoc(doc(db, "requirements", reqToDelete.id));
      toast({ title: "Success", description: "Requirement removed successfully." });
      setIsDeleteReqOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete requirement." });
    } finally {
      setIsSavingReq(false);
    }
  }

  // ================= HOW TO APPLY =================

  const persistHowToSteps = async (nextSteps: HowToApplyStep[]) => {
    const now = new Date().toISOString();
    const normalized = nextSteps.map((step, index) => ({ ...step, order: index, updatedAt: now }));
    await setDoc(doc(db, "settings", HOW_TO_APPLY_SETTINGS_DOC), { steps: normalized }, { merge: true });
    return normalized;
  }

  const handleSaveStep = async () => {
    if (!stepFormTitle.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Step title cannot be empty." });
      return;
    }
    setIsSavingStep(true);
    try {
      const now = new Date().toISOString();
      if (editingStep) {
        const next = howToSteps.map(step => step.id === editingStep.id
          ? { ...step, title: stepFormTitle.trim(), description: stepFormDesc.trim(), icon: stepFormIcon, updatedAt: now }
          : step);
        await persistHowToSteps(next);
        toast({ title: "Success", description: "Step updated successfully.", className: "bg-emerald-600 text-white" });
      } else {
        const newStep: HowToApplyStep = {
          id: Math.random().toString(36).substr(2, 9),
          order: howToSteps.length,
          title: stepFormTitle.trim(),
          description: stepFormDesc.trim(),
          icon: stepFormIcon,
          active: true,
          createdAt: now,
          updatedAt: now,
        };
        await persistHowToSteps([...howToSteps, newStep]);
        toast({ title: "Success", description: "Step added successfully.", className: "bg-emerald-600 text-white" });
      }
      setIsStepFormOpen(false);
      setStepFormTitle("");
      setStepFormDesc("");
      setStepFormIcon("landmark");
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save step." });
    } finally {
      setIsSavingStep(false);
    }
  }

  const confirmDeleteStep = async () => {
    if (!stepToDelete) return;
    setIsSavingStep(true);
    try {
      await persistHowToSteps(howToSteps.filter(step => step.id !== stepToDelete.id));
      toast({ title: "Success", description: "Step removed successfully." });
      setIsDeleteStepOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete step." });
    } finally {
      setIsSavingStep(false);
    }
  }

  const handleMoveStep = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= howToSteps.length) return;
    setIsReorderingStep(true);
    try {
      const next = [...howToSteps];
      [next[index], next[target]] = [next[target], next[index]];
      await persistHowToSteps(next);
      toast({ title: "Success", description: "Step order updated.", className: "bg-emerald-600 text-white" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to reorder steps." });
    } finally {
      setIsReorderingStep(false);
    }
  }

  const handleSaveNotice = async () => {
    if (!noticeDialogMode) return;
    if (!noticeFormTitle.trim() || !noticeFormMessage.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Notice title and message cannot be empty." });
      return;
    }
    setIsSavingNotice(true);
    try {
      const key = noticeDialogMode === "important" ? "importantNotice" : "registrationNotice";
      await setDoc(doc(db, "settings", HOW_TO_APPLY_SETTINGS_DOC), {
        [key]: { title: noticeFormTitle.trim(), message: noticeFormMessage.trim(), updatedAt: new Date().toISOString() },
      }, { merge: true });
      toast({ title: "Success", description: noticeDialogMode === "important" ? "Important notice updated successfully." : "Registration notice updated successfully.", className: "bg-emerald-600 text-white" });
      setNoticeDialogMode(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save notice." });
    } finally {
      setIsSavingNotice(false);
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
        <Tabs defaultValue="manage-barangays" className="space-y-6">
          
          <TabsList className="bg-slate-100/50 p-1.5 shadow-sm flex flex-wrap h-auto w-full md:w-fit justify-start rounded-2xl border border-slate-200 gap-1">
            <TabsTrigger value="manage-barangays" className="gap-2 h-10 px-6 shrink-0 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"><MapPin className="h-4 w-4" /> Manage Barangays</TabsTrigger>
            <TabsTrigger value="manage-requirements" className="gap-2 h-10 px-6 shrink-0 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"><BookCheck className="h-4 w-4" /> Manage Requirements</TabsTrigger>
            <TabsTrigger value="manage-how-to-apply" className="gap-2 h-10 px-6 shrink-0 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"><ListChecks className="h-4 w-4" /> How to Apply</TabsTrigger>
          </TabsList>

          {/* ================= MANAGE BARANGAYS TAB ================= */}
          <TabsContent value="manage-barangays">
            <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden bg-white">
              <div className="h-2 bg-gradient-to-r from-rose-400 to-rose-600 w-full" />
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-2"><MapPin className="h-5 w-5 text-rose-600" /> Manage Barangays</CardTitle>
                  <CardDescription className="font-medium text-slate-500">Maintain the list of barangays for student registration and payouts.</CardDescription>
                </div>
                <Button onClick={() => { setEditingBarangay(null); setBarangayFormName(""); setIsBarangayFormOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md font-bold h-12 px-6 shrink-0 text-base"><Plus className="w-5 h-5 mr-2" /> Add Barangay</Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  <Input placeholder="Search barangays..." value={barangaySearch} onChange={(e) => setBarangaySearch(e.target.value)} className="pl-12 h-14 rounded-2xl bg-slate-50 border-slate-200 shadow-sm font-medium text-lg" />
                </div>
                {filteredBarangays.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-slate-400">
                    <MapPin className="h-12 w-12 mb-4 opacity-20" />
                    <p className="font-black text-xl text-slate-500 uppercase tracking-tight">No barangays found</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {filteredBarangays.map((barangay, index) => (
                      <div key={barangay.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-emerald-400 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100 shadow-sm">
                            <span className="font-black text-xl">{index + 1}</span>
                          </div>
                          <span className="font-black text-slate-900 text-xl uppercase tracking-tight whitespace-nowrap">{barangay.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button variant="outline" onClick={() => { setEditingBarangay(barangay); setBarangayFormName(barangay.name); setIsBarangayFormOpen(true); }} className="h-12 px-5 rounded-xl border-slate-200 text-blue-600 hover:bg-blue-50 font-bold text-base"><Edit className="h-5 w-5 sm:mr-2" /><span className="hidden sm:inline">Edit</span></Button>
                          <Button variant="outline" onClick={() => { setBarangayToDelete(barangay); setIsDeleteBarangayOpen(true); }} className="h-12 px-5 rounded-xl border-slate-200 text-red-600 hover:bg-red-50 font-bold text-base"><Trash2 className="h-5 w-5 sm:mr-2" /><span className="hidden sm:inline">Delete</span></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-sm font-bold text-slate-500">Total Barangays: <span className="text-slate-800 text-lg ml-1">{filteredBarangays.length}</span></div>
                </div>
              </CardContent>
            </Card>

            {/* ADD/EDIT BARANGAY MODAL */}
            <Dialog open={isBarangayFormOpen} onOpenChange={setIsBarangayFormOpen}>
              <DialogContent className="sm:max-w-[450px] rounded-3xl p-6 shadow-2xl border-0">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-800">
                    {editingBarangay ? "Edit Barangay" : "Add New Barangay"}
                  </DialogTitle>
                  <DialogDescription className="font-medium text-slate-500">
                    {editingBarangay ? "Modify the name of the existing barangay." : "Enter a unique name to add it to the global list."}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="barangayName" className="text-xs font-bold uppercase tracking-wider text-slate-700">Barangay Name <span className="text-red-500">*</span></Label>
                    <Input id="barangayName" autoFocus placeholder="e.g. Barangay 1" value={barangayFormName} onChange={(e) => setBarangayFormName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSaveBarangay() }} className="h-12 rounded-xl bg-slate-50 focus:bg-white text-base font-bold uppercase" />
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                  <Button variant="outline" onClick={() => setIsBarangayFormOpen(false)} disabled={isSavingBarangay} className="rounded-xl font-bold border-slate-200 h-11 px-6">Cancel</Button>
                  <Button onClick={handleSaveBarangay} disabled={isSavingBarangay} className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md h-11 px-8">
                    {isSavingBarangay ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {editingBarangay ? "Save Changes" : "Add Barangay"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* DELETE BARANGAY CONFIRMATION */}
            <AlertDialog open={isDeleteBarangayOpen} onOpenChange={setIsDeleteBarangayOpen}>
              <AlertDialogContent className="rounded-3xl border-0 shadow-2xl p-6">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-red-500" /> Confirm Deletion
                  </AlertDialogTitle>
                  <AlertDialogDescription className="font-medium text-slate-600 text-base">
                    Are you sure you want to delete <span className="font-black text-slate-900 uppercase">"{barangayToDelete?.name}"</span>? This will remove it from the registration dropdown and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6">
                  <AlertDialogCancel disabled={isSavingBarangay} className="rounded-xl font-bold border-slate-200 text-slate-600 h-11 px-6">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmDeleteBarangay(); }} disabled={isSavingBarangay} className="bg-red-600 hover:bg-red-700 rounded-xl font-bold text-white shadow-md h-11 px-6">
                    {isSavingBarangay ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {isSavingBarangay ? "Deleting..." : "Yes, Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TabsContent>

          {/* ================= MANAGE REQUIREMENTS TAB ================= */}
          <TabsContent value="manage-requirements">
            <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden bg-white">
              <div className="h-2 bg-gradient-to-r from-violet-400 to-violet-600 w-full" />
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-2"><BookCheck className="h-5 w-5 text-violet-600" /> Manage Requirements</CardTitle>
                  <CardDescription className="font-medium text-slate-500">Define the required documents students must upload when applying.</CardDescription>
                </div>
                <Button onClick={() => { setEditingReq(null); setReqFormName(""); setReqFormDesc(""); setIsReqFormOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md font-bold h-12 px-6 shrink-0 text-base"><Plus className="w-5 h-5 mr-2" /> Add Requirement</Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  <Input placeholder="Search requirements..." value={requirementSearch} onChange={(e) => setRequirementSearch(e.target.value)} className="pl-12 h-14 rounded-2xl bg-slate-50 border-slate-200 shadow-sm font-medium text-lg" />
                </div>
                {filteredRequirements.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-slate-400">
                    <BookCheck className="h-12 w-12 mb-4 opacity-20" />
                    <p className="font-black text-xl text-slate-500 uppercase tracking-tight">No requirements found</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {filteredRequirements.map((req, index) => (
                      <div key={req.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-violet-400 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4 overflow-hidden flex-1">
                          <div className="h-12 w-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 shrink-0 border border-violet-100 shadow-sm">
                            <span className="font-black text-xl">{index + 1}</span>
                          </div>
                          <div className="overflow-hidden">
                            <span className="font-black text-slate-900 text-xl uppercase tracking-tight block truncate">{req.name}</span>
                            {req.description && (
                              <span className="text-sm font-medium text-slate-500 block truncate">{req.description}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button variant="outline" onClick={() => { setEditingReq(req); setReqFormName(req.name); setReqFormDesc(req.description || ""); setIsReqFormOpen(true); }} className="h-12 px-5 rounded-xl border-slate-200 text-blue-600 hover:bg-blue-50 font-bold text-base"><Edit className="h-5 w-5 sm:mr-2" /><span className="hidden sm:inline">Edit</span></Button>
                          <Button variant="outline" onClick={() => { setReqToDelete(req); setIsDeleteReqOpen(true); }} className="h-12 px-5 rounded-xl border-slate-200 text-red-600 hover:bg-red-50 font-bold text-base"><Trash2 className="h-5 w-5 sm:mr-2" /><span className="hidden sm:inline">Delete</span></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-sm font-bold text-slate-500">Total Requirements: <span className="text-slate-800 text-lg ml-1">{filteredRequirements.length}</span></div>
                </div>
              </CardContent>
            </Card>

            {/* ADD/EDIT REQUIREMENT MODAL */}
            <Dialog open={isReqFormOpen} onOpenChange={setIsReqFormOpen}>
              <DialogContent className="sm:max-w-[500px] rounded-3xl p-6 shadow-2xl border-0">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-800">
                    {editingReq ? "Edit Requirement" : "Add New Requirement"}
                  </DialogTitle>
                  <DialogDescription className="font-medium text-slate-500">
                    {editingReq ? "Modify the name and description of the requirement." : "Define a new document requirement for scholarship applications."}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reqName" className="text-xs font-bold uppercase tracking-wider text-slate-700">Requirement Name <span className="text-red-500">*</span></Label>
                    <Input id="reqName" autoFocus placeholder="e.g. Filled-out Application Form" value={reqFormName} onChange={(e) => setReqFormName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSaveRequirement() }} className="h-12 rounded-xl bg-slate-50 focus:bg-white text-base font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reqDesc" className="text-xs font-bold uppercase tracking-wider text-slate-700">Description <span className="text-slate-400">(optional)</span></Label>
                    <Input id="reqDesc" placeholder="Brief description of the requirement" value={reqFormDesc} onChange={(e) => setReqFormDesc(e.target.value)} className="h-12 rounded-xl bg-slate-50 focus:bg-white text-base" />
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                  <Button variant="outline" onClick={() => setIsReqFormOpen(false)} disabled={isSavingReq} className="rounded-xl font-bold border-slate-200 h-11 px-6">Cancel</Button>
                  <Button onClick={handleSaveRequirement} disabled={isSavingReq} className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md h-11 px-8">
                    {isSavingReq ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {editingReq ? "Save Changes" : "Add Requirement"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* DELETE REQUIREMENT CONFIRMATION */}
            <AlertDialog open={isDeleteReqOpen} onOpenChange={setIsDeleteReqOpen}>
              <AlertDialogContent className="rounded-3xl border-0 shadow-2xl p-6">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-red-500" /> Confirm Deletion
                  </AlertDialogTitle>
                  <AlertDialogDescription className="font-medium text-slate-600 text-base">
                    Are you sure you want to delete <span className="font-black text-slate-900 uppercase">"{reqToDelete?.name}"</span>? This will remove it from the student upload requirements and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6">
                  <AlertDialogCancel disabled={isSavingReq} className="rounded-xl font-bold border-slate-200 text-slate-600 h-11 px-6">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmDeleteRequirement(); }} disabled={isSavingReq} className="bg-red-600 hover:bg-red-700 rounded-xl font-bold text-white shadow-md h-11 px-6">
                    {isSavingReq ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {isSavingReq ? "Deleting..." : "Yes, Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TabsContent>

          {/* ================= HOW TO APPLY TAB ================= */}
          <TabsContent value="manage-how-to-apply">
            {/* IMPORTANT NOTICE SECTION */}
            <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden bg-white mb-6">
              <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-500 w-full" />
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shadow-sm shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black uppercase tracking-tight text-slate-800">Important Notice</CardTitle>
                    <CardDescription className="font-medium text-slate-500">Shown on the landing page How to Apply modal and the registration page.</CardDescription>
                  </div>
                </div>
                <Button variant="outline" onClick={() => { setNoticeDialogMode("important"); setNoticeFormTitle(importantNotice.title); setNoticeFormMessage(importantNotice.message); }} className="h-11 px-5 rounded-xl border-slate-200 text-blue-600 hover:bg-blue-50 font-bold shrink-0"><Edit className="h-5 w-5 sm:mr-2" /><span className="hidden sm:inline">Edit Notice</span></Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 md:p-5">
                  <div className="flex items-center gap-2 mb-1.5 text-amber-700">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <h5 className="text-sm font-black uppercase tracking-tight">{importantNotice.title}</h5>
                  </div>
                  <p className="text-xs md:text-sm text-amber-800 leading-relaxed">{importantNotice.message}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden bg-white">
              <div className="h-2 bg-gradient-to-r from-sky-400 to-sky-600 w-full" />
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-2"><ListChecks className="h-5 w-5 text-sky-600" /> How to Apply</CardTitle>
                  <CardDescription className="font-medium text-slate-500">Manage the step-by-step application process shown on the landing page.</CardDescription>
                </div>
                <Button onClick={() => { setEditingStep(null); setStepFormTitle(""); setStepFormDesc(""); setStepFormIcon("landmark"); setIsStepFormOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md font-bold h-12 px-6 shrink-0 text-base"><Plus className="w-5 h-5 mr-2" /> Add Step</Button>
              </CardHeader>
              <CardContent className="p-6">
                {howToSteps.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center bg-slate-50/60 border-2 border-dashed border-slate-200 rounded-3xl">
                    <div className="h-16 w-16 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center mb-4">
                      <Info className="h-8 w-8 text-sky-500" />
                    </div>
                    <p className="font-black text-lg text-slate-600 uppercase tracking-tight">No application steps configured</p>
                    <p className="text-sm font-medium text-slate-400 mt-1.5 max-w-sm">Add your first step to display the How to Apply process on the landing page.</p>
                    <Button onClick={() => { setEditingStep(null); setStepFormTitle(""); setStepFormDesc(""); setStepFormIcon("landmark"); setIsStepFormOpen(true); }} className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md font-bold h-12 px-6 text-base"><Plus className="w-5 h-5 mr-2" /> Add Step</Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {howToSteps.map((step, index) => {
                      const StepIcon = getHowToApplyIcon(step.icon)
                      const isLast = index === howToSteps.length - 1
                      return (
                        <div key={step.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-sky-400 hover:shadow-md transition-all">
                          <div className="flex items-center gap-4 overflow-hidden flex-1">
                            <div className="h-12 w-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0 border border-sky-100 shadow-sm">
                              <StepIcon className="h-6 w-6" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-1">Step {index + 1}</p>
                              <span className="font-black text-slate-900 text-xl uppercase tracking-tight block truncate">{step.title}</span>
                              {step.description && (
                                <span className="text-sm font-medium text-slate-500 block truncate">{step.description}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex flex-col gap-1 mr-1">
                              <button
                                type="button"
                                onClick={() => handleMoveStep(index, -1)}
                                disabled={index === 0 || isReorderingStep || isSavingStep}
                                title="Move up"
                                className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveStep(index, 1)}
                                disabled={isLast || isReorderingStep || isSavingStep}
                                title="Move down"
                                className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </button>
                            </div>
                            <Button variant="outline" onClick={() => { setEditingStep(step); setStepFormTitle(step.title); setStepFormDesc(step.description || ""); setStepFormIcon(step.icon || "landmark"); setIsStepFormOpen(true); }} className="h-12 px-5 rounded-xl border-slate-200 text-blue-600 hover:bg-blue-50 font-bold text-base"><Edit className="h-5 w-5 sm:mr-2" /><span className="hidden sm:inline">Edit</span></Button>
                            <Button variant="outline" onClick={() => { setStepToDelete(step); setIsDeleteStepOpen(true); }} className="h-12 px-5 rounded-xl border-slate-200 text-red-600 hover:bg-red-50 font-bold text-base"><Trash2 className="h-5 w-5 sm:mr-2" /><span className="hidden sm:inline">Delete</span></Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-sm font-bold text-slate-500">Total Steps: <span className="text-slate-800 text-lg ml-1">{howToSteps.length}</span></div>
                </div>
              </CardContent>
            </Card>

            {/* ADD/EDIT STEP MODAL */}
            <Dialog open={isStepFormOpen} onOpenChange={setIsStepFormOpen}>
              <DialogContent className="sm:max-w-[560px] rounded-3xl p-6 shadow-2xl border-0 max-h-[92vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-800">
                    {editingStep ? "Edit Step" : "Add New Step"}
                  </DialogTitle>
                  <DialogDescription className="font-medium text-slate-500">
                    {editingStep ? "Modify the title, description, and icon of this step." : "Define a new step for the How to Apply process on the landing page."}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stepNumber" className="text-xs font-bold uppercase tracking-wider text-slate-700">Step Number</Label>
                    <div id="stepNumber" className="h-12 px-4 rounded-xl bg-slate-100 border border-slate-200 flex items-center text-base font-black text-slate-500">
                      {editingStep ? howToSteps.findIndex(s => s.id === editingStep.id) + 1 : howToSteps.length + 1}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stepTitle" className="text-xs font-bold uppercase tracking-wider text-slate-700">Step Title <span className="text-red-500">*</span></Label>
                    <Input id="stepTitle" autoFocus placeholder="e.g. Proceed to the Municipality of Carmona" value={stepFormTitle} onChange={(e) => setStepFormTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSaveStep() }} className="h-12 rounded-xl bg-slate-50 focus:bg-white text-base font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stepDesc" className="text-xs font-bold uppercase tracking-wider text-slate-700">Description</Label>
                    <Textarea id="stepDesc" rows={3} placeholder="Describe what the applicant needs to do in this step..." value={stepFormDesc} onChange={(e) => setStepFormDesc(e.target.value)} className="rounded-xl bg-slate-50 focus:bg-white text-base font-medium resize-none" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Icon</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {HOW_TO_APPLY_ICON_OPTIONS.map((option) => (
                        <button
                          key={option.name}
                          type="button"
                          onClick={() => setStepFormIcon(option.name)}
                          title={option.label}
                          className={`h-12 rounded-xl border-2 flex items-center justify-center transition-all ${stepFormIcon === option.name ? "border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm" : "border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300 hover:text-slate-600"}`}
                        >
                          <option.icon className="h-5 w-5" />
                        </button>
                      ))}
                    </div>
                    <p className="text-xs font-medium text-slate-400">Choose the icon displayed next to this step on the landing page.</p>
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                  <Button variant="outline" onClick={() => setIsStepFormOpen(false)} disabled={isSavingStep} className="rounded-xl font-bold border-slate-200 h-11 px-6">Cancel</Button>
                  <Button onClick={handleSaveStep} disabled={isSavingStep} className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md h-11 px-8">
                    {isSavingStep ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {editingStep ? "Save Changes" : "Save Step"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* DELETE STEP CONFIRMATION */}
            <AlertDialog open={isDeleteStepOpen} onOpenChange={setIsDeleteStepOpen}>
              <AlertDialogContent className="rounded-3xl border-0 shadow-2xl p-6">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-red-500" /> Confirm Deletion
                  </AlertDialogTitle>
                  <AlertDialogDescription className="font-medium text-slate-600 text-base">
                    Are you sure you want to delete <span className="font-black text-slate-900 uppercase">"{stepToDelete?.title}"</span>? This will remove it from the landing page How to Apply process and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6">
                  <AlertDialogCancel disabled={isSavingStep} className="rounded-xl font-bold border-slate-200 text-slate-600 h-11 px-6">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmDeleteStep(); }} disabled={isSavingStep} className="bg-red-600 hover:bg-red-700 rounded-xl font-bold text-white shadow-md h-11 px-6">
                    {isSavingStep ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {isSavingStep ? "Deleting..." : "Yes, Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* REGISTRATION NOTICE SECTION */}
            <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden bg-white mt-6">
              <div className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-500 w-full" />
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm shrink-0">
                    <Info className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black uppercase tracking-tight text-slate-800">Registration Notice</CardTitle>
                    <CardDescription className="font-medium text-slate-500">Shown on the student registration page before account creation.</CardDescription>
                  </div>
                </div>
                <Button variant="outline" onClick={() => { setNoticeDialogMode("registration"); setNoticeFormTitle(registrationNotice.title); setNoticeFormMessage(registrationNotice.message); }} className="h-11 px-5 rounded-xl border-slate-200 text-blue-600 hover:bg-blue-50 font-bold shrink-0"><Edit className="h-5 w-5 sm:mr-2" /><span className="hidden sm:inline">Edit Notice</span></Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 md:p-5">
                  <div className="flex items-center gap-2 mb-1.5 text-emerald-700">
                    <Info className="h-4 w-4 shrink-0" />
                    <h5 className="text-sm font-black uppercase tracking-tight">{registrationNotice.title}</h5>
                  </div>
                  <p className="text-xs md:text-sm text-emerald-800 leading-relaxed">{registrationNotice.message}</p>
                </div>
              </CardContent>
            </Card>

            {/* ADD/EDIT NOTICE MODAL */}
            <Dialog open={noticeDialogMode !== null} onOpenChange={(open) => { if (!open) setNoticeDialogMode(null) }}>
              <DialogContent className="sm:max-w-[520px] rounded-3xl p-6 shadow-2xl border-0">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-800">
                    {noticeDialogMode === "registration" ? "Edit Registration Notice" : "Edit Important Notice"}
                  </DialogTitle>
                  <DialogDescription className="font-medium text-slate-500">
                    {noticeDialogMode === "registration"
                      ? "Update the notice displayed on the student registration page."
                      : "Update the notice displayed on the landing page How to Apply modal and the registration page."}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="noticeTitle" className="text-xs font-bold uppercase tracking-wider text-slate-700">Notice Title <span className="text-red-500">*</span></Label>
                    <Input id="noticeTitle" autoFocus placeholder="e.g. Important Notice" value={noticeFormTitle} onChange={(e) => setNoticeFormTitle(e.target.value)} className="h-12 rounded-xl bg-slate-50 focus:bg-white text-base font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="noticeMessage" className="text-xs font-bold uppercase tracking-wider text-slate-700">Notice Message <span className="text-red-500">*</span></Label>
                    <Textarea id="noticeMessage" rows={4} placeholder="Enter the notice message shown to students..." value={noticeFormMessage} onChange={(e) => setNoticeFormMessage(e.target.value)} className="rounded-xl bg-slate-50 focus:bg-white text-base font-medium resize-none" />
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                  <Button variant="outline" onClick={() => setNoticeDialogMode(null)} disabled={isSavingNotice} className="rounded-xl font-bold border-slate-200 h-11 px-6">Cancel</Button>
                  <Button onClick={handleSaveNotice} disabled={isSavingNotice} className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md h-11 px-8">
                    {isSavingNotice ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {isSavingNotice ? "Saving..." : "Save Notice"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

        </Tabs>
      </div>
    </AdminLayout>
  )
}
