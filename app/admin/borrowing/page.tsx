"use client"

import { AdminNav } from "@/components/admin-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"

type Borrowing = {
  id: string
  bookId: string
  bookTitle: string
  borrowerId: string
  borrowerName: string
  borrowDate: string
  dueDate: string
  returnDate?: string
  status: "Borrowed" | "Returned" | "Overdue"
}

type Book = {
  id: string
  title: string
  status: "Available" | "Borrowed"
}

export default function BorrowingPage() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([])
  const [books, setBooks] = useState<Book[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const storedBorrowings = JSON.parse(localStorage.getItem("borrowings") || "[]")
    const storedBooks = JSON.parse(localStorage.getItem("books") || "[]")

    // Update borrowing status based on due dates
    const updatedBorrowings = storedBorrowings.map((b: Borrowing) => {
      if (b.status === "Borrowed" && new Date(b.dueDate) < new Date()) {
        return { ...b, status: "Overdue" as const }
      }
      return b
    })

    setBorrowings(updatedBorrowings)
    setBooks(storedBooks)
  }

  const handleReturnBook = (borrowingId: string) => {
    const borrowing = borrowings.find((b) => b.id === borrowingId)
    if (!borrowing) return

    const returnDate = new Date()
    const dueDate = new Date(borrowing.dueDate)

    // Calculate fine if overdue
    if (returnDate > dueDate) {
      const daysOverdue = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      const fineAmount = daysOverdue * 10 // ₱10 per day

      const fines = JSON.parse(localStorage.getItem("fines") || "[]")
      const newFine = {
        id: Date.now().toString(),
        borrowerId: borrowing.borrowerId,
        borrowerName: borrowing.borrowerName,
        bookTitle: borrowing.bookTitle,
        amount: fineAmount,
        reason: `Overdue by ${daysOverdue} days`,
        status: "Unpaid",
        issueDate: returnDate.toISOString().split("T")[0],
      }
      localStorage.setItem("fines", JSON.stringify([...fines, newFine]))
    }

    // Update borrowing
    const updatedBorrowings = borrowings.map((b) =>
      b.id === borrowingId
        ? { ...b, status: "Returned" as const, returnDate: returnDate.toISOString().split("T")[0] }
        : b,
    )
    localStorage.setItem("borrowings", JSON.stringify(updatedBorrowings))

    // Update book status
    const updatedBooks = books.map((b) => (b.id === borrowing.bookId ? { ...b, status: "Available" as const } : b))
    localStorage.setItem("books", JSON.stringify(updatedBooks))

    loadData()
  }

  const activeBorrowings = borrowings.filter((b) => b.status === "Borrowed" || b.status === "Overdue")
  const returnedBorrowings = borrowings.filter((b) => b.status === "Returned")

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-black">Borrowing Management</h1>
            <p className="text-gray-600 mt-1">Track and manage book borrowings</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Active Borrowings</h2>
            {activeBorrowings.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">No active borrowings</CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {activeBorrowings.map((borrowing) => (
                  <Card key={borrowing.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
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
                              <span className="font-medium">Borrower:</span> {borrowing.borrowerName}
                            </div>
                            <div>
                              <span className="font-medium">Borrow Date:</span> {borrowing.borrowDate}
                            </div>
                            <div>
                              <span className="font-medium">Due Date:</span> {borrowing.dueDate}
                            </div>
                            {borrowing.status === "Overdue" && (
                              <div className="text-red-600">
                                <span className="font-medium">Days Overdue:</span>{" "}
                                {Math.ceil(
                                  (new Date().getTime() - new Date(borrowing.dueDate).getTime()) /
                                    (1000 * 60 * 60 * 24),
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleReturnBook(borrowing.id)}>
                          Return Book
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Borrowing History</h2>
            {returnedBorrowings.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">No borrowing history</CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {returnedBorrowings.slice(0, 10).map((borrowing) => (
                  <Card key={borrowing.id}>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{borrowing.bookTitle}</h3>
                          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">Returned</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Borrower:</span> {borrowing.borrowerName}
                          </div>
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
