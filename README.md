# 🛒 Pradera Ecommerce

Scalable ecommerce web application built with modern fullstack architecture using Next.js and Supabase.

This project demonstrates authentication flows, protected routes, database integration, testing strategies, and production-ready structure.

---

## 🚀 Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Responsive UI

### Backend
- Supabase (PostgreSQL)
- Supabase Authentication
- API integration via server/client components

### Testing
- Jest (Unit Testing)
- Playwright (End-to-End Testing)

### Deployment
- Vercel (Production hosting)

---

## ✨ Core Features

- Secure user authentication
- Product catalog with dynamic rendering
- Shopping cart logic
- Route protection using middleware
- Clean and modular project structure
- Responsive design with animation support
- Production-ready configuration

---

## 🧠 Architecture & Design Decisions

- App Router used for scalability and modern routing patterns
- Clear separation of Server and Client components
- Supabase selected for rapid backend integration
- Middleware implemented for route protection
- Combined unit + E2E testing strategy

---

## 📁 Project Structure

```
src/
├── app/
├── components/
├── lib/
├── middleware.ts
└── types/
```

The project follows a modular and scalable folder structure to allow future expansion.

---

## ⚙️ Getting Started

### 1️⃣ Clone repository

```bash
git clone https://github.com/crudoa/pradera-ecommerce.git
cd pradera-ecommerce
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Configure environment variables

Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

You can copy from:

```
.env.example
```

### 4️⃣ Run development server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```
