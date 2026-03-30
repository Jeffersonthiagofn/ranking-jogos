import { useState } from "react";
import { Trophy } from "lucide-react";

function getCategory(percentage) {
    if (percentage <= 5) return "Lendário";
    if (percentage <= 15) return "Épico";
    if (percentage <= 30) return "Raro";
    return "Comum";
}

function getCategoryStyle(category) {
    switch (category) {
        case "Lendário":
            return "bg-yellow-500/20 text-yellow-300";
        case "Épico":
            return "bg-purple-500/20 text-purple-300";
        case "Raro":
            return "bg-blue-500/20 text-blue-300";
        default:
            return "bg-white/10 text-white/60";
    }
}

export default function Achievements({ achievements = [] }) {
    const [showAll, setShowAll] = useState(false);

    const sorted = [...achievements].sort(
        (a, b) => a.completion_percentage - b.completion_percentage,
    );

    const visibleAchievements = showAll ? sorted : sorted.slice(0, 6);

    if (achievements.length == 0) {
        return (
            <div className="mt-10 ">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-400" />
                        <h3 className="text-sm font-semibold text-white">Conquistas do jogo</h3>
                    </div>
                    <span className="mt-10 text-xl text-white/70">Nenhuma Conquista Listada</span>
                </div>
            </div>
        );
    } else {
        return (
            <div className="mt-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-400" />
                        <h3 className="text-sm font-semibold text-white">Conquistas do jogo</h3>
                    </div>

                    {achievements.length > 4 && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="text-xs text-violet-400 hover:text-violet-300"
                        >
                            {showAll
                                ? "Mostrar menos"
                                : `Ver todas as ${achievements.length} conquistas`}
                        </button>
                    )}
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {visibleAchievements.map((ach, index) => {
                        const category = getCategory(ach.completion_percentage);

                        return (
                            <div
                                key={index}
                                className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/10"
                            >
                                <div className="flex items-start justify-between">
                                    <img
                                        src={ach.icon}
                                        alt={ach.name}
                                        className="h-10 w-10 rounded-lg object-cover"
                                    />

                                    <span
                                        className={`rounded-full px-2 py-1 text-[10px] font-medium ${getCategoryStyle(
                                            category,
                                        )}`}
                                    >
                                        {category}
                                    </span>
                                </div>

                                <h4 className="mt-4 text-sm font-semibold text-white">
                                    {ach.name}
                                </h4>

                                <p className="mt-1 text-xs text-white/60">{ach.description}</p>

                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-[10px] text-white/50">
                                        <span>% de todos os jogadores</span>
                                        <span>{ach.completion_percentage}%</span>
                                    </div>

                                    <div className="mt-1 h-1.5 w-full rounded-full bg-white/10">
                                        <div
                                            className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                                            style={{
                                                width: `${ach.completion_percentage}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}
