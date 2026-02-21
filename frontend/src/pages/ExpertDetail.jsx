import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { getExpertById } from "../services/api";
import { useSocket } from "../context/SocketContext";
import { joinExpertRoom, leaveExpertRoom } from "../services/socket";
import LoadingSpinner from "../components/LoadingSpinner";

const ExpertDetail = () => {
    const { id } = useParams();
    const { socket } = useSocket();
    const [expert, setExpert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookedSlots, setBookedSlots] = useState([]); // Local track of slots booked in this session

    useEffect(() => {
        const fetchExpert = async () => {
            try {
                const { data } = await getExpertById(id);
                setExpert(data.data || data);
            } catch (err) {
                setError(err.response?.data?.message || "Expert not found");
            } finally {
                setLoading(false);
            }
        };

        fetchExpert();
        joinExpertRoom(id);

        return () => {
            leaveExpertRoom(id);
        };
    }, [id]);

    useEffect(() => {
        if (!socket) return;

        const handleSlotBooked = (payload) => {
            // Check if the booking is for this expert
            if (payload.expertId === id) {
                // Add to bookedSlots to disable it visually
                const slotId = `${new Date(payload.date).toDateString()}-${payload.timeSlot}`;
                setBookedSlots((prev) => [...prev, slotId]);

                // Remove the slot from the local expert state after a short delay (or immediately)
                // "remove slot in real time"
                setTimeout(() => {
                    setExpert((prevExpert) => {
                        if (!prevExpert) return prevExpert;
                        const updatedAvailableSlots = prevExpert.availableSlots.map((group) => {
                            const groupDate = new Date(group.date).toDateString();
                            const payloadDate = new Date(payload.date).toDateString();

                            if (groupDate === payloadDate) {
                                return {
                                    ...group,
                                    slots: group.slots.filter((s) => s !== payload.timeSlot),
                                };
                            }
                            return group;
                        }).filter(group => group.slots.length > 0);

                        return { ...prevExpert, availableSlots: updatedAvailableSlots };
                    });
                }, 2000); // 2 second delay to show "Booked" state before removal
            }
        };

        socket.on("slotBooked", handleSlotBooked);

        return () => {
            socket.off("slotBooked", handleSlotBooked);
        };
    }, [id, socket]);

    // Grouping slots by date (in case they aren't perfectly grouped from backend)
    const groupedSlots = useMemo(() => {
        if (!expert?.availableSlots) return [];

        // Ensure slots are unique and grouped by date string
        const groups = {};
        expert.availableSlots.forEach(group => {
            const dateStr = new Date(group.date).toDateString();
            if (!groups[dateStr]) {
                groups[dateStr] = {
                    date: group.date,
                    slots: new Set()
                };
            }
            group.slots.forEach(s => groups[dateStr].slots.add(s));
        });

        return Object.values(groups).map(g => ({
            date: g.date,
            slots: Array.from(g.slots).sort()
        })).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [expert]);

    if (loading) return <LoadingSpinner text="Expert profile taking shape…" />;

    if (error)
        return (
            <div className="mx-auto max-w-md py-20 text-center">
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-400">
                    {error}
                </div>
                <Link to="/" className="mt-6 inline-block text-sm text-[#888] hover:text-white transition-colors">
                    ← Back to experts
                </Link>
            </div>
        );

    const { name, category, experience, rating, bio } = expert;

    return (
        <section className="mx-auto max-w-4xl px-4 py-12 animate-fade-in sm:px-6">
            {/* Breadcrumb */}
            <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-white transition-colors">
                <span className="text-lg">←</span> Back to Experts
            </Link>

            {/* Profile Header */}
            <div className="card p-6 mb-8 sm:p-10">
                <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white text-black text-4xl font-black shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                        {name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <h1 className="text-4xl font-black tracking-tight text-white">{name}</h1>
                            <div className="flex items-center gap-1.5 rounded-lg bg-surface-overlay px-3 py-1 border border-border">
                                <span className="text-yellow-500">★</span>
                                <span className="font-bold">{rating?.toFixed(1) || "5.0"}</span>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-white/5 border border-white/10 px-4 py-1 text-xs font-bold uppercase tracking-wider text-text-secondary">
                                {category}
                            </span>
                            <span className="text-sm font-medium text-text-muted">
                                {experience} Years Experience
                            </span>
                        </div>
                        {bio && <p className="mt-6 text-lg leading-relaxed text-text-secondary max-w-2xl">{bio}</p>}
                    </div>
                </div>
            </div>

            {/* Availability Section */}
            <div className="grid gap-8 lg:grid-cols-1">
                <div className="card p-6 sm:p-10">
                    <div className="mb-8 flex items-center justify-between">
                        <h2 className="text-2xl font-black text-white">Availability</h2>
                        <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
                            Live Updates On
                        </span>
                    </div>

                    {groupedSlots.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
                            <span className="mb-3 text-3xl">🗓️</span>
                            <p className="font-medium text-text-muted">No slots available for this expert.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2">
                            {groupedSlots.map((slotGroup) => {
                                const dateObj = new Date(slotGroup.date);
                                const dateStr = dateObj.toDateString();

                                return (
                                    <div key={dateStr} className="flex flex-col gap-4 rounded-2xl bg-surface-overlay p-6 border border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-lg">
                                                📅
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white">
                                                    {dateObj.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </p>
                                                <p className="text-[10px] font-bold uppercase tracking-tighter text-text-muted">
                                                    {dateObj.getFullYear()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {slotGroup.slots.map((slot) => {
                                                const slotKey = `${dateStr}-${slot}`;
                                                const isBooked = bookedSlots.includes(slotKey);

                                                return (
                                                    <div
                                                        key={slot}
                                                        className={`
                                                            group relative flex items-center justify-center rounded-xl border px-4 py-2.5 text-xs font-bold transition-all duration-300
                                                            ${isBooked
                                                                ? "border-red-500/50 bg-red-500/10 text-red-400 cursor-not-allowed opacity-70"
                                                                : "border-border bg-surface hover:border-white hover:bg-white hover:text-black cursor-default text-text-secondary"}
                                                        `}
                                                    >
                                                        {isBooked ? (
                                                            <span className="flex items-center gap-1.5 animate-pulse">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                                                                Booked
                                                            </span>
                                                        ) : slot}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Sticky CTA Area */}
                <div className="mt-8 flex justify-center">
                    <Link
                        to={`/book?expert=${id}`}
                        id="book-now-btn"
                        className="group relative flex w-full max-w-md items-center justify-center gap-3 overflow-hidden rounded-2xl bg-white px-8 py-5 text-lg font-black text-black transition-all hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(255,255,255,0.15)] active:scale-95"
                    >
                        <span className="relative z-10">BOOK SESSION NOW</span>
                        <span className="relative z-10 text-2xl transition-transform group-hover:translate-x-1">→</span>
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full"></div>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ExpertDetail;

