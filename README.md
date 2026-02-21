# Expert Booking Platform

A production-ready, real-time platform for scheduling sessions with industry experts. Built with a high-end dark aesthetic, synchronous socket-driven updates, and a robust Node.js/React architecture.

---

## Key Features

- **Live Availability**: Slots update in real-time across all connected clients using Socket.io.
- **Expert Profiles**: Detailed views with experience, ratings, and categorized availability.
- **Secure Booking**: Multi-step validation, conflict prevention, and session management.
- **My Bookings**: Email-authenticated lookups to track appointment history and statuses.
- **Premium UI**: Ultra-dark theme with shimmering animations, liquid transitions, and responsive design.

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Socket.io-client, Axios.
- **Backend**: Node.js, Express, MongoDB/Mongoose, Socket.io.
- **DevOps**: Environment-driven configurations, Static build serving.

---

## Local Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or on Atlas)

### 2. Clone and Install
```bash
# Install dependencies for both projects
npm run install:all
```

### 3. Environment Variables
Create `.env` files in both the `backend` and `frontend` directories based on the `.env.example` templates provided.

**Backend (.env):**
```env
PORT=5000
MONGO_URI=your_mongodb_uri
NODE_ENV=development
```

**Frontend (.env):**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## Running Identically

### Development Mode
Runs both backend (nodemon) and frontend (vite) concurrently.
```bash
npm run dev
```

### Production Build & Launch
Compile the frontend and serve it through the Node.js backend.
```bash
# 1. Build frontend
npm run build

# 2. Set environment to production and start
# (Windows Example)
set NODE_ENV=production && npm start
```

---

## Project Structure

- `backend/`: Express server, socket handlers, and Mongoose models.
- `frontend/`: React application, design system, and API services.
- `frontend/dist/`: Compiled production assets (generated after `npm run build`).

---

## Testing
- **Real-time**: Open two browser windows on an Expert Detail page. Book a slot in one; watch it pulse and disappear in the other instantly.
- **Validation**: Attempt to book without an email or with an invalid phone format.
- **Conflicts**: Attempt to book the same slot simultaneously from two different browsers.
