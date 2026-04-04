import { Star, Heart, Users } from "lucide-react";
import { formatCompactNumber, scoreToStars } from "../../utils/dataChanges";
import { useNavigate } from "react-router-dom";

export default function GameCardFeatured({
    game,
    favoriteIds,
    onToggleFavorite,
    featured = false,
    rank = 1,
}) {
    if (!game) return null;

    const navigate = useNavigate();

    function handleNavigate() {
        navigate(`/game/${game.appid}`, {
            state: { game },
        });
    }

    return (
        <div
            onClick={handleNavigate}
            className={`cursor-pointer group overflow-hidden rounded-3xl bg-white/[0.03] ring-1 ring-white/10 transition-all duration-300 hover:bg-white/[0.05] hover:ring-white/15 ${
                featured ? "min-h-[430px]" : "min-h-[360px]"
            }`}
        >
            <div className="relative h-full">
                <img
                    src={game.image}
                    alt={game.name}
                    className={`w-full object-fill transition-transform duration-500 group-hover:scale-[1.03] ${
                        featured ? "h-[430px]" : "h-[240px]"
                    }`}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#08080d] via-[#08080d]/25 to-transparent" />

                <div className="absolute right-4 top-4">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite?.(game.appid);
                        }}
                        className="grid h-10 w-10 place-items-center rounded-full bg-black/30 backdrop-blur ring-1 ring-white/10 hover:bg-black/45"
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

                <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="flex items-center gap-2 text-xs text-white/60">
                        <p className="inline-flex items-center gap-2 rounded-full bg-violet-500/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                            RANK #{rank}
                        </p>
                    </div>

                    <h3
                        className={`mt-3 font-semibold leading-tight text-white ${
                            featured ? "text-4xl" : "text-xl"
                        }`}
                    >
                        {game.name}
                    </h3>

                    <p className="mt-2 text-sm text-white/55">
                        {game.developer || "Desenvolvedor desconhecido"}
                    </p>

                    <div className="mt-4 flex justify-between flex-wrap gap-4 text-sm text-white/70">
                        <div className="flex gap-4">
                            <div className="inline-flex items-center gap-2">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{scoreToStars(game.score)} classificação global</span>
                            </div>

                            <div className="inline-flex items-center gap-2">
                                <Users className="h-4 w-4 text-violet-300" />
                                <span>{formatCompactNumber(game.currentPlayers)} jogadores</span>
                            </div>
                        </div>
                        {featured ? (
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                    className="rounded-2xl bg-violet-500 px-5 py-3 text-sm font-medium text-white"
                                >
                                    Comparar
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
