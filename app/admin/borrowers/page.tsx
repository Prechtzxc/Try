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
import { useEffect, useState } from "react"

type Borrower = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  membershipDate: string
}

export default function BorrowersPage() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentBorrower, setCurrentBorrower] = useState<Borrower | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  useEffect(() => {
    const storedBorrowers = JSON.parse(localStorage.getItem("borrowers") || "[]")
    setBorrowers(storedBorrowers)
  }, [])

  const saveBorrowers = (updatedBorrowers: Borrower[]) => {
    localStorage.setItem("borrowers", JSON.stringify(updatedBorrowers))
    setBorrowers(updatedBorrowers)
  }

  const handleAddBorrower = () => {
    const newBorrower: Borrower = {
      id: Date.now().toString(),
      ...formData,
      membershipDate: new Date().toISOString().split("T")[0],
    }
    saveBorrowers([...borrowers, newBorrower])
    setIsAddDialogOpen(false)
    setFormData({ name: "", email: "", phone: "", address: "" })
  }

  const handleEditBorrower = () => {
    if (!currentBorrower) return
    const updatedBorrowers = borrowers.map((b) =>
      b.id === currentBorrower.id ? { ...currentBorrower, ...formData } : b,
    )
    saveBorrowers(updatedBorrowers)
    setIsEditDialogOpen(false)
    setCurrentBorrower(null)
  }

  const handleDeleteBorrower = (id: string) => {
    if (confirm("Are you sure you want to delete this borrower?")) {
      saveBorrowers(borrowers.filter((b) => b.id !== id))
    }
  }

  const openEditDialog = (borrower: Borrower) => {
    setCurrentBorrower(borrower)
    setFormData({
      name: borrower.name,
      email: borrower.email,
      phone: borrower.phone,
      address: borrower.address,
    })
    setIsEditDialogOpen(true)
  }

  const filteredBorrowers = borrowers.filter(
    (borrower) =>
      borrower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrower.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrower.phone.includes(searchTerm),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">Borrowers Management</h1>
              <p className="text-gray-600 mt-1">Manage library members and their information</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add New Borrower</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Borrower</DialogTitle>
                  <DialogDescription>Enter the borrower details below</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+63 912 345 6789"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Main St, City"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddBorrower}>Add Borrower</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
            {filteredBorrowers.map((borrower) => (
              <Card key={borrower.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <h3 className="text-xl font-semibold">{borrower.name}</h3>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Email:</span> {borrower.email}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {borrower.phone}
                        </div>
                        <div>
                          <span className="font-medium">Address:</span> {borrower.address}
                        </div>
                        <div>
                          <span className="font-medium">Member Since:</span> {borrower.membershipDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(borrower)}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteBorrower(borrower.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredBorrowers.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  No borrowers found. Add your first borrower to get started.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Borrower</DialogTitle>
            <DialogDescription>Update the borrower details</DialogDescription>
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
            <Button onClick={handleEditBorrower}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
