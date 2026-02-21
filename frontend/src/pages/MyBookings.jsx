import { useEffect, useState, useMemo } from "react";
import { getBookings, updateBookingStatus } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link } from "react-router-dom";

const StatusBadge = ({ status }) => {
    const config = {
        Pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        Confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        Completed: "bg-green-500/10 text-green-400 border-green-500/20",
    };

    return (
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${config[status] || config.Pending}`}>
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
            setError(err.response?.data?.message || `Failed to update status to ${newStatus}.`);
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
            setError(err.response?.data?.message || "Could not retrieve bookings for this email.");
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
        <div className="card flex flex-col items-center justify-center p-16 text-center animate-fade-in">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/5 text-4xl shadow-inner">
                📅
            </div>
            <h3 className="mb-2 text-2xl font-black text-white">No Sessions Found</h3>
            <p className="max-w-xs text-sm font-medium leading-relaxed text-text-secondary">
                We couldn't find any bookings associated with <span className="text-white">{searchEmail}</span>.
            </p>
            <Link to="/book" className="mt-8 rounded-xl bg-white px-8 py-3 text-sm font-black text-black transition-all hover:scale-105 active:scale-95">
                BOOK YOUR FIRST SESSION
            </Link>
        </div>
    );

    const initialStats = (
        <div className="mx-auto max-w-md text-center py-20 animate-fade-in">
            <h1 className="text-4xl font-black tracking-tighter text-white sm:text-5xl">MY SESSIONS</h1>
            <p className="mt-4 text-lg font-medium text-text-secondary">Enter your email to manage your appointments.</p>

            <form onSubmit={handleSearch} className="mt-10 space-y-4">
                <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-surface-overlay p-5 text-center text-lg font-bold text-white outline-none transition-all placeholder:text-text-muted focus:border-white focus:ring-1 focus:ring-white/10"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-white py-5 text-sm font-black text-black transition-all hover:bg-zinc-200 disabled:opacity-50"
                >
                    {loading ? "SEARCHING..." : "ACCESS BOOKINGS"}
                </button>
            </form>
        </div>
    );

    return (
        <section className="mx-auto max-w-5xl px-6 py-12 lg:py-24">
            {!hasSearched ? initialStats : (
                <div className="animate-fade-in">
                    <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-white">YOUR SESSIONS</h1>
                            <p className="mt-2 flex items-center gap-2 text-sm font-bold text-text-secondary">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                Connected as {searchEmail}
                                <button onClick={() => setHasSearched(false)} className="ml-2 text-xs text-white underline hover:no-underline">Change</button>
                            </p>
                        </div>
                        <Link to="/book" className="flex items-center gap-3 rounded-2xl border border-border bg-surface-overlay px-6 py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-white hover:text-black hover:border-white">
                            <span>+</span> New Booking
                        </Link>
                    </div>

                    {loading ? <LoadingSpinner text="Retrieving history..." /> : (
                        <>
                            {error && (
                                <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm font-bold text-red-400">
                                    {error}
                                </div>
                            )}

                            {bookings.length === 0 ? emptyState : (
                                <div className="grid gap-6">
                                    {bookings.map((booking) => (
                                        <div key={booking._id} className="card group relative overflow-hidden p-6 transition-all hover:border-white/20 sm:p-8">
                                            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                                                {/* Left Profile/Avatar */}
                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-black text-black shadow-xl">
                                                    {(booking.expert?.name || "E").charAt(0)}
                                                </div>

                                                {/* Main Content */}
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-2 flex flex-wrap items-center gap-3">
                                                        <h3 className="text-xl font-black text-white truncate">
                                                            {booking.expert?.name || "Expert Profile"}
                                                        </h3>
                                                        <StatusBadge status={booking.status} />
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm font-bold text-text-secondary">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg">📅</span>
                                                            {new Date(booking.date).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg">🕐</span>
                                                            {booking.timeSlot}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg">📂</span>
                                                            {booking.expert?.category || "Consultation"}
                                                        </div>
                                                    </div>

                                                    {booking.notes && (
                                                        <div className="mt-4 rounded-xl bg-white/[0.03] p-3 text-xs italic text-text-muted border-l-2 border-border">
                                                            "{booking.notes}"
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex shrink-0 items-center gap-2 sm:self-center">
                                                    <div className="relative">
                                                        <select
                                                            value={booking.status}
                                                            disabled={updatingId === booking._id || booking.status === "Completed"}
                                                            onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
                                                            className={`
                                                                rounded-xl border border-border bg-surface-overlay pr-8 pl-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none transition-all
                                                                ${booking.status === "Completed" ? "cursor-not-allowed text-text-muted" : "cursor-pointer text-white hover:border-white focus:ring-1 focus:ring-white/10"}
                                                                disabled:opacity-50
                                                            `}
                                                        >
                                                            {/* Only showing options that represent forward progression (or current) */}
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
                                                            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
                                                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Subtle Shimmer Overlay on status Confirmed */}
                                            {booking.status === "Confirmed" && (
                                                <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_5s_infinite]"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </section>
    );
};

export default MyBookings;

