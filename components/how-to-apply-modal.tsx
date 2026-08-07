"use client"

import { useRouter } from "next/navigation"
import { ArrowRight, Landmark, FileBadge, UserCheck, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"

interface HowToApplyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const steps = [
  {
    number: 1,
    title: "Proceed to the Municipality of Carmona",
    description: "Visit the Municipality of Carmona to begin your scholarship application process.",
    icon: Landmark,
  },
  {
    number: 2,
    title: "Proceed to the COMELEC Office",
    description: "Secure your Voter's Certificate.",
    icon: FileBadge,
  },
  {
    number: 3,
    title: "Proceed to the CAYDO Office",
    description: "Submit your requirements and complete the registration approval process.",
    icon: UserCheck,
  },
]

export function HowToApplyModal({ open, onOpenChange }: HowToApplyModalProps) {
  const router = useRouter()

  const handleRegisterNow = () => {
    onOpenChange(false)
    router.push("/register")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-3xl w-[95vw] max-h-[90vh] p-0 flex flex-col overflow-hidden rounded-3xl sm:rounded-3xl border-0 shadow-2xl gap-0 z-[100] [&>button]:text-white [&>button]:bg-white/20 [&>button]:hover:bg-white/30 [&>button]:rounded-full [&>button]:h-9 [&>button]:w-9 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:transition-colors [&>button]:opacity-100"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 md:px-8 py-6 md:py-8 text-white relative shrink-0 rounded-t-[24px]">
          <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-tight text-white">
            How to Apply
          </DialogTitle>
          <DialogDescription className="text-green-100 mt-1.5 text-sm md:text-base font-medium">
            Follow these steps before creating your scholarship account.
          </DialogDescription>
        </div>

        {/* Body */}
        <div className="bg-slate-50/50 px-6 md:px-8 py-6 md:py-8 min-h-0 flex-1 overflow-y-auto">
          {/* Vertical stepper / timeline */}
          <div className="space-y-0">
            {steps.map((step, index) => {
              const IconComponent = step.icon
              const isLast = index === steps.length - 1
              return (
                <div key={step.number} className="flex gap-4 md:gap-5">
                  {/* Timeline column */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="relative z-10 flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white border-4 border-white ring-2 ring-green-200 shadow-md">
                      <span className="text-sm md:text-base font-black">{step.number}</span>
                    </div>
                    {!isLast && (
                      <div className="mt-2 w-1 flex-1 min-h-[30px] rounded-full bg-gradient-to-b from-emerald-400 to-green-200" />
                    )}
                  </div>

                  {/* Step card */}
                  <div className={`flex-1 min-w-0 ${isLast ? "" : "pb-6 md:pb-8"}`}>
                    <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-5 md:p-6 transition-all duration-300 hover:shadow-md hover:shadow-green-100">
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-10 w-10 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/30">
                          <IconComponent className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">
                            Step {step.number} of {steps.length}
                          </p>
                          <h3 className="text-sm md:text-base font-black text-green-900 leading-snug">
                            {step.title}
                          </h3>
                          <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Important Notice */}
          <div className="mt-6 p-4 md:p-5 rounded-2xl border-2 border-amber-200 bg-amber-50 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-amber-700">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <h4 className="text-sm font-black uppercase tracking-tight">Important Notice</h4>
            </div>
            <p className="text-xs md:text-sm text-amber-800 leading-relaxed">
              Only students included in the Registration Approval List may proceed with account registration. For more information, kindly proceed to the CAYDO Office.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 md:px-8 py-5 bg-white border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-[24px]">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto h-12 px-6 rounded-xl border-slate-300 text-slate-600 hover:bg-slate-50 font-bold"
            >
              Close
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleRegisterNow}
            className="w-full sm:w-auto h-12 px-8 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-md hover:shadow-lg transition-all"
          >
            Register Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}