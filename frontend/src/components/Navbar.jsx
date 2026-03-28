import { NavLink, useNavigate } from "react-router-dom";
import { Search, Gamepad2 } from "lucide-react";

function NavItem({ to, children }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                [
                    "text-sm transition-colors",
                    isActive ? "text-white" : "text-white/60 hover:text-white/85",
                ].join(" ")
            }
        >
            {children}
        </NavLink>
    );
}

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0B0B10]/70 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
                {/* Brand */}
                <NavItem to="/dashboard">
                    <div className="cursor-pointer flex items-center gap-2">
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
                            <Gamepad2 className="h-5 w-5 text-violet-300" />
                        </div>
                        <span className="text-sm font-semibold text-white/90">GameRank</span>
                    </div>
                </NavItem>

                {/* Links */}
                <nav className="pl-6 hidden items-center gap-6 md:flex">
                    <NavItem to="/dashboard">Painel</NavItem>
                    <NavItem to="/ranking">Ranking</NavItem>
                    <NavItem to="/comparacao">Comparação</NavItem>
                </nav>

                {/* Right */}
                <div className="ml-auto flex items-center gap-3">
                    <div className="hidden w-[360px] items-center gap-2 rounded-full bg-white/[0.04] px-4 py-2 ring-1 ring-white/10 focus-within:ring-violet-400/40 md:flex">
                        <Search className="h-4 w-4 text-white/40" />
                        <input
                            placeholder="Pesquisar"
                            className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
                        />
                    </div>

                    <button
                        type="button"
                        className="h-10 w-10 overflow-hidden rounded-full ring-1 ring-white/10 hover:ring-white/20"
                        aria-label="Perfil"
                    >
                        <div className="h-full w-full bg-gradient-to-br from-violet-500/50 to-fuchsia-500/40" />
                    </button>
                </div>
            </div>
        </header>
    );
}
