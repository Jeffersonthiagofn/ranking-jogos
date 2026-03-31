import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { graphqlRequest } from "../services/graphql";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function fetchMe() {
        try {
            const query = `
                query {
                    getMe {
                        _id
                        name
                        avatar
                    }
                }
            `;

            const data = await graphqlRequest(query);
            setUser(data.getMe);
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    async function login(email, password) {
        const query = `
            mutation($email: String!, $password: String!) {
                login(email: $email, password: $password) {
                    token
                }
            }
        `;

        const data = await graphqlRequest(query, { email, password });

        localStorage.setItem("token", data.login.token);

        await fetchMe();
    }

    function logout() {
        localStorage.removeItem("token");
        setUser(null);
    }

    useEffect(() => {
        fetchMe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
