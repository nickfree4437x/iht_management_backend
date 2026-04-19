# Travel Agency Backend API

A scalable and production-ready backend for managing tours, bookings, payments, and client dashboards.

---

## 🛠 Tech Stack

* Node.js
* Express.js
* PostgreSQL
* Prisma ORM
* Socket.io (Real-time features)
* Cloudinary (File Uploads)

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/nickfree4437x/travel-agency-backend.git
cd travel-agency-backend
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Setup Environment Variables

Create a `.env` file in the root:

```bash
cp .env.example .env
```

Fill all required values.

---

### 4️⃣ Setup Database

```bash
npx prisma generate
npx prisma migrate dev
```

---

### 5️⃣ Run Server

```bash
npm run dev
```


## 🔐 Environment Variables

| Variable        | Description                   |
| --------------- | ----------------------------- |
| DATABASE_URL    | PostgreSQL connection string  |
| JWT_SECRET      | Secret key for authentication |
| EMAIL_USER      | Email for sending mails       |
| CLOUDINARY_NAME | Cloudinary cloud name         |

---

## 📁 Folder Structure

```
src/
├── controllers/
├── routes/
├── middleware/
├── config/
├── loaders/
```

---

## 🚀 Features

* Authentication & Authorization
* Tour Management
* Payments & Invoices
* File Uploads (Cloudinary)
* Real-time Updates (Socket.io)
* Client Dashboard

---

## ⚠️ Important

* Do NOT commit `.env` file
* Keep secrets safe

---

## 📌 Author
Vishal Saini
