let deleteBookId = null
const bootstrap = window.bootstrap // Declare the bootstrap variable

function loadBooks() {
  const books = JSON.parse(localStorage.getItem("books") || "[]")
  const tbody = document.getElementById("booksTable")

  if (books.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No books found</td></tr>'
    return
  }

  tbody.innerHTML = books
    .map((book) => {
      const statusBadge =
        book.status === "available"
          ? '<span class="badge bg-success">Available</span>'
          : '<span class="badge bg-secondary">Borrowed</span>'

      return `
      <tr>
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.category}</td>
        <td>${book.publisher}</td>
        <td>${book.year}</td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn btn-sm btn-outline-dark me-1" onclick="editBook('${book.id}')">Edit</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteBook('${book.id}')">Delete</button>
        </td>
      </tr>
    `
    })
    .join("")
}

function saveBook() {
  const id = document.getElementById("bookId").value
  const title = document.getElementById("title").value
  const author = document.getElementById("author").value
  const category = document.getElementById("category").value
  const publisher = document.getElementById("publisher").value
  const year = document.getElementById("year").value

  const books = JSON.parse(localStorage.getItem("books") || "[]")

  if (id) {
    // Edit existing book
    const index = books.findIndex((b) => b.id === id)
    if (index !== -1) {
      books[index] = { ...books[index], title, author, category, publisher, year }
    }
  } else {
    // Add new book
    const newBook = {
      id: Date.now().toString(),
      title,
      author,
      category,
      publisher,
      year,
      status: "available",
    }
    books.push(newBook)
  }

  localStorage.setItem("books", JSON.stringify(books))
  bootstrap.Modal.getInstance(document.getElementById("addBookModal")).hide()
  document.getElementById("bookForm").reset()
  loadBooks()
}

function editBook(id) {
  const books = JSON.parse(localStorage.getItem("books") || "[]")
  const book = books.find((b) => b.id === id)

  if (book) {
    document.getElementById("modalTitle").textContent = "Edit Book"
    document.getElementById("bookId").value = book.id
    document.getElementById("title").value = book.title
    document.getElementById("author").value = book.author
    document.getElementById("category").value = book.category
    document.getElementById("publisher").value = book.publisher
    document.getElementById("year").value = book.year

    new bootstrap.Modal(document.getElementById("addBookModal")).show()
  }
}

function deleteBook(id) {
  deleteBookId = id
  new bootstrap.Modal(document.getElementById("deleteModal")).show()
}

function confirmDelete() {
  if (deleteBookId) {
    let books = JSON.parse(localStorage.getItem("books") || "[]")
    books = books.filter((b) => b.id !== deleteBookId)
    localStorage.setItem("books", JSON.stringify(books))

    bootstrap.Modal.getInstance(document.getElementById("deleteModal")).hide()
    deleteBookId = null
    loadBooks()
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

// Reset form when modal is closed
document.getElementById("addBookModal").addEventListener("hidden.bs.modal", () => {
  document.getElementById("modalTitle").textContent = "Add Book"
  document.getElementById("bookForm").reset()
})

// Load books on page load
loadBooks()
