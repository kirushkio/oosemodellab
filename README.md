# 🍽️ FoodBridge — Food Waste Donation & Redistribution System

A full-stack web application that connects restaurants (donors) with NGOs to redistribute surplus food, reducing waste and feeding communities.

## Tech Stack

- **Frontend**: React 19 + Tailwind CSS 4 + React Router 7
- **Backend**: Node.js + Express
- **Database**: SQLite (via sql.js — pure JavaScript, no native compilation)
- **Auth**: Simple session-based login (express-session)

## Features

- 🏪 **Donor Registration** — Restaurants can register and manage their profile
- 📋 **Donation Listings** — Create food donations with safety checklists
- 🔍 **NGO Browsing** — NGOs browse and accept available donations
- 📅 **Pickup Scheduling** — Schedule and track food pickups
- ⏱️ **Expiry Countdown** — Real-time countdown with urgent warnings (< 2 hours)
- 🛡️ **Food Safety Tracking** — Temperature, packaging, and allergen info
- 🔄 **Status Flow** — Available → Accepted → Picked Up → Completed
- ⏰ **Auto-expiry** — Donations automatically marked expired past their time

## Getting Started

### Prerequisites

- Node.js 18+ installed

### Setup

```bash
# 1. Install all dependencies
npm run install-all

# 2. Seed the database with sample data
npm run seed

# 3. Start the dev server (runs both client & server)
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

### Sample Login Credentials

| Role   | Name                      | Phone        | Password  |
|--------|---------------------------|--------------|-----------|
| Donor  | Green Garden Restaurant   | 9876543210   | donor123  |
| Donor  | The Daily Bread Café      | 9123456780   | donor123  |
| NGO    | Feeding Hope Foundation   | 9988776655   | ngo123    |

## Project Structure

```
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── api.js           # API client
│   │   ├── App.jsx          # Main app with routing
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Tailwind + custom styles
│   └── vite.config.ts       # Vite configuration
├── server/                  # Express backend
│   ├── index.js             # Server + all API routes
│   ├── db.js                # Database setup
│   └── seed.js              # Seed data script
└── package.json             # Root with concurrently
```

## API Routes

| Method | Route                          | Description                   |
|--------|--------------------------------|-------------------------------|
| POST   | `/api/auth/register/donor`     | Register a new donor          |
| POST   | `/api/auth/register/ngo`       | Register a new NGO            |
| POST   | `/api/auth/login`              | Login (donor or NGO)          |
| POST   | `/api/auth/logout`             | Logout                        |
| GET    | `/api/auth/me`                 | Get current user              |
| POST   | `/api/donations`               | Create a donation (donor)     |
| GET    | `/api/donations/available`     | Get available donations       |
| GET    | `/api/donations/mine`          | Get donor's donations         |
| PATCH  | `/api/donations/:id/status`    | Update donation status        |
| POST   | `/api/pickups`                 | Accept & schedule pickup (NGO)|
| GET    | `/api/pickups/mine`            | Get NGO's pickups             |
| PATCH  | `/api/pickups/:id/status`      | Update pickup status          |

## Pages

| Route               | Description                         |
|----------------------|-------------------------------------|
| `/`                  | Landing page                        |
| `/register`          | Registration (donor or NGO)         |
| `/login`             | Shared login                        |
| `/donor/dashboard`   | Donor's donation dashboard          |
| `/donor/new-donation`| Create new food listing             |
| `/ngo/browse`        | Browse available donations          |
| `/ngo/scheduled`     | View accepted & scheduled pickups   |
