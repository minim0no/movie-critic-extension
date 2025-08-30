function IconButton({ icon, label, onClick, focus }) {
    return (
        <button
            className={`bg-white ${
                focus ? "text-red-500" : "text-stone-800"
            }  flex flex-1 items-center whitespace-nowrap gap-2 cursor-pointer hover:text-red-500 font-bold`}
            onClick={onClick}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

export default IconButton;
