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

export async function getMyTopGames() {
    const query = `
        query {
            getMyTopGames {
                appid
                name
                cover
                playtime_forever
            }
        }
    `;

    const data = await graphqlRequest(query);
    return data.getMyTopGames;
}
