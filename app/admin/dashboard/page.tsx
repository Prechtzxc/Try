"use client"

import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

export default function AdminDashboard() {
  const [userName, setUserName] = useState("")
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    totalStudents: 0,
    activeBorrowings: 0,
    overdueBooks: 0,
    totalFines: 0,
  })

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Admin"
    setUserName(name)

    const books = JSON.parse(localStorage.getItem("books") || "[]")
    const students = JSON.parse(localStorage.getItem("students") || "[]")
    const borrowings = JSON.parse(localStorage.getItem("borrowings") || "[]")
    const fines = JSON.parse(localStorage.getItem("fines") || "[]")

    const availableBooks = books.filter((b: any) => b.status === "Available").length
    const activeBorrowings = borrowings.filter((b: any) => b.status === "Borrowed").length
    const overdueBooks = borrowings.filter((b: any) => {
      if (b.status !== "Borrowed") return false
      const dueDate = new Date(b.dueDate)
      return dueDate < new Date()
    }).length
    const totalFines = fines.reduce((sum: number, f: any) => sum + (f.amount || 0), 0)

    setStats({
      totalBooks: books.length,
      availableBooks,
      totalStudents: students.length,
      activeBorrowings,
      overdueBooks,
      totalFines,
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-black">Hi {userName}</h1>
            <p className="text-gray-600 mt-1">Overview of library statistics</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Books</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalBooks}</div>
                <p className="text-xs text-gray-500 mt-1">{stats.availableBooks} available</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalStudents}</div>
                <p className="text-xs text-gray-500 mt-1">Registered users</p>
              </CardContent>
            </Card>

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
                <CardTitle className="text-sm font-medium text-gray-600">Overdue Books</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.overdueBooks}</div>
                <p className="text-xs text-gray-500 mt-1">Need attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Fines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₱{stats.totalFines.toFixed(2)}</div>
                <p className="text-xs text-gray-500 mt-1">Unpaid penalties</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Available Books</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.availableBooks}</div>
                <p className="text-xs text-gray-500 mt-1">Ready to borrow</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
