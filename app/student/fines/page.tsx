"use client"

import { StudentNav } from "@/components/student-nav"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"

type Fine = {
  id: string
  bookTitle: string
  amount: number
  reason: string
  status: "Unpaid" | "Paid"
  issueDate: string
  paidDate?: string
}

export default function BorrowerFinesPage() {
  const [fines, setFines] = useState<Fine[]>([])

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail") || ""
    const students = JSON.parse(localStorage.getItem("students") || "[]")
    const student = students.find((b: any) => b.email === userEmail)

    if (student) {
      const allFines = JSON.parse(localStorage.getItem("fines") || "[]")
      const myFines = allFines.filter((f: any) => f.borrowerId === student.id)
      setFines(myFines)
    }
  }, [])

  const unpaidFines = fines.filter((f) => f.status === "Unpaid")
  const paidFines = fines.filter((f) => f.status === "Paid")
  const totalUnpaid = unpaidFines.reduce((sum, f) => sum + f.amount, 0)
  const totalPaid = paidFines.reduce((sum, f) => sum + f.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNav />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-black">My Fines</h1>
            <p className="text-gray-600 mt-1">View your outstanding and paid fines</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600">Total Unpaid Fines</div>
                <div className="text-3xl font-bold text-red-600 mt-2">₱{totalUnpaid.toFixed(2)}</div>
                <p className="text-xs text-gray-500 mt-1">{unpaidFines.length} unpaid fines</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600">Total Paid Fines</div>
                <div className="text-3xl font-bold text-green-600 mt-2">₱{totalPaid.toFixed(2)}</div>
                <p className="text-xs text-gray-500 mt-1">{paidFines.length} paid fines</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Unpaid Fines</h2>
            {unpaidFines.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">No unpaid fines</CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {unpaidFines.map((fine) => (
                  <Card key={fine.id}>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{fine.bookTitle}</h3>
                          <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">Unpaid</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Amount:</span> ₱{fine.amount.toFixed(2)}
                          </div>
                          <div>
                            <span className="font-medium">Issue Date:</span> {fine.issueDate}
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Reason:</span> {fine.reason}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Paid Fines</h2>
            {paidFines.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">No paid fines</CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {paidFines.map((fine) => (
                  <Card key={fine.id}>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{fine.bookTitle}</h3>
                          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">Paid</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Amount:</span> ₱{fine.amount.toFixed(2)}
                          </div>
                          <div>
                            <span className="font-medium">Paid Date:</span> {fine.paidDate}
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Reason:</span> {fine.reason}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
