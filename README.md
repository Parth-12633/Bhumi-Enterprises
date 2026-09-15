# Civil Contractor Ledger App

## Setup Instructions

### Backend
1. `cd backend`
2. `npm install`
3. Rename `.env.example` to `.env` and configure MongoDB URI.
4. Run `npm run build` and `npx ts-node src/seed.ts` to seed initial users (Father, Friend 1, Friend 2) with password: `password123`.
5. Run `npm run dev` to start the backend on port 5000.

### Frontend
1. `cd frontend`
2. `npm install`
3. Run `npm run dev` to start the Vite server.

The app uses React, Tailwind CSS, React Query, Express, Mongoose, and JWT authentication.
