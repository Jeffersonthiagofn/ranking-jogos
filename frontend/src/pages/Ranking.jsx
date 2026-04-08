import { useEffect, useState } from "react";
import { fetchGames, fetchGenres } from "../services/gameService";
import AppLayout from "../layouts/AppLayout";
import { ChevronDown, Heart, X } from "lucide-react";

const mockGames = [
    {
        appid: 1,
        name: "Stardew Valley",
        price: "R$ 12,49",
        release_date: "26 Fev. de 2016",
        thumb: "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/capsule_231x87.jpg",
    },
    {
        appid: 2,
        name: "CS2",
        price: "Gratuito",
        release_date: "27 Set. de 2023",
        thumb: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/capsule_231x87.jpg",
    },
    {
        appid: 3,
        name: "Elden Ring",
        price: "R$ 199,50",
        release_date: "25 Fev. de 2022",
        thumb: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/capsule_231x87.jpg",
    },
    {
        appid: 4,
        name: "Palworld",
        price: "R$ 125,00",
        release_date: "19 Jan. de 2024",
        thumb: "https://cdn.cloudflare.steamstatic.com/steam/apps/1623730/capsule_231x87.jpg",
    },
    {
        appid: 5,
        name: "Cyberpunk 2077",
        price: "R$ 199,90",
        release_date: "10 Dez. de 2020",
        thumb: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/capsule_231x87.jpg",
    },
];

const sortMap = {
    "Mais populares": "popular",
    "Mais jogadores": "players",
    Lançamento: "release",
    "Maior preço": "price_desc",
    "Menor preço": "price_asc",
};

const sortOptions = [
    "Mais populares",
    "Mais jogadores",
    "Lançamento",
    "Maior preço",
    "Menor preço",
];

export default function Ranking() {
    const [genres, setGenres] = useState([]);
    const [games, setGames] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [selectedGenre, setSelectedGenre] = useState("Gêneros");
    const [selectedSort, setSelectedSort] = useState("Mais populares");
    const [openGenre, setOpenGenre] = useState(false);
    const [openSort, setOpenSort] = useState(false);

    const limit = 10;
    const totalPages = Math.ceil(total / limit);

    useEffect(() => {
        async function loadGenres() {
            try {
                const data = await fetchGenres();
                setGenres(data);
            } catch (err) {
                console.error("Erro ao buscar gêneros:", err);
            }
        }

        loadGenres();
    }, []);

    useEffect(() => {
        async function loadGames() {
            try {
                const data = await fetchGames({
                    genre: selectedGenre,
                    sort: sortMap[selectedSort],
                    page,
                });

                setGames(data.games);
                setTotal(data.total);
            } catch (err) {
                console.error(err);
            }
        }

        loadGames();
    }, [selectedGenre, selectedSort, page]);

    function getVisiblePages(current, total) {
        const maxVisible = 5;

        let start = Math.max(1, current - 2);
        let end = start + maxVisible - 1;

        if (end > total) {
            end = total;
            start = Math.max(1, end - maxVisible + 1);
        }

        const pages = [];

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return {
            pages,
            hasMore: end < total,
        };
    }

    const { pages, hasMore } = getVisiblePages(page, totalPages);

    return (
        <AppLayout>
            <div className="p-6">
                <div className="rounded-2xl bg-gradient-to-b from-[#0b0f1a] to-[#070a12] p-6 shadow-xl">
                    {/* HEADER */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-xl font-semibold text-white">Jogo</h1>

                        <div className="flex gap-3">
                            {/* GENRES DROPDOWN */}
                            <div className="relative">
                                <button
                                    onClick={() => setOpenGenre(!openGenre)}
                                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white ${selectedGenre !== "Gêneros" ? "bg-violet-500/20 hover:bg-[rgb(59,47,112)]" : "bg-[#1a1f2e] hover:bg-[#22283a]"}`}
                                >
                                    {/* Se tiver filtro ativo, mostra X */}
                                    {selectedGenre !== "Gêneros" && (
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation(); // 🔥 impede abrir dropdown
                                                setSelectedGenre("Gêneros");
                                                setPage(1);
                                            }}
                                            className="text-red-500 flex items-center justify-center rounded-full hover:bg-white/10 p-0.5"
                                        >
                                            <X size={15} />
                                        </span>
                                    )}

                                    {selectedGenre}
                                    <ChevronDown size={16} />
                                </button>

                                {openGenre && (
                                    <div className="absolute right-0 mt-2 w-40 max-h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-violet-500/40 scrollbar-track-transparent hover:scrollbar-thumb-violet-500/70 rounded-xl bg-[#1b2838] shadow-lg ring-1 ring-white/10 z-50">
                                        {genres.map((genre) => (
                                            <button
                                                key={genre}
                                                onClick={() => {
                                                    setSelectedGenre(genre);
                                                    setPage(1);
                                                    setOpenGenre(false);
                                                }}
                                                className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10"
                                            >
                                                {genre}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* SORT DROPDOWN */}
                            <div className="relative">
                                <button
                                    onClick={() => setOpenSort(!openSort)}
                                    className="flex items-center gap-2 rounded-lg bg-violet-500/20 px-4 py-2 text-sm text-white hover:bg-[rgb(59,47,112)]"
                                >
                                    {selectedSort}
                                    <ChevronDown size={16} />
                                </button>
                                {openSort && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#1b2838] shadow-lg ring-1 ring-white/10 z-50">
                                        {sortOptions.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => {
                                                    setSelectedSort(option);
                                                    setPage(1);
                                                    setOpenSort(false);
                                                }}
                                                className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10"
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* TABLE HEADER */}
                    <div className="grid grid-cols-[60px_1fr_200px_120px_60px] text-xs text-white/40 px-2 pb-3 border-b border-white/10">
                        <span>#Top</span>
                        <span>Jogo</span>
                        <span>Data de Lançamento</span>
                        <span>Preço</span>
                        <span></span>
                    </div>

                    {/* LIST */}
                    <div className="divide-y divide-white/5">
                        {games.map((game, index) => (
                            <div
                                key={game.appid}
                                className="grid grid-cols-[60px_1fr_200px_120px_60px] items-center py-4 px-2 hover:bg-white/5 rounded-lg transition"
                            >
                                <span className="text-violet-400 font-semibold">#{index + 1}</span>

                                <div className="flex items-center gap-3">
                                    <img
                                        src={game.icon}
                                        alt={game.name}
                                        className=" w-44 rounded object-cover"
                                    />
                                    <span className="text-white">{game.name}</span>
                                </div>

                                <span className="text-white/60 text-sm">{game.release_date}</span>
                                <span className="text-white text-sm">{game.price}</span>

                                <button className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10">
                                    <Heart size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* PAGINATION */}
                    <div className="flex items-center justify-between mt-6 text-sm text-white/60">
                        <div className="flex items-center gap-2">
                            {pages.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`px-3 py-1 rounded ${
                                        p === page
                                            ? "bg-violet-500 text-white"
                                            : "bg-white/5 hover:bg-white/10"
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}

                            {hasMore && <span className="px-2 text-white/40">...</span>}
                        </div>

                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((prev) => prev - 1)}
                                className="px-4 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50"
                            >
                                Anterior
                            </button>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage((prev) => prev + 1)}
                                className="px-4 py-1 rounded bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-50"
                            >
                                Próxima
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
