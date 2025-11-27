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
} from "@/components/ui/dialog"
import { useEffect, useState } from "react"

type Student = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  membershipDate: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  useEffect(() => {
    const storedStudents = JSON.parse(localStorage.getItem("students") || "[]")
    setStudents(storedStudents)
  }, [])

  const saveStudents = (updatedStudents: Student[]) => {
    localStorage.setItem("students", JSON.stringify(updatedStudents))
    setStudents(updatedStudents)
  }

  const handleEditStudent = () => {
    if (!currentStudent) return
    const updatedStudents = students.map((s) => (s.id === currentStudent.id ? { ...currentStudent, ...formData } : s))
    saveStudents(updatedStudents)
    setIsEditDialogOpen(false)
    setCurrentStudent(null)
  }

  const handleDeleteStudent = (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      saveStudents(students.filter((s) => s.id !== id))
    }
  }

  const openEditDialog = (student: Student) => {
    setCurrentStudent(student)
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      address: student.address,
    })
    setIsEditDialogOpen(true)
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">Students Management</h1>
              <p className="text-gray-600 mt-1">Manage library members and their information</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="grid gap-4">
            {filteredStudents.map((student) => (
              <Card key={student.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <h3 className="text-xl font-semibold">{student.name}</h3>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Email:</span> {student.email}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {student.phone}
                        </div>
                        <div>
                          <span className="font-medium">Address:</span> {student.address}
                        </div>
                        <div>
                          <span className="font-medium">Member Since:</span> {student.membershipDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(student)}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteStudent(student.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredStudents.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">No students found.</CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update the student details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditStudent}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
