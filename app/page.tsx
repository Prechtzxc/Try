"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export default function Home() {
  useEffect(() => {
    const isInitialized = localStorage.getItem("dataInitialized")
    if (!isInitialized) {
      // Filipino Books
      const filipinoBooks = [
        {
          id: "1",
          title: "Noli Me Tangere",
          author: "Jose Rizal",
          category: "Historical Fiction",
          publisher: "Berliner Buchdruckerei-Aktiengesellschaft",
          yearPublished: "1887",
          status: "Borrowed", // Only 1 copy, currently borrowed
        },
        {
          id: "2",
          title: "El Filibusterismo",
          author: "Jose Rizal",
          category: "Historical Fiction",
          publisher: "F. Meyer-Van Loo Press",
          yearPublished: "1891",
          status: "Available", // Only 1 copy, currently available
        },
        {
          id: "3",
          title: "Dekada '70",
          author: "Lualhati Bautista",
          category: "Contemporary Fiction",
          publisher: "The Bookmark, Inc.",
          yearPublished: "1983",
          status: "Available", // Only 1 copy, currently available
        },
        {
          id: "4",
          title: "Ibong Adarna",
          author: "Anonymous",
          category: "Epic Poetry",
          publisher: "Various Publishers",
          yearPublished: "1860",
          status: "Available", // Only 1 copy, currently available
        },
        {
          id: "5",
          title: "Florante at Laura",
          author: "Francisco Balagtas",
          category: "Epic Poetry",
          publisher: "Various Publishers",
          yearPublished: "1838",
          status: "Borrowed", // Only 1 copy, currently borrowed
        },
        {
          id: "6",
          title: "Mga Ibong Mandaragit",
          author: "Amado V. Hernandez",
          category: "Poetry",
          publisher: "Lahi Publishing House",
          yearPublished: "1969",
          status: "Available", // Only 1 copy, currently available
        },
        {
          id: "7",
          title: "Banaag at Sikat",
          author: "Lope K. Santos",
          category: "Social Realism",
          publisher: "Limbagan ni P. Gutierrez",
          yearPublished: "1906",
          status: "Available", // Only 1 copy, currently available
        },
        {
          id: "8",
          title: "Sa Mga Kuko ng Liwanag",
          author: "Edgardo M. Reyes",
          category: "Contemporary Fiction",
          publisher: "De La Salle University Press",
          yearPublished: "1966",
          status: "Available", // Only 1 copy, currently available
        },
        {
          id: "9",
          title: "Ang Tundo Man May Langit Din",
          author: "Andres Cristobal Cruz",
          category: "Contemporary Fiction",
          publisher: "National Book Store",
          yearPublished: "1956",
          status: "Available", // Only 1 copy, currently available
        },
        {
          id: "10",
          title: "Luha ng Buwaya",
          author: "Amado V. Hernandez",
          category: "Poetry",
          publisher: "Philippine Writers League",
          yearPublished: "1973",
          status: "Available", // Only 1 copy, currently available
        },
      ]

      // Student Accounts - Darell Eucare is admin, these are the 5 students
      const studentAccounts = [
        {
          id: "student-001",
          name: "Charmee Botero",
          email: "charmee.botero@student.library.com",
          password: "student123",
          phone: "+63 912 345 6001",
          address: "123 Manila St, Quezon City",
        },
        {
          id: "student-002",
          name: "Kristella Candelosa",
          email: "kristella.candelosa@student.library.com",
          password: "student123",
          phone: "+63 912 345 6002",
          address: "456 Rizal Ave, Makati City",
        },
        {
          id: "student-003",
          name: "Ronielyn Olimpo",
          email: "ronielyn.olimpo@student.library.com",
          password: "student123",
          phone: "+63 912 345 6003",
          address: "789 Bonifacio St, Pasig City",
        },
        {
          id: "student-004",
          name: "Shakira Nicole Pelayo",
          email: "shakira.pelayo@student.library.com",
          password: "student123",
          phone: "+63 912 345 6004",
          address: "321 Luna St, Mandaluyong City",
        },
        {
          id: "student-005",
          name: "John Andrew Empania",
          email: "john.empania@student.library.com",
          password: "student123",
          phone: "+63 912 345 6005",
          address: "654 Mabini St, Manila",
        },
      ]

      // Sample Borrowing Records (only some students have records)
      const borrowingRecords = [
        {
          id: "borrow-001",
          bookId: "1",
          bookTitle: "Noli Me Tangere",
          borrowerId: "student-001",
          borrowerName: "Charmee Botero",
          borrowDate: "2025-01-15",
          dueDate: "2025-02-14",
          status: "Borrowed",
        },
        {
          id: "borrow-002",
          bookId: "3",
          bookTitle: "Dekada '70",
          borrowerId: "student-002",
          borrowerName: "Kristella Candelosa",
          borrowDate: "2025-01-10",
          dueDate: "2025-02-09",
          returnDate: "2025-02-08",
          status: "Returned",
        },
        {
          id: "borrow-003",
          bookId: "5",
          bookTitle: "Florante at Laura",
          borrowerId: "student-003",
          borrowerName: "Ronielyn Olimpo",
          borrowDate: "2025-01-20",
          dueDate: "2025-02-19",
          status: "Borrowed",
        },
        {
          id: "borrow-004",
          bookId: "7",
          bookTitle: "Banaag at Sikat",
          borrowerId: "student-004",
          borrowerName: "Shakira Nicole Pelayo",
          borrowDate: "2024-12-15",
          dueDate: "2025-01-14",
          returnDate: "2025-01-20",
          status: "Returned",
        },
        {
          id: "borrow-005",
          bookId: "4",
          bookTitle: "Ibong Adarna",
          borrowerId: "student-004",
          borrowerName: "Shakira Nicole Pelayo",
          borrowDate: "2024-12-01",
          dueDate: "2024-12-31",
          returnDate: "2024-12-30",
          status: "Returned",
        },
      ]

      // Fine for late return (Shakira)
      const fines = [
        {
          id: "fine-001",
          borrowerId: "student-004",
          borrowerName: "Shakira Nicole Pelayo",
          bookTitle: "Banaag at Sikat",
          amount: 60,
          reason: "Overdue by 6 days",
          status: "Unpaid",
          issueDate: "2025-01-20",
        },
      ]

      localStorage.setItem("books", JSON.stringify(filipinoBooks))
      localStorage.setItem("students", JSON.stringify(studentAccounts))
      localStorage.setItem("borrowings", JSON.stringify(borrowingRecords))
      localStorage.setItem("fines", JSON.stringify(fines))
      localStorage.setItem("dataInitialized", "true")
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-8 px-4">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-black tracking-tight">Library Management System</h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">Manage books, students, and transactions efficiently</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" variant="default" className="w-full sm:w-auto min-w-[200px]">
              Login
            </Button>
          </Link>
          <Link href="/register/student">
            <Button size="lg" variant="outline" className="w-full sm:w-auto min-w-[200px] bg-transparent">
              Register
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
