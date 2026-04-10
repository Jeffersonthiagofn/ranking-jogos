import { toggleFavoriteRequest } from "./authService";
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

export async function fetchFavorites(setFavoriteIds) {
    try {
        const query = `
            query {
                getMe {
                    favorites {
                        appid
                    }
                }
            }
        `;

        const data = await graphqlRequest(query);

        const ids = data.getMe.favorites.map((f) => Number(f.appid));

        setFavoriteIds(ids);
    } catch (err) {
        console.error("Erro ao carregar favoritos:", err);
    }
}

export async function toggleFavorite(gameId, setFavoriteIds) {
    const intGameId = parseInt(gameId);
    setFavoriteIds((prev) => {
        return prev.includes(intGameId)
            ? prev.filter((id) => id !== intGameId)
            : [...prev, intGameId];
    });
    try {
        const updatedFavorites = await toggleFavoriteRequest(intGameId);

        const ids = updatedFavorites.map((f) => Number(f.appid));

        setFavoriteIds(ids);
    } catch (err) {
        console.error("Erro ao favoritar:", err);
    }
}
