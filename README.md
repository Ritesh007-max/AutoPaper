# 📚 AutoPaper – Smart Question Paper Generator

AutoPaper is a **multi-tenant SaaS platform** that helps schools and coaching institutes **automate the process of creating question papers**.

It allows teachers to manage question banks, generate structured exam papers, and export them as **ready-to-print PDFs**.

---

## 🚀 Features

### 🧾 Question Management
- Add single or multiple questions
- Bulk upload via text or PDF
- AI-assisted question parsing
- Tag questions by:
  - Class
  - Subject
  - Chapter
  - Difficulty
  - Marks
  - Type (MCQ / Short / Long)

---

### 📊 Question Bank
- Filter questions by multiple parameters
- Edit / delete questions
- Organized and searchable database

---

### 🧠 Smart Paper Generator
- Generate exam papers based on:
  - Class
  - Subject
  - Chapters
  - Difficulty distribution
  - Blueprint (Sections A, B, C)

- Automatically balances:
  - Difficulty
  - Question types
  - Marks distribution

---

### 📄 PDF Export
- Generate clean, printable exam papers
- Professional layout with:
  - School name
  - Subject
  - Time & marks
  - Sections

---

### 🏫 Multi-Tenant Architecture
- Separate data for each institution
- Secure access control using roles

---

### 👥 Role-Based Access Control

#### 👨‍🏫 Teacher
- Add/edit/delete questions
- Generate papers
- Export PDFs

#### 🏫 Institute Admin
- Invite/remove teachers
- View teacher activity
- Monitor question banks (read-only)

#### 👑 Platform Admin
- Manage institutions
- Add/remove institute admins
- Platform-level controls

---

### 📩 Invite System
- Teachers join via secure invite links
- Token-based authentication
- Expiry-based invite validation

---

## 🛠 Tech Stack

### Frontend
- React.js
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Other Tools
- Puppeteer (PDF generation)
- JWT (Authentication)
- OpenAI API (AI parsing - optional)

---

## 📂 Project Structure

