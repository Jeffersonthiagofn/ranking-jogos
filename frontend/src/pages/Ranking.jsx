import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchFavorites, fetchGames, fetchGenres, toggleFavorite } from "../services/gameService";
import { ChevronDown, Heart, X } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import Modal from "../components/Modal";
import { AuthContext } from "../context/AuthContext";
import { formatDate } from "../utils/dataChanges";

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
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const genreRef = useRef(null);
    const sortRef = useRef(null);

    const limit = 10;
    const totalPages = Math.ceil(total / limit);

    useEffect(() => {
        fetchFavorites(setFavoriteIds);
        async function loadGenres() {
            try {
                const data = await fetchGenres();
                setGenres(data);
            } catch (err) {
                console.error("Erro ao buscar gêneros:", err);
            }
        }
        loadGenres();

        function handleClickOutside(event) {
            if (genreRef.current && !genreRef.current.contains(event.target)) {
                setOpenGenre(false);
            }

            if (sortRef.current && !sortRef.current.contains(event.target)) {
                setOpenSort(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
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
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-xl font-semibold text-white">Jogo</h1>

                        <div className="flex gap-3">
                            <div ref={genreRef} className="relative">
                                <button
                                    onClick={() => {
                                        setOpenGenre(!openGenre);
                                        setOpenSort(false);
                                    }}
                                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white ${selectedGenre !== "Gêneros" ? "bg-violet-500/20 hover:bg-[rgb(59,47,112)]" : "bg-[#1a1f2e] hover:bg-[#22283a]"}`}
                                >
                                    {selectedGenre !== "Gêneros" && (
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation();
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

                            <div ref={sortRef} className="relative">
                                <button
                                    onClick={() => {
                                        setOpenSort(!openSort);
                                        setOpenGenre(false);
                                    }}
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

                    <div className="grid grid-cols-[60px_1fr_200px_120px_60px] text-xs text-white/40 px-2 pb-3 border-b border-white/10">
                        <span>#Top</span>
                        <span>Jogo</span>
                        <span>Data de Lançamento</span>
                        <span>Preço</span>
                        <span></span>
                    </div>

                    <div className="divide-y divide-white/5">
                        {games.map((game, index) => (
                            <div
                                onClick={() => navigate(`/game/${game.appid}`)}
                                key={game.appid}
                                className="cursor-pointer grid grid-cols-[60px_1fr_200px_120px_60px] items-center py-4 px-2 hover:bg-white/5 rounded-lg transition"
                            >
                                <span className="text-violet-400 font-semibold">
                                    #{(page - 1) * limit + index + 1}
                                </span>

                                <div className="flex items-center gap-3">
                                    <img
                                        src={game.icon}
                                        alt={game.name}
                                        className=" w-44 rounded object-cover"
                                    />
                                    <span className="text-white">{game.name}</span>
                                </div>

                                <span className="text-white/60 text-sm">
                                    {formatDate(game.release_date)}
                                </span>
                                <span className="text-white text-sm">{game.price}</span>

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!user) {
                                            setIsModalOpen(true);
                                        } else {
                                            toggleFavorite?.(game.appid, setFavoriteIds);
                                        }
                                    }}
                                    className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.03] ring-1 ring-white/10 hover:bg-white/[0.06]"
                                >
                                    <Heart
                                        className={`h-4 w-4 ${
                                            favoriteIds.includes(Number(game.appid))
                                                ? "fill-violet-400 text-violet-300"
                                                : "text-white/60"
                                        }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>

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
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="text-center">
                    <h2 className="text-lg font-semibold text-white mb-2">
                        Você precisa estar logado
                    </h2>

                    <p className="text-sm text-white/60 mb-6">
                        Faça login para adicionar jogos aos favoritos.
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 rounded-lg bg-white/5 py-2 text-white hover:bg-white/10"
                        >
                            Cancelar
                        </button>

                        <button
                            onClick={() => navigate("/login")}
                            className="flex-1 rounded-lg  py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/10 hover:opacity-95 active:opacity-90"
                        >
                            Entrar
                        </button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
