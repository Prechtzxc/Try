"use client"

import { StudentNav } from "@/components/student-nav"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

type Book = {
  id: string
  title: string
  author: string
  category: string
  publisher: string
  yearPublished: string
  status: "Available" | "Borrowed"
}

export default function BorrowerBooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const storedBooks = JSON.parse(localStorage.getItem("books") || "[]")
    setBooks(storedBooks)
  }, [])

  const handleBorrowBook = (book: Book) => {
    const userEmail = localStorage.getItem("userEmail") || ""
    const students = JSON.parse(localStorage.getItem("students") || "[]")
    const student = students.find((s: any) => s.email === userEmail)

    if (!student) {
      alert("Please log in to borrow books")
      return
    }

    // Create borrowing record
    const borrowings = JSON.parse(localStorage.getItem("borrowings") || "[]")
    const today = new Date()
    const dueDate = new Date(today)
    dueDate.setDate(dueDate.getDate() + 30) // 30 days borrowing period

    const newBorrowing = {
      id: `borrow-${Date.now()}`,
      bookId: book.id,
      bookTitle: book.title,
      borrowerId: student.id,
      borrowerName: student.name,
      borrowDate: today.toISOString().split("T")[0],
      dueDate: dueDate.toISOString().split("T")[0],
      status: "Borrowed",
    }

    borrowings.push(newBorrowing)
    localStorage.setItem("borrowings", JSON.stringify(borrowings))

    // Update book status to Borrowed
    const updatedBooks = books.map((b) => (b.id === book.id ? { ...b, status: "Borrowed" as const } : b))
    setBooks(updatedBooks)
    localStorage.setItem("books", JSON.stringify(updatedBooks))

    alert(`Successfully borrowed "${book.title}"! Due date: ${dueDate.toLocaleDateString()}`)
  }

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const availableBooks = filteredBooks.filter((b) => b.status === "Available")
  const borrowedBooks = filteredBooks.filter((b) => b.status === "Borrowed")

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNav />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-black">Browse Books</h1>
            <p className="text-gray-600 mt-1">Search and view available books in the library</p>
          </div>

          <div className="flex gap-4">
            <Input
              placeholder="Search by title, author, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Available Books ({availableBooks.length})</h2>
            {availableBooks.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">No available books found</CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {availableBooks.map((book) => (
                  <Card key={book.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold">{book.title}</h3>
                            <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">Available</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Author:</span> {book.author}
                            </div>
                            <div>
                              <span className="font-medium">Category:</span> {book.category}
                            </div>
                            <div>
                              <span className="font-medium">Publisher:</span> {book.publisher}
                            </div>
                            <div>
                              <span className="font-medium">Year:</span> {book.yearPublished}
                            </div>
                          </div>
                        </div>
                        <Button onClick={() => handleBorrowBook(book)} className="shrink-0">
                          Borrow Book
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Currently Borrowed ({borrowedBooks.length})</h2>
            {borrowedBooks.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">No borrowed books</CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {borrowedBooks.map((book) => (
                  <Card key={book.id}>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-semibold">{book.title}</h3>
                          <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">Borrowed</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Author:</span> {book.author}
                          </div>
                          <div>
                            <span className="font-medium">Category:</span> {book.category}
                          </div>
                          <div>
                            <span className="font-medium">Publisher:</span> {book.publisher}
                          </div>
                          <div>
                            <span className="font-medium">Year:</span> {book.yearPublished}
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
