import { useEffect, useState } from "react";
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

        const handleSlotUpdate = (payload) => {
            if (payload.expertId === id) {
                getExpertById(id).then(({ data }) => setExpert(data.data || data));
            }
        };
        socket?.on("expertSlotUpdate", handleSlotUpdate);

        return () => {
            leaveExpertRoom(id);
            socket?.off("expertSlotUpdate", handleSlotUpdate);
        };
    }, [id, socket]);

    if (loading) return <LoadingSpinner text="Loading expert profile…" />;
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

    const { name, category, experience, rating, bio, availableSlots } = expert;

    return (
        <section className="mx-auto max-w-4xl px-6 py-12 animate-fade-in">
            {/* Breadcrumb */}
            <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-[#888] hover:text-white transition-colors">
                ← Back to experts
            </Link>

            {/* Profile Header */}
            <div className="card p-8 mb-8">
                <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-black text-3xl font-bold">
                        {name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-extrabold text-white">{name}</h1>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                            <span className="rounded-full border border-[#333] px-4 py-1 text-sm font-medium text-[#999]">
                                {category}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-[#888]">
                                ★ {rating?.toFixed(1) || "N/A"}
                            </span>
                            <span className="text-sm text-[#666]">{experience} years experience</span>
                        </div>
                        {bio && <p className="mt-4 leading-relaxed text-[#888]">{bio}</p>}
                    </div>
                </div>
            </div>

            {/* Available Slots */}
            <div className="card p-8 mb-8">
                <h2 className="mb-6 text-xl font-bold text-white">Available Slots</h2>
                {!availableSlots || availableSlots.length === 0 ? (
                    <p className="text-sm text-[#555]">No slots available at the moment.</p>
                ) : (
                    <div className="space-y-6">
                        {availableSlots.map((slotGroup, idx) => (
                            <div key={idx} className="rounded-xl bg-[#0a0a0a] p-5 border border-[#1a1a1a]">
                                <p className="mb-3 text-sm font-semibold text-[#ccc]">
                                    📅 {new Date(slotGroup.date).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {slotGroup.slots.map((slot) => (
                                        <span
                                            key={slot}
                                            className="rounded-lg border border-[#333] bg-[#111] px-3 py-1.5 text-xs font-medium text-[#ccc] transition-colors hover:bg-[#1a1a1a] hover:text-white"
                                        >
                                            {slot}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Book CTA */}
            <div className="text-center">
                <Link
                    to={`/book?expert=${id}`}
                    id="book-cta"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 font-semibold text-black transition-all duration-200 hover:bg-[#e0e0e0] active:bg-[#ccc]"
                >
                    Book a Session
                    <span className="text-lg">→</span>
                </Link>
            </div>
        </section>
    );
};

export default ExpertDetail;
