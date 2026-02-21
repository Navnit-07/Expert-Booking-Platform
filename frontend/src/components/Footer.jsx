const Footer = () => (
    <footer className="border-t border-[#1a1a1a] bg-black py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 text-center">
            <p className="text-sm font-medium text-[#666]">
                Built with React + Vite
            </p>
            <p className="text-xs text-[#444]">
                &copy; {new Date().getFullYear()} ExpertHub. All rights reserved.
            </p>
        </div>
    </footer>
);

export default Footer;
