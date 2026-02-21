import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getExperts, getExpertById, createBooking } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

const BookSession = () => {
    const [searchParams] = useSearchParams();
    const preselectedExpertId = searchParams.get("expert");
    const navigate = useNavigate();

    const [experts, setExperts] = useState([]);
    const [selectedExpert, setSelectedExpert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        expert: preselectedExpertId || "",
        name: "",
        email: "",
        phone: "",
        date: "",
        timeSlot: "",
        notes: "",
    });

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await getExperts();
                setExperts(data.data || data);
            } catch {
                setError("Failed to load experts");
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (name === "expert") {
            setForm((prev) => ({ ...prev, date: "", timeSlot: "" }));
        }
        if (name === "date") {
            setForm((prev) => ({ ...prev, timeSlot: "" }));
        }
    };

    const availableDates =
        selectedExpert?.availableSlots?.map((s) =>
            new Date(s.date).toISOString().split("T")[0]
        ) || [];

    const availableTimeSlots =
        selectedExpert?.availableSlots?.find(
            (s) => new Date(s.date).toISOString().split("T")[0] === form.date
        )?.slots || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            await createBooking(form);
            setSuccess(true);
            setTimeout(() => navigate("/my-bookings"), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Booking failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner text="Preparing booking form…" />;

    if (success) {
        return (
            <section className="mx-auto max-w-lg px-6 py-20 text-center animate-fade-in">
                <div className="card p-10">
                    <div className="mb-4 text-5xl">✓</div>
                    <h2 className="mb-2 text-2xl font-bold text-white">Booking Confirmed!</h2>
                    <p className="text-[#888]">Redirecting to your bookings…</p>
                </div>
            </section>
        );
    }

    const inputClasses =
        "w-full rounded-xl border border-[#222] bg-[#0a0a0a] py-3 px-4 text-sm text-white outline-none transition-all placeholder:text-[#555] focus:border-[#444] focus:ring-1 focus:ring-[#333]";

    return (
        <section className="mx-auto max-w-2xl px-6 py-12 animate-fade-in">
            <h1 className="mb-2 text-3xl font-extrabold text-white">
                Book a Session
            </h1>
            <p className="mb-10 text-[#888]">
                Fill in your details and pick an available slot.
            </p>

            {error && (
                <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="card p-8 space-y-6">
                {/* Expert select */}
                <div>
                    <label htmlFor="expert-select" className="mb-2 block text-sm font-medium text-[#ccc]">
                        Expert
                    </label>
                    <select
                        id="expert-select"
                        name="expert"
                        value={form.expert}
                        onChange={handleChange}
                        required
                        className={inputClasses}
                    >
                        <option value="">Select an expert</option>
                        {experts.map((exp) => (
                            <option key={exp._id} value={exp._id}>
                                {exp.name} — {exp.category}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Client info */}
                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="name-input" className="mb-2 block text-sm font-medium text-[#ccc]">Name</label>
                        <input id="name-input" name="name" type="text" required placeholder="Your full name" value={form.name} onChange={handleChange} className={inputClasses} />
                    </div>
                    <div>
                        <label htmlFor="email-input" className="mb-2 block text-sm font-medium text-[#ccc]">Email</label>
                        <input id="email-input" name="email" type="email" required placeholder="you@example.com" value={form.email} onChange={handleChange} className={inputClasses} />
                    </div>
                </div>

                <div>
                    <label htmlFor="phone-input" className="mb-2 block text-sm font-medium text-[#ccc]">Phone</label>
                    <input id="phone-input" name="phone" type="tel" required placeholder="+1 234 567 890" value={form.phone} onChange={handleChange} className={inputClasses} />
                </div>

                {/* Date & Time */}
                {selectedExpert && (
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                            <label htmlFor="date-select" className="mb-2 block text-sm font-medium text-[#ccc]">Date</label>
                            <select id="date-select" name="date" value={form.date} onChange={handleChange} required className={inputClasses}>
                                <option value="">Select a date</option>
                                {availableDates.map((d) => (
                                    <option key={d} value={d}>
                                        {new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="slot-select" className="mb-2 block text-sm font-medium text-[#ccc]">Time Slot</label>
                            <select id="slot-select" name="timeSlot" value={form.timeSlot} onChange={handleChange} required disabled={!form.date} className={inputClasses}>
                                <option value="">Select a slot</option>
                                {availableTimeSlots.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Notes */}
                <div>
                    <label htmlFor="notes-input" className="mb-2 block text-sm font-medium text-[#ccc]">Notes (optional)</label>
                    <textarea id="notes-input" name="notes" rows="3" placeholder="Anything you'd like the expert to know…" value={form.notes} onChange={handleChange} className={inputClasses} />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    id="submit-booking"
                    disabled={submitting}
                    className="w-full rounded-xl bg-white py-3.5 font-semibold text-black transition-all duration-200 hover:bg-[#e0e0e0] active:bg-[#ccc] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {submitting ? "Booking…" : "Confirm Booking"}
                </button>
            </form>
        </section>
    );
};

export default BookSession;
