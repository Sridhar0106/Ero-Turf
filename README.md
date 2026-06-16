# 🏏 EROTURF — Premium Cricket Turf Booking Platform

A production-grade, full-stack web application for booking cricket turfs. Built with React + Vite (frontend) and Node.js + Express (backend).

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### 1. Clone & Install

```bash
# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```
MONGODB_URI=mongodb://localhost:27017/eroturf
JWT_SECRET=your_secret_here
STRIPE_SECRET_KEY=sk_test_...
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

**Frontend** (`frontend/.env`):
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Run Development Servers

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Frontend: http://localhost:5173
Backend API: http://localhost:5000/api

### 4. Seed Demo Data

Visit: `http://localhost:5000/api/turfs/seed/demo` (GET or POST)

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Animations | Framer Motion |
| State | Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | Firebase (Phone OTP + Google) |
| Payments | Stripe (+ Google Pay via Payment Request API) |
| Charts | Recharts |

---

## 📱 Features

- ✅ **Hero page** with parallax effect & glow animations
- ✅ **Authentication** — Google Sign-In + Phone OTP (Firebase) + Dev mode
- ✅ **Booking flow** — Turf gallery → Team details → Date/slot → Payment
- ✅ **Movie-ticket style** date selector (30 days)
- ✅ **Real-time slot availability** (green/red/yellow)
- ✅ **Stripe Payments** with Google Pay / UPI support
- ✅ **QR Code tickets** on booking confirmation
- ✅ **Live Cricket Scores** (auto-refresh every 30s, mock fallback)
- ✅ **Upcoming Matches** with countdown timers
- ✅ **User Dashboard** with bookings, payment history, statistics
- ✅ **Admin Panel** — manage bookings, users, block slots, revenue charts
- ✅ **Dark/Light mode** toggle
- ✅ **Fully responsive** — mobile, tablet, desktop
- ✅ **Loading skeletons** on all async content
- ✅ **Page transitions** with Framer Motion
- ✅ **SEO optimized** (meta tags, semantic HTML)

---

## 🔐 Authentication

### Dev Mode (No Firebase needed)
Click **"Dev Mode Login"** in the auth modal — logs you in with admin access instantly.

### Firebase (Production)
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Phone Authentication** and **Google Sign-In**
3. Copy credentials to `frontend/.env` and `backend/.env`

---

## 💳 Payments

### Stripe Test Mode
1. Get keys from [dashboard.stripe.com](https://dashboard.stripe.com)
2. Add `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` to `.env` files
3. Use test card: `4242 4242 4242 4242`

### Webhook (Local Testing)
```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

---

## 🏏 Cricket API

Set `CRICKET_API_KEY` in `backend/.env` to get real data. 
Get a free key at [cricapi.com](https://cricapi.com).

Without a key → app uses rich **mock data** automatically.

---

## 📁 Project Structure

```
eroturf/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── auth/AuthModal.jsx
│       │   ├── booking/ (DateSelector, SlotGrid, BookingSummaryCard)
│       │   ├── cricket/ (MatchCards)
│       │   └── ui/ (Navbar, LoadingSkeleton)
│       ├── context/ (AuthContext, ThemeContext)
│       ├── pages/ (Home, Booking, Dashboard, Admin, etc.)
│       ├── services/api.js
│       └── App.jsx
└── backend/
    ├── config/ (db.js, firebase.js)
    ├── middleware/ (auth.js, errorHandler.js)
    ├── models/ (User, Turf, Booking, Payment, TimeSlot)
    ├── routes/ (auth, turf, slot, booking, payment, cricket, admin)
    └── server.js
```

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary | `#00C853` (Green) |
| Accent | `#FFD700` (Gold) |
| Background | `#0D1117` (Dark) |
| Cards | `rgba(255,255,255,0.06)` (Glassmorphism) |
| Fonts | Inter + Rajdhani + Orbitron |

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend && npm run build
# Deploy the dist/ folder
```

### Backend (Railway/Render)
Set all environment variables and deploy.
Use MongoDB Atlas for production DB.

---

Built with ❤️ by EROTURF Team
