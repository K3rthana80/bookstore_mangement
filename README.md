# 📚 Book Store Management System

A simple, clean, full-stack Book Store / Library Management System for college projects and demos.

---

## ✨ Features

- **Admin Login** — Secure JWT-based authentication with hashed passwords
- **Book Management** — Add, Edit, Delete books with auto-generated Book IDs (B001, B002 …)
- **Search Books** — Search by Book ID, Book Name, or Author
- **Issue Book** — Issue a book to a person; auto-decrements available count
- **Issued Books Tracker** — View all issued/returned transactions with status filter
- **Return Book** — 3-step return flow: enter return date → see charge preview → confirm payment
- **Charge Calculation** — Inclusive day counting × ₹3/day
- **Payment Submission** — Marks payment as Paid, book as Returned, restores available count
- **Dashboard Stats** — Real-time counts: Total Books, Available Copies, Currently Issued, Returned
- **Validation** — Both frontend and backend validation on all forms
- **Responsive UI** — Works on desktop, tablet, and mobile

---

## 🛠 Technology Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19 + Vite 8 + Tailwind CSS v4 |
| Backend    | Node.js + Express.js                |
| Database   | SQLite (via Knex.js + sqlite3)      |
| Auth       | JWT (jsonwebtoken) + bcryptjs       |
| HTTP       | Axios (frontend API calls)          |
| UI Icons   | Lucide React                        |
| Toasts     | react-hot-toast                     |

---

## 📁 Folder Structure

```
fullstack_project/
├── backend/
│   ├── data/                   ← SQLite database file (auto-created)
│   │   └── bookstore.db
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js           ← Knex DB init + table creation
│   │   │   └── seed.js         ← Seed admin user + sample books
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── booksController.js
│   │   │   ├── issuesController.js
│   │   │   └── dashboardController.js
│   │   ├── middleware/
│   │   │   └── auth.js         ← JWT authentication middleware
│   │   └── routes/
│   │       ├── authRoutes.js
│   │       ├── bookRoutes.js
│   │       ├── issueRoutes.js
│   │       └── dashboardRoutes.js
│   ├── server.js               ← Express app entry point
│   ├── .env                    ← Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Modal.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Books.jsx
│   │   │   ├── IssueBook.jsx
│   │   │   └── IssuedBooks.jsx
│   │   ├── services/
│   │   │   └── api.js          ← Axios API service
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 🗄 Database Schema

### `users`
| Column       | Type    | Notes                  |
|--------------|---------|------------------------|
| id           | INTEGER | Primary key            |
| username     | TEXT    | Unique                 |
| email        | TEXT    | Unique                 |
| passwordHash | TEXT    | bcrypt hashed          |
| createdAt    | DATETIME|                        |

### `books`
| Column         | Type    | Notes                      |
|----------------|---------|----------------------------|
| id             | INTEGER | Primary key                |
| bookId         | TEXT    | Unique, auto-generated B001|
| bookName       | TEXT    |                            |
| publishingYear | INTEGER |                            |
| author         | TEXT    |                            |
| description    | TEXT    | Optional                   |
| totalCount     | INTEGER |                            |
| availableCount | INTEGER | Updated on issue/return    |
| createdAt      | DATETIME|                            |
| updatedAt      | DATETIME|                            |

### `issue_transactions`
| Column        | Type    | Notes                              |
|---------------|---------|------------------------------------|
| id            | INTEGER | Primary key                        |
| personName    | TEXT    |                                    |
| phone         | TEXT    |                                    |
| email         | TEXT    |                                    |
| bookId        | TEXT    | FK → books.bookId                  |
| issuedDate    | TEXT    | YYYY-MM-DD                         |
| returnDate    | TEXT    | YYYY-MM-DD, set on return          |
| numberOfDays  | INTEGER | Inclusive count                    |
| dailyCharge   | REAL    | ₹3/day                            |
| totalCharge   | REAL    | numberOfDays × dailyCharge         |
| paymentStatus | TEXT    | pending / paid                     |
| status        | TEXT    | issued / returned                  |
| createdAt     | DATETIME|                                    |
| updatedAt     | DATETIME|                                    |

---

## 🚀 How to Install & Run

### Prerequisites
- Node.js (v18+)
- npm

### 1. Install Backend Dependencies
```bash
cd fullstack_project/backend
npm install
```

### 2. Seed the Database
```bash
npm run seed
```
This creates:
- The SQLite database at `backend/data/bookstore.db`
- Default admin user
- 5 sample books (B001–B005)

### 3. Start the Backend
```bash
npm start
# or for development with auto-reload:
npm run dev
```
Backend runs on: **http://localhost:5000**

### 4. Install Frontend Dependencies
```bash
cd fullstack_project/frontend
npm install
```

### 5. Start the Frontend
```bash
npm run dev
```
Frontend runs on: **http://localhost:5173**

> The Vite dev server proxies `/api` requests to the backend automatically.

---

## 🔑 Default Login Credentials

| Field    | Value            |
|----------|------------------|
| Username | `admin`          |
| Password | `admin123`       |
| Email    | admin@bookstore.com |

---

## 📐 Important Business Rules

### Day Calculation — **INCLUSIVE**
```
Issued Date:    03/08/2026
Return Date:    10/08/2026
Days counted:   03, 04, 05, 06, 07, 08, 09, 10 = 8 days
Formula:        (Return Date - Issued Date) + 1
```

### Charge Rate
```
₹3 per day (inclusive)
Example: 8 days × ₹3 = ₹24
```

### Book Count Logic
```
Initial:          Total=20, Available=20
After 1 issue:    Total=20, Available=19
After 2 issues:   Total=20, Available=18
After 1 return:   Total=20, Available=19
```

### Safety Rules
- Cannot issue if availableCount = 0
- Cannot delete a book with active issued copies
- Cannot reduce totalCount below currently-issued count when editing
- Cannot return an already-returned transaction
- Return date cannot be earlier than issued date
- All issue/return operations use atomic DB transactions

---

## 🔌 API Overview

### Authentication
| Method | Endpoint          | Description        |
|--------|-------------------|--------------------|
| POST   | /api/auth/login   | Login, returns JWT |
| POST   | /api/auth/logout  | Logout             |
| GET    | /api/auth/me      | Get current user   |

### Dashboard
| Method | Endpoint               | Description        |
|--------|------------------------|--------------------|
| GET    | /api/dashboard/stats   | Summary statistics |

### Books
| Method | Endpoint        | Description          |
|--------|-----------------|----------------------|
| GET    | /api/books      | List all (+ search)  |
| POST   | /api/books      | Create book          |
| GET    | /api/books/:id  | Get single book      |
| PUT    | /api/books/:id  | Update book          |
| DELETE | /api/books/:id  | Delete book          |

### Issues
| Method | Endpoint                    | Description           |
|--------|-----------------------------|-----------------------|
| GET    | /api/issues                 | List all (+ filter)   |
| POST   | /api/issues                 | Issue a book          |
| GET    | /api/issues/:id             | Get single issue      |
| POST   | /api/issues/:id/calculate   | Preview charge        |
| POST   | /api/issues/:id/return      | Return + pay          |

> All `/api/books`, `/api/issues`, `/api/dashboard` routes require a valid JWT in the `Authorization: Bearer <token>` header.

---

## 🧪 Verified Test Scenario

The exact scenario from the requirements works correctly:

| Step | Action | Result |
|------|--------|--------|
| 1 | Java (B001) initial | Available: 20 |
| 2 | Issue to ABC on 03/08/2026 | Available: 19 ✅ |
| 3 | Calculate charge for 10/08/2026 | 8 days × ₹3 = ₹24 ✅ |
| 4 | Submit payment | Status: returned, Payment: paid ✅ |
| 5 | After return | Available: 20 ✅ |
