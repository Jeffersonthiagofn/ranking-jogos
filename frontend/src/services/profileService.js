import { graphqlRequest } from "./graphql";

export async function getMyFavorites() {
    const query = `
        query {
            getMe {
                favorites {
                    appid
                    gameDetails {
                        name
                        cover
                        genres
                        current_players
                    }
                }
            }
        }
    `;

    const data = await graphqlRequest(query);
    return data.getMe.favorites;
}
