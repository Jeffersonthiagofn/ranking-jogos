import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Heart, Sparkles, Users, BarChart3 } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import GameCard from "../components/GameCard";
import { getDashboardGames } from "../services/dashboardService";
import { formatCompactNumber, formatNumber } from "../utils/dataChanges";

export default function Dashboard() {
    const [mostPopularGames, setMostPopularGames] = useState([]);
    const [totalGames, setTotalGames] = useState(0);
    const [totalActivePlayers, setTotalActivePlayers] = useState(0);
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
                console.log(result);
                if (mounted) {
                    setMostPopularGames(result.games);
                    setTotalGames(result.totalGames);
                    setTotalActivePlayers(result.totalActivePlayers);
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

    const featuredGame = mostPopularGames[0] || null;
    const trendingGames = mostPopularGames.slice(1, 5);

    function toggleFavorite(gameId) {
        setFavoriteIds((prev) => {
            const next = prev.includes(gameId)
                ? prev.filter((id) => id !== gameId)
                : [...prev, gameId];

            localStorage.setItem("dashboard-favorites", JSON.stringify(next));
            return next;
        });
    }

    const sortedByScore = useMemo(() => {
        return [...mostPopularGames].sort((a, b) => (b.score || 0) - (a.score || 0));
    }, [mostPopularGames]);

    const comparisonGames = sortedByScore.slice(0, 2);

    return (
        <AppLayout>
            <section className="grid gap-10 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.15),transparent_65%)]" />
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
                    </div>

                    <div className="mt-10 grid grid-cols-3 gap-8">
                        <div>
                            <p className="text-3xl font-semibold text-white">
                                {formatCompactNumber(totalGames)}
                            </p>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/35">
                                Total de Jogos
                            </p>
                        </div>

                        <div>
                            <p className="text-3xl font-semibold text-white">
                                {formatCompactNumber(totalActivePlayers)}
                            </p>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/35">
                                jogadores ativos
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-14">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-semibold text-white">Ranking Global</h3>
                        <p className="mt-1 text-sm text-white/45">
                            O painel central com os jogos mais relevantes do catálogo atual.
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
                    <div className="grid gap-6 xl:grid-cols-[1.65fr_0.85fr]">
                        <GameCard
                            game={featuredGame}
                            featured
                            rank={1}
                            isFavorite={favoriteIds.includes(featuredGame.id)}
                            onToggleFavorite={toggleFavorite}
                        />

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
                                {trendingGames.length === 0 ? (
                                    <p className="text-sm text-white/55">Nenhum jogo encontrado.</p>
                                ) : (
                                    trendingGames.map((game, index) => (
                                        <div
                                            key={game.id}
                                            className="flex items-center gap-4 rounded-2xl bg-black/20 px-4 py-3 ring-1 ring-white/5"
                                        >
                                            <span className="w-4 text-sm text-white/45">
                                                {index + 2}
                                            </span>

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
                                                    {game.genres?.[0] || "Sem gênero"}
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
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-white/55">Nenhum jogo disponível.</p>
                )}
            </section>

            <section className="mt-14">
                <div className="grid gap-8 xl:grid-cols-[0.7fr_1.3fr]">
                    <div>
                        <h3 className="text-4xl font-semibold leading-tight text-white">
                            CONFRONTO DE
                            <br />
                            <span className="text-violet-300">ANÁLISE</span>
                        </h3>

                        <p className="mt-5 max-w-md text-sm leading-7 text-white/55">
                            Coloque dois jogos frente a frente. Nesta fase, a comparação usa score,
                            jogadores ativos e achievements para destacar diferenças.
                        </p>

                        <button className="mt-6 rounded-xl bg-white/[0.03] px-4 py-3 text-sm text-white/75 ring-1 ring-white/10 hover:bg-white/[0.06]">
                            Acessar comparação completa
                        </button>
                    </div>

                    <div className="rounded-3xl bg-white/[0.03] p-6 ring-1 ring-white/10">
                        {comparisonGames.length >= 2 ? (
                            <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
                                <div
                                    key={comparisonGames[0].id}
                                    className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/5"
                                >
                                    <img
                                        src={comparisonGames[0].image}
                                        alt={comparisonGames[0].name}
                                        className="h-32 w-full rounded-xl object-cover"
                                    />
                                    <p className="mt-4 text-lg font-medium text-white">
                                        {comparisonGames[0].name}
                                    </p>

                                    <div className="mt-3 space-y-1 text-xs text-white/50">
                                        <p>{comparisonGames[0].developer || 0}</p>
                                    </div>
                                </div>

                                <button className="rounded-xl bg-white px-2 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-black hover:opacity-95">
                                    Comparar
                                </button>

                                <div
                                    key={comparisonGames[1].id}
                                    className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/5"
                                >
                                    <img
                                        src={comparisonGames[1].image}
                                        alt={comparisonGames[1].name}
                                        className="h-32 w-full rounded-xl object-cover"
                                    />
                                    <p className="mt-4 text-lg font-medium text-white">
                                        {comparisonGames[1].name}
                                    </p>

                                    <div className="mt-3 space-y-1 text-xs text-white/50">
                                        <p>{comparisonGames[1].developer || 0}</p>
                                    </div>
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

            <section className="mt-14 grid gap-6 md:grid-cols-3">
                <div className="rounded-3xl bg-white/[0.03] p-5 ring-1 ring-white/10">
                    <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-violet-300" />
                        <h4 className="text-sm font-semibold text-white">
                            Telemetria em tempo real
                        </h4>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-white/55">
                        Fluxos de dados globais sem latência, diretamente dos jogos para o catálogo.
                    </p>
                </div>

                <div className="rounded-3xl bg-white/[0.03] p-5 ring-1 ring-white/10">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="h-4 w-4 text-violet-300" />
                        <h4 className="text-sm font-semibold text-white">Tendências preditivas</h4>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-white/55">
                        Visualize score, engajamento e popularidade para entender o impacto de cada
                        jogo.
                    </p>
                </div>

                <div className="rounded-3xl bg-white/[0.03] p-5 ring-1 ring-white/10">
                    <div className="flex items-center gap-3">
                        <Sparkles className="h-4 w-4 text-violet-300" />
                        <h4 className="text-sm font-semibold text-white">
                            Sincronização multiplataforma
                        </h4>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-white/55">
                        Estrutura pronta para conectar biblioteca, favoritos e perfil do usuário no
                        próximo passo.
                    </p>
                </div>
            </section>
        </AppLayout>
    );
}
