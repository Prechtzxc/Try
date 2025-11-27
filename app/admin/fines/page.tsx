"use client"

import { AdminNav } from "@/components/admin-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"

type Fine = {
  id: string
  borrowerId: string
  borrowerName: string
  bookTitle: string
  amount: number
  reason: string
  status: "Unpaid" | "Paid"
  issueDate: string
  paidDate?: string
}

export default function FinesPage() {
  const [fines, setFines] = useState<Fine[]>([])

  useEffect(() => {
    const storedFines = JSON.parse(localStorage.getItem("fines") || "[]")
    setFines(storedFines)
  }, [])

  const saveFines = (updatedFines: Fine[]) => {
    localStorage.setItem("fines", JSON.stringify(updatedFines))
    setFines(updatedFines)
  }

  const handleMarkAsPaid = (id: string) => {
    const updatedFines = fines.map((f) =>
      f.id === id ? { ...f, status: "Paid" as const, paidDate: new Date().toISOString().split("T")[0] } : f,
    )
    saveFines(updatedFines)
  }

  const unpaidFines = fines.filter((f) => f.status === "Unpaid")
  const paidFines = fines.filter((f) => f.status === "Paid")
  const totalUnpaid = unpaidFines.reduce((sum, f) => sum + f.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-black">Fines Management</h1>
            <p className="text-gray-600 mt-1">Track and manage library fines</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600">Total Unpaid Fines</div>
                <div className="text-3xl font-bold text-red-600 mt-2">₱{totalUnpaid.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600">Unpaid Count</div>
                <div className="text-3xl font-bold mt-2">{unpaidFines.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600">Paid Count</div>
                <div className="text-3xl font-bold text-green-600 mt-2">{paidFines.length}</div>
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
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">{fine.borrowerName}</h3>
                            <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">Unpaid</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Book:</span> {fine.bookTitle}
                            </div>
                            <div>
                              <span className="font-medium">Amount:</span> ₱{fine.amount.toFixed(2)}
                            </div>
                            <div>
                              <span className="font-medium">Reason:</span> {fine.reason}
                            </div>
                            <div>
                              <span className="font-medium">Issue Date:</span> {fine.issueDate}
                            </div>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleMarkAsPaid(fine.id)}>
                          Mark as Paid
                        </Button>
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
                          <h3 className="text-lg font-semibold">{fine.borrowerName}</h3>
                          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">Paid</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Book:</span> {fine.bookTitle}
                          </div>
                          <div>
                            <span className="font-medium">Amount:</span> ₱{fine.amount.toFixed(2)}
                          </div>
                          <div>
                            <span className="font-medium">Reason:</span> {fine.reason}
                          </div>
                          <div>
                            <span className="font-medium">Paid Date:</span> {fine.paidDate}
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
