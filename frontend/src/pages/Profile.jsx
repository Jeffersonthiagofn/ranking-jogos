import AppLayout from "../layouts/AppLayout";
import { backgrounds } from "../utils/imagesBg";
import profileImg from "../assets/img-profile/image-profile.avif";
import { useEffect, useContext, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { formatCompactNumber } from "../utils/dataChanges";
import { getMyTopGames, getMyFavorites } from "../services/profileService";
import FavoriteCard from "../components/game/FavoriteCard";
import TopGamesCard from "../components/TopGamesCard";
import { linkSteamAccount } from "../services/authService";
import { toggleFavorite } from "../services/gameService";
import Modal from "../components/Modal";

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
    const [showAllTopGames, setShowAllTopGames] = useState(false);
    const [showAllFavoriteGames, setShowAllFavoriteGames] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [topGames, setTopGames] = useState([]);
    const [loadingFavorites, setLoadingFavorites] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);
    const [currentBg, setCurrentBg] = useState(backgrounds[0]);
    const [selectedBg, setSelectedBg] = useState(backgrounds[0]);

    const dropdownRef = useRef(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
                setSelectedBg(currentBg);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [currentBg]);

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

    async function handleConfirmRemove() {
        if (!selectedGame) return;

        await toggleFavorite(selectedGame.appid, setFavorites);

        setIsModalOpen(false);
        setSelectedGame(null);
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

    const visibleFavorites = showAllFavoriteGames
        ? favorites
        : hasRemaining
          ? favorites.slice(0, cardsPerRow - 1)
          : favorites;

    const visibleTopGames = showAllTopGames
        ? topGames
        : hasRemainingTopGames
          ? topGames.slice(0, cardsPerRow - 1)
          : topGames;

    const remainingCount = favorites.length - (cardsPerRow - 1);

    const remainingCountTopGames = topGames.length - (cardsPerRow - 1);

    const percentBar = ((user.steamXp * 100) / (user.steamXp + user.steamXpNeeded)).toFixed(1);

    function categoryLevel() {
        if (!user || user.steamLevel == 1) return "Iniciante";
        if (user.steamLevel <= 10) return "Aprendiz";
        if (user.steamLevel <= 20) return "Veterano";
        if (user.steamLevel <= 30) return "Mestre";
        if (user.steamLevel > 30) return "Lendário";
    }

    return (
        <AppLayout>
            <div className="text-white">
                <div className="rounded-2xl relative h-[220px] w-full overflow-hidden rounded-b-3xl">
                    <img
                        src={currentBg.image}
                        alt="background"
                        className="absolute inset-0 h-full w-full object-cover opacity-70"
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

                            <p className="text-sm text-white/60">
                                {categoryLevel()} • Nível {user.steamLevel}
                            </p>

                            <div className="mt-2 flex items-center gap-2">
                                <button
                                    onClick={() => setIsOpen((prev) => !prev)}
                                    className="rounded-full bg-violet-500 px-4 py-1.5 text-xs font-medium text-white hover:opacity-90"
                                >
                                    Editar perfil
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    {isOpen && (
                        <div
                            ref={dropdownRef}
                            className="absolute -bottom-[3.4rem] mt-3 w-2/3 rounded-2xl bg-[#0B0B10] p-4 ring-1 ring-white/10 shadow-xl z-50"
                        >
                            <p className="text-sm text-white mb-4">Escolha seu plano de fundo</p>

                            <div className="grid grid-cols-3 gap-4">
                                {backgrounds.map((bg) => (
                                    <div
                                        key={bg.name}
                                        onClick={() => setSelectedBg(bg)}
                                        className={`cursor-pointer rounded-lg overflow-hidden ring-2 transition ${
                                            selectedBg.name === bg.name
                                                ? "ring-violet-500"
                                                : "ring-transparent hover:ring-white/20"
                                        }`}
                                    >
                                        <img src={bg.image} className="w-full h-14 object-cover" />
                                    </div>
                                ))}
                            </div>

                            {/* BOTÕES */}
                            <div className="flex justify-end gap-3 mt-5">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        setSelectedBg(currentBg);
                                    }}
                                    className="rounded-lg bg-white/5 py-2 px-3 text-white hover:bg-white/10"
                                >
                                    Cancelar
                                </button>

                                <button
                                    disabled={selectedBg.name === currentBg.name}
                                    onClick={() => {
                                        setCurrentBg(selectedBg);
                                        setIsOpen(false);
                                    }}
                                    className={`rounded-lg py-2 px-3 text-white ${
                                        selectedBg.name === currentBg.name
                                            ? "bg-white/10 cursor-not-allowed"
                                            : "bg-violet-500 hover:bg-violet-600"
                                    }`}
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    )}
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
                                <p className="text-sm text-white/70">Nível {user.steamLevel}</p>

                                <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                                    <div
                                        className="h-2 rounded-full bg-violet-400"
                                        style={{ width: `${percentBar}%` }}
                                    />
                                </div>

                                <p className="mt-2 text-xs text-white/50">
                                    {user.steamXp} / {user.steamXp + user.steamXpNeeded} XP
                                </p>
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
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-1 rounded bg-violet-500" />
                                <h2 className="text-lg font-semibold text-white">
                                    Jogos Mais Jogados
                                </h2>
                            </div>

                            {topGames.length > cardsPerRow && (
                                <button
                                    onClick={() => setShowAllTopGames((prev) => !prev)}
                                    className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                                >
                                    {showAllTopGames ? "Mostrar menos" : "Ver todos"}
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {visibleTopGames.map((fav) => (
                                <TopGamesCard game={fav} />
                            ))}

                            {!showAllTopGames && hasRemainingTopGames && (
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
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-1 rounded bg-violet-500" />
                        <h2 className="text-lg font-semibold text-white">Lista de favoritos</h2>
                    </div>

                    {favorites.length > cardsPerRow && (
                        <button
                            onClick={() => setShowAllFavoriteGames((prev) => !prev)}
                            className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                        >
                            {showAllFavoriteGames ? "Mostrar menos" : "Ver todos"}
                        </button>
                    )}
                </div>

                {visibleFavorites.length == 0 ? (
                    <h2 className="w-[21rem] flex justify-center  rounded-xl text-sm font-semibold text-white/50 bg-white/[0.03] p-3 ring-1 ring-white/10">
                        Lista Vazia. Adicione jogos ao seus favoritos
                    </h2>
                ) : (
                    <></>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {visibleFavorites.map((fav) => (
                        <FavoriteCard
                            appid={fav.appid}
                            game={fav.gameDetails}
                            onRemove={(gameData) => {
                                setSelectedGame(gameData);
                                setIsModalOpen(true);
                            }}
                        />
                    ))}

                    {!showAllFavoriteGames && hasRemaining && (
                        <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/40 to-violet-900/40 text-white font-semibold">
                            +{remainingCount}
                            <span className="block text-xs text-white/60 ml-1">outros jogos</span>
                        </div>
                    )}
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        onClick={() => setIsModalOpen(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <div className="relative z-10 w-full max-w-sm rounded-2xl bg-[#1b2838] p-6 ring-1 ring-white/10 shadow-xl">
                        <h2 className="text-white text-lg font-semibold mb-2">
                            Remover dos favoritos
                        </h2>

                        <p className="text-sm text-white/60 mb-6">
                            Tem certeza que deseja remover{" "}
                            <span className="text-white font-medium">
                                {selectedGame?.game?.name}
                            </span>{" "}
                            da sua lista de favoritos?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 rounded-lg bg-white/5 py-2 text-white hover:bg-white/10"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={handleConfirmRemove}
                                className="flex-1 rounded-lg bg-red-500 py-2 text-white hover:bg-red-600"
                            >
                                Remover
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
