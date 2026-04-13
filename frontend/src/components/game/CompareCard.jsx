import { Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { searchGames } from "../../services/searchService";
import { fetchGameById } from "../../services/gameService";

export default function CompareCard({ game, onSelect }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingGame, setLoadingGame] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setResults([]);
                setQuery("");
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
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
        <div className="relative h-56 rounded-2xl">
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
                {game && <img src={game.thumb} className="w-full h-full object-fill" />}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
            </div>

            <div className="relative h-full flex flex-col justify-between p-4">
                <div>
                    <div>
                        {game ? (
                            <>
                                <div className="flex justify-between">
                                    <div>
                                        <span className="text-[10px] text-white/50">
                                            Comparando agora
                                        </span>
                                        <h2 className="text-white text-lg font-semibold">
                                            {game.name}
                                        </h2>
                                        <p className="text-xs text-white/60">
                                            {game.developer || "—"}
                                        </p>
                                    </div>
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelect(null);
                                        }}
                                        className="h-5 w-5 text-red-500 flex items-center justify-center rounded-full hover:bg-white/10 p-0.5"
                                    >
                                        <X />
                                    </span>
                                </div>
                            </>
                        ) : (
                            <h2 className="text-white/50 text-sm mt-2">Escolha um game</h2>
                        )}
                    </div>
                </div>

                <div ref={ref} className="relative">
                    <div className="flex items-center gap-2 rounded-lg bg-white/[0.05] px-3 py-2 ring-1 ring-white/10 focus-within:ring-violet-400/40">
                        <Search className="h-4 w-4 text-white/40" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Pesquise o jogo..."
                            className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
                        />
                    </div>

                    {query && (
                        <div className="absolute top-12 w-full rounded-xl bg-[#0B0B10] p-2 ring-1 ring-white/10 shadow-xl z-50">
                            {loading ? (
                                <p className="p-2 text-xs text-white/50">Buscando...</p>
                            ) : results.length === 0 ? (
                                <p className="p-2 text-xs text-white/50">Nenhum jogo encontrado</p>
                            ) : (
                                results.map((g) => (
                                    <div
                                        key={g.appid}
                                        onClick={async () => {
                                            try {
                                                setLoadingGame(true);
                                                const fullGame = await fetchGameById(
                                                    parseInt(g.appid),
                                                );
                                                setLoadingGame(false);

                                                onSelect(fullGame);

                                                setQuery("");
                                                setResults([]);
                                            } catch (err) {
                                                console.error(err);
                                            }
                                        }}
                                        className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5"
                                    >
                                        <img
                                            src={g.icon}
                                            className="w-10 h-6 object-cover rounded"
                                        />
                                        <span className="text-sm text-white">{g.name}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
