let returnBorrowingId = null
const bootstrap = window.bootstrap // Declare the bootstrap variable

function loadBorrowings() {
  const borrowings = JSON.parse(localStorage.getItem("borrowings") || "[]")
  const activeBorrowings = borrowings.filter((b) => b.status === "active")
  const returnedBorrowings = borrowings.filter((b) => b.status === "returned")

  // Active borrowings
  const activeTable = document.getElementById("activeBorrowingsTable")
  if (activeBorrowings.length === 0) {
    activeTable.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No active borrowings</td></tr>'
  } else {
    const today = new Date()
    activeTable.innerHTML = activeBorrowings
      .map((b) => {
        const dueDate = new Date(b.dueDate)
        const isOverdue = dueDate < today
        const statusBadge = isOverdue
          ? '<span class="badge bg-danger">Overdue</span>'
          : '<span class="badge bg-success">Active</span>'

        return `
        <tr>
          <td>${b.studentName}</td>
          <td>${b.bookTitle}</td>
          <td>${new Date(b.borrowDate).toLocaleDateString()}</td>
          <td>${dueDate.toLocaleDateString()}</td>
          <td>${statusBadge}</td>
          <td>
            <button class="btn btn-sm btn-dark" onclick="returnBook('${b.id}')">Return Book</button>
          </td>
        </tr>
      `
      })
      .join("")
  }

  // History
  const historyTable = document.getElementById("historyTable")
  if (returnedBorrowings.length === 0) {
    historyTable.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No borrowing history</td></tr>'
  } else {
    historyTable.innerHTML = returnedBorrowings
      .map(
        (b) => `
      <tr>
        <td>${b.studentName}</td>
        <td>${b.bookTitle}</td>
        <td>${new Date(b.borrowDate).toLocaleDateString()}</td>
        <td>${new Date(b.returnDate).toLocaleDateString()}</td>
        <td><span class="badge bg-secondary">Returned</span></td>
      </tr>
    `,
      )
      .join("")
  }
}

function returnBook(id) {
  const borrowings = JSON.parse(localStorage.getItem("borrowings") || "[]")
  const borrowing = borrowings.find((b) => b.id === id)

  if (borrowing) {
    returnBorrowingId = id
    const dueDate = new Date(borrowing.dueDate)
    const today = new Date()
    const daysOverdue = Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)))
    const fine = daysOverdue * 10

    document.getElementById("returnModalBody").innerHTML = `
      <p><strong>Student:</strong> ${borrowing.studentName}</p>
      <p><strong>Book:</strong> ${borrowing.bookTitle}</p>
      <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
      ${
        daysOverdue > 0
          ? `
        <div class="alert alert-warning">
          <strong>Overdue:</strong> ${daysOverdue} days<br>
          <strong>Fine:</strong> ₱${fine}
        </div>
      `
          : '<p class="text-success">Returned on time</p>'
      }
    `

    new bootstrap.Modal(document.getElementById("returnModal")).show()
  }
}

function confirmReturn() {
  if (returnBorrowingId) {
    const borrowings = JSON.parse(localStorage.getItem("borrowings") || "[]")
    const borrowingIndex = borrowings.findIndex((b) => b.id === returnBorrowingId)

    if (borrowingIndex !== -1) {
      const borrowing = borrowings[borrowingIndex]
      const today = new Date()
      const dueDate = new Date(borrowing.dueDate)
      const daysOverdue = Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)))

      // Update borrowing
      borrowings[borrowingIndex].status = "returned"
      borrowings[borrowingIndex].returnDate = today.toISOString()
      localStorage.setItem("borrowings", JSON.stringify(borrowings))

      // Update book status
      const books = JSON.parse(localStorage.getItem("books") || "[]")
      const bookIndex = books.findIndex((b) => b.id === borrowing.bookId)
      if (bookIndex !== -1) {
        books[bookIndex].status = "available"
        localStorage.setItem("books", JSON.stringify(books))
      }

      // Add fine if overdue
      if (daysOverdue > 0) {
        const fines = JSON.parse(localStorage.getItem("fines") || "[]")
        fines.push({
          id: "fine-" + Date.now(),
          studentId: borrowing.studentId,
          studentName: borrowing.studentName,
          bookTitle: borrowing.bookTitle,
          amount: daysOverdue * 10,
          daysOverdue,
          status: "unpaid",
          createdDate: today.toISOString(),
        })
        localStorage.setItem("fines", JSON.stringify(fines))
      }

      bootstrap.Modal.getInstance(document.getElementById("returnModal")).hide()
      returnBorrowingId = null
      loadBorrowings()
    }
  }
}

function logout() {
  const modal = new bootstrap.Modal(document.getElementById("logoutModal"))
  modal.show()
}

function confirmLogout() {
  sessionStorage.removeItem("currentUser")
  window.location.href = "../index.html"
}

loadBorrowings()
