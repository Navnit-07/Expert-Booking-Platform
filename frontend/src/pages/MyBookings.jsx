import { useEffect, useState, useMemo } from "react";
import { getBookings, updateBookingStatus } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link } from "react-router-dom";

const StatusBadge = ({ status }) => {
    const config = {
        Pending: "bg-yellow-500/10 text-yellow-400",
        Confirmed: "bg-blue-500/10 text-blue-400",
        Completed: "bg-green-500/10 text-green-400",
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config[status] || config.Pending}`}>
            {status}
        </span>
    );
};

const MyBookings = () => {
    const [email, setEmail] = useState("");
    const [searchEmail, setSearchEmail] = useState("");
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleStatusUpdate = async (id, newStatus) => {
        setUpdatingId(id);
        setError(null);
        try {
            await updateBookingStatus(id, newStatus);
            setBookings((prev) =>
                prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
            );
        } catch (err) {
            setError(err.response?.data?.message || `Failed to update status.`);
        } finally {
            setUpdatingId(null);
        }
    };

    const fetchBookings = async (emailToFetch) => {
        if (!emailToFetch) return;
        setLoading(true);
        setError(null);
        try {
            const { data } = await getBookings({ email: emailToFetch });
            setBookings(data.data || data);
            setHasSearched(true);
        } catch (err) {
            setError(err.response?.data?.message || "Could not retrieve bookings.");
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (email.trim()) {
            setSearchEmail(email.trim());
            fetchBookings(email.trim());
        }
    };

    const emptyState = (
        <div className="flex flex-col items-center justify-center py-28 text-center animate-fade-in">
            <h3 className="text-2xl font-bold text-white">No Sessions Found</h3>
            <p className="mt-4 text-neutral-400">
                We couldn't find any bookings for <span className="text-white">{searchEmail}</span>.
            </p>
            <Link to="/book" className="mt-10 rounded-xl bg-white px-8 py-4 text-sm font-bold text-black transition-all hover:bg-neutral-200">
                Book Your First Session
            </Link>
        </div>
    );

    const initialStats = (
        <div className="mx-auto max-w-[500px] py-28 animate-fade-in">
            <h1 className="text-5xl font-bold tracking-tight text-white mt">My Sessions</h1>
            <p className="text-lg text-neutral-400">Enter your email to manage your appointments.</p>

            <form onSubmit={handleSearch} className="space-y-6 p">
                <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-[3em] mb rounded-xl border border-neutral-800 bg-neutral-900 p-5 text-white outline-none focus:border-white transition-all placeholder:text-neutral-600"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[2em] rounded-xl bg-white py-5 text-sm font-bold text-black transition-all hover:bg-neutral-200 disabled:opacity-50"
                >
                    {loading ? "Searching..." : "Access Bookings"}
                </button>
            </form>
        </div>
    );

    return (
        <section className="py-20">
            {!hasSearched ? initialStats : (
                <div className="animate-fade-in mx-auto max-w-[900px]">
                    <div className="mb-14 flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-5xl font-bold tracking-tight text-white">Your Sessions</h1>
                            <p className="mt-3 text-neutral-400">
                                Connected as <span className="text-white font-medium">{searchEmail}</span>
                                <button onClick={() => setHasSearched(false)} className="ml-2 text-xs text-neutral-500 underline hover:text-white">Change</button>
                            </p>
                        </div>
                        <Link to="/book" className="rounded-xl border border-neutral-800 bg-neutral-900 px-8 py-4 text-sm font-bold text-white hover:border-white transition-all">
                            New Booking
                        </Link>
                    </div>

                    {loading ? <LoadingSpinner text="Retrieving history..." /> : (
                        <div className="space-y-8 p">
                            {error && (
                                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm font-bold text-red-400">
                                    {error}
                                </div>
                            )}

                            {bookings.length === 0 ? emptyState : (
                                <div className="space-y-8">
                                    {bookings.map((booking) => (
                                        <div key={booking._id} className="mb flex flex-col justify-between items-center gap-8 rounded-xl border border-neutral-800 bg-neutral-900 p-8 transition-all hover:border-white hover:bg-neutral-800 sm:flex-row">
                                            <div className="flex flex-1 items-center gap-8 min-w-0 w-full">
                                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-xl font-bold text-black">
                                                    {(booking.expert?.name || "E").charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-semibold text-white truncate max-w-[150px] sm:max-w-none">
                                                            {booking.expert?.name || "Expert"}
                                                        </h3>
                                                        <StatusBadge status={booking.status} />
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-400">
                                                        <div className="flex items-center gap-1.5 font-medium">
                                                            <span>📅</span>
                                                            {new Date(booking.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 font-medium">
                                                            <span>�</span>
                                                            {booking.timeSlot}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 items-center sm:self-center">
                                                <div className="relative">
                                                    <select
                                                        value={booking.status}
                                                        disabled={updatingId === booking._id || booking.status === "Completed"}
                                                        onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
                                                        className={`
                                                            rounded-xl border border-neutral-800 bg-black pr-8 pl-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none transition-all
                                                            ${booking.status === "Completed" ? "cursor-not-allowed text-neutral-600" : "cursor-pointer text-white hover:border-white"}
                                                            disabled:opacity-50
                                                        `}
                                                    >
                                                        {booking.status === "Pending" && (
                                                            <>
                                                                <option value="Pending">Pending</option>
                                                                <option value="Confirmed">Confirm</option>
                                                                <option value="Completed">Complete</option>
                                                            </>
                                                        )}
                                                        {booking.status === "Confirmed" && (
                                                            <>
                                                                <option value="Confirmed">Confirmed</option>
                                                                <option value="Completed">Complete</option>
                                                            </>
                                                        )}
                                                        {booking.status === "Completed" && (
                                                            <option value="Completed">Completed</option>
                                                        )}
                                                    </select>
                                                    {updatingId === booking._id && (
                                                        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60">
                                                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default MyBookings;

