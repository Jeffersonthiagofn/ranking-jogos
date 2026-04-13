import { useNavigate } from "react-router-dom";
import { formatCompactNumber } from "../utils/dataChanges";
import { Clock } from "lucide-react";

export default function TopGamesCard({ game }) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/game/${game.appid}`)}
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
                <div className="relative right-1.5 flex items-center mt-0.5">
                    <Clock className="h-3 text-white/60" />
                    <p className="text-xs font-medium text-white/60 truncate">
                        {formatCompactNumber(game.playtime_forever / 60)} h
                    </p>
                </div>
            </div>
        </div>
    );
}
