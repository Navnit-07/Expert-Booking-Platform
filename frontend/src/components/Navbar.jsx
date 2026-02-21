import { NavLink } from "react-router-dom";
import { useSocket } from "../context/SocketContext";

const navLinks = [
    { to: "/", label: "Experts" },
    { to: "/book", label: "Book" },
    { to: "/my-bookings", label: "My Bookings" },
];

const Navbar = () => {
    const { isConnected } = useSocket();

    return (
        <header className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-black/80 backdrop-blur-md">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                {/* Logo */}
                <NavLink
                    to="/"
                    id="logo-link"
                    className="group flex items-center gap-2.5 text-xl font-extrabold tracking-tight"
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black text-sm font-black transition-transform duration-300 group-hover:scale-105">
                        E
                    </span>
                    <span className="text-white">
                        ExpertHub
                    </span>
                </NavLink>

                {/* Navigation Links */}
                <ul className="flex items-center gap-1">
                    {navLinks.map(({ to, label }) => (
                        <li key={to}>
                            <NavLink
                                to={to}
                                end={to === "/"}
                                id={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                                className={({ isActive }) =>
                                    `relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${isActive
                                        ? "bg-white/10 text-white"
                                        : "text-[#888] hover:bg-white/5 hover:text-white"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {label}
                                        {isActive && (
                                            <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-white" />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                {/* Connection status */}
                <div className="flex items-center gap-2 text-xs font-medium">
                    <span
                        className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"
                            }`}
                    />
                    <span className={isConnected ? "text-[#888]" : "text-red-400"}>
                        {isConnected ? "Live" : "Offline"}
                    </span>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
