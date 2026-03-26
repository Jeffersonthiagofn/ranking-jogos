export default function GradientButton({ children, ...props }) {
    return (
        <button
            {...props}
            className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/10 hover:opacity-95 active:opacity-90"
        >
            {children}
        </button>
    );
}
