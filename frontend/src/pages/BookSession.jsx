import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { getExperts, getExpertById, createBooking } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { useSocket } from "../context/SocketContext";

const BookSession = () => {
    const [searchParams] = useSearchParams();
    const preselectedExpertId = searchParams.get("expert");
    const navigate = useNavigate();
    const { socket } = useSocket();

    const [experts, setExperts] = useState([]);
    const [selectedExpert, setSelectedExpert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [bookedSlots, setBookedSlots] = useState([]);

    const [form, setForm] = useState({
        expert: preselectedExpertId || "",
        name: "",
        email: "",
        phone: "",
        date: "",
        timeSlot: "",
        notes: "",
    });

    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await getExperts({ limit: 100 });
                setExperts(data.data || data);
            } catch (err) {
                setError("Failed to load experts foundation.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        if (form.expert) {
            getExpertById(form.expert)
                .then(({ data }) => setSelectedExpert(data.data || data))
                .catch(() => setSelectedExpert(null));
        } else {
            setSelectedExpert(null);
        }
    }, [form.expert]);

    // Socket listener for real-time slot updates on the booking page
    useEffect(() => {
        if (!socket) return;

        const handleSlotBooked = (payload) => {
            if (payload.expertId === form.expert) {
                const slotKey = `${new Date(payload.date).toDateString()}-${payload.timeSlot}`;
                setBookedSlots(prev => [...prev, slotKey]);

                // If the user currently selected this slot, warn them
                if (form.date && new Date(form.date).toDateString() === new Date(payload.date).toDateString() && form.timeSlot === payload.timeSlot) {
                    setError("Notice: The slot you were viewing was just booked by someone else.");
                    setForm(prev => ({ ...prev, timeSlot: "" }));
                }
            }
        };

        socket.on("slotBooked", handleSlotBooked);
        return () => socket.off("slotBooked", handleSlotBooked);
    }, [socket, form.expert, form.date, form.timeSlot]);

    const validate = () => {
        const errors = {};
        if (!form.name.trim()) errors.name = "Name is required";
        if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = "Invalid email address";
        if (!form.phone.match(/^\+?[\d\s-]{10,}$/)) errors.phone = "Invalid phone number (min 10 digits)";
        if (!form.expert) errors.expert = "Please select an expert";
        if (!form.date) errors.date = "Please select a date";
        if (!form.timeSlot) errors.timeSlot = "Please select a time slot";

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        // Clear validation errors when user types
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: null }));
        }

        if (name === "expert") {
            setForm((prev) => ({ ...prev, date: "", timeSlot: "" }));
            setBookedSlots([]); // Reset booked slots for new expert
        }
        if (name === "date") {
            setForm((prev) => ({ ...prev, timeSlot: "" }));
        }
    };

    const availableDates = useMemo(() => {
        if (!selectedExpert?.availableSlots) return [];
        return selectedExpert.availableSlots.map(group => ({
            raw: group.date,
            formatted: new Date(group.date).toISOString().split("T")[0],
            display: new Date(group.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
        }));
    }, [selectedExpert]);

    const availableTimeSlots = useMemo(() => {
        if (!form.date || !selectedExpert) return [];
        const group = selectedExpert.availableSlots.find(
            (s) => new Date(s.date).toISOString().split("T")[0] === form.date
        );
        return group ? group.slots : [];
    }, [selectedExpert, form.date]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        setError(null);

        try {
            await createBooking(form);
            setSuccess(true);
            setTimeout(() => navigate("/my-bookings"), 2500);
        } catch (err) {
            const msg = err.response?.data?.message || "Booking failed. The slot may have been taken.";
            setError(msg);
            // If slot conflict, refresh expert data
            if (err.response?.status === 409) {
                getExpertById(form.expert).then(({ data }) => setSelectedExpert(data.data || data));
                setForm(prev => ({ ...prev, timeSlot: "" }));
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner text="Consulting the calendar…" />;

    if (success) {
        return (
            <section className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center animate-fade-in">
                <div className="card w-full p-12 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                    <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-white text-black text-4xl shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        ✓
                    </div>
                    <h2 className="mb-4 text-3xl font-black text-white">Booking Secured</h2>
                    <p className="text-lg leading-relaxed text-text-secondary">
                        Your session with <span className="text-white font-bold">{selectedExpert?.name}</span> has been confirmed.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <div className="h-1 w-24 overflow-hidden rounded-full bg-white/5">
                            <div className="h-full w-full origin-left bg-white animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                    <p className="mt-4 text-xs font-bold uppercase tracking-widest text-text-muted">
                        Redirecting to My Bookings...
                    </p>
                </div>
            </section>
        );
    }

    const inputClasses = (hasError) => `
        w-full rounded-xl border bg-neutral-900 py-3 px-4 text-sm text-white outline-none transition-all duration-200 
        placeholder:text-neutral-600
        ${hasError
            ? "border-red-500 focus:ring-1 focus:ring-red-500/20"
            : "border-neutral-800 focus:border-white"}
        disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const labelClasses = "mb-2 block text-xs font-bold uppercase tracking-widest text-neutral-400";

    return (
        <section className="py-16 animate-fade-in w-[100vw]">
            <div className="mb-12 text-center">
                <h1 className="text-5xl font-bold tracking-tight text-white mt">
                    Book A Session
                </h1>
                <p className="mt-2 text-lg text-neutral-400 text-center mt">
                    Secure your time with industry-leading experts.
                </p>
            </div>

            <div className="mx-auto w-full p flex justify-center item-center">
                {error && (
                    <div className="mb-8 flex items-center gap-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 mt mb">
                    {/* Expert Selection */}
                    <div className="space-y-2 mb mt">
                        <label htmlFor="expert-select" className={labelClasses}>Choose Expert</label>
                        <select
                            id="expert-select"
                            name="expert"
                            value={form.expert}
                            onChange={handleChange}
                            className={inputClasses(validationErrors.expert)}
                        >
                            <option value="">Select an expert...</option>
                            {experts.map((exp) => (
                                <option key={exp._id} value={exp._id}>
                                    {exp.name} — {exp.category}
                                </option>
                            ))}
                        </select>
                        {validationErrors.expert && <p className="text-xs text-red-500">{validationErrors.expert}</p>}
                    </div>

                    {/* Client Information */}
                    <div className="grid gap-6 md:grid-cols-2 mb mt">
                        <div className="space-y-2">
                            <label htmlFor="name-input" className={labelClasses}>Full Name</label>
                            <input
                                id="name-input"
                                name="name"
                                type="text"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={handleChange}
                                className={inputClasses(validationErrors.name)}
                            />
                            {validationErrors.name && <p className="text-xs text-red-500">{validationErrors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email-input" className={labelClasses}>Email Address</label>
                            <input
                                id="email-input"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                value={form.email}
                                onChange={handleChange}
                                className={inputClasses(validationErrors.email)}
                            />
                            {validationErrors.email && <p className="text-xs text-red-500">{validationErrors.email}</p>}
                        </div>
                    </div>

                    <div className="space-y-2 mb mt">
                        <label htmlFor="phone-input" className={labelClasses}>Phone Number</label>
                        <input
                            id="phone-input"
                            name="phone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={form.phone}
                            onChange={handleChange}
                            className={inputClasses(validationErrors.phone)}
                        />
                        {validationErrors.phone && <p className="text-xs text-red-500">{validationErrors.phone}</p>}
                    </div>

                    {/* Scheduling Section */}
                    {selectedExpert && (
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="date-select" className={labelClasses}>Available Dates</label>
                                <select
                                    id="date-select"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    className={inputClasses(validationErrors.date)}
                                >
                                    <option value="">Select date...</option>
                                    {availableDates.map((d) => (
                                        <option key={d.formatted} value={d.formatted}>{d.display}</option>
                                    ))}
                                </select>
                                {validationErrors.date && <p className="text-xs text-red-500">{validationErrors.date}</p>}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="slot-select" className={labelClasses}>Time Slots</label>
                                <select
                                    id="slot-select"
                                    name="timeSlot"
                                    value={form.timeSlot}
                                    onChange={handleChange}
                                    disabled={!form.date}
                                    className={inputClasses(validationErrors.timeSlot)}
                                >
                                    <option value="">Select slot...</option>
                                    {availableTimeSlots.map((s) => {
                                        const isTaken = bookedSlots.includes(`${new Date(form.date).toDateString()}-${s}`);
                                        return (
                                            <option key={s} value={s} disabled={isTaken}>
                                                {s} {isTaken ? "(Booked)" : ""}
                                            </option>
                                        )
                                    })}
                                </select>
                                {validationErrors.timeSlot && <p className="text-xs text-red-500">{validationErrors.timeSlot}</p>}
                            </div>
                        </div>
                    )}

                    {/* Additional Notes */}
                    <div className="space-y-2 mb mt">
                        <label htmlFor="notes-input" className={labelClasses}>Additional Notes</label>
                        <textarea
                            id="notes-input"
                            name="notes"
                            rows="4"
                            placeholder="Tell the expert about your goals..."
                            value={form.notes}
                            onChange={handleChange}
                            className={inputClasses()}
                        />
                    </div>

                    {/* Final Actions */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            id="submit-booking"
                            disabled={submitting}
                            className="w-full rounded-xl bg-white py-4 text-sm font-bold text-black transition-all hover:bg-neutral-200 disabled:opacity-50"
                        >
                            {submitting ? "Processing..." : "Confirm & Book Session"}
                        </button>

                        <p className="mt-6 text-center text-sm text-neutral-400">
                            Already have a session? <Link to="/my-bookings" className="text-white hover:underline">Manage your bookings</Link>
                        </p>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default BookSession;

