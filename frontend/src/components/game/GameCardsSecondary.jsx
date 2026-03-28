import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GameCardsSecondary({ game, index, favoriteIds, toggleFavorite }) {
    const navigate = useNavigate();

    function handleNavigate() {
        navigate(`/game/${game.appid}`, {
            state: { game },
        });
    }

    return (
        <div
            onClick={handleNavigate}
            key={game.id}
            className="cursor-pointer flex items-center gap-4 rounded-2xl bg-black/20 px-4 py-3 ring-1 ring-white/5"
        >
            <span className="w-4 text-sm text-white/45">{index + 2}</span>

            <img src={game.image} alt={game.name} className="h-12 w-20 rounded-lg object-cover" />

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{game.name}</p>
                <p className="mt-1 text-xs text-white/45">{game.genres?.[0] || "Sem gênero"}</p>
            </div>

            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite?.(game.id);
                }}
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
    );
}
