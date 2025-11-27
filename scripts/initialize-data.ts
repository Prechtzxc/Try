// Initialize Filipino Books
const filipinoBooks = [
  {
    id: "1",
    title: "Noli Me Tangere",
    author: "Jose Rizal",
    category: "Historical Fiction",
    publisher: "Berliner Buchdruckerei-Aktiengesellschaft",
    yearPublished: "1887",
    status: "Available" as const,
  },
  {
    id: "2",
    title: "El Filibusterismo",
    author: "Jose Rizal",
    category: "Historical Fiction",
    publisher: "F. Meyer-Van Loo Press",
    yearPublished: "1891",
    status: "Available" as const,
  },
  {
    id: "3",
    title: "Dekada '70",
    author: "Lualhati Bautista",
    category: "Contemporary Fiction",
    publisher: "The Bookmark, Inc.",
    yearPublished: "1983",
    status: "Available" as const,
  },
  {
    id: "4",
    title: "Ibong Adarna",
    author: "Anonymous",
    category: "Epic Poetry",
    publisher: "Various Publishers",
    yearPublished: "1860",
    status: "Available" as const,
  },
  {
    id: "5",
    title: "Florante at Laura",
    author: "Francisco Balagtas",
    category: "Epic Poetry",
    publisher: "Various Publishers",
    yearPublished: "1838",
    status: "Available" as const,
  },
  {
    id: "6",
    title: "Mga Ibong Mandaragit",
    author: "Amado V. Hernandez",
    category: "Poetry",
    publisher: "Lahi Publishing House",
    yearPublished: "1969",
    status: "Available" as const,
  },
  {
    id: "7",
    title: "Banaag at Sikat",
    author: "Lope K. Santos",
    category: "Social Realism",
    publisher: "Limbagan ni P. Gutierrez",
    yearPublished: "1906",
    status: "Available" as const,
  },
  {
    id: "8",
    title: "Sa Mga Kuko ng Liwanag",
    author: "Edgardo M. Reyes",
    category: "Contemporary Fiction",
    publisher: "De La Salle University Press",
    yearPublished: "1966",
    status: "Available" as const,
  },
  {
    id: "9",
    title: "Ang Tundo Man May Langit Din",
    author: "Andres Cristobal Cruz",
    category: "Contemporary Fiction",
    publisher: "National Book Store",
    yearPublished: "1956",
    status: "Available" as const,
  },
  {
    id: "10",
    title: "Luha ng Buwaya",
    author: "Amado V. Hernandez",
    category: "Poetry",
    publisher: "Philippine Writers League",
    yearPublished: "1973",
    status: "Available" as const,
  },
]

// Initialize Admin Account (Only 1 admin)
const adminAccount = {
  id: "admin-001",
  name: "Darell Eucare",
  email: "admin@library.com",
  password: "admin123",
  role: "Admin",
}

// Initialize Student Accounts
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

// Initialize Sample Borrowing Records (only for some students)
const borrowingRecords = [
  // Charmee Botero - Currently borrowing
  {
    id: "borrow-001",
    bookId: "1",
    bookTitle: "Noli Me Tangere",
    borrowerId: "student-001",
    borrowerName: "Charmee Botero",
    borrowDate: "2025-01-15",
    dueDate: "2025-02-14",
    status: "Borrowed" as const,
  },
  // Kristella Candelosa - Returned on time
  {
    id: "borrow-002",
    bookId: "3",
    bookTitle: "Dekada '70",
    borrowerId: "student-002",
    borrowerName: "Kristella Candelosa",
    borrowDate: "2025-01-10",
    dueDate: "2025-02-09",
    returnDate: "2025-02-08",
    status: "Returned" as const,
  },
  // Ronielyn Olimpo - Currently borrowing, about to be due
  {
    id: "borrow-003",
    bookId: "5",
    bookTitle: "Florante at Laura",
    borrowerId: "student-003",
    borrowerName: "Ronielyn Olimpo",
    borrowDate: "2025-01-20",
    dueDate: "2025-02-19",
    status: "Borrowed" as const,
  },
  // Shakira Nicole Pelayo - Returned late (will have a fine)
  {
    id: "borrow-004",
    bookId: "7",
    bookTitle: "Banaag at Sikat",
    borrowerId: "student-004",
    borrowerName: "Shakira Nicole Pelayo",
    borrowDate: "2024-12-15",
    dueDate: "2025-01-14",
    returnDate: "2025-01-20",
    status: "Returned" as const,
  },
  // Shakira Nicole Pelayo - Another return
  {
    id: "borrow-005",
    bookId: "4",
    bookTitle: "Ibong Adarna",
    borrowerId: "student-004",
    borrowerName: "Shakira Nicole Pelayo",
    borrowDate: "2024-12-01",
    dueDate: "2024-12-31",
    returnDate: "2024-12-30",
    status: "Returned" as const,
  },
]

// Update book statuses based on borrowings
const updatedBooks = filipinoBooks.map((book) => {
  const activeBorrowing = borrowingRecords.find(
    (b) => b.bookId === book.id && (b.status === "Borrowed" || b.status === "Overdue"),
  )
  if (activeBorrowing) {
    return { ...book, status: "Borrowed" as const }
  }
  return book
})

// Initialize Fine for late return
const fines = [
  {
    id: "fine-001",
    borrowerId: "student-004",
    borrowerName: "Shakira Nicole Pelayo",
    bookTitle: "Banaag at Sikat",
    amount: 60, // 6 days overdue * ₱10/day
    reason: "Overdue by 6 days",
    status: "Unpaid",
    issueDate: "2025-01-20",
  },
]

// Initialize localStorage
if (typeof window !== "undefined") {
  localStorage.setItem("books", JSON.stringify(updatedBooks))
  localStorage.setItem("students", JSON.stringify(studentAccounts))
  localStorage.setItem("borrowings", JSON.stringify(borrowingRecords))
  localStorage.setItem("fines", JSON.stringify(fines))
  console.log("[v0] Library management system initialized with Filipino books and student data")
  console.log("[v0] Admin: admin@library.com / admin123")
  console.log("[v0] Students can login with their email (e.g., charmee.botero@student.library.com) / student123")
}
