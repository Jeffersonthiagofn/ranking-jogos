import { NavLink, useNavigate } from "react-router-dom";
import { Search, Gamepad2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { searchGames } from "../services/searchService";

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

function SearchItem({ game }) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/game/${game.appid}`)}
            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5"
        >
            {/* imagem */}
            <img src={game.thumb} alt={game.name} className="h-10 w-16 rounded-lg object-cover" />

            {/* info */}
            <div className="flex flex-col min-w-0">
                <span className="truncate text-sm text-white">{game.name}</span>
                <span className="text-xs text-white/50">
                    {game.is_free ? "Free to Play" : game.price || "—"}
                </span>
            </div>
        </div>
    );
}

export default function Navbar() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setResults([]);
                setQuery("");
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const delay = setTimeout(async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            try {
                setLoading(true);
                const data = await searchGames(query);
                setResults(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 300); // debounce

        return () => clearTimeout(delay);
    }, [query]);

    return (
        <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0B0B10]/70 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
                {/* Brand */}
                <NavItem to="/dashboard">
                    <div className="cursor-pointer flex items-center gap-2">
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
                            {/* <Gamepad2 className="h-5 w-5 text-violet-300" /> */}
                            <img className="h-6" src="/icon-gamerank.svg" alt="" />
                        </div>
                        <span className="text-sm font-semibold text-white/90">GameRank</span>
                    </div>
                </NavItem>

                {/* Links */}
                <nav className="pl-6 hidden items-center gap-6 md:flex">
                    <NavItem to="/dashboard">Painel</NavItem>
                    <NavItem to="/ranking">Ranking</NavItem>
                    <NavItem to="/compare">Comparação</NavItem>
                </nav>

                {/* Right */}
                <div className="ml-auto flex items-center gap-3">
                    <div ref={searchRef} className="relative hidden w-[360px] md:flex flex-col">
                        {/* Input */}
                        <div className="flex items-center gap-2 rounded-full bg-white/[0.04] px-4 py-2 ring-1 ring-white/10 focus-within:ring-violet-400/40">
                            <Search className="h-4 w-4 text-white/40" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Pesquisar"
                                className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
                            />
                        </div>

                        {/* Dropdown */}
                        {query && (
                            <div className="absolute top-12 w-full rounded-2xl bg-[#0B0B10] p-2 ring-1 ring-white/10 shadow-xl z-50">
                                {loading ? (
                                    <p className="p-3 text-xs text-white/50">Buscando...</p>
                                ) : results.length === 0 ? (
                                    <p className="p-3 text-xs text-white/50">
                                        Nenhum jogo encontrado
                                    </p>
                                ) : (
                                    results.map((game) => (
                                        <SearchItem key={game.appid} game={game} />
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <NavItem to="/profile">
                        <button
                            type="button"
                            className="h-10 w-10 overflow-hidden rounded-full ring-1 ring-white/10 hover:ring-white/20"
                            aria-label="Perfil"
                        >
                            <div className="h-full w-full bg-gradient-to-br from-violet-500/50 to-fuchsia-500/40" />
                        </button>
                    </NavItem>
                </div>
            </div>
        </header>
    );
}
