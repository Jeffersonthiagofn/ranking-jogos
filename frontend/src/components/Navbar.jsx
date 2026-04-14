import { NavLink, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useState, useEffect, useRef, useContext } from "react";
import { searchGames } from "../services/searchService";
import { AuthContext } from "../context/AuthContext";
import profileImg from "../assets/img-profile/image-profile.avif";

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
            <img src={game.icon} alt={game.name} className="max-w-32 rounded-lg object-fill" />

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
    const { user, logout } = useContext(AuthContext);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const profileRef = useRef(null);
    const searchRef = useRef(null);

    async function handleLogout() {
        await logout();
        navigate("/");
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setResults([]);
                setQuery("");
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsMenuOpen(false);
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
        }, 300);

        return () => clearTimeout(delay);
    }, [query]);

    return (
        <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0B0B10]/70 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
                <NavItem to="/">
                    <div className="cursor-pointer flex items-center gap-2">
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
                            <img className="h-6" src="/icon-gamerank.svg" alt="" />
                        </div>
                        <span className="text-sm font-semibold text-white/90">GameRank</span>
                    </div>
                </NavItem>

                <nav className="pl-6 hidden items-center gap-6 md:flex">
                    <NavItem to="/">Painel</NavItem>
                    <NavItem to="/ranking">Ranking</NavItem>
                    <NavItem to="/compare">Comparação</NavItem>
                </nav>

                <div className="ml-auto flex items-center gap-3">
                    <div ref={searchRef} className="relative hidden w-[380px] md:flex flex-col">
                        <div className="flex items-center gap-2 rounded-full bg-white/[0.04] px-4 py-2 ring-1 ring-white/10 focus-within:ring-violet-400/40">
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Pesquisar jogo"
                                className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
                            />
                            <Search className="h-4 w-4 text-white/40" />
                        </div>

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
                    {user ? (
                        <div ref={profileRef} className="relative">
                            <button
                                onClick={() => setIsMenuOpen((prev) => !prev)}
                                className="h-10 w-10 overflow-hidden rounded-full ring-1 ring-white/10 hover:ring-white/20"
                            >
                                <img
                                    src={user.steamId ? user.avatar : profileImg}
                                    alt="profile"
                                    className="rounded-full"
                                />
                            </button>

                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-[#1b2838] shadow-lg ring-1 ring-white/10 z-50 overflow-hidden">
                                    <button
                                        onClick={() => {
                                            navigate("/profile");
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10"
                                    >
                                        Meu perfil
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                                    >
                                        Sair
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <NavItem to="/login">
                            <button className="py-2 px-4 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/10 hover:opacity-95 active:opacity-90">
                                Entrar
                            </button>
                        </NavItem>
                    )}
                </div>
            </div>
        </header>
    );
}
