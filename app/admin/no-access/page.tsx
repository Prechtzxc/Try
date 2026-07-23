"use client"

import { AdminLayout } from "@/components/admin-layout"
import { ShieldX, MailQuestion } from "lucide-react"
import Link from "next/link"

export default function NoAccessPage() {
  return (
    <AdminLayout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 border border-amber-200 shadow-sm mb-6">
          <ShieldX className="h-10 w-10 text-amber-500" />
        </div>

        <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase mb-3">
          Access Restricted
        </h1>

        <p className="text-slate-500 font-medium max-w-md mb-8 leading-relaxed">
          Your account has not been assigned any permissions yet.
          <br />
          Please contact your Head Administrator.
        </p>

        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-500">
          <MailQuestion className="h-4 w-4 text-slate-400" />
          Need help? Email{" "}
          <a
            href="mailto:admin@carmona.gov.ph"
            className="text-emerald-600 hover:text-emerald-700 font-bold underline underline-offset-2"
          >
            admin@carmona.gov.ph
          </a>
        </div>
      </div>
    </AdminLayout>
  )
}
