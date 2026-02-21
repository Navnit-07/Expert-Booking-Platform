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
        <header className="sticky top-0 z-50 border-b border-neutral-800 bg-black/80 backdrop-blur-md">
            <nav className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-6">

                <NavLink
                    to="/"
                    className="group flex items-center gap-3"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-black text-sm font-black transition-all duration-300 group-hover:scale-105">
                        E
                    </div>
                    <span className="text-lg font-semibold tracking-tight text-white">
                        ExpertHub
                    </span>
                </NavLink>

                <ul className="flex items-center gap-8">
                    {navLinks.map(({ to, label }) => (
                        <li key={to}>
                            <NavLink
                                to={to}
                                end={to === "/"}
                                className={({ isActive }) =>
                                    `relative text-sm font-medium transition-all duration-200 ${isActive
                                        ? "text-white"
                                        : "text-neutral-400 hover:text-white"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {label}
                                        <span
                                            className={`absolute -bottom-1 left-0 h-[2px] w-full origin-left transition-transform duration-300 ${isActive ? "scale-x-100 bg-white" : "scale-x-0"
                                                }`}
                                        />
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
                    <span
                        className={`h-2 w-2 rounded-full transition-all duration-300 ${isConnected
                            ? "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]"
                            : "bg-red-500"
                            }`}
                    />
                    <span
                        className={`${isConnected ? "text-neutral-400" : "text-red-400"
                            }`}
                    >
                        {isConnected ? "Live" : "Offline"}
                    </span>
                </div>

            </nav>
        </header>
    );
};

export default Navbar;
