import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronRight, Heart, Sparkles, Trophy } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import GameCard from "../components/GameCard";
import { getDashboardGames } from "../services/dashboardService";

function formatNumber(value) {
    return new Intl.NumberFormat("pt-BR").format(value);
}

export default function Dashboard() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [favoriteIds, setFavoriteIds] = useState(() => {
        const saved = localStorage.getItem("dashboard-favorites");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        let mounted = true;

        async function loadGames() {
            try {
                setLoading(true);
                setError("");
                const result = await getDashboardGames(20, 0);

                if (mounted) {
                    setGames(result);
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

        loadGames();

        return () => {
            mounted = false;
        };
    }, []);

    function toggleFavorite(gameId) {
        setFavoriteIds((prev) => {
            const next = prev.includes(gameId)
                ? prev.filter((id) => id !== gameId)
                : [...prev, gameId];

            localStorage.setItem("dashboard-favorites", JSON.stringify(next));
            return next;
        });
    }

    const featuredGame = games[0] || null;
    const trendingGames = useMemo(() => games.slice(1, 5), [games]);
    const comparisonGames = useMemo(() => games.slice(0, 2), [games]);

    const stats = useMemo(() => {
        const totalGames = games.length;
        const totalAchievements = games.reduce((acc, game) => acc + game.achievementsCount, 0);
        const averageAchievements = totalGames ? Math.round(totalAchievements / totalGames) : 0;

        return {
            totalGames,
            totalAchievements,
            averageAchievements,
        };
    }, [games]);

    return (
        <AppLayout>
            <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                    <h1 className="text-5xl font-semibold leading-tight tracking-tight text-white">
                        Descubra o que
                    </h1>
                    <h2 className="mt-1 text-5xl font-semibold leading-tight tracking-tight text-violet-300">
                        o mundo está jogando
                    </h2>

                    <p className="mt-6 max-w-2xl text-sm leading-7 text-white/55">
                        Ranking global ao vivo, baseado na atividade dos jogadores em tempo real.
                        Obtenha informações detalhadas sobre os jogos que estão moldando a era
                        digital.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white hover:opacity-95">
                            Explore Rankings
                            <ChevronRight className="h-4 w-4" />
                        </button>

                        <button className="text-sm text-white/70 hover:text-white">
                            Visualizar análises
                        </button>
                    </div>

                    <div className="mt-10 grid grid-cols-3 gap-8">
                        <div>
                            <p className="text-3xl font-semibold text-white">
                                {formatNumber(stats.totalGames)}
                            </p>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/35">
                                jogos listados
                            </p>
                        </div>

                        <div>
                            <p className="text-3xl font-semibold text-white">
                                {formatNumber(stats.totalAchievements)}
                            </p>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/35">
                                achievements
                            </p>
                        </div>

                        <div>
                            <p className="text-3xl font-semibold text-white">
                                {formatNumber(stats.averageAchievements)}
                            </p>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/35">
                                média por jogo
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl bg-white/[0.03] p-6 ring-1 ring-white/10 backdrop-blur">
                    <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-white/80">
                            <Sparkles className="h-4 w-4 text-violet-300" />
                            Em alta agora
                        </div>

                        <button className="text-xs text-violet-300 hover:text-violet-200">
                            Ver tudo
                        </button>
                    </div>

                    <div className="mt-6 space-y-4">
                        {loading ? (
                            <p className="text-sm text-white/55">Carregando jogos...</p>
                        ) : error ? (
                            <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-200 ring-1 ring-red-500/20">
                                {error}
                            </div>
                        ) : trendingGames.length === 0 ? (
                            <p className="text-sm text-white/55">Nenhum jogo encontrado.</p>
                        ) : (
                            trendingGames.map((game, index) => (
                                <div
                                    key={game.id}
                                    className="flex items-center gap-4 rounded-2xl bg-black/20 px-4 py-3 ring-1 ring-white/5"
                                >
                                    <span className="w-4 text-sm text-white/45">{index + 1}</span>

                                    <img
                                        src={game.image}
                                        alt={game.name}
                                        className="h-12 w-20 rounded-lg object-cover"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-white">
                                            {game.name}
                                        </p>
                                        <p className="mt-1 text-xs text-white/45">
                                            {game.achievementsCount} achievements
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => toggleFavorite(game.id)}
                                        className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.03] ring-1 ring-white/10 hover:bg-white/[0.06]"
                                    >
                                        <Heart
                                            className={`h-4 w-4 ${
                                                favoriteIds.includes(game.id)
                                                    ? "fill-violet-400 text-violet-300"
                                                    : "text-white/60"
                                            }`}
                                        />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-6 rounded-2xl bg-gradient-to-r from-violet-500/12 to-fuchsia-500/12 p-4 ring-1 ring-violet-400/10">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-violet-200/70">
                            favoritos
                        </p>
                        <p className="mt-2 text-sm text-white/70">
                            Use o coração para montar sua lista. Depois ela pode ser exibida na tela
                            de Profile.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mt-14">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-semibold text-white">Ranking Global</h3>
                        <p className="mt-1 text-sm text-white/45">
                            O painel central com os jogos disponíveis no catálogo atual.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <p className="text-sm text-white/55">Carregando ranking...</p>
                ) : error ? (
                    <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-200 ring-1 ring-red-500/20">
                        {error}
                    </div>
                ) : featuredGame ? (
                    <div className="grid gap-6 lg:grid-cols-[1.7fr_0.8fr]">
                        <GameCard
                            game={featuredGame}
                            featured
                            isFavorite={favoriteIds.includes(featuredGame.id)}
                            onToggleFavorite={toggleFavorite}
                        />

                        <div className="space-y-4">
                            <div className="rounded-3xl bg-white/[0.03] p-5 ring-1 ring-white/10">
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-violet-300" />
                                    <h4 className="text-sm font-semibold text-white">
                                        Destaques rápidos
                                    </h4>
                                </div>

                                <div className="mt-5 space-y-4">
                                    {games.slice(0, 4).map((game, index) => (
                                        <div
                                            key={game.id}
                                            className="flex items-center gap-3 rounded-2xl bg-black/20 px-3 py-3 ring-1 ring-white/5"
                                        >
                                            <span className="w-5 text-xs text-white/45">
                                                {index + 1}
                                            </span>

                                            <img
                                                src={game.image}
                                                alt={game.name}
                                                className="h-10 w-16 rounded-lg object-cover"
                                            />

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-white">
                                                    {game.name}
                                                </p>
                                                <p className="text-xs text-white/45">
                                                    {game.achievementsCount} achievements
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-3xl bg-white/[0.03] p-5 ring-1 ring-white/10">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                                    análise semanal
                                </p>
                                <p className="mt-3 text-sm leading-7 text-white/65">
                                    O catálogo já retorna imagem e conquistas por jogo, o que
                                    permite montar cards, rankings e comparações sem depender de
                                    dados do usuário logado.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-white/55">Nenhum jogo disponível.</p>
                )}
            </section>

            <section className="mt-14">
                <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
                    <div>
                        <h3 className="text-4xl font-semibold leading-tight text-white">
                            CONFRONTO DE
                            <br />
                            <span className="text-violet-300">ANÁLISE</span>
                        </h3>

                        <p className="mt-5 max-w-md text-sm leading-7 text-white/55">
                            Coloque dois jogos frente a frente. Nesta fase, a comparação usa dados
                            públicos do catálogo; depois podemos enriquecer com mais campos do
                            GraphQL.
                        </p>

                        <button className="mt-6 rounded-xl bg-white/[0.03] px-4 py-3 text-sm text-white/75 ring-1 ring-white/10 hover:bg-white/[0.06]">
                            Acessar comparação completa
                        </button>
                    </div>

                    <div className="rounded-3xl bg-white/[0.03] p-6 ring-1 ring-white/10">
                        {comparisonGames.length >= 2 ? (
                            <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
                                <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/5">
                                    <img
                                        src={comparisonGames[0].image}
                                        alt={comparisonGames[0].name}
                                        className="h-32 w-full rounded-xl object-cover"
                                    />
                                    <p className="mt-4 text-sm font-medium text-white">
                                        {comparisonGames[0].name}
                                    </p>
                                    <p className="mt-1 text-xs text-white/45">
                                        {comparisonGames[0].achievementsCount} achievements
                                    </p>
                                </div>

                                <button className="rounded-xl bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black hover:opacity-95">
                                    Comece a comparar
                                </button>

                                <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/5">
                                    <img
                                        src={comparisonGames[1].image}
                                        alt={comparisonGames[1].name}
                                        className="h-32 w-full rounded-xl object-cover"
                                    />
                                    <p className="mt-4 text-sm font-medium text-white">
                                        {comparisonGames[1].name}
                                    </p>
                                    <p className="mt-1 text-xs text-white/45">
                                        {comparisonGames[1].achievementsCount} achievements
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-white/55">
                                Jogos insuficientes para montar comparação.
                            </p>
                        )}
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
