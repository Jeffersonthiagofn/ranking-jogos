import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";

import AuthLayout from "../layouts/AuthLayout";
import TextField from "../components/TextField";
import GradientButton from "../components/GradientButton";
import { AuthContext } from "../context/AuthContext";
import { loginWithSteam } from "../services/authService";

import heroImg from "../assets/login-hero.png";

export default function Login() {
    const { login, user, fetchMe } = useContext(AuthContext);

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMe();
    }, []);

    useEffect(() => {
        if (user) navigate("/");
    }, [user]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!email.trim()) {
            setError("Informe seu email.");
            return;
        }

        if (!password.trim()) {
            setError("Informe sua senha.");
            return;
        }

        try {
            setLoading(true);
            await login(email, password);
            navigate("/");
        } catch (err) {
            setError(err.message || "Não foi possível fazer login.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout
            heroImage={heroImg}
            title="Seja Bem-vindo"
            subtitle="Insira suas credenciais para acessar"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <TextField
                    label="Email"
                    icon={Mail}
                    type="email"
                    placeholder="nome@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <div>
                    <TextField
                        label="Senha"
                        icon={Lock}
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <div className="mt-2 flex justify-end">
                        <button
                            type="button"
                            className="text-xs font-medium text-violet-300 hover:text-violet-200"
                        >
                            Esqueceu sua senha?
                        </button>
                    </div>
                </div>

                {error ? (
                    <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-200 ring-1 ring-red-500/20">
                        {error}
                    </div>
                ) : null}

                <GradientButton type="submit" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                </GradientButton>

                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[11px] uppercase tracking-wider text-white/40">ou</span>
                    <div className="h-px flex-1 bg-white/10" />
                </div>

                <button
                    onClick={loginWithSteam}
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b2838] py-3 text-sm font-medium text-white ring-1 ring-white/10 hover:bg-[#223247]"
                >
                    Entrar com Steam
                </button>

                <div className="pt-2 text-center text-sm text-white/60">
                    Não tem uma conta?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/register")}
                        className="font-medium text-violet-300 hover:text-violet-200"
                    >
                        Cadastre-se
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
}
