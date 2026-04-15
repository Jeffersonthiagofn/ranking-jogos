import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";

import AuthLayout from "../layouts/AuthLayout";
import TextField from "../components/TextField";
import GradientButton from "../components/GradientButton";
import { registerUser } from "../services/authService";
import heroImg from "../assets/login-hero.png";

export default function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!name.trim()) return setError("Informe seu nome.");
        if (!email.trim()) return setError("Informe seu email.");
        if (!password.trim()) return setError("Informe sua senha.");
        if (password.length < 6) return setError("A senha deve ter no mínimo 6 caracteres.");
        if (password !== confirmPassword) return setError("As senhas não coincidem.");

        try {
            setLoading(true);
            const message = await registerUser(name, email, password);
            setSuccessMessage("Cadastro realizado com sucesso.");

            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (err) {
            setError("Não foi possível realizar o cadastro.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout
            heroImage={heroImg}
            title="Crie sua conta"
            subtitle="Preencha os dados para começar"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <TextField
                    label="Nome"
                    icon={User}
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <TextField
                    label="Email"
                    icon={Mail}
                    type="email"
                    placeholder="nome@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <TextField
                    label="Senha"
                    icon={Lock}
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <TextField
                    label="Confirmar senha"
                    icon={Lock}
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {error ? (
                    <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-200 ring-1 ring-red-500/20">
                        {error}
                    </div>
                ) : null}

                {successMessage ? (
                    <div className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 ring-1 ring-emerald-500/20">
                        {successMessage}
                    </div>
                ) : null}

                <GradientButton type="submit" disabled={loading}>
                    {loading ? "Cadastrando..." : "Cadastrar"}
                </GradientButton>

                <div className="pt-2 text-center text-sm text-white/60">
                    Já tem uma conta?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="font-medium text-violet-300 hover:text-violet-200"
                    >
                        Entrar
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
}
