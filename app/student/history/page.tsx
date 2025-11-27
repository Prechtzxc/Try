"use client"

import { StudentNav } from "@/components/student-nav"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"

type Borrowing = {
  id: string
  bookTitle: string
  borrowDate: string
  dueDate: string
  returnDate?: string
  status: "Borrowed" | "Returned" | "Overdue"
}

export default function BorrowerHistoryPage() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([])

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail") || ""
    const students = JSON.parse(localStorage.getItem("students") || "[]")
    const student = students.find((b: any) => b.email === userEmail)

    if (student) {
      const allBorrowings = JSON.parse(localStorage.getItem("borrowings") || "[]")
      const myBorrowings = allBorrowings.filter((b: any) => b.borrowerId === student.id)

      // Update status for overdue books
      const updatedBorrowings = myBorrowings.map((b: any) => {
        if (b.status === "Borrowed" && new Date(b.dueDate) < new Date()) {
          return { ...b, status: "Overdue" }
        }
        return b
      })

      setBorrowings(updatedBorrowings)
    }
  }, [])

  const activeBorrowings = borrowings.filter((b) => b.status === "Borrowed" || b.status === "Overdue")
  const returnedBorrowings = borrowings.filter((b) => b.status === "Returned")

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNav />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-black">My Borrowing History</h1>
            <p className="text-gray-600 mt-1">View your current and past borrowings</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Currently Borrowed</h2>
            {activeBorrowings.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">No active borrowings</CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {activeBorrowings.map((borrowing) => (
                  <Card key={borrowing.id}>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{borrowing.bookTitle}</h3>
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              borrowing.status === "Overdue" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {borrowing.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Borrow Date:</span> {borrowing.borrowDate}
                          </div>
                          <div>
                            <span className="font-medium">Due Date:</span> {borrowing.dueDate}
                          </div>
                          {borrowing.status === "Overdue" && (
                            <div className="text-red-600 col-span-2">
                              <span className="font-medium">Days Overdue:</span>{" "}
                              {Math.ceil(
                                (new Date().getTime() - new Date(borrowing.dueDate).getTime()) / (1000 * 60 * 60 * 24),
                              )}{" "}
                              (₱10 per day fine)
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Returned Books</h2>
            {returnedBorrowings.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">No returned books yet</CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {returnedBorrowings.map((borrowing) => (
                  <Card key={borrowing.id}>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{borrowing.bookTitle}</h3>
                          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">Returned</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Borrow Date:</span> {borrowing.borrowDate}
                          </div>
                          <div>
                            <span className="font-medium">Due Date:</span> {borrowing.dueDate}
                          </div>
                          <div>
                            <span className="font-medium">Return Date:</span> {borrowing.returnDate}
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
