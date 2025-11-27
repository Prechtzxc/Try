"use client"

import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

type Report = {
  totalBooks: number
  availableBooks: number
  borrowedBooks: number
  totalBorrowers: number
  activeBorrowings: number
  totalBorrowings: number
  overdueBorrowings: number
  totalFines: number
  paidFines: number
  unpaidFines: number
  popularBooks: Array<{ title: string; count: number }>
  activeBorrowers: Array<{ name: string; count: number }>
  categoryDistribution: Array<{ category: string; count: number }>
}

export default function ReportsPage() {
  const [report, setReport] = useState<Report>({
    totalBooks: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    totalBorrowers: 0,
    activeBorrowings: 0,
    totalBorrowings: 0,
    overdueBorrowings: 0,
    totalFines: 0,
    paidFines: 0,
    unpaidFines: 0,
    popularBooks: [],
    activeBorrowers: [],
    categoryDistribution: [],
  })

  useEffect(() => {
    generateReport()
  }, [])

  const generateReport = () => {
    const books = JSON.parse(localStorage.getItem("books") || "[]")
    const borrowers = JSON.parse(localStorage.getItem("borrowers") || "[]")
    const borrowings = JSON.parse(localStorage.getItem("borrowings") || "[]")
    const fines = JSON.parse(localStorage.getItem("fines") || "[]")

    // Basic stats
    const availableBooks = books.filter((b: any) => b.status === "Available").length
    const borrowedBooks = books.filter((b: any) => b.status === "Borrowed").length
    const activeBorrowings = borrowings.filter((b: any) => b.status === "Borrowed" || b.status === "Overdue").length
    const overdueBorrowings = borrowings.filter((b: any) => {
      if (b.status !== "Borrowed") return false
      return new Date(b.dueDate) < new Date()
    }).length

    // Fines stats
    const unpaidFinesList = fines.filter((f: any) => f.status === "Unpaid")
    const paidFinesList = fines.filter((f: any) => f.status === "Paid")
    const totalFinesAmount = fines.reduce((sum: number, f: any) => sum + (f.amount || 0), 0)
    const paidFinesAmount = paidFinesList.reduce((sum: number, f: any) => sum + (f.amount || 0), 0)
    const unpaidFinesAmount = unpaidFinesList.reduce((sum: number, f: any) => sum + (f.amount || 0), 0)

    // Popular books (most borrowed)
    const bookBorrowCount: { [key: string]: { title: string; count: number } } = {}
    borrowings.forEach((b: any) => {
      if (!bookBorrowCount[b.bookId]) {
        bookBorrowCount[b.bookId] = { title: b.bookTitle, count: 0 }
      }
      bookBorrowCount[b.bookId].count++
    })
    const popularBooks = Object.values(bookBorrowCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Active borrowers (most borrowings)
    const borrowerCount: { [key: string]: { name: string; count: number } } = {}
    borrowings.forEach((b: any) => {
      if (!borrowerCount[b.borrowerId]) {
        borrowerCount[b.borrowerId] = { name: b.borrowerName, count: 0 }
      }
      borrowerCount[b.borrowerId].count++
    })
    const activeBorrowers = Object.values(borrowerCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Category distribution
    const categoryCount: { [key: string]: number } = {}
    books.forEach((b: any) => {
      const category = b.category || "Uncategorized"
      categoryCount[category] = (categoryCount[category] || 0) + 1
    })
    const categoryDistribution = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count: count as number }))
      .sort((a, b) => b.count - a.count)

    setReport({
      totalBooks: books.length,
      availableBooks,
      borrowedBooks,
      totalBorrowers: borrowers.length,
      activeBorrowings,
      totalBorrowings: borrowings.length,
      overdueBorrowings,
      totalFines: totalFinesAmount,
      paidFines: paidFinesAmount,
      unpaidFines: unpaidFinesAmount,
      popularBooks,
      activeBorrowers,
      categoryDistribution,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-black">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive library statistics and insights</p>
          </div>

          {/* Library Overview */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Library Overview</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Books</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{report.totalBooks}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {report.availableBooks} available, {report.borrowedBooks} borrowed
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Borrowers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{report.totalBorrowers}</div>
                  <div className="text-xs text-gray-500 mt-1">Registered members</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Borrowings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{report.totalBorrowings}</div>
                  <div className="text-xs text-gray-500 mt-1">{report.activeBorrowings} currently active</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Overdue Books</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{report.overdueBorrowings}</div>
                  <div className="text-xs text-gray-500 mt-1">Need immediate attention</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Financial Overview</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Fines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">₱{report.totalFines.toFixed(2)}</div>
                  <div className="text-xs text-gray-500 mt-1">All fines issued</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Paid Fines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">₱{report.paidFines.toFixed(2)}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {report.paidFines > 0 ? ((report.paidFines / report.totalFines) * 100).toFixed(1) : "0"}% collection
                    rate
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Unpaid Fines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">₱{report.unpaidFines.toFixed(2)}</div>
                  <div className="text-xs text-gray-500 mt-1">Outstanding amount</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Popular Books */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Most Popular Books</h2>
            {report.popularBooks.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">No borrowing data available</CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {report.popularBooks.map((book, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border-b last:border-b-0 pb-3 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                          <div>
                            <div className="font-semibold">{book.title}</div>
                            <div className="text-sm text-gray-500">Borrowed {book.count} times</div>
                          </div>
                        </div>
                        <div className="text-xl font-bold">{book.count}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Most Active Borrowers */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Most Active Borrowers</h2>
            {report.activeBorrowers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">No borrowing data available</CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {report.activeBorrowers.map((borrower, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border-b last:border-b-0 pb-3 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                          <div>
                            <div className="font-semibold">{borrower.name}</div>
                            <div className="text-sm text-gray-500">{borrower.count} total borrowings</div>
                          </div>
                        </div>
                        <div className="text-xl font-bold">{borrower.count}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Category Distribution */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Books by Category</h2>
            {report.categoryDistribution.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">No books available</CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {report.categoryDistribution.map((cat, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="font-medium">{cat.category}</div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-black rounded-full"
                              style={{ width: `${(cat.count / report.totalBooks) * 100}%` }}
                            />
                          </div>
                          <div className="text-sm font-semibold w-12 text-right">{cat.count}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
