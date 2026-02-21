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
            <div className="mx-auto max-w-md py-28 text-center">
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-red-400">
                    {error}
                </div>
                <Link to="/" className="mt-8 inline-block text-sm text-[#888] hover:text-white transition-colors">
                    ← Back to experts
                </Link>
            </div>
        );

    const { name, category, experience, rating, bio } = expert;

    return (
        <section className="py-20 animate-fade-in">
            {/* Breadcrumb */}
            <Link to="/" className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                <span>←</span> Back to Experts
            </Link>

            <div className="mx-auto max-w-[900px]">
                {/* Profile Header */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-10 mb-10">
                    <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white text-black text-4xl font-bold">
                            {name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <h1 className="text-5xl font-bold tracking-tight text-white">{name}</h1>
                                <div className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-black px-3 py-1">
                                    <span className="text-yellow-500">★</span>
                                    <span className="font-bold text-white">{rating?.toFixed(1) || "5.0"}</span>
                                </div>
                            </div>
                            <div className="mt-6 flex flex-wrap items-center gap-4">
                                <span className="text-lg font-medium text-neutral-400">
                                    {category}
                                </span>
                                <span className="h-1 w-1 rounded-full bg-neutral-700"></span>
                                <span className="text-lg font-medium text-neutral-400">
                                    {experience} Years Experience
                                </span>
                            </div>
                            {bio && <p className="mt-8 text-lg leading-relaxed text-neutral-400">{bio}</p>}
                        </div>
                    </div>
                </div>

                {/* Availability Section */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-10">
                    <div className="mb-10 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">Availability</h2>
                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                            Live Updates
                        </span>
                    </div>

                    {groupedSlots.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800 py-16 text-center text-neutral-400">
                            <span className="mb-4 text-3xl">🗓️</span>
                            <p className="font-medium">No slots available for this expert.</p>
                        </div>
                    ) : (
                        <div className="grid gap-8 sm:grid-cols-2">
                            {groupedSlots.map((slotGroup) => {
                                const dateObj = new Date(slotGroup.date);
                                const dateStr = dateObj.toDateString();

                                return (
                                    <div key={dateStr} className="flex flex-col gap-5 rounded-xl border border-neutral-800 bg-black p-8">
                                        <div className="flex items-center gap-3">
                                            <div className="text-neutral-400">
                                                <p className="text-sm font-bold text-white">
                                                    {dateObj.toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' })}
                                                </p>
                                                <p className="text-[10px] uppercase text-neutral-500">
                                                    {dateObj.getFullYear()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            {slotGroup.slots.map((slot) => {
                                                const slotKey = `${dateStr}-${slot}`;
                                                const isBooked = bookedSlots.includes(slotKey);

                                                return (
                                                    <div
                                                        key={slot}
                                                        className={`
                                                            rounded-lg border px-5 py-3 text-xs font-bold transition-all duration-300
                                                            ${isBooked
                                                                ? "border-red-500/20 bg-red-500/5 text-red-500 opacity-60"
                                                                : "border-neutral-800 bg-neutral-900 text-neutral-400"}
                                                        `}
                                                    >
                                                        {isBooked ? "Booked" : slot}
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

                {/* CTA Area */}
                <div className="mt-12">
                    <Link
                        to={`/book?expert=${id}`}
                        className="flex w-full items-center justify-center rounded-xl bg-white px-8 py-6 text-lg font-bold text-black transition-all hover:bg-neutral-200"
                    >
                        Book Session Now
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ExpertDetail;

