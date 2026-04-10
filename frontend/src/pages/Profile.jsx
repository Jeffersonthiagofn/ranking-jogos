import AppLayout from "../layouts/AppLayout";
import backgroundImg from "../assets/background-profile.png";
import profileImg from "../assets/image-profile.avif";
import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Settings } from "lucide-react";
import { formatCompactNumber } from "../utils/dataChanges";
import { getMyTopGames, getMyFavorites } from "../services/profileService";
import FavoriteCard from "../components/game/FavoriteCard";
import TopGamesCard from "../components/TopGamesCard";
import { linkSteamAccount } from "../services/authService";

function Stat({ title, value, subtitle }) {
    return (
        <div className="flex flex-col items-center justify-center">
            <p className="text-[11px] uppercase tracking-wide text-white/40">{title}</p>
            <p className="mt-1 text-lg font-semibold text-white">
                {value} {subtitle && <span className="text-sm text-white/50">{subtitle}</span>}
            </p>
        </div>
    );
}

export default function Profile() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showAllGames, setShowAllGames] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [topGames, setTopGames] = useState([]);
    const [loadingFavorites, setLoadingFavorites] = useState(true);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const playedGamesCount = user.ownedGames.reduce(
        (acc, game) => (game.playtime_forever > 0 ? acc + 1 : acc),
        0,
    );

    const playtimeForeverSum = user.ownedGames.reduce(
        (acc, game) => acc + game.playtime_forever,
        0,
    );

    const totalAchievementsSum = user.ownedGames.reduce(
        (acc, game) => acc + game.total_achievements,
        0,
    );
    const totalAchievementsSumFormated = `/${formatCompactNumber(totalAchievementsSum)}`;

    const completed_achievementsSum = user.ownedGames.reduce(
        (acc, game) => acc + game.completed_achievements,
        0,
    );

    function toggleMenu() {
        setIsMenuOpen((prev) => !prev);
    }

    async function handleLogout() {
        await logout();
        navigate("/");
    }

    if (!user) {
        return (
            <AppLayout>
                <p className="text-white">Erro ao carregar usuário</p>
            </AppLayout>
        );
    }

    async function fetchGamesProfile() {
        try {
            const dataFavorites = await getMyFavorites();
            const dataTopGames = await getMyTopGames();
            setFavorites(dataFavorites);
            setTopGames(dataTopGames);
        } catch (err) {
            console.error("Erro ao buscar os jogos da tela Profile", err);
        } finally {
            setLoadingFavorites(false);
        }
    }

    useEffect(() => {
        fetchGamesProfile();
    }, [favorites, topGames]);

    const cardsPerRow =
        window.innerWidth < 640
            ? 2
            : window.innerWidth < 1024
              ? 4
              : window.innerWidth < 1280
                ? 5
                : 6;

    const hasRemaining = favorites.length > cardsPerRow;

    const hasRemainingTopGames = topGames.length > cardsPerRow;

    const visibleFavorites = showAllGames
        ? favorites
        : hasRemaining
          ? favorites.slice(0, cardsPerRow - 1)
          : favorites;

    const visibleTopGames = showAllGames
        ? topGames
        : hasRemainingTopGames
          ? topGames.slice(0, cardsPerRow - 1)
          : topGames;

    const remainingCount = favorites.length - (cardsPerRow - 1);

    const remainingCountTopGames = topGames.length - (cardsPerRow - 1);

    return (
        <AppLayout>
            <div className="text-white">
                <div className="rounded-2xl relative h-[220px] w-full overflow-hidden rounded-b-3xl">
                    <img
                        src={backgroundImg}
                        alt="background"
                        className="absolute inset-0 h-full w-full object-fill opacity-70"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B10] via-[#0B0B10]/40 to-transparent" />

                    <div className="relative z-10 flex items-center gap-6 px-6 py-6">
                        <div className="relative">
                            <img
                                src={user.steamId ? user.avatar : profileImg}
                                alt="profile"
                                className="h-20 w-20 rounded-full ring-4 ring-violet-500/40"
                            />
                            <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-green-400 ring-2 ring-[#0B0B10]" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-green-400">● Online</span>

                            <h1 className="text-2xl font-semibold">{user.name}</h1>

                            <p className="text-sm text-white/60">Iniciante • Nível 1</p>

                            <div className="mt-2 flex items-center gap-2">
                                <button className="rounded-full bg-violet-500 px-4 py-1.5 text-xs font-medium text-white hover:opacity-90">
                                    Editar perfil
                                </button>

                                <div className="relative flex items-center gap-2">
                                    <button
                                        onClick={toggleMenu}
                                        className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center"
                                    >
                                        <Settings className="h-5" />
                                    </button>
                                    {isMenuOpen && (
                                        <div className="  rounded-xl bg-[#1b2838] shadow-lg ring-1 ring-white/10 z-50 hover:bg-red-900">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full rounded-xl px-5 py-1 text-xs text-white"
                                            >
                                                Sair
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div
                        className={`${
                            user?.steamId
                                ? ""
                                : " blur-none opacity-90 pointer-events-none select-none"
                        }`}
                    >
                        <div className="py-1 px-1 mt-6 grid gap-4 md:grid-cols-[1.5fr_0.8fr]">
                            <div className="grid grid-cols-4 gap-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                                <Stat
                                    title="Total de Jogos"
                                    value={formatCompactNumber(user.ownedGames.length)}
                                />
                                <Stat
                                    title="Jogos Jogados"
                                    value={formatCompactNumber(playedGamesCount)}
                                />
                                <Stat
                                    title="Horas Jogadas"
                                    value={formatCompactNumber(playtimeForeverSum / 60)}
                                />
                                <Stat
                                    title="Conquistas"
                                    value={formatCompactNumber(completed_achievementsSum)}
                                    subtitle={totalAchievementsSumFormated}
                                />
                            </div>

                            <div className="rounded-2xl bg-gradient-to-r from-violet-500/20 to-indigo-500/20 p-4 ring-1 ring-violet-400/20">
                                <p className="text-sm text-white/70">Nível 1</p>

                                <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                                    <div className="h-2 w-[10%] rounded-full bg-violet-400" />
                                </div>

                                <p className="mt-2 text-xs text-white/50">100 / 1,000 XP</p>
                            </div>
                        </div>
                    </div>

                    {!user?.steamId && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl">
                            <button
                                onClick={linkSteamAccount}
                                className="rounded-xl bg-violet-500 px-5 py-3 text-white font-medium hover:bg-violet-600 transition"
                            >
                                Sincronizar com a Steam
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {user.steamId ? (
                <>
                    <div className="mt-10">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-1 rounded bg-violet-500" />
                                <h2 className="text-lg font-semibold text-white">
                                    Jogos Mais Jogados
                                </h2>
                            </div>

                            {topGames.length > cardsPerRow && (
                                <button
                                    onClick={() => setShowAllGames((prev) => !prev)}
                                    className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                                >
                                    {showAllGames ? "Mostrar menos" : "Ver todos"}
                                </button>
                            )}
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {visibleTopGames.map((fav) => (
                                <TopGamesCard game={fav} />
                            ))}

                            {!showAllGames && hasRemainingTopGames && (
                                <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/40 to-violet-900/40 text-white font-semibold">
                                    +{remainingCountTopGames}
                                    <span className="block text-xs text-white/60 ml-1">
                                        outros jogos
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <></>
            )}
            <div className="mt-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-1 rounded bg-violet-500" />
                        <h2 className="text-lg font-semibold text-white">Lista de favoritos</h2>
                    </div>

                    {favorites.length > cardsPerRow && (
                        <button
                            onClick={() => setShowAllGames((prev) => !prev)}
                            className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                        >
                            {showAllGames ? "Mostrar menos" : "Ver todos"}
                        </button>
                    )}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {visibleFavorites.map((fav) => (
                        <FavoriteCard appid={fav.appid} game={fav.gameDetails} />
                    ))}

                    {!showAllGames && hasRemaining && (
                        <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/40 to-violet-900/40 text-white font-semibold">
                            +{remainingCount}
                            <span className="block text-xs text-white/60 ml-1">outros jogos</span>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
