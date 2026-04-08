import { graphqlRequest } from "./graphql";

export async function fetchGenres() {
    const query = `
        query {
            getGenres
        }
    `;

    const data = await graphqlRequest(query);
    return data.getGenres;
}

export async function fetchGames({ genre, sort, page = 1 }) {
    const query = `
        query($genre: String, $sort: String, $limit: Int, $offset: Int) {
            getGamesFiltered(
                genre: $genre
                sort: $sort
                limit: $limit
                offset: $offset
            ) {
                games {
                    appid
                    name
                    thumb
                    icon
                    price
                    release_date
                }
                total
            }
        }
    `;

    const limit = 10;

    const variables = {
        genre: genre === "Gêneros" ? null : genre,
        sort,
        limit,
        offset: (page - 1) * limit,
    };

    const data = await graphqlRequest(query, variables);
    return data.getGamesFiltered;
}
