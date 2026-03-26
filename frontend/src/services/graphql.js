const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || "http://localhost:8080/graphql";

export async function graphqlRequest(query, variables = {}) {
    const token = localStorage.getItem("token");

    const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
            query,
            variables,
        }),
    });

    const result = await response.json();

    if (result.errors?.length) {
        throw new Error(result.errors[0].message || "Erro na requisição GraphQL");
    }

    return result.data;
}
