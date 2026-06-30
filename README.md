# SpendWise

SpendWise is a gamified, full-stack personal finance tracker that features advanced predictive analytics, personality profiling, and secure HttpOnly cookie authentication.

## Features
- **Predictive Analytics Engine:** Forecasts future spending based on a Blended Velocity model and user personas.
- **Financial Discipline Gamification:** A dynamic streak system that rewards you for staying under budget.
- **Secure Authentication:** JWT-based access tokens with an HttpOnly, secure Refresh Token architecture and silent-refresh Axios interceptors.
- **Dynamic Dashboards:** Interactive Recharts graphics with TailwindCSS styling and fully responsive dark mode.
- **Report Generation:** Download expenses as CSV or PDF.

## Tech Stack
- MongoDB Atlas
- Express
- React (Vite)
- Node.js
- Tailwind CSS

## Getting Started
1. Run `npm install` in both `frontend` and `backend`.
2. Add a `.env` file to the backend with `MONGO_URI`, `JWT_SECRET`, and `FRONTEND_URL`.
3. Start the backend: `npm run dev` in `/backend`.
4. Start the frontend: `npm run dev` in `/frontend`.
