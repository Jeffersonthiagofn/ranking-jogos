export default function TextField({ label, icon: Icon, ...props }) {
    return (
        <div>
            <label className="text-sm text-white/70">{label}</label>
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-black/20 px-3 py-3 ring-1 ring-white/10 focus-within:ring-violet-400/50">
                {Icon ? <Icon className="h-4 w-4 text-white/50" /> : null}
                <input
                    {...props}
                    className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
                />
            </div>
        </div>
    );
}
