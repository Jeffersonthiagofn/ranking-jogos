import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Users, Star, Coins, Trophy } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import CompareCard from "../components/game/CompareCard";
import { scoreToStars, formatCompactNumber } from "../utils/dataChanges";

function getPercentage(value, max) {
    if (!max) return 100;
    return (value / max) * 100;
}

function ComparisonMetrics({ leftGame, rightGame }) {
    const metrics = [
        {
            label: "Jogadores ativos",
            key: "players",
        },
        {
            label: "Classificação",
            key: "rating",
        },
        {
            label: "Preço",
            key: "price",
        },
        {
            label: "Achievements",
            key: "achievements",
        },
    ];

    let leftValue = 0;
    let rightValue = 0;

    return (
        <div className="bg-[#0f172a] rounded-2xl p-6 space-y-6">
            {metrics.map((metric) => {
                if (metric.key == "players") {
                    if (leftGame) {
                        leftValue = leftGame.current_players;
                    }
                    if (rightGame) {
                        rightValue = rightGame.current_players;
                    }
                } else if (metric.key == "rating") {
                    if (leftGame) {
                        leftValue = scoreToStars(leftGame.ranking_data.score);
                    }
                    if (rightGame) {
                        rightValue = scoreToStars(rightGame.ranking_data.score);
                    }
                } else if (metric.key == "price") {
                    if (leftGame) {
                        if (leftGame.price == "Free to Play") {
                            leftValue = "Gratuito";
                        } else {
                            leftValue = parseInt(leftGame.price.replace("R$ ", ""));
                        }
                    }
                    if (rightGame) {
                        if (rightGame.price == "Free to Play") {
                            rightValue = "Gratuito";
                        } else {
                            rightValue = parseInt(rightGame.price.replace("R$ ", ""));
                        }
                    }
                } else if (metric.key == "achievements") {
                    if (leftGame) {
                        leftValue = leftGame.achievements.length;
                    }
                    if (rightGame) {
                        rightValue = rightGame.achievements.length;
                    }
                }

                const max = Math.max(leftValue, rightValue, 1);

                const leftPercent = getPercentage(leftValue, max);
                const rightPercent = getPercentage(rightValue, max);

                return (
                    <div key={metric.key} className="space-y-2">
                        <div className="flex justify-between text-sm text-white">
                            <span className="flex justify-start items-center w-32">
                                {leftValue == "Gratuito"
                                    ? leftValue
                                    : metric.key == "price"
                                      ? `R$ ${formatCompactNumber(leftValue)}`
                                      : formatCompactNumber(leftValue)}
                            </span>
                            <div className="flex flex-col items-center gap-2">
                                {metric.key == "players" ? <Users className={"h-4"} /> : <></>}
                                {metric.key == "rating" ? <Star className={"h-4"} /> : <></>}
                                {metric.key == "price" ? <Coins className={"h-4"} /> : <></>}
                                {metric.key == "achievements" ? (
                                    <Trophy className={"h-4"} />
                                ) : (
                                    <></>
                                )}
                                <span className="text-white/50">{metric.label}</span>
                            </div>
                            <span className="flex justify-end items-center w-32">
                                {rightValue == "Gratuito"
                                    ? rightValue
                                    : metric.key == "price"
                                      ? `R$ ${formatCompactNumber(rightValue)}`
                                      : formatCompactNumber(rightValue)}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            {/* esquerda */}
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-violet-500"
                                    style={{ width: `${leftPercent}%` }}
                                />
                            </div>

                            {/* direita */}
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-violet-500"
                                    style={{ width: `${rightPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
{
}

export default function Compare() {
    const location = useLocation();

    const [leftGame, setLeftGame] = useState(location.state?.leftGame || null);
    const [rightGame, setRightGame] = useState(location.state?.rightGame || null);

    return (
        <AppLayout>
            <div className="py-6 grid grid-cols-2 gap-6">
                <CompareCard game={leftGame} onSelect={setLeftGame} />

                <CompareCard game={rightGame} onSelect={setRightGame} />
            </div>
            <ComparisonMetrics leftGame={leftGame} rightGame={rightGame} />
        </AppLayout>
    );
}
