"use client"

import { StudentNav } from "@/components/student-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

export default function BorrowerDashboard() {
  const [userName, setUserName] = useState("")
  const [stats, setStats] = useState({
    activeBorrowings: 0,
    totalBorrowed: 0,
    overdueBooks: 0,
    totalFines: 0,
  })

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Student"
    setUserName(name)

    const userEmail = localStorage.getItem("userEmail") || ""
    const students = JSON.parse(localStorage.getItem("students") || "[]")
    const student = students.find((s: any) => s.email === userEmail)

    if (student) {
      const borrowings = JSON.parse(localStorage.getItem("borrowings") || "[]")
      const fines = JSON.parse(localStorage.getItem("fines") || "[]")

      const myBorrowings = borrowings.filter((b: any) => b.borrowerId === student.id)
      const activeBorrowings = myBorrowings.filter((b: any) => b.status === "Borrowed" || b.status === "Overdue").length
      const overdueBooks = myBorrowings.filter((b: any) => {
        if (b.status !== "Borrowed") return false
        const dueDate = new Date(b.dueDate)
        return dueDate < new Date()
      }).length

      const myFines = fines.filter((f: any) => f.borrowerId === student.id && f.status === "Unpaid")
      const totalFines = myFines.reduce((sum: number, f: any) => sum + (f.amount || 0), 0)

      setStats({
        activeBorrowings,
        totalBorrowed: myBorrowings.length,
        overdueBooks,
        totalFines,
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNav />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-black">Hi {userName}</h1>
            <p className="text-gray-600 mt-1">Overview of your library activity</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Borrowings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.activeBorrowings}</div>
                <p className="text-xs text-gray-500 mt-1">Currently borrowed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Borrowed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalBorrowed}</div>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Overdue Books</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.overdueBooks}</div>
                <p className="text-xs text-gray-500 mt-1">Need to return</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Outstanding Fines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">₱{stats.totalFines.toFixed(2)}</div>
                <p className="text-xs text-gray-500 mt-1">Unpaid penalties</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
