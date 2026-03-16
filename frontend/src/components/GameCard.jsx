import { Heart, Trophy } from "lucide-react";

export default function GameCard({ game, isFavorite = false, onToggleFavorite, featured = false }) {
    if (!game) return null;

    return (
        <div
            className={`group overflow-hidden rounded-3xl bg-white/[0.03] ring-1 ring-white/10 transition-all duration-300 hover:bg-white/[0.05] hover:ring-white/15 ${
                featured ? "min-h-[420px]" : "min-h-[320px]"
            }`}
        >
            <div className="relative h-full">
                <img
                    src={game.image}
                    alt={game.name}
                    className={`w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
                        featured ? "h-[420px]" : "h-[320px]"
                    }`}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#08080d] via-[#08080d]/35 to-transparent" />

                <div className="absolute right-4 top-4">
                    <button
                        type="button"
                        onClick={() => onToggleFavorite?.(game.id)}
                        className="grid h-10 w-10 place-items-center rounded-full bg-black/30 backdrop-blur ring-1 ring-white/10 hover:bg-black/45"
                    >
                        <Heart
                            className={`h-4 w-4 transition-colors ${
                                isFavorite ? "fill-violet-400 text-violet-300" : "text-white/75"
                            }`}
                        />
                    </button>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="flex items-center gap-2 text-xs text-white/60">
                        <span className="rounded-md bg-violet-500/80 px-2 py-1 font-semibold uppercase tracking-[0.15em] text-white">
                            App {game.appid}
                        </span>
                    </div>

                    <h3
                        className={`mt-3 font-semibold leading-tight text-white ${
                            featured ? "text-3xl" : "text-xl"
                        }`}
                    >
                        {game.name}
                    </h3>

                    <div className="mt-4 flex items-center gap-4 text-sm text-white/70">
                        <div className="inline-flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-violet-300" />
                            <span>{game.achievementsCount} achievements</span>
                        </div>
                    </div>

                    {featured ? (
                        <div className="mt-5 flex flex-wrap gap-3">
                            <button className="rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95">
                                Comparar
                            </button>
                            <button className="rounded-xl bg-white/[0.05] px-4 py-2.5 text-sm text-white/80 ring-1 ring-white/10 hover:bg-white/[0.08]">
                                Visão geral
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
