import { useEffect, useState, useCallback, useRef } from "react";
import { getExperts } from "../services/api";
import ExpertCard from "../components/ExpertCard";
import LoadingSpinner from "../components/LoadingSpinner";

const CATEGORIES = [
    "All Categories",
    "Technology",
    "Marketing",
    "Finance",
    "Design",
    "Health",
    "Legal",
    "Education",
    "Business",
];

const LIMIT = 6;

const ExpertListing = () => {
    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const debounceRef = useRef(null);

    const fetchExperts = useCallback(async (params) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await getExperts(params);
            setExperts(data.data || []);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);
            setPage(data.page || 1);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to load experts. Please try again."
            );
            setExperts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const params = { page, limit: LIMIT };
        if (search.trim()) params.search = search.trim();
        if (category) params.category = category;
        fetchExperts(params);
    }, [page, category, fetchExperts]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            setPage(1);
            const params = { page: 1, limit: LIMIT };
            if (search.trim()) params.search = search.trim();
            if (category) params.category = category;
            fetchExperts(params);
        }, 400);

        return () => clearTimeout(debounceRef.current);
    }, [search]);

    const handleCategoryChange = (e) => {
        const val = e.target.value;
        setCategory(val === "All Categories" ? "" : val);
        setPage(1);
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const goToPage = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            let start = Math.max(2, page - 1);
            let end = Math.min(totalPages - 1, page + 1);

            if (page <= 3) {
                start = 2;
                end = 4;
            } else if (page >= totalPages - 2) {
                start = totalPages - 3;
                end = totalPages - 1;
            }

            if (start > 2) pages.push("...");
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalPages - 1) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <section className="relative w-full py-8 p">

            {/* Heading */}
            <div className="mb-10 max-w-3xl">
                <h1 className="text-5xl font-bold tracking-tight text-white ">
                    Find Your Expert
                </h1>
                <p className="mt text-neutral-400 leading-relaxed mb">
                    Browse top professionals across industries and book consultations in seconds.
                </p>
            </div>

            {/* Search + Filter Card */}
            <div className="mb mt rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl p-6 shadow-lg shadow-black/20">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    {/* Search */}
                    <div className="relative w-full max-w-xl">
                        <input
                            type="text"
                            placeholder="Search experts by name..."
                            value={search}
                            onChange={handleSearchChange}
                            className="w-full rounded-2xl border border-neutral-700 bg-neutral-900/60 px-5 py-4 pl-12 text-base text-neutral-100 placeholder:text-neutral-500 backdrop-blur-md shadow-sm transition-all duration-200 outline-none hover:border-neutral-600 focus:border-white focus:bg-neutral-900 focus:ring-4 focus:ring-white/10"
                        />
                        <svg
                            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400 transition-colors duration-200 group-focus-within:text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        ></svg>
                    </div>

                    {/* Category Filter */}
                    <select
                        value={category || "All Categories"}
                        onChange={handleCategoryChange}
                        className="w-full md:w-56 rounded-xl border border-neutral-800 bg-neutral-950 py-3 px-4 text-sm text-white outline-none transition-all focus:border-white focus:ring-1 focus:ring-white/20"
                    >
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Results Info */}
            {!loading && !error && (
                <div className="mb mt flex items-center justify-between text-sm text-neutral-500">
                    <span>
                        {total === 0
                            ? "No results"
                            : `Showing ${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)} of ${total} expert${total !== 1 ? "s" : ""}`}
                    </span>

                    {(search || category) && (
                        <button
                            onClick={() => {
                                setSearch("");
                                setCategory("");
                                setPage(1);
                            }}
                            className="rounded-lg border border-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-500 transition-all hover:border-neutral-600 hover:text-white"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex justify-center py-20">
                    <LoadingSpinner text="Fetching experts..." />
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="mx-auto max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center shadow-lg shadow-red-500/5">
                    <p className="text-red-400 font-medium">{error}</p>
                    <button
                        onClick={() => {
                            const params = { page, limit: LIMIT };
                            if (search.trim()) params.search = search.trim();
                            if (category) params.category = category;
                            fetchExperts(params);
                        }}
                        className="mt-6 rounded-lg bg-red-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-red-600"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && experts.length === 0 && (
                <div className="py-20 text-center">
                    <p className="text-xl font-semibold text-neutral-600">
                        No experts found
                    </p>
                    <p className="mt-2 text-sm text-neutral-500">
                        Try adjusting your search or filter criteria.
                    </p>
                </div>
            )}

            {/* Experts Grid */}
            {!loading && !error && experts.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {experts.map((expert) => (
                        <ExpertCard key={expert._id} expert={expert} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
                <nav className="mt-12 flex items-center justify-center gap-2">
                    <button
                        onClick={() => goToPage(page - 1)}
                        disabled={page === 1}
                        className="h-10 px-4 rounded-lg border border-neutral-800 bg-neutral-900 text-sm text-neutral-400 transition-all hover:border-neutral-600 hover:text-white disabled:opacity-30"
                    >
                        Previous
                    </button>

                    {getPageNumbers().map((p, i) =>
                        p === "..." ? (
                            <span key={i} className="px-2 text-neutral-600">…</span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => goToPage(p)}
                                className={`h-10 w-10 rounded-lg border text-sm font-medium transition-all ${p === page
                                    ? "bg-white text-black border-white"
                                    : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-600 hover:text-white mt mb"
                                    }`}
                            >
                                {p}
                            </button>
                        )
                    )}

                    <button
                        onClick={() => goToPage(page + 1)}
                        disabled={page === totalPages}
                        className="h-10 px-4 rounded-lg border border-neutral-800 bg-neutral-900 text-sm text-neutral-400 transition-all hover:border-neutral-600 hover:text-white disabled:opacity-30"
                    >
                        Next
                    </button>
                </nav>
            )}
        </section>
    );
};

export default ExpertListing;
