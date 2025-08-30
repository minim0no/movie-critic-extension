function Input({ className, type = "text", ...props }) {
    return (
        <input
            type={type}
            className={`w-full h-4 min-w-0 rounded-md py-4 text-sm bg-white placeholder:text-gray-500 selection:bg-gray-200 selection:text-gray-800 border border-transparent outline-none transition-[box-shadow,border-color] focus:ring-4 focus:ring-gray-400/50 focus:border-black disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
        />
    );
}

export default Input;
