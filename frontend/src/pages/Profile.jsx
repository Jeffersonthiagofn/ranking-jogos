import AppLayout from "../layouts/AppLayout";
import profileImg from "../assets/image-profile.avif";
import backgroundImg from "../assets/background-profile.png";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Settings } from "lucide-react";

function Stat({ title, value, subtitle }) {
    return (
        <div>
            <p className="text-[11px] uppercase tracking-wide text-white/40">{title}</p>
            <p className="mt-1 text-lg font-semibold text-white">
                {value} {subtitle && <span className="text-sm text-white/50">{subtitle}</span>}
            </p>
        </div>
    );
}

export default function Profile() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    function toggleMenu() {
        setIsMenuOpen((prev) => !prev);
    }

    async function handleLogout() {
        await logout();
        navigate("/login");
    }

    if (!user) {
        return (
            <AppLayout>
                <p className="text-white">Erro ao carregar usuário</p>
            </AppLayout>
        );
    }

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
                                src={profileImg}
                                alt="profile"
                                className="h-20 w-20 rounded-full ring-4 ring-violet-500/40"
                            />
                            <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-green-400 ring-2 ring-[#0B0B10]" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-green-400">● Online</span>

                            <h1 className="text-2xl font-semibold">{user.name}</h1>

                            <p className="text-sm text-white/60">Legendary Player • Nível 87</p>

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

                <div className="mt-6 px-6 grid gap-4 md:grid-cols-[1.5fr_0.8fr]">
                    <div className="grid grid-cols-5 gap-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                        <Stat title="Ranking Global" value="#128" subtitle="Top 0.3%" />
                        <Stat title="Jogos Jogados" value="1,284" />
                        <Stat title="Horas Jogadas" value="3,742h" />
                        <Stat title="Vitórias" value="67%" />
                        <Stat title="Conquistas" value="245" subtitle="/312" />
                    </div>

                    <div className="rounded-2xl bg-gradient-to-r from-violet-500/20 to-indigo-500/20 p-4 ring-1 ring-violet-400/20">
                        <p className="text-sm text-white/70">Nível 87</p>

                        <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                            <div className="h-2 w-[70%] rounded-full bg-violet-400" />
                        </div>

                        <p className="mt-2 text-xs text-white/50">12,450 / 15,000 XP</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
