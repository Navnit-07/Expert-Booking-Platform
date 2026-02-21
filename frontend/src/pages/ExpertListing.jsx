import { useEffect, useState } from "react";
import { getExperts } from "../services/api";
import ExpertCard from "../components/ExpertCard";
import LoadingSpinner from "../components/LoadingSpinner";

const ExpertListing = () => {
    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchExperts = async () => {
            try {
                const { data } = await getExperts();
                setExperts(data.data || data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load experts");
            } finally {
                setLoading(false);
            }
        };
        fetchExperts();
    }, []);

    const filtered = experts.filter(
        (e) =>
            e.name?.toLowerCase().includes(search.toLowerCase()) ||
            e.category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <section className="mx-auto max-w-7xl px-6 py-12 animate-fade-in">
            {/* Hero */}
            <div className="mb-12 text-center">
                <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                    Find Your Expert
                </h1>
                <p className="mx-auto max-w-xl text-lg text-[#888]">
                    Browse top professionals, check real-time availability, and book
                    consultations instantly.
                </p>
            </div>

            {/* Search */}
            <div className="relative mx-auto mb-10 max-w-lg">
                <input
                    id="search-experts"
                    type="text"
                    placeholder="Search by name or category…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-[#222] bg-[#0a0a0a] py-3.5 pl-12 pr-4 text-sm text-white outline-none transition-all placeholder:text-[#555] focus:border-[#444] focus:ring-1 focus:ring-[#333]"
                />
            </div>

            {/* Content */}
            {loading && <LoadingSpinner text="Fetching experts…" />}

            {error && (
                <div className="mx-auto max-w-md rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-center text-sm text-red-400">
                    {error}
                </div>
            )}

            {!loading && !error && filtered.length === 0 && (
                <p className="py-20 text-center text-[#555]">
                    No experts found. Try a different search.
                </p>
            )}

            {!loading && !error && filtered.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((expert) => (
                        <ExpertCard key={expert._id} expert={expert} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default ExpertListing;
