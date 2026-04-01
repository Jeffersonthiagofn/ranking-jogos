import { graphqlRequest } from "./graphql";

export async function loginUser(email, password) {
    const query = `
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        msg
        token
      }
    }
  `;

    const data = await graphqlRequest(query, { email, password });
    return data.login;
}

export const logoutUser = async () => {
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

    await fetch(`${backendUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
    });

    localStorage.removeItem("token");
};

export async function registerUser(name, email, password) {
    const query = `
    mutation Register($name: String!, $email: String!, $password: String!) {
      register(name: $name, email: $email, password: $password)
    }
  `;

    const data = await graphqlRequest(query, { name, email, password });
    return data.register;
}

export const loginWithSteam = () => {
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

    window.location.href = `${backendUrl}/auth/steam`;
};

export const linkSteamAccount = (token) => {
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

    window.location.href = `${backendUrl}/auth/steam?token=${token}`;
};
