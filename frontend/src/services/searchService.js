import { graphqlRequest } from "./graphql";

export async function searchGames(query) {
    const gql = `
        query SearchGames($query: String!) {
            searchGames(query: $query) {
                appid
                name
                thumb
                price
                is_free
            }
        }
    `;

    const response = await graphqlRequest(gql, { query });

    return response.searchGames || [];
}
