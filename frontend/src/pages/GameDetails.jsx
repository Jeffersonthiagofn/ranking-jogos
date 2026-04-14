import AppLayout from "../layouts/AppLayout";
import { useParams, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { getGameDetails } from "../services/gameDetailsService";
import { CodeXml, Calendar, Heart, Star } from "lucide-react";
import { formatDate, scoreToStars } from "../utils/dataChanges";
import Achievements from "../components/game/Achievements";
import Modal from "../components/Modal";
import { AuthContext } from "../context/AuthContext";
import { fetchFavorites, toggleFavorite } from "../services/gameService";

export default function GameDetails() {
    const { appid } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [favoriteIds, setFavoriteIds] = useState([]);

    useEffect(() => {
        fetchFavorites(setFavoriteIds);
    }, []);

    useEffect(() => {
        let mounted = true;
        async function loadGame() {
            try {
                setLoading(true);
                setGame(null);

                const result = await getGameDetails(appid);
                if (mounted) {
                    setGame(result);
                }
            } catch (err) {
                if (mounted) {
                    setError(err.message || "Erro ao carregar jogos.");
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadGame();
        return () => {
            mounted = false;
        };
    }, [appid]);

    if (loading) return <AppLayout></AppLayout>;
    if (error)
        return (
            <AppLayout>
                <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-200 ring-1 ring-red-500/20">
                    {error}
                </div>
            </AppLayout>
        );
    if (!game)
        return (
            <AppLayout>
                <p className="text-4xl text-white/55">Jogo não encontrado.</p>
            </AppLayout>
        );

    return (
        <AppLayout>
            <div className=" pb-12 text-white">
                <div className="grid gap-10 lg:grid-cols-[240px_1fr] items-start">
                    <div>
                        <img
                            src={game.cover}
                            alt={game.name}
                            className="w-full max-w-[240px] rounded-2xl shadow-2xl "
                        />
                    </div>

                    <div className="flex flex-col justify-center gap-1">
                        <div className="flex items-center gap-2">
                            {game.genres?.slice(0, 2).map((genre, index) => (
                                <span
                                    key={index}
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                        index === 0
                                            ? "bg-violet-500/20 text-violet-300"
                                            : "bg-white/10 text-white/60"
                                    }`}
                                >
                                    {genre}
                                </span>
                            ))}
                        </div>

                        <h1 className="mt-4 text-6xl font-bold leading-tight">{game.name}</h1>

                        <div className="mt-3 flex flex-wrap items-center gap-6 text-sm text-white/60">
                            <div className="flex items-center gap-2 text-sm text-white/80">
                                <CodeXml className={`h-4 w-4 transition-colors "text-white/75"`} />
                                <span>{game.developer}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/80">
                                <Calendar className={`h-4 w-4 transition-colors "text-white/75"`} />
                                <span>Lançamento: {formatDate(game.release_date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/80">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{scoreToStars(game.ranking_data?.score)}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-5">
                            <div className="text-lg font-semibold text-white">
                                {game.is_free ? "Free to Play" : game.price || "—"}
                            </div>

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
                                className="flex px-4 py-2 items-center gap-2 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 hover:bg-white/[0.06]"
                            >
                                <span className=" text-sm text-white/80">
                                    {favoriteIds.includes(Number(game.appid))
                                        ? "Remover dos"
                                        : "Adicionar aos"}{" "}
                                    Favoritos
                                </span>
                                <Heart
                                    className={`h-4 w-4 ${
                                        favoriteIds.includes(Number(game.appid))
                                            ? "fill-violet-400 text-violet-300"
                                            : "text-white/60"
                                    }`}
                                />
                            </button>

                            <button
                                onClick={() => {
                                    navigate("/compare", {
                                        state: {
                                            leftGame: game,
                                        },
                                    });
                                }}
                                className="rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-2 text-sm font-medium text-white shadow-lg hover:opacity-90"
                            >
                                Compare
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <section className="pb-12 text-white">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-1 rounded bg-violet-500" />
                    <h2 className="text-lg font-semibold">Descrição</h2>
                </div>

                <div className="mt-4 rounded-2xl bg-white/[0.03] p-6 text-sm leading-relaxed text-white/70 ring-1 ring-white/10">
                    {game.description}
                </div>

                <Achievements achievements={game.achievements} />
            </section>
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
