import { Link } from "react-router-dom";

const ExpertCard = ({ expert }) => {
    const { _id, name, category, experience, rating, bio } = expert;

    return (
        <Link
            to={`/expert/${_id}`}
            id={`expert-card-${_id}`}
            className="group card flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.04)]"
        >
            <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-black text-lg font-bold transition-transform duration-300 group-hover:scale-110">
                    {name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-white transition-colors group-hover:text-[#ccc]">
                        {name}
                    </h3>
                    <span className="inline-block rounded-full border border-[#333] px-3 py-0.5 text-xs font-medium text-[#999] transition-colors group-hover:border-[#555] group-hover:text-[#bbb]">
                        {category}
                    </span>
                </div>
            </div>

            {bio && (
                <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-[#777]">
                    {bio}
                </p>
            )}

            <div className="flex items-center gap-5 border-t border-[#1a1a1a] pt-4 text-sm">
                <div className="flex items-center gap-1.5">
                    <span className="text-yellow-500">★</span>
                    <span className="font-semibold text-white">
                        {rating?.toFixed(1) || "N/A"}
                    </span>
                </div>
                <div className="text-[#333]">|</div>
                <div className="text-[#777]">
                    <span className="font-semibold text-white">{experience}</span> yrs
                    exp
                </div>
            </div>
        </Link>
    );
};

export default ExpertCard;
