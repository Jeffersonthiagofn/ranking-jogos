const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || "http://localhost:8080/graphql";

export async function graphqlRequest(query, variables = {}, options = {}) {
    const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
            query,
            variables,
        }),
        ...options,
    });

    const result = await response.json();

    if (result.errors?.length) {
        console.error("GraphQL ERROR:", result.errors);
        throw new Error(result.errors[0].message || "Erro na requisição GraphQL");
    }

    return result.data;
}