// Authentication functionality
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault()

  const email = document.getElementById("email").value
  const password = document.getElementById("password").value
  const errorAlert = document.getElementById("errorAlert")

  errorAlert.classList.add("d-none")

  // Check admin credentials
  const admin = JSON.parse(localStorage.getItem("admin") || "{}")
  if (admin.email === email && admin.password === password) {
    sessionStorage.setItem(
      "currentUser",
      JSON.stringify({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: "admin",
      }),
    )
    window.location.href = "admin/dashboard.html"
    return
  }

  // Check student credentials
  const students = JSON.parse(localStorage.getItem("students") || "[]")
  const student = students.find((s) => s.email === email && s.password === password)

  if (student) {
    sessionStorage.setItem(
      "currentUser",
      JSON.stringify({
        id: student.id,
        name: student.name,
        email: student.email,
        role: "student",
        studentId: student.studentId,
      }),
    )
    window.location.href = "student/dashboard.html"
    return
  }

  // Invalid credentials
  errorAlert.textContent = "Invalid email or password"
  errorAlert.classList.remove("d-none")
})

// Check if user is already logged in
const currentUser = sessionStorage.getItem("currentUser")
if (currentUser && window.location.pathname.includes("login.html")) {
  const user = JSON.parse(currentUser)
  if (user.role === "admin") {
    window.location.href = "admin/dashboard.html"
  } else {
    window.location.href = "student/dashboard.html"
  }
}
