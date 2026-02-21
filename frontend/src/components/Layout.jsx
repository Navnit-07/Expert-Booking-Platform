import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => (
    <div className="flex min-h-screen flex-col bg-black selection:bg-white selection:text-black">
        <Navbar />
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-10">
            <Outlet />
        </main>
        <Footer />
    </div>
);

export default Layout;
