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
        <section className="mx-auto max-w-7xl px-6 py-12 animate-fade-in">
            <div className="mb-12 text-center">
                <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                    Find Your Expert
                </h1>
                <p className="mx-auto max-w-xl text-lg text-[#888]">
                    Browse top professionals, check real-time availability, and book
                    consultations instantly.
                </p>
            </div>

            <div className="mx-auto mb-10 flex max-w-3xl flex-col gap-3 sm:flex-row sm:gap-4">
                <div className="relative flex-1">
                    <svg
                        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <input
                        id="search-experts"
                        type="text"
                        placeholder="Search experts by name…"
                        value={search}
                        onChange={handleSearchChange}
                        className="w-full rounded-xl border border-[#222] bg-[#0a0a0a] py-3.5 pl-12 pr-4 text-sm text-white outline-none transition-all placeholder:text-[#555] focus:border-[#444] focus:ring-1 focus:ring-[#333]"
                    />
                </div>

                <div className="relative sm:w-52">
                    <select
                        id="category-filter"
                        value={category || "All Categories"}
                        onChange={handleCategoryChange}
                        className="w-full cursor-pointer appearance-none rounded-xl border border-[#222] bg-[#0a0a0a] py-3.5 pl-4 pr-10 text-sm text-white outline-none transition-all focus:border-[#444] focus:ring-1 focus:ring-[#333]"
                    >
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                    <svg
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </div>

            {!loading && !error && (
                <div className="mb-6 flex items-center justify-between text-sm text-[#666]">
                    <span>
                        {total === 0
                            ? "No results"
                            : `Showing ${(page - 1) * LIMIT + 1}–${Math.min(
                                page * LIMIT,
                                total
                            )} of ${total} expert${total !== 1 ? "s" : ""}`}
                    </span>
                    {(search || category) && (
                        <button
                            id="clear-filters"
                            onClick={() => {
                                setSearch("");
                                setCategory("");
                                setPage(1);
                            }}
                            className="rounded-lg border border-[#333] px-3 py-1.5 text-xs font-medium text-[#888] transition-all hover:border-[#555] hover:text-white"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            )}

            {loading && <LoadingSpinner text="Fetching experts…" />}

            {error && (
                <div className="mx-auto max-w-md rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
                    <svg
                        className="mx-auto mb-3 h-8 w-8 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p className="mb-4 text-sm text-red-400">{error}</p>
                    <button
                        id="retry-btn"
                        onClick={() => {
                            const params = { page, limit: LIMIT };
                            if (search.trim()) params.search = search.trim();
                            if (category) params.category = category;
                            fetchExperts(params);
                        }}
                        className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/20"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {!loading && !error && experts.length === 0 && (
                <div className="py-20 text-center">
                    <svg
                        className="mx-auto mb-4 h-16 w-16 text-[#333]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z"
                        />
                    </svg>
                    <p className="text-lg font-medium text-[#555]">No experts found</p>
                    <p className="mt-1 text-sm text-[#444]">
                        Try adjusting your search or filter criteria.
                    </p>
                </div>
            )}

            {!loading && !error && experts.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {experts.map((expert, i) => (
                        <div
                            key={expert._id}
                            className="animate-fade-in"
                            style={{ animationDelay: `${i * 60}ms` }}
                        >
                            <ExpertCard expert={expert} />
                        </div>
                    ))}
                </div>
            )}

            {!loading && !error && totalPages > 1 && (
                <nav
                    id="pagination"
                    className="mt-12 flex items-center justify-center gap-2"
                    aria-label="Pagination"
                >
                    <button
                        id="prev-page"
                        onClick={() => goToPage(page - 1)}
                        disabled={page === 1}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#222] bg-[#0a0a0a] text-sm text-[#888] transition-all hover:border-[#444] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-[#222] disabled:hover:text-[#888]"
                        aria-label="Previous page"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {getPageNumbers().map((p, i) =>
                        p === "..." ? (
                            <span
                                key={`dots-${i}`}
                                className="flex h-10 w-10 items-center justify-center text-sm text-[#555]"
                            >
                                …
                            </span>
                        ) : (
                            <button
                                key={p}
                                id={`page-${p}`}
                                onClick={() => goToPage(p)}
                                className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-all ${p === page
                                    ? "border-white/20 bg-white text-black"
                                    : "border-[#222] bg-[#0a0a0a] text-[#888] hover:border-[#444] hover:text-white"
                                    }`}
                                aria-current={p === page ? "page" : undefined}
                                aria-label={`Page ${p}`}
                            >
                                {p}
                            </button>
                        )
                    )}

                    <button
                        id="next-page"
                        onClick={() => goToPage(page + 1)}
                        disabled={page === totalPages}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#222] bg-[#0a0a0a] text-sm text-[#888] transition-all hover:border-[#444] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-[#222] disabled:hover:text-[#888]"
                        aria-label="Next page"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </nav>
            )}
        </section>
    );
};

export default ExpertListing;
