import { useNavigate } from "react-router-dom";
import { Heart, HeartCrack } from "lucide-react";

export default function FavoriteCard({ appid, game, onRemove }) {
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
                    onRemove({ appid, game });
                }}
                className="absolute top-1 right-1 h-6 w-6 flex items-center justify-center rounded-full hover:bg-white/10 p-0.5"
            >
                {/* <Heart className="absolute inset-0 group-hover:hidden h-6  text-violet-300 rounded-full " />
                <HeartCrack className="absolute inset-0 hidden group-hover:block h-6 text-violet-300 rounded-full" /> */}
                <Heart className="h-6 fill-violet-400 text-violet-300" />
            </div>
        </div>
    );
}
