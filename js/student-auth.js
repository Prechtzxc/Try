// Check if user is logged in and is student
const currentUser = sessionStorage.getItem("currentUser")
if (!currentUser) {
  window.location.href = "../login.html"
} else {
  const user = JSON.parse(currentUser)
  if (user.role !== "student") {
    window.location.href = "../login.html"
  }
  // Set greeting
  if (document.getElementById("studentGreeting")) {
    document.getElementById("studentGreeting").textContent = `Hi ${user.name}`
  }
  if (document.getElementById("pageGreeting")) {
    document.getElementById("pageGreeting").textContent = `Hi ${user.name}`
  }
}
