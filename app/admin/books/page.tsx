"use client"

import { AdminNav } from "@/components/admin-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"

type Book = {
  id: string
  title: string
  author: string
  category: string
  publisher: string
  yearPublished: string
  status: "Available" | "Borrowed"
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentBook, setCurrentBook] = useState<Book | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    publisher: "",
    yearPublished: "",
    status: "Available" as "Available" | "Borrowed",
  })

  useEffect(() => {
    const storedBooks = JSON.parse(localStorage.getItem("books") || "[]")
    setBooks(storedBooks)
  }, [])

  const saveBooks = (updatedBooks: Book[]) => {
    localStorage.setItem("books", JSON.stringify(updatedBooks))
    setBooks(updatedBooks)
  }

  const handleAddBook = () => {
    const newBook: Book = {
      id: Date.now().toString(),
      ...formData,
    }
    saveBooks([...books, newBook])
    setIsAddDialogOpen(false)
    setFormData({
      title: "",
      author: "",
      category: "",
      publisher: "",
      yearPublished: "",
      status: "Available",
    })
  }

  const handleEditBook = () => {
    if (!currentBook) return
    const updatedBooks = books.map((b) => (b.id === currentBook.id ? { ...currentBook, ...formData } : b))
    saveBooks(updatedBooks)
    setIsEditDialogOpen(false)
    setCurrentBook(null)
  }

  const handleDeleteBook = (id: string) => {
    if (confirm("Are you sure you want to delete this book?")) {
      saveBooks(books.filter((b) => b.id !== id))
    }
  }

  const openEditDialog = (book: Book) => {
    setCurrentBook(book)
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      publisher: book.publisher,
      yearPublished: book.yearPublished,
      status: book.status,
    })
    setIsEditDialogOpen(true)
  }

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">Books Management</h1>
              <p className="text-gray-600 mt-1">Add, edit, and manage library books</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add New Book</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Book</DialogTitle>
                  <DialogDescription>Enter the book details below</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Book title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Author name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Fiction, Science, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publisher">Publisher</Label>
                    <Input
                      id="publisher"
                      value={formData.publisher}
                      onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                      placeholder="Publisher name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year Published</Label>
                    <Input
                      id="year"
                      value={formData.yearPublished}
                      onChange={(e) => setFormData({ ...formData, yearPublished: e.target.value })}
                      placeholder="2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "Available" | "Borrowed") => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Borrowed">Borrowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddBook}>Add Book</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-4">
            <Input
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="grid gap-4">
            {filteredBooks.map((book) => (
              <Card key={book.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold">{book.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded ${book.status === "Available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {book.status}
                        </span>
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
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(book)}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteBook(book.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredBooks.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  No books found. Add your first book to get started.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
            <DialogDescription>Update the book details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-author">Author</Label>
              <Input
                id="edit-author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-publisher">Publisher</Label>
              <Input
                id="edit-publisher"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-year">Year Published</Label>
              <Input
                id="edit-year"
                value={formData.yearPublished}
                onChange={(e) => setFormData({ ...formData, yearPublished: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "Available" | "Borrowed") => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Borrowed">Borrowed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditBook}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
