import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { toggleFavorite } from "../../services/gameService";

export default function FavoriteCard({ appid, game, setFavorites }) {
    const navigate = useNavigate();
    if (!game) return null;

    return (
        <div
            onClick={() => navigate(`/game/${appid}`)}
            className="cursor-pointer group relative overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/10 hover:ring-white/20 transition-all"
        >
            <img
                src={game.cover}
                alt={game.name}
                className="  object-fill group-hover:scale-105 transition-transform"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-2 left-2 right-2">
                <p className="text-sm font-medium text-white truncate">{game.name}</p>
            </div>
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(appid, setFavorites);
                }}
                className="absolute top-1 right-0.5 h-6 w-6 text-red-500 flex items-center justify-center rounded-full hover:bg-white/10 p-0.5"
            >
                <Trash2 className="h-4" />
            </div>
        </div>
    );
}
