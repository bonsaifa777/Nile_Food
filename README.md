# Nile Food - MERN Stack Food Ordering Application

A production-ready MERN stack (MongoDB, Express, React, Node.js) food ordering web application designed for hotel/restaurant on-site ordering (QR/table-based) and online delivery with location tracking.

## Features

- **On-Site Hotel/Restaurant Ordering**: QR code per table for dine-in orders
- **Online Delivery**: Location tracking with real-time order status
- **Admin Panel**: Full dashboard with analytics, menu management, orders, and more
- **AI Chatbot**: Customer support & ordering assistance
- **AI Recommendations**: Smart food suggestions
- **Payment Integration**: Chapa (Ethiopia) for ETB payments
- **Dark/Light Mode**: Fully optimized UI modes
- **Glassmorphism UI**: Modern Apple-like design
- **Real-time Updates**: Socket.io for live order tracking

## Tech Stack

- **Frontend**: React + Vite, Tailwind CSS, Framer Motion, Three.js
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Real-time**: Socket.io
- **Admin**: Separate React dashboard

## Project Structure

```
root/
├── client/          # Customer React app
├── admin/           # Admin dashboard
├── server/          # Node.js backend
├── shared/          # Constants & utilities
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 6+
- npm or yarn

### Installation

1. **Clone and install dependencies**

```bash
# Install client dependencies
cd client && npm install

# Install admin dependencies
cd ../admin && npm install

# Install server dependencies
cd ../server && npm install
```

2. **Configure environment**

```bash
# Copy example env file
cp server/.env.example server/.env

# Edit with your values
# - MONGODB_URI
# - CHAPA_SECRET_KEY
# - JWT_SECRET
```

3. **Seed database (first time only)**

```bash
cd server && npm run seed
```

This creates:
- Admin user: admin@foodapp.com / Admin@123
- 8 food categories
- 22 sample food items
- 10 sample tables

### Running the Application

```bash
# Terminal 1: Start backend
cd server && npm run dev

# Terminal 2: Start client
cd client && npm run dev

# Terminal 3: Start admin panel
cd admin && npm run dev
```

### Access URLs

- **Client App**: http://localhost:5173
- **Admin Panel**: http://localhost:3000/admin
- **API**: http://localhost:5002

Default admin login:
- Email: admin@foodapp.com
- Password: Admin@123

## LAN Mode (offline)

Run everything from the project root with one command:

```bash
npm run lan:start
```

Open `http://<your-mac-ip>:5002` on any device on the same network.

### "Works one day, doesn't work the next" — the IP keeps changing

Your Mac gets a new IP address from the router/phone every time it reconnects
(DHCP), so old bookmarks/QR codes with the old IP stop working. Two fixes:

1. **Use the stable URL** (never changes, even when the IP does) — the server prints it at startup:
   ```
   http://<your-mac-hostname>.local:5002
   ```
   e.g. `http://macintoshdemacbook-pro.local:5002`

2. **Lock the IP permanently** so `http://192.168.x.x:5002` always works:
   ```bash
   npm run lan:static-ip
   ```
   This sets a fixed IP for the Mac's current network. (It will need your
   password for `sudo`.) Re-run it if you switch networks.

Other useful commands:

```bash
npm run lan:setup        # full install + build + seed (first time only)
npm run lan:build        # rebuild frontend apps
npm run lan:firewall     # allow Node through the macOS firewall
npm run lan:seed         # (re)seed the database
```

## Key Features

### Customer App (client/)

- 🥗 Food Menu with categories & search
- 🛒 Shopping cart
- 📱 Table QR ordering
- 🚚 Delivery tracking
- 🤖 AI Chatbot support
- 🌙 Dark mode
- 📱 PWA ready

### Admin Panel (admin/)

- 📊 Dashboard with analytics
- 📋 Order management
- 🍕 Menu & category CRUD
- 🪑 Table/QR management
- 👥 User management
- 💳 Payment tracking
- ⚙️ Settings

### Backend (server/)

- RESTful API
- JWT authentication
- Role-based access
- Socket.io real-time
- Payment integration

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Foods
- GET /api/foods
- GET /api/foods/featured
- GET /api/foods/search?q=
- GET /api/foods/:id
- POST /api/foods (admin)

### Orders
- GET /api/orders
- POST /api/orders
- PUT /api/orders/:id/status (admin)

### Tables
- GET /api/tables
- GET /api/tables/:id
- GET /api/tables/qr/:tableId

### Payment
- POST /api/payments/chapa

### Admin
- POST /api/admin/login
- GET /api/admin/dashboard
- GET /api/admin/analytics

## License

MIT# Nile-Food
# Nile_Food
# Nile_Food
# Nile_Food
# Nile_Food
