# 🦊 TradeFox

> India's stock market simulator — practice trading with ₹1,00,000 virtual balance using real NSE/BSE prices. Zero risk, real experience.

<img width="1364" height="641" alt="image" src="https://github.com/user-attachments/assets/cdcb87bc-442f-40ea-a821-09961408446e" />

---

## ✨ Features

- 📈 **Live Market Data** — Real-time NSE/BSE stock prices via WebSocket
- 💰 **Virtual Trading** — Start with ₹1,00,000 virtual balance
- 📊 **Order Types** — Market, Limit, Stop-Loss (SL), and SL-Market orders
- 🕯️ **Candlestick Charts** — Interactive charts powered by Lightweight Charts
- 📁 **Portfolio Tracking** — Holdings, P&L, and average buy price
- 🔔 **Price Alerts** — Get notified when a stock hits your target price
- 👀 **Watchlist** — Track your favourite stocks
- 🔐 **Auth** — JWT-based login/signup with password reset via email
- 📜 **Order History** — Full trade history with status tracking

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 19 + Vite | UI framework |
| Tailwind CSS v4 | Styling |
| React Router v7 | Routing |
| TanStack Query | Server state management |
| Lightweight Charts | Candlestick charts |
| Recharts | P&L charts |
| Socket.io Client | Real-time price updates |
| Axios | HTTP client |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express 5 | REST API server |
| PostgreSQL + Prisma | Database & ORM |
| Socket.io | WebSocket server |
| JWT + bcryptjs | Authentication |
| Nodemailer | Password reset emails |
| Winston | Logging |
| express-rate-limit | Rate limiting |

---

## 📁 Project Structure

```
Tradefox/
├── frontend/               # React + Vite app
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── features/       # Auth, Dashboard, Portfolio, Trading
│       ├── pages/          # Route-level pages
│       ├── services/       # API service functions
│       ├── hooks/          # Custom React hooks
│       └── context/        # Auth context
│
└── backend/                # Node.js + Express API
    ├── src/
    │   ├── controllers/    # Route handlers
    │   ├── routes/         # API routes
    │   ├── services/       # Business logic
    │   ├── middleware/      # Auth, error handling, rate limiting
    │   ├── websockets/     # Price simulator & socket server
    │   └── utils/          # JWT, email, logger, market hours
    └── prisma/
        ├── schema.prisma   # DB schema
        └── seed.js         # Seed 60+ NSE stocks
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database

### 1. Clone the repo

```bash
git clone https://github.com/Danish-tyagi/Tradefox.git
cd Tradefox
```

### 2. Setup Backend

```bash
cd backend
npm install
```
Start the backend:

```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in `/frontend`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

App will be running at `https://tradefox-1.onrender.com/`

---

## 📡 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Sign up |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Request password reset |
| GET | `/api/stocks` | Get all stocks |
| GET | `/api/stocks/:symbol` | Get stock details |
| POST | `/api/orders` | Place an order |
| GET | `/api/orders` | Get order history |
| GET | `/api/portfolio` | Get holdings |
| GET/POST/DELETE | `/api/watchlist` | Manage watchlist |
| GET/POST/DELETE | `/api/alerts` | Manage price alerts |

## 🚀 Live Demo

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Now-green?style=for-the-badge&logo=render)](https://tradefox-1.onrender.com/)


## 📄 License

MIT © [Danish Tyagi](https://github.com/Danish-tyagi)
