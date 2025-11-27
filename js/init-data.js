// Initialize demo data in localStorage if not already present
function initializeData() {
  if (!localStorage.getItem("libraryInitialized")) {
    // Initialize Filipino Books
    const books = [
      {
        id: "1",
        title: "Noli Me Tangere",
        author: "Jose Rizal",
        category: "Fiction",
        publisher: "Bertelsman Publishing House",
        year: "1887",
        status: "available",
      },
      {
        id: "2",
        title: "El Filibusterismo",
        author: "Jose Rizal",
        category: "Fiction",
        publisher: "F. Meyer van Loo",
        year: "1891",
        status: "available",
      },
      {
        id: "3",
        title: "Dekada '70",
        author: "Lualhati Bautista",
        category: "Historical Fiction",
        publisher: "Star Books",
        year: "1983",
        status: "available",
      },
      {
        id: "4",
        title: "Ibong Adarna",
        author: "Anonymous",
        category: "Epic Poetry",
        publisher: "Various",
        year: "1600s",
        status: "available",
      },
      {
        id: "5",
        title: "Florante at Laura",
        author: "Francisco Balagtas",
        category: "Epic Poetry",
        publisher: "Various",
        year: "1838",
        status: "available",
      },
      {
        id: "6",
        title: "Mga Ibong Mandaragit",
        author: "Amado V. Hernandez",
        category: "Fiction",
        publisher: "Liwayway Publishing",
        year: "1969",
        status: "available",
      },
      {
        id: "7",
        title: "Bata, Bata, Pa'no Ka Ginawa?",
        author: "Lualhati Bautista",
        category: "Fiction",
        publisher: "Pasang-Krus",
        year: "1984",
        status: "available",
      },
      {
        id: "8",
        title: "Ang Tatlong Kuwadro ng Buhay ni Rosario",
        author: "Mario O'Hara",
        category: "Fiction",
        publisher: "Various",
        year: "2010",
        status: "available",
      },
      {
        id: "9",
        title: "Mga Agos sa Disyerto",
        author: "Edgardo M. Reyes",
        category: "Fiction",
        publisher: "De La Salle University Press",
        year: "1964",
        status: "available",
      },
      {
        id: "10",
        title: "Luha ng Buwaya",
        author: "Amado V. Hernandez",
        category: "Poetry",
        publisher: "Liwayway Publishing",
        year: "1974",
        status: "available",
      },
    ]
    localStorage.setItem("books", JSON.stringify(books))

    // Initialize Admin Account
    const admin = {
      id: "admin-1",
      name: "Darell Eucare",
      email: "admin@library.com",
      password: "admin123",
      role: "admin",
    }
    localStorage.setItem("admin", JSON.stringify(admin))

    // Initialize Student Accounts
    const students = [
      {
        id: "student-1",
        name: "Charmee Botero",
        email: "charmee.botero@student.library.com",
        password: "student123",
        role: "student",
        studentId: "STU-001",
        contact: "09123456789",
      },
      {
        id: "student-2",
        name: "Kristella Candelosa",
        email: "kristella.candelosa@student.library.com",
        password: "student123",
        role: "student",
        studentId: "STU-002",
        contact: "09123456790",
      },
      {
        id: "student-3",
        name: "Ronielyn Olimpo",
        email: "ronielyn.olimpo@student.library.com",
        password: "student123",
        role: "student",
        studentId: "STU-003",
        contact: "09123456791",
      },
      {
        id: "student-4",
        name: "Shakira Nicole Pelayo",
        email: "shakira.pelayo@student.library.com",
        password: "student123",
        role: "student",
        studentId: "STU-004",
        contact: "09123456792",
      },
      {
        id: "student-5",
        name: "John Andrew Empania",
        email: "john.empania@student.library.com",
        password: "student123",
        role: "student",
        studentId: "STU-005",
        contact: "09123456793",
      },
    ]
    localStorage.setItem("students", JSON.stringify(students))

    // Initialize Sample Borrowing Records
    const borrowings = [
      {
        id: "borrow-1",
        bookId: "1",
        bookTitle: "Noli Me Tangere",
        studentId: "student-1",
        studentName: "Charmee Botero",
        borrowDate: new Date("2024-01-15").toISOString(),
        dueDate: new Date("2024-01-29").toISOString(),
        returnDate: null,
        status: "active",
      },
      {
        id: "borrow-2",
        bookId: "3",
        bookTitle: "Dekada '70",
        studentId: "student-3",
        studentName: "Ronielyn Olimpo",
        borrowDate: new Date("2024-01-20").toISOString(),
        dueDate: new Date("2024-02-03").toISOString(),
        returnDate: null,
        status: "active",
      },
      {
        id: "borrow-3",
        bookId: "5",
        bookTitle: "Florante at Laura",
        studentId: "student-2",
        studentName: "Kristella Candelosa",
        borrowDate: new Date("2024-01-10").toISOString(),
        dueDate: new Date("2024-01-24").toISOString(),
        returnDate: new Date("2024-01-23").toISOString(),
        status: "returned",
      },
      {
        id: "borrow-4",
        bookId: "2",
        bookTitle: "El Filibusterismo",
        studentId: "student-4",
        studentName: "Shakira Nicole Pelayo",
        borrowDate: new Date("2024-01-05").toISOString(),
        dueDate: new Date("2024-01-19").toISOString(),
        returnDate: new Date("2024-01-25").toISOString(),
        status: "returned",
      },
    ]
    localStorage.setItem("borrowings", JSON.stringify(borrowings))

    // Update book statuses
    books[0].status = "borrowed" // Noli Me Tangere
    books[2].status = "borrowed" // Dekada '70
    localStorage.setItem("books", JSON.stringify(books))

    // Initialize Fines
    const fines = [
      {
        id: "fine-1",
        studentId: "student-4",
        studentName: "Shakira Nicole Pelayo",
        bookTitle: "El Filibusterismo",
        amount: 60,
        daysOverdue: 6,
        status: "unpaid",
        createdDate: new Date("2024-01-25").toISOString(),
      },
    ]
    localStorage.setItem("fines", JSON.stringify(fines))

    localStorage.setItem("libraryInitialized", "true")
  }
}

// Run initialization on page load
initializeData()
