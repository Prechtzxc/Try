"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function UnifiedLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (email === "admin@library.com" && password === "admin123") {
      localStorage.setItem("userType", "admin")
      localStorage.setItem("userEmail", email)
      localStorage.setItem("userName", "Darell Eucare")
      router.push("/admin/dashboard")
      return
    }

    const students = JSON.parse(localStorage.getItem("students") || "[]")
    const student = students.find((s: any) => s.email === email && s.password === password)

    if (student) {
      localStorage.setItem("userType", "student")
      localStorage.setItem("userEmail", email)
      localStorage.setItem("userName", student.name)
      router.push("/student/dashboard")
      return
    }

    setError("Invalid credentials")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <Card className="w-full max-w-md border-2 border-black">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white">
              Login
            </Button>
            <div className="text-sm text-center">
              Don't have an account?{" "}
              <Link href="/register/student" className="text-black font-semibold hover:underline">
                Register here
              </Link>
            </div>
            <Link href="/" className="text-sm text-gray-600 hover:text-black text-center">
              Back to home
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
