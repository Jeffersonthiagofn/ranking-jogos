import { Gamepad2, ShieldCheck } from "lucide-react";

export default function AuthLayout({ title, subtitle, children, heroImage, brand = "GameRank" }) {
    return (
        <div className="min-h-screen bg-[#0B0B10] text-white">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
                {/* LEFT HERO */}
                <section className="relative hidden lg:block">
                    <img
                        src={heroImage}
                        alt="Hero"
                        className="absolute inset-0 h-full w-full object-cover"
                    />

                    {/* overlays */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#120A24]/90 via-[#120A24]/60 to-[#0B0B10]/90" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.28),transparent_55%)]" />

                    <div className="relative flex h-full flex-col justify-between p-10">
                        {/* brand */}
                        <div className="flex items-center gap-2 text-white/90">
                            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
                                <Gamepad2 className="h-5 w-5 text-violet-300" />
                            </div>
                            <span className="text-lg font-semibold">{brand}</span>
                        </div>

                        {/* headline */}
                        <div className="flex flex-1 items-center">
                            <div className="max-w-xl">
                                <h1 className="text-6xl font-semibold leading-tight tracking-tight">
                                    Analise. <span className="text-violet-400">Classifique.</span>
                                    <br />
                                    Domine a arena.
                                </h1>

                                <p className="mt-8 max-w-md text-base leading-7 text-white/60">
                                    Junte-se a mais de 500 mil jogadores que acompanham estatísticas
                                    ao vivo em mais de 2.500 títulos globais. Sua jornada rumo ao
                                    top começa com dados.
                                </p>
                            </div>
                        </div>

                        {/* badge */}
                        <div className="mt-auto">
                            <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm text-white/70 ring-1 ring-white/10">
                                <ShieldCheck className="h-4 w-4 text-violet-300" />
                                Aprovado por organizações profissionais de esports em todo o mundo.
                            </div>
                        </div>
                    </div>
                </section>

                {/* RIGHT FORM */}
                <section className="relative flex items-center justify-center px-6 py-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />

                    <div className="relative w-full max-w-md">
                        <div className="rounded-2xl bg-white/[0.04] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/10 backdrop-blur">
                            <h2 className="text-center text-2xl font-semibold">{title}</h2>
                            <p className="mt-2 text-center text-sm text-white/60">{subtitle}</p>

                            <div className="mt-8">{children}</div>
                        </div>

                        <div className="mt-10 flex justify-center gap-6 text-xs text-white/40">
                            <button type="button" className="hover:text-white/60">
                                Política de Privacidade
                            </button>
                            <button type="button" className="hover:text-white/60">
                                Termos de Serviço
                            </button>
                            <button type="button" className="hover:text-white/60">
                                Contato para Suporte
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
