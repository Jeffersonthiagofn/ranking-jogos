import { Twitter, Github, Youtube, Instagram, Gamepad2 } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-[#0B0B10]">
            <div className="mx-auto max-w-7xl px-6 pt-12 pb-6">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
                                <img className="h-6" src="/icon-gamerank.svg" alt="" />
                            </div>
                            <span className="text-sm font-semibold text-white/90">GameRank</span>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-white/55">
                            A plataforma definitiva para análise e ranking em tempo real.
                        </p>

                        <div className="mt-5 flex gap-3">
                            {[
                                { icon: Twitter, label: "Twitter" },
                                { icon: Github, label: "GitHub" },
                                { icon: Youtube, label: "YouTube" },
                                { icon: Instagram, label: "Instagram" },
                            ].map((item) => {
                                const IconComponent = item.icon;

                                return (
                                    <button
                                        key={item.label}
                                        type="button"
                                        aria-label={item.label}
                                        className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.03] text-white/60 ring-1 ring-white/10 hover:bg-white/[0.06] hover:text-white/80"
                                    >
                                        <IconComponent className="h-4 w-4" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-white/85">Plataforma</h4>
                        <ul className="mt-4 space-y-2 text-sm text-white/55">
                            <li className="cursor-pointer hover:text-white/80">Rankings globais</li>
                            <li className="cursor-pointer hover:text-white/80">Em alta agora</li>
                            <li className="cursor-pointer hover:text-white/80">Confrontos</li>
                            <li className="cursor-pointer hover:text-white/80">Acesso à API</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-white/85">Recursos</h4>
                        <ul className="mt-4 space-y-2 text-sm text-white/55">
                            <li className="cursor-pointer hover:text-white/80">Documentação</li>
                            <li className="cursor-pointer hover:text-white/80">
                                Portal do desenvolvedor
                            </li>
                            <li className="cursor-pointer hover:text-white/80">
                                Central de atendimento
                            </li>
                            <li className="cursor-pointer hover:text-white/80">Comunidade</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-white/85">Empresa</h4>
                        <ul className="mt-4 space-y-2 text-sm text-white/55">
                            <li className="cursor-pointer hover:text-white/80">Sobre nós</li>
                            <li className="cursor-pointer hover:text-white/80">Carreiras</li>
                            <li className="cursor-pointer hover:text-white/80">
                                Política de privacidade
                            </li>
                            <li className="cursor-pointer hover:text-white/80">Termos</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/5">
                <div className="mx-auto max-w-7xl px-6 py-6 text-xs text-white/40 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <span>
                        © {new Date().getFullYear()} GameRank. Todos os direitos reservados.
                    </span>
                    <div className="flex gap-6">
                        <span className="cursor-pointer hover:text-white/60">
                            Status do sistema
                        </span>
                        <span className="cursor-pointer hover:text-white/60">Cookies</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
