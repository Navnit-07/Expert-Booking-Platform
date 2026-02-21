import axios from "axios";

const API = axios.create({
    baseURL: "/api",
    timeout: 10_000,
    headers: { "Content-Type": "application/json" },
});

// ── Expert endpoints ──
export const getExperts = (params = {}) =>
    API.get("/experts", { params });

export const getExpertById = (id) => API.get(`/experts/${id}`);

// ── Booking endpoints ──
export const createBooking = (data) => API.post("/bookings", data);
export const getBookings = () => API.get("/bookings");
export const updateBookingStatus = (id, status) =>
    API.patch(`/bookings/${id}/status`, { status });

export default API;
