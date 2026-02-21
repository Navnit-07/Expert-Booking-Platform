const LoadingSpinner = ({ size = "md", text = "Loading..." }) => {
    const sizes = {
        sm: "h-6 w-6 border-2",
        md: "h-10 w-10 border-[3px]",
        lg: "h-16 w-16 border-4",
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div
                className={`${sizes[size]} animate-spin rounded-full border-[#222] border-t-white`}
            />
            <p className="text-sm font-medium text-[#666]">{text}</p>
        </div>
    );
};

export default LoadingSpinner;
