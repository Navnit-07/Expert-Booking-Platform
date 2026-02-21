import { Link } from "react-router-dom";

const ExpertCard = ({ expert }) => {
    const { _id, name, category, experience, rating, bio } = expert;

    return (
        <Link
            to={`/expert/${_id}`}
            id={`expert-card-${_id}`}
            className="group flex h-full flex-col rounded-xl border border-neutral-800 bg-neutral-900 p-8 transition-all duration-200 hover:border-white hover:shadow-lg"
        >
            <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-black text-lg font-bold">
                    {name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0">
                    <h3 className="text-xl font-semibold text-white">
                        {name}
                    </h3>
                    <span className="text-sm text-neutral-400">
                        {category}
                    </span>
                </div>
            </div>

            {bio && (
                <p className="mb-8 line-clamp-2 flex-1 text-sm leading-relaxed text-neutral-400">
                    {bio}
                </p>
            )}

            <div className="flex items-center gap-6 text-sm mt-auto pt-4 border-t border-neutral-800">
                <div className="flex items-center gap-1.5">
                    <span className="text-yellow-500">★</span>
                    <span className="font-semibold text-white">
                        {rating?.toFixed(1) || "5.0"}
                    </span>
                </div>
                <div className="text-neutral-400">
                    <span className="font-semibold text-white">{experience}</span> Years Exp
                </div>
            </div>
        </Link>
    );
};

export default ExpertCard;
