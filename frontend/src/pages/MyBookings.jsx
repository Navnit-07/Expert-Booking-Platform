import { useEffect, useState } from "react";
import { getBookings } from "../services/api";
import { useSocket } from "../context/SocketContext";
import LoadingSpinner from "../components/LoadingSpinner";

const statusStyles = {
    Pending: "border-[#444] bg-[#1a1a1a] text-[#aaa]",
    Confirmed: "border-[#555] bg-[#111] text-white",
    Completed: "border-[#333] bg-[#0a0a0a] text-[#666]",
};

const MyBookings = () => {
    const { socket } = useSocket();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBookings = async () => {
        try {
            const { data } = await getBookings();
            setBookings(data.data || data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();

        const handleSlotBooked = () => fetchBookings();
        socket?.on("slotBooked", handleSlotBooked);

        return () => {
            socket?.off("slotBooked", handleSlotBooked);
        };
    }, [socket]);

    if (loading) return <LoadingSpinner text="Loading your bookings…" />;

    return (
        <section className="mx-auto max-w-4xl px-6 py-12 animate-fade-in">
            <h1 className="mb-2 text-3xl font-extrabold text-white">
                My Bookings
            </h1>
            <p className="mb-10 text-[#888]">Track all your scheduled sessions.</p>

            {error && (
                <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                    {error}
                </div>
            )}

            {!error && bookings.length === 0 && (
                <div className="card p-12 text-center">
                    <div className="text-5xl mb-4">📋</div>
                    <p className="text-lg font-medium text-white">No bookings yet</p>
                    <p className="mt-1 text-sm text-[#666]">
                        Browse experts and book your first session!
                    </p>
                </div>
            )}

            {bookings.length > 0 && (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div
                            key={booking._id}
                            id={`booking-${booking._id}`}
                            className="card p-6 transition-all duration-200"
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <h3 className="truncate text-lg font-semibold text-white">
                                        {booking.expert?.name || "Expert"}
                                    </h3>
                                    <p className="mt-1 text-sm text-[#888]">
                                        📅{" "}
                                        {new Date(booking.date).toLocaleDateString("en-US", {
                                            weekday: "short",
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}{" "}
                                        · 🕐 {booking.timeSlot}
                                    </p>
                                    {booking.notes && (
                                        <p className="mt-2 text-sm text-[#555] line-clamp-1">
                                            📝 {booking.notes}
                                        </p>
                                    )}
                                </div>

                                <span
                                    className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold ${statusStyles[booking.status] || statusStyles.Pending
                                        }`}
                                >
                                    {booking.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default MyBookings;
