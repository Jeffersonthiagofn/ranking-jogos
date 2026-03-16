import { useState } from "react";
import { AuthContext } from "./AuthContext";
import { loginUser } from "../services/authService";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    async function login(email, password) {
        const response = await loginUser(email, password);

        const loggedUser = {
            email,
        };

        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(loggedUser));
        setUser(loggedUser);
    }

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    }

    return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}
